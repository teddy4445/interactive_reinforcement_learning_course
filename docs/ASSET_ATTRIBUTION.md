# Asset and dependency provenance

## Local artwork and type

- **ACML logo:** exact, unmodified `img/logo.png` from the owner-maintained ACML repository, also used in the live homepage header. Retrieved and visually inspected on 2026-09-17. The repository's MIT license credits Teddy Lazebnik (2025); its full text is retained in `public/assets/licenses/ACML-MIT.txt`. File URL and SHA-256 are in `evidence/task-00-01/asset-provenance.json`. The logo is displayed at its original aspect ratio on a light surface. The initial development text placeholder has been replaced.
- **Inter:** locally bundled through `@fontsource/inter@5.3.0`, SIL Open Font License 1.1. Full license is retained in `public/assets/licenses/Inter-OFL.txt`. No Google Fonts request occurs at runtime.
- **Island, terrain, robot, compass, and notebook geometry:** original simple SVG/CSS shapes created for this repository. They are labeled illustrations and do not represent a running simulation.
- Course PDFs are audit inputs kept in a gitignored local directory, not shipped assets. No claim is made that the ACML repository's license licenses third-party lecture decks.

## Exact direct dependencies

| Dependency | Version | License | Role |
|---|---|---|---|
| @tensorflow/tfjs-core | 4.22.0 | Apache-2.0 | Lazy neural operations, autodiff and SGD in the worker |
| @tensorflow/tfjs-backend-cpu | 4.22.0 | Apache-2.0 | Lazy CPU kernels; no WebGL requirement |
| @fontsource/inter | 5.3.0 | OFL-1.1 | Bundled typography |
| chart.js | 4.5.1 | MIT | Actual training, evaluation and neural loss plots |
| katex | 0.18.7 | MIT | Reserved for later mathematics rendering; not imported into the shell |
| vite | 8.3.0 | MIT | Static development/build tool |
| vitest | 5.0.1 | MIT | Unit tests |
| eslint | 10.10.0 | MIT | Lint |
| @eslint/js | 10.0.1 | MIT | Lint rules |
| globals | 17.12.0 | MIT | Lint environment definitions |
| typescript | 7.0.2 | Apache-2.0 | JSDoc checking |
| @playwright/test | 1.63.0 | Apache-2.0 | Browser testing |
| @axe-core/playwright | 4.13.0 | MPL-2.0 | Development-only accessibility scans |

Versions and engine requirements were queried from the public npm registry during task 00 and are compatible with the installed Node 22.18.0. The lockfile pins transitive dependencies. Dependency license metadata is an audit aid, not a new license grant.


Task 06: the inline Robo SVG in the action-probability compass is original vector geometry matching the existing shared Canvas robot (white/gray body, blue face details). No third-party emoji, image or neural-generation dependency is used.

Task 07: TensorFlow.js core and CPU package versions are exact dependencies. Their installed package license fields and lockfile were inspected. The static neural chunk retains dependency license comments. No external model weights, pixel datasets, or pretrained demonstration assets are bundled.

Task 11: the production archive also includes full license texts for Chart.js, its @kurkle/color 0.3.4 runtime dependency (MIT), seedrandom 3.0.5 (MIT), and Apache-2.0 for TensorFlow.js and long 4.0.0. See `assets/licenses/THIRD-PARTY-NOTICES.txt` in the artifact. Texts were copied from installed package license files and seedrandom's source header; original dependency license comments remain. Node-only fetch packages, type declarations, build/test tools and unused KaTeX are not runtime services or shipped application dependencies. The offline manifest hashes the bundled license files too.
