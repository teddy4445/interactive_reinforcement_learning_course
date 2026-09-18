param([ValidatePattern('^[a-z0-9][a-z0-9-]{0,63}$')][string]$PackageName = 'rl-island-github-pages')
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem
$projectRoot = Split-Path -Parent $PSScriptRoot
$distRoot = (Resolve-Path -LiteralPath (Join-Path $projectRoot 'dist')).Path
$releaseRoot = Join-Path $projectRoot 'release'
$evidenceRoot = Join-Path $projectRoot 'evidence/github-pages'
$packageRoot = Join-Path $releaseRoot $PackageName
$archivePath = Join-Path $releaseRoot ($PackageName+'.zip')
if ((Test-Path -LiteralPath $packageRoot) -or (Test-Path -LiteralPath $archivePath)) { throw 'Output already exists. Use a new -PackageName to retain the earlier package.' }
$manifest = Get-Content -LiteralPath (Join-Path $distRoot 'offline-manifest.json') -Raw | ConvertFrom-Json
if ($manifest.base -ne '/rl-island/') { throw 'This GitHub Pages package requires the /rl-island/ build.' }
New-Item -ItemType Directory -Force -Path $releaseRoot,$evidenceRoot | Out-Null
Copy-Item -LiteralPath $distRoot -Destination $packageRoot -Recurse
[System.IO.File]::WriteAllText((Join-Path $packageRoot '.nojekyll'),'')
$files = @(Get-ChildItem -LiteralPath $packageRoot -Recurse -Force -File)
foreach ($file in $files) {
  $relative = [System.IO.Path]::GetRelativePath($packageRoot,$file.FullName)
  if ($relative -eq '.nojekyll') { continue }
  $source = Join-Path $distRoot $relative
  if ((Get-FileHash -LiteralPath $file.FullName -Algorithm SHA256).Hash -ne (Get-FileHash -LiteralPath $source -Algorithm SHA256).Hash) { throw "Source mismatch: $relative" }
}
[System.IO.Compression.ZipFile]::CreateFromDirectory($packageRoot,$archivePath,[System.IO.Compression.CompressionLevel]::Optimal,$false)
$zip = [System.IO.Compression.ZipFile]::OpenRead($archivePath)
$records = @()
try {
  foreach ($entry in $zip.Entries) {
    if ($entry.FullName.EndsWith('/')) { continue }
    $name = $entry.FullName.Replace('\','/')
    $file = [System.IO.Path]::GetFullPath((Join-Path $packageRoot $name))
    if (-not $file.StartsWith($packageRoot+[System.IO.Path]::DirectorySeparatorChar,[System.StringComparison]::OrdinalIgnoreCase)) { throw 'Archive entry escaped package.' }
    $stream = $entry.Open(); $sha = [System.Security.Cryptography.SHA256]::Create()
    try { $hash = ([System.BitConverter]::ToString($sha.ComputeHash($stream))).Replace('-','').ToLowerInvariant() } finally { $stream.Dispose(); $sha.Dispose() }
    if ($hash -ne (Get-FileHash -LiteralPath $file -Algorithm SHA256).Hash.ToLowerInvariant()) { throw "Archive mismatch: $name" }
    $records += @{path=$name;bytes=$entry.Length;sha256=$hash}
  }
} finally { $zip.Dispose() }
if ($records.Count -ne $files.Count -or -not ($records.path -contains 'index.html') -or -not ($records.path -contains '.nojekyll')) { throw 'Archive inventory is incomplete.' }
$report = @{result='PASS';at=[DateTime]::UtcNow.ToString('o');buildVersion=$manifest.version;base=$manifest.base;requiredRepositoryName='rl-island';package=('release/'+$PackageName);archive=('release/'+$PackageName+'.zip');archiveBytes=(Get-Item -LiteralPath $archivePath).Length;sha256=(Get-FileHash -LiteralPath $archivePath -Algorithm SHA256).Hash.ToLowerInvariant();files=$records;runtimeChanges='None: all dist files copied byte-for-byte; only .nojekyll added.';published=$false}
$report | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath (Join-Path $evidenceRoot ('packaging-'+$PackageName+'.json'))
Write-Output "Verified $($records.Count) files. Upload archive: $archivePath"
