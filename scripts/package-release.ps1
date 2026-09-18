$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem
$projectRoot = Split-Path -Parent $PSScriptRoot
$distRoot = (Resolve-Path -LiteralPath (Join-Path $projectRoot 'dist')).Path
$releaseRoot = Join-Path $projectRoot 'release'
$evidenceRoot = Join-Path $projectRoot 'evidence/task-11'
New-Item -ItemType Directory -Force -Path $releaseRoot,$evidenceRoot | Out-Null
$archivePath = Join-Path $releaseRoot 'rl-island-static.zip'
if (Test-Path -LiteralPath $archivePath) { throw 'Archive already exists. Retain or explicitly replace the previous release before packaging again.' }
if (-not (Test-Path -LiteralPath (Join-Path $distRoot 'index.html'))) { throw 'Build dist before packaging.' }
[System.IO.Compression.ZipFile]::CreateFromDirectory($distRoot,$archivePath,[System.IO.Compression.CompressionLevel]::Optimal,$false)
$zip = [System.IO.Compression.ZipFile]::OpenRead($archivePath)
$records = @()
try {
  foreach ($entry in $zip.Entries) {
    if ($entry.FullName.EndsWith('/')) { continue }
    $name = $entry.FullName.Replace('\','/')
    $file = [System.IO.Path]::GetFullPath((Join-Path $distRoot $name))
    if (-not $file.StartsWith($distRoot+[System.IO.Path]::DirectorySeparatorChar,[System.StringComparison]::OrdinalIgnoreCase)) { throw 'Archive entry escaped dist.' }
    $stream=$entry.Open(); $sha=[System.Security.Cryptography.SHA256]::Create()
    try { $hash=([System.BitConverter]::ToString($sha.ComputeHash($stream))).Replace('-','').ToLowerInvariant() } finally { $stream.Dispose();$sha.Dispose() }
    if ($hash -ne (Get-FileHash -LiteralPath $file -Algorithm SHA256).Hash.ToLowerInvariant()) { throw "Archive content mismatch: $name" }
    $records += @{path=$name;bytes=$entry.Length;sha256=$hash}
  }
} finally { $zip.Dispose() }
$files = @(Get-ChildItem -LiteralPath $distRoot -Recurse -File)
if ($records.Count -ne $files.Count -or -not ($records.path -contains 'index.html')) { throw 'Archive inventory does not match dist contents.' }
$manifest = Get-Content -LiteralPath (Join-Path $distRoot 'offline-manifest.json') -Raw | ConvertFrom-Json
$report = @{result='PASS';at=[DateTime]::UtcNow.ToString('o');buildVersion=$manifest.version;archive='release/rl-island-static.zip';archiveBytes=(Get-Item -LiteralPath $archivePath).Length;sha256=(Get-FileHash -LiteralPath $archivePath -Algorithm SHA256).Hash.ToLowerInvariant();files=$records}
$report | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath (Join-Path $evidenceRoot 'archive-verification.json')
Write-Output "Verified $($records.Count) files. Archive: $archivePath"
