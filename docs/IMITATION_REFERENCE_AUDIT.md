# Task-08 source review

Reviewed 18 September 2026. The manifest maps lesson 11, **Mimic learning**, to [11.pdf](https://teddylazebnik.com/files/rl_course/11.pdf). The verified local file has 65 physical pages, SHA-256 `143b49cf23f438ff4c11d1ffe852bc6f68ba615df24250bb53a47eb4fa864a19`, and is Emma Brunskill's CS234 Spring 2024 deck titled **Imitation Learning and RLHF**. Its cover calls it Lecture 8; that source counter does not replace the catalog's lesson-11 order.

A fresh web-reader open of the manifest URL returned “not accessible via this tool.” A direct Node fetch was also attempted and failed with `EACCES` under restricted network access. An initial web-reader attempt used the ACML subdomain instead of the manifest's host and failed too; it is not source evidence. No successful refresh or changed deck hash is claimed. `evidence/task-08/source-review.json` records the correct URL, verified local hash and refresh failure.

The PDF skill and bundled Poppler rendered pages for actual visual inspection. All page numbers below are **one-based physical PDF pages**; these particular pages also display the corresponding printed slide number. Renders are local developer material under `.local/task08-source/lesson11-{07,08,27,28}.png`, not production assets.

| Visually inspected physical page | Verified topic | Content decision |
|---|---|---|
| 7 | Demonstration trajectories as sequences of states and actions | The manual recorder exposes correctly aligned pre-action observation/action pairs. |
| 8 | Supervised behavioral cloning versus recovering a reward via inverse RL | Fitting consumes action labels, not rewards; original island reward is used separately for RL/evaluation. |
| 27 | Behavioral cloning versus reinforcement learning, plus maximum-entropy reward/policy ideas | Explain the distinction; do not claim to implement maximum-entropy IRL. |
| 28 | Human feedback and reinforcement learning from human preferences | State that RLHF is a broader deck topic, outside the implemented cloning/initialization algorithms. |

Complete extracted-text searches additionally found DAgger references on physical pages 2–3 and human-effort comparisons on 32–33, and maximum-entropy IRL on 12–25. These searches are **text observations**, not newly claimed visual inspections of all those pages. The small softmax gradient example, missing-state experiment and actor-critic transfer protocol are original worked activities; no exact slide-page derivation is claimed. In particular, the inspected pages do not establish a slide anchor for the compounding-error explanation.

Remaining gaps: full activity-to-slide mapping and instructor content approval; full visual review of all 65 physical pages; confirmation of required coverage beyond the user-requested cloning and RL initialization. The manifest therefore retains `pdfContentsVerified: false`, empty approved `pageRanges`, and pending detailed activity mapping. DAgger, inverse RL and RLHF are explained as distinct concepts, not advertised as working implementations. Raw PDFs are neither copied into the public bundle nor fetched at application runtime.
