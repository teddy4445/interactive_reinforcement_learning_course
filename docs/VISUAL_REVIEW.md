# Task 01 visual review

Date: 2026-09-17. Implementation: RL Island 0.1.0. The exact production JS/CSS filenames and SHA-256 values are recorded in `evidence/task-00-01/build.json`. No commit or deployment is asserted.

## Live reference

Actual Chromium captures of [the public ACML homepage](https://acml.teddylazebnik.com/) are retained as:

- `evidence/task-00-01/reference/acml-desktop.png` — 1440x900 viewport, full page.
- `evidence/task-00-01/reference/acml-mobile.png` — 390x844 viewport, full page.
- `evidence/task-00-01/reference/capture.json` — successful HTTP 200 captures, no failed requests.

These were visually inspected, including the live gradient hero and navigation. The source refresh verified the exact blue, rose, and radii. This is an actual rendered comparison, not a claim of pixel-identical reproduction.

## Comparison and adaptations

| Treatment | Reference and shell observation |
|---|---|
| Logo | Same original black ACML asset, unchanged aspect ratio. Shell puts it on a white header for readable contrast. |
| Brand | Exact #2563EB blue and #F43F5E rose. Darker rose text is used on pale badges. Computed token checks passed. |
| Typography | Inter, loaded from local files. System fallbacks are declared. The welcome title uses a restrained blue/purple display accent seen on ACML. |
| Navigation | Pill navigation with an explicit active state; shell adds settings, a lab return link, a keyboard skip link, and mobile disclosure. |
| Surfaces | Light-gray background, white cards, restrained shadows. Cards use the verified 20 px radius; controls use 8 px. |
| Hero | Dark navy with restrained blue/rose gradients. The shell uses a contained course hero instead of copying the host homepage's full-height research presentation. |
| Illustration | Original vector terrain and robot, confined to the course/map surfaces. Explicitly labeled as static illustration. |
| Hierarchy | Eleven lesson numbers remain primary. Lesson workspace keeps most width for the world and uses light instructions/inspector panels. |
| Responsive behavior | At narrow widths the world comes before instructions/inspector/results tabs. Navigation collapses to an accessible menu. Lesson titles wrap and all eleven lessons remain available through the text list. |
| Motion | No ambient animations. Reduced-motion styles remove transitions; both system and saved preferences are respected. |

## Screenshot set

All paths below are relative to `evidence/task-00-01/screenshots/`. Screenshots use empty application state, not synthetic student results.

| View | Desktop 1440x900 | Mobile 390x844 |
|---|---|---|
| Welcome | welcome-desktop.png | welcome-mobile.png |
| Island | island-desktop.png | island-mobile.png |
| Lesson workspace | lesson-01-desktop.png | lesson-01-mobile.png |
| Compare unavailable state | compare-desktop.png | compare-mobile.png |
| Notebook | notebook-desktop.png | notebook-mobile.png |
| Settings | settings-desktop.png | settings-mobile.png |
| Development components | components-desktop.png | components-mobile.png |

Additional captures: `lesson-tablet.png` (1024x768), `lesson-wide.png` (1920x1080), `lesson-large-text-320.png` (320x700 with large text), `menu-mobile.png`, and `keyboard-focus-desktop.png`.

## Review findings and limits

Screenshots were inspected for hierarchy, overflow, clipping, labels, disabled controls, focus, and readable layouts. The initial review found uneven decorative grid rows; the final CSS removes the SVG's influence on grid sizing. An initial axe scan found low contrast in the empty timeline decoration; its color was darkened. A keyboard fixture found that the Motion label included its explanatory sentence; the label and description are now separately associated.

The final browser suite checks no horizontal document overflow at the specified viewports, visible route focus, menu Escape behavior, tab keyboard behavior, and local-only assets. Automated accessibility scans supplement this visual/keyboard inspection; they are not a claim of complete WCAG compliance.

NOT RUN: native screen-reader sessions, real touch-device testing, native browser zoom at 200%, Firefox, and WebKit. Large-text/320 px reflow is tested separately and is not described as native zoom testing. Final instructor visual approval remains a review gate before moving beyond task 01.

