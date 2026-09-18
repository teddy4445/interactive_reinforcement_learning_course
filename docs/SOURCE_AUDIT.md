# Source audit, assumptions, and decisions
Audit date: 17 September 2026

## Evidence boundaries

Implementation refresh completed on 2026-09-17. The original planning audit had source-only visual evidence and unavailable PDF bodies; the refreshed evidence below supersedes those limitations.

The public ACML homepage, HTML, JavaScript, CSS, and owner-repository license were fetched successfully. The exact blue/rose values and radii still match the supplied tokens. Live desktop (1440x900) and mobile (390x844) screenshots were captured with Chromium with no failed requests. See [visual review](VISUAL_REVIEW.md) and the screenshots in `evidence/task-00-01/reference/`.

All eleven sanitized PDF URLs returned PDF bodies. Full text was extracted, all cover pages were visually inspected, and selected content pages were rendered and inspected. The initial audit found a catalog/PDF mismatch for lesson 02 and activity-scope issues for lessons 10 and 11. See [PDF audit](PDF_REFERENCE_AUDIT.md). No complete instructional mapping is approved; empty activity page ranges remain empty.

The current eleven-lesson navigation still follows the supplied first matching current course entry. The older duplicate is excluded. S4/S5 selection evidence is inherited from the supplied verified reference; the full catalog and protected course page were not fetched again or copied into the app.

No reference body attempted in the refreshed ACML/PDF audit remains unavailable. The initial web-reader request to `1.pdf` failed, and sandboxed shell network access returned EACCES; authorized public network retrieval subsequently succeeded. Missing approvals are identified as review work, not network failures.

The original logo was obtained from the owner-maintained, MIT-licensed source and visually checked against the live header. It is bundled unmodified with attribution; the temporary text placeholder is no longer used. All artwork/font provenance is recorded in [asset attribution](ASSET_ATTRIBUTION.md).

Exact source URLs, retrieval timestamps, response metadata, byte counts, and SHA-256 checksums are in `evidence/task-00-01/reference-fetch.json` and `asset-provenance.json`. Files were retrieved by path/content hash, not an asserted upstream commit. No course credentials, full catalog, or lecture PDF is included in the runtime bundle.

## Product decisions

- Core lesson order follows the eleven catalog entries, not the earlier speculative eight-week schedule.
- Interface uses the actual ACML blue/rose brand; terrain colors are subordinate.
- Vanilla JavaScript and a static Vite build are the default. Framework, 3D, backend, and runtime AI are out of scope.
- Advanced lessons are required for a full-course release, but not for the first student pilot.
- Multi-agent RL is optional pending a separate course/content decision.
- Learning metrics, progress scores, and performance targets are not verified outcomes. They must be earned/measured by the implementation.
- Local exports and checksums are not authenticated grades or tamper-proof records.

## Sources

### [S1] ACML live homepage
`https://acml.teddylazebnik.com/`

Refreshed 2026-09-17. Actual desktop/mobile browser captures and comparison are recorded in docs/VISUAL_REVIEW.md.

### [S2] ACML homepage source
`https://raw.githubusercontent.com/teddy4445/applied_computational_mathematics_lab_website/main/index.html?raw=1`

Inspected 2026-09-17. Source shows Inter, navigation, content surfaces, hero treatment, and component classes.

### [S3] ACML design configuration and styles
`https://raw.githubusercontent.com/teddy4445/applied_computational_mathematics_lab_website/main/js/main.js`

Inspected 2026-09-17. Primary/secondary colors and border-radius configuration explicitly defined. Companion CSS source: https://raw.githubusercontent.com/teddy4445/applied_computational_mathematics_lab_website/main/css/styles.css?raw=1

### [S4] Academic website course-page implementation
`https://raw.githubusercontent.com/teddy4445/teddy_lazebnik_academic_website/master/js/pages/course-page.js`

Inspected. Page loads a teaching catalog and selects the first matching course code. Do not embed credentials or the entire catalog in RL Island.

### [S5] Course catalog used by the supplied page
`https://raw.githubusercontent.com/teddy4445/teddy_lazebnik_academic_website/master/data/jsons/teaching.json`

Inspected current first TFSS25_2026 entry. Eleven linked lessons verified. An older duplicate exists. Only sanitized lesson metadata is included in this repository. During task 00, the public PDF bodies were retrieved and initially inspected; detailed approved activity mappings remain pending. See docs/PDF_REFERENCE_AUDIT.md.

### [S6] Vite static deployment documentation
`https://vite.dev/guide/static-deploy`

Supports static dist builds, base-path configuration, and the distinction between local preview and production hosting.

### [S7] MDN: Using Web Workers
`https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers`

Supports worker/main-thread separation and message-based communication.

### [S8] MDN: IndexedDB API
`https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API`

Reference for larger client-side structured storage.

### [S9] MDN: Web Storage API
`https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API`

Reference for localStorage and its synchronous behavior; keep large experiment data out of frequent UI-thread writes.

### [S10] Gymnasium: Handling Time Limits
`https://gymnasium.farama.org/tutorials/gymnasium_basics/handling_time_limits/`

Primary implementation guidance on termination, truncation, time features, and bootstrapping.

### [S11] TensorFlow.js platform/environment documentation
`https://www.tensorflow.org/js/guide/platform_environment`

Reference for backend choices and tensor/memory considerations; actual worker/backend performance remains to be benchmarked.

### [S12] W3C: Understanding Contrast (Minimum)
`https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html`

Accessibility reference for text contrast; other accessibility requirements in the plan are design/test requirements.

### [S13] MDN: Using Service Workers
`https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers`

Reference for caching, scope, secure contexts, lifecycle, and offline behavior.

### [S14] OpenAI: AGENTS.md guidance
`https://developers.openai.com/codex/guides/agents-md`

Official Codex documentation; redirects to the current ChatGPT Learn documentation. Repository instructions are supported. Also reviewed https://developers.openai.com/cookbook/examples/codex/iterating-development-workflows-with-codex for phased work and evidence logging.


## Audit deliverables and remaining approval

Source content hashes, live reference captures, original logo/license provenance, direct dependency licenses, PDF retrieval/initial inspection, and discrepancies are now recorded. Full activity mappings and the content discrepancies require instructor review before content approval. Tasks 00/01 add no authenticated grades, numerical learning evidence, or production deployment.

## Task 11 public-link revalidation — 18 September 2026

`evidence/task-11/public-reference-links.json` records fresh successful public GET requests to the ACML homepage and all eleven sanitized lecture PDF URLs. Every body hash matches the original task-00/01 successful retrieval. Initial restricted Node requests returned EACCES; the web reader opened the homepage but could not open 2.pdf, 14.pdf and 11.pdf. Those failed attempts remain recorded in `reference-refresh.json`; subsequent authorized read-only networking resolved availability. No protected catalog was fetched and no reference file or live site was modified. This is availability/content-identity verification, not new page inspection, approved activity mapping, or instructor signoff. Existing source discrepancies remain.
