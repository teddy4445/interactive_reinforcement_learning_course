# ACML visual specification

## Verified reference
Source audit: 17 September 2026. [S1-S3]

- `js/main.js` defines primary `#2563eb`, secondary `#f43f5e`, button radius 8 px, md 12 px, lg 16 px, xl 20 px, 2xl 24 px, and full pill radius.
- Homepage markup uses Inter, `bg-gray-50`, white cards, gray body text, a fixed 80 px navigation row with pill links, and a dark hero with blue/rose gradient layers.
- Its headline uses a restrained blue-to-purple accent. This is a display treatment, not a replacement for the blue/rose brand colors.
- Source styles include a translucent white scrolled header, subtle card shadows, short hover/press transitions, and reduced-motion handling.

Preparation used source observations. Task 01 subsequently captured and inspected live ACML at desktop/mobile sizes. See docs/VISUAL_REVIEW.md and evidence/task-00-01/reference/. The shell uses the original licensed logo, local Inter, and verified token values; final instructor visual approval remains a review gate.

## Design tokens
Use `reference/acml-tokens.css` as the starting specification. The primary/secondary colors and documented radii are directly verified. Neutral tokens interpret the homepage's Tailwind gray classes; terrain, semantic feedback, and accessible darker accent variants are deliberate product additions.

Do not import the whole ACML stylesheet, Tailwind CDN runtime, jQuery, or homepage animation code. They contain page-specific behavior the game does not need. Match the design with scoped local styles. Do not modify global selectors on the host site.

## Layout and hierarchy
Landing/dashboard content width: approximately 1280 px. Lesson workspaces may expand to about 1600 px to preserve useful map and inspector width. Use a 4/8 px spacing rhythm, 24-32 px desktop page padding, and 16 px mobile padding. These dimensions are proposed adaptations, not claims about every ACML page.

Main headings should be 36-48 px on large landing views; lesson titles 28-32 px; body text 16 px with about 1.5 line height. Inspector numerals may be monospaced with tabular digits, but must remain readable. Do not use decorative script fonts for instructions or equations.

Header: ACML logo asset obtained from the owner's source during implementation, followed by RL Island. Keep the logo's aspect ratio and approved contrast treatment. Do not redraw the logo from memory. Add a back-to-lab link. Hide extended footer content inside focused lesson views.

Card hierarchy: course region cards, progress summaries, experiment panels, and inspector sections share the same radius and border family. Buttons distinguish primary (blue), secondary (neutral outline), and destructive (clearly labeled) actions. Reserve space for a button border to prevent hover layout shift.

## World art
Use top-down 2D vector-style artwork with subtle depth. Robot: white/gray body and blue details; hazard markers may use rose; goals need a shape as well as a color. Use a consistent asset family rather than mixing emoji, pixel art, and glossy 3D assets.

The dashboard island can be a larger illustration with clickable HTML buttons positioned over regions. The game world is a small grid drawn on Canvas. A map is still interpretable without a decorative background. Decorative swaying, water movement, confetti, and particles are disabled or reduced during training and in reduced-motion mode.

No new art asset is included in this plan. Codex should use original simple vector geometry or appropriately licensed assets and record attribution. The bundle contains no font binaries or copied lecture media.

## Interaction treatments
Pill tabs show selected state using fill/outline plus text semantics. Tooltips work on focus as well as hover. Click/touch feedback is short and restrained. Errors belong near the relevant input and remain visible until resolved. Avoid transient-only messages for failed saves or invalid experiments.

The main lesson panel should not contain a huge marketing hero. Retain brand continuity through typography, the navigation, white cards, blue controls, and restrained rose highlights. Focus mode may reduce decoration without changing the conceptual layout.

## Accessibility additions
All color legends have labels and numerical ranges. Comparison plots use distinct line styles or markers in addition to color. Board state is available through a DOM inspector and keyboard-navigable cell/list representation; important information is never only painted on Canvas.

Check contrast according to WCAG criteria [S12]. The bright rose token is not automatically suitable for small text on white. Use an approved darker rose text token when necessary. Avoid declaring WCAG compliance based solely on automated checks.

## Visual acceptance evidence
Capture `welcome`, `island`, `lesson`, `compare`, and `notebook` at 1440x900 and 390x844; also inspect 1024x768 and a wide lesson display. Verify no clipped controls, hidden focus, unreadable legends, or accidental horizontal scrolling. Freeze animation and seeded data for screenshot regression tests.

Store screenshots with the commit/build identifier. Include a brief human comparison against ACML: colors, type, navigation, card radii, whitespace, motion, and overall hierarchy. Any inaccessible reference rendering remains explicitly pending rather than falsely approved.
