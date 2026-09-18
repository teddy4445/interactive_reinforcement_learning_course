# Static placement at /rl-island/

For a ready-to-upload GitHub Pages package and browser-only publishing steps, use [GITHUB_PAGES.md](GITHUB_PAGES.md). The dedicated repository must be named `rl-island` for this build.

This repository and archive have not been pushed or published. Deployment and any ACML navigation change require the owner's separate approval. See RELEASE_REPORT.md for the technical verdict and outstanding content review.

## Local preview

From the project directory, with Node 22.13+:

```sh
npm ci
npm run build
npm run preview -- --port 4173
```

Open http://127.0.0.1:4173/rl-island/ or http://127.0.0.1:4173/rl-island/#/lesson/09. Ctrl+C stops the server. Preview serves only dist with ordinary static GET/HEAD responses, without transforms, APIs or route fallback. It does not publish anything. On Windows PowerShell use `npm.cmd` if script execution policy prevents `npm`.

The release ZIP contains the **contents** of dist: index.html, assets/, offline-manifest.json and sw.js. It has no enclosing dist/ directory. Do not open index.html with file://; workers, module loading and offline caching need HTTP localhost or production HTTPS.

After building and verifying, the Windows packaging command is `pwsh -NoProfile -File scripts/package-release.ps1`. It compares every decompressed archive entry with dist using SHA-256, writes `evidence/task-11/archive-verification.json`, and refuses to overwrite an existing archive. Retain an older release separately before producing a replacement. Packaging is local and does not deploy.

## Placement for the hosting owner

1. Export/retain student backups before a site update. Review release evidence and obtain the outstanding human content approval.
2. Retain a copy of the previous rl-island directory. Unpack the archive into a new staging directory and verify the archive/inventory hashes recorded with the release.
3. Place those files in the host's **rl-island/** subdirectory. The resulting URL must be `/rl-island/index.html`, not `/dist/index.html` or `/rl-island/dist/index.html`.
4. Preserve the ACML root index.html, host styles/scripts, existing redirects, and every unrelated directory. No root service worker or global rewrite rule is required. Hash routes all request the same `/rl-island/` document. The server should serve index.html for this directory and redirect `/rl-island` to `/rl-island/`.
5. Serve `.js` as JavaScript, `.css` as CSS, `.json` as JSON, and local font/image formats correctly. Use HTTPS. Revalidate index.html, sw.js and offline-manifest.json (`Cache-Control: no-cache`). Hashed assets may be cached immutably. Never give sw.js a root-wide `Service-Worker-Allowed` header.
6. Upload new hashed assets before activating new index.html/sw.js, preferably using an atomic directory switch. Retain old hashed assets while older tabs may still be open. The app keeps old per-version caches until it can safely prune them; it does not erase localStorage or IndexedDB.
7. Verify welcome, a direct lesson hash URL, live tabular and neural training, frozen evaluation, a JSON backup, and the explicit complete-course offline readiness message. Disconnect and reload. Confirm a root ACML page has no RL Island service-worker controller.
8. Only after approval, an optional host navigation change is a single link to `/rl-island/`. No host integration change is included or required by this artifact.

## Updates, rollback and dependencies

The worker registers from `/rl-island/sw.js` with exactly `/rl-island/` scope; cache names start `rl-island:/rl-island/:course:v1-`. Full offline readiness requires every manifest asset, including unopened neural chunks. An incomplete cache gives a repair message. New versions wait for explicit application; active/paused work blocks the update. Students should save reflections before accepting a reload. External lecture PDFs are links only and remain online resources.

Rollback restores the previous application files and its matching manifest/worker together. Do not clear student storage as part of rollback. Older code may reject a future save schema; retain exports and use a forward-compatible version rather than deleting data. Clearing unrelated ACML storage or origin-wide caches is never an update step.

Production needs no Node server, package installation, secrets, account, API, telemetry endpoint, remote inference or database service. All algorithms run locally in the browser; larger saves use that browser's IndexedDB. Browser storage is not a permanent backup. Exported evidence is self-reported, not an authenticated grade.
