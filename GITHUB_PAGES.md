# Upload RL Island to GitHub Pages

Prepared 18 September 2026. The upload package contains the previously verified production website plus an empty `.nojekyll` marker. No application code or learning behavior changed. Nothing has been uploaded, pushed or published by this preparation.

## Files to use

- ZIP: `release/rl-island-github-pages.zip`.
- Already extracted upload folder: `release/rl-island-github-pages/`.
- Technical release evidence: [RELEASE_REPORT.md](RELEASE_REPORT.md).

Use a **new, dedicated repository named exactly `rl-island`** (lowercase, hyphen). The build's asset URLs and service worker are scoped to `/rl-island/`. GitHub project sites normally use `https://YOUR-USERNAME.github.io/REPOSITORY-NAME/`, so this repository name matches the tested application path. Do not rename it to `acml_rl_course` or upload it at a user site's root without preparing a different build. [GitHub Pages URL documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages).

This separate project repository leaves the existing ACML homepage and its files unchanged. No custom domain or ACML navigation change is needed. If the account already uses a custom Pages domain, use the actual published URL shown in Settings → Pages and confirm it still ends in `/rl-island/`.

## Upload using the GitHub website

1. Sign in to GitHub and create a **new public repository named `rl-island`**. Select **Add a README** so its default branch exists. Use `main` as the default branch. Public repositories support Pages on GitHub Free. Keep this separate from the ACML website repository. [GitHub Pages availability](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages).
2. Extract `release/rl-island-github-pages.zip`, or open the already extracted folder listed above. Open the folder until you can see `index.html` directly.
3. In the repository's **Code** tab choose **Add file → Upload files**. Drag the **contents** of the extracted folder, including the `assets` directory, onto the upload area. Do not upload the ZIP itself or its enclosing folder. GitHub supports folder uploads; this package has only 25 files, below its 100-file upload limit. [GitHub upload instructions](https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository).
4. Commit the upload to `main` with a message such as `Add RL Island website`. If GitHub presents a pull-request flow, merge that upload into `main` before enabling Pages.
5. Confirm the repository root contains the layout below. If the upload omitted `.nojekyll`, use **Add file → Create new file**, name it exactly `.nojekyll`, and commit it. It can be empty; a short text line also works.

```text
rl-island repository / main
├── .nojekyll
├── index.html
├── offline-manifest.json
├── sw.js
├── assets/
│   ├── ...built JavaScript, CSS, local fonts and logo...
│   └── licenses/
└── README.md                 (GitHub's optional repository description)
```

Only the extracted package contents belong in this upload. Source code, node_modules, local QA exports, reference PDFs and the full working project are unnecessary. Keep the `assets/licenses/` directory with the website.

## Enable Pages

1. Open the repository's **Settings → Pages**.
2. Under **Build and deployment**, set **Source → Deploy from a branch**.
3. Select **Branch → main**, **Folder → /(root)**, then **Save**.
4. Open the repository's **Actions** tab and wait for the Pages deployment to finish successfully. Return to **Settings → Pages** and use **Visit site**.

These are GitHub's current [branch publishing steps](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site). The `.nojekyll` marker lets the prepared static files deploy without a Jekyll build. You do not need to add a custom workflow, run npm on GitHub, or provide an API key.

With the default GitHub domain, the site will be:

```text
https://YOUR-USERNAME.github.io/rl-island/
```

A direct lesson URL is:

```text
https://YOUR-USERNAME.github.io/rl-island/#/lesson/09
```

The part after `#` selects the lesson in the browser, so no server route rewrites are needed. Keep the trailing slash before `#`.

## Check the published site

Open the published URL and a direct lesson link in a fresh tab. Check a manual movement, live training and frozen evaluation. Wait for **Offline course · ready**, then disconnect and reload; external lecture PDFs remain online-only. Export a small Notebook backup. The service worker should be scoped to the site's `/rl-island/` path, never the account homepage.

Progress from localhost does not automatically appear on github.io because browser storage belongs to its origin. Use the app's JSON exports/imports to carry your own work across. The application has no telemetry or server-side account system; GitHub's hosting service still applies its own normal access logging, as described in its [Pages documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages).

## Common problems and later updates

- **404 homepage:** check that the Pages deployment succeeded, `index.html` is at the publishing root, and the repository is named `rl-island`. Uploading the ZIP or a parent folder does not install the website.
- **Blank page or missing assets:** verify `/rl-island/assets/` exists on the published site. A different repository name produces a different URL base and needs a rebuilt application; this package is intentionally scoped to `/rl-island/`.
- **Old version after an update:** wait for GitHub's deployment to finish, reopen the site online, and use the app's update notice when it appears. Finish or cancel active training first. Export a backup before clearing browser storage; clearing site data erases local work.
- **Publishing folder:** use `/(root)` for this upload. The working project's `docs/` directory contains documentation, not the built website.
- **Future releases:** build and verify locally, make a new package with the command below, then upload the new files into the same publishing root. Retain older hashed assets while older tabs may still be open. Keep prior archives for rollback; restore matching index, manifest, service worker and assets together. Do not clear student storage during deployment.

To create another package from a newly verified local dist, without overwriting this archive:

```powershell
npm.cmd run build
pwsh -NoProfile -File scripts/package-github-pages.ps1 -PackageName rl-island-github-pages-v2
```

For a local preview of the same application:

```powershell
cd C:\Users\lazeb\Desktop\acml_rl_course
npm.cmd run preview -- --port 4173
```

Open http://127.0.0.1:4173/rl-island/. Local preview does not publish anything.

## Verification status

The original release passed 327 unit tests and 110 browser tests; the application files in this package are unchanged. The packaging follow-up checks file/ZIP hashes and runs a focused browser smoke check on the prepared folder. All 25 packaged files and ZIP entries passed hash checks. Lint, the prepared-folder browser smoke check (including offline CPU DQN and frozen evaluation), and the 24-file/19-route release check passed. Two fresh screenshots were inspected. Results are recorded in `evidence/github-pages/` and TASK_STATUS.md. GitHub-hosted deployment itself has **not** been run here.

Human instructor review remains outstanding, including lesson 2's source conflict and the lesson 10/11 scope decisions. Packaging for Pages does not claim that approval; see RELEASE_REPORT.md.
