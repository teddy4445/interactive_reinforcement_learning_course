# Task-07 deck content verification

Reviewed 18 September 2026 using the repository's verified local PDFs and complete extracted page text. These are the public catalog files already retrieved with HTTP 200 and SHA-256 provenance in `evidence/task-00-01/reference-fetch.json`: lesson 09 [10.pdf](https://teddylazebnik.com/files/rl_course/10.pdf), 37 physical pages, and lesson 10 [14.pdf](https://teddylazebnik.com/files/rl_course/14.pdf), 36 physical pages. Raw decks stay outside the production build in `.local/references`.

A fresh attempt to open both public PDF URLs through the web reader during task 07 returned “not accessible via this tool.” No new successful fetch or new PDF hash is claimed. Verified local copies remained available. The npm registry was reachable through the approved package-install path; that does not establish that the PDF web reader could fetch the course host.

Page numbers below are **one-based physical PDF pages**, not printed slide counters. Selected pages were rendered with Poppler and visually inspected in `.local/pdf-renders/task07-contact.png`; individual renders are `.local/pdf-renders/task07-09-{11,13,18,22}.png` and `task07-10-{6,24,32,33}.png`. No activity page ranges or full instructor-approved mappings are invented.

| Source | Verified visual anchor | Implementation/content decision |
|---|---|---|
| 10.pdf p11 | Neural action-value approximation; state input and action outputs | Lesson 09 uses a real vector-input MLP. |
| 10.pdf p13 | Semi-gradient pseudo-loss, bootstrap target treated fixed | Autodiff excludes the target computation. Loss is not presented as an independent policy-quality measure. |
| 10.pdf p18 | Replay/past experience and minibatches | Real bounded replay; uniform versus chronological matched-size batches. |
| 10.pdf p22 | Periodically copied target network | Actual delayed network; visible optimizer-step synchronization count. |
| 14.pdf p6 | General value functions parameterized by cumulant, discount, policy | Lesson 10 explains the prediction question and checks a discounted cumulant example. |
| 14.pdf p24 | Adaptive target normalization | Concept and scale/gradient motivation; no implemented normalization algorithm claimed. |
| 14.pdf p32 | Learning distributions of returns beyond expected values | Explicit distinction between empirical evaluation samples and a learned distributional network. |
| 14.pdf p33 | Categorical support and probability-weighted expectation | Worked numerical expectation check. No C51 training implementation claimed. |

The full text scan additionally found auxiliary tasks (14.pdf p12), gradient/scale tradeoffs (p20–23), output-preserving rescaling/PopArt (p25–26), UVFA (p29), and distributional projection/quantile approaches (p34–35). These are **text observations**, not newly claimed visual inspections. Part 1 also contains Double Q, prioritized replay, multistep and dueling extensions; those are outside this small DQN implementation.

## Corrected lesson split and remaining gaps

The initial proposal inaccurately suggested that replay/target-network ablations alone could represent the part-2 deck. Lesson 10 now labels that experiment as an applied bridge from part 1, and separately teaches the part-2 richer-prediction concepts and numerical exercises. The live agent remains scalar DQN. Full implementations of the part-2 extensions are outside the user's task-07 scope; the course companion does not claim complete reproduction of either deck.

Both six-stage original activities are implemented, but instructor approval of the activity split, individual page mappings, pedagogy, difficulty and full lecture coverage remains pending. The manifest keeps `pdfContentsVerified:false`, `pageRanges:[]` and full-content approval false. The earlier lesson-02 catalog/deck conflict and lesson-11 scope gap remain unchanged. There are no unavailable local references needed for task 07; only the fresh web-reader attempts were unavailable. No course password or runtime deck fetch is added.
