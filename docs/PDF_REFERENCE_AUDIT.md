# PDF reference audit — 17 September 2026

All eleven public PDF URLs in the supplied sanitized manifest returned HTTP 200 and PDF bytes during this implementation. Full text was extracted locally with pypdf. All cover pages were rendered with Poppler and visually inspected; selected content pages listed below were also rendered and inspected. This is an initial source audit, not complete mathematical or instructional approval of every slide.

Raw decks and extracted text stay under gitignored `.local/references/`; they are not copied into the public application. SHA-256 hashes, response types, lengths, and exact URLs are recorded in `evidence/task-00-01/reference-fetch.json`. Page counts are in `evidence/task-00-01/pdf-inspection.json`.

**Page numbers below mean one-based physical PDF pages**, not the deck's printed slide counter. No approved activity ranges have been assigned: the manifest's `pageRanges` arrays remain empty. `pdfContentsVerified: false` continues to mean that a complete lesson-content review has not been approved; retrieval and initial inspection have separate explicit fields.

| Course lesson | File | Physical pages | Cover inspected on page 1 | Finding |
|---|---|---:|---|---|
| 01 | 1.pdf | 70 | Introduction to reinforcement learning | Broad topic agrees. |
| 02 | 2.pdf | 62 | Exploration and Exploitation | **Conflicts with the catalog's MDP planning / policy evaluation title.** |
| 03 | 3.pdf | 66 | Markov Decision Processes and Dynamic Programming | Relevant to the catalog's MDP continuation. |
| 04 | 5.pdf | 80 | Model-Free Prediction | Broad topic agrees. |
| 05 | 6.pdf | 51 | Model-Free Control | Broad topic agrees. |
| 06 | 7.pdf | 63 | Function approximation in reinforcement learning | Broad topic agrees. |
| 07 | 8.pdf | 59 | Planning and models | Broad topic agrees. |
| 08 | 9.pdf | 50 | Policy Gradients and Actor Critics | Broad topic agrees. |
| 09 | 10.pdf | 37 | Deep Reinforcement Learning | Broad topic agrees; contains stabilization material. |
| 10 | 14.pdf | 36 | Deep Reinforcement Learning - Part 2 | Proposed activity needs revision/review against the actual topics. |
| 11 | 11.pdf | 65 | Imitation Learning and RLHF | Broader than behavior cloning; source has its own lecture numbering. |

## Verified content anchors, not approved activity mappings

| File | Inspected physical page(s) | Observed content |
|---|---|---|
| 1.pdf | 21, 22 | Agent/environment interaction; rewards and the return expression. |
| 3.pdf | 41, 49, 53 | Policy evaluation, policy iteration, and value iteration respectively. |
| 10.pdf | 22 | Target networks. |
| 14.pdf | 4, 31 | General value functions and distributional RL section titles respectively. |
| 11.pdf | 27, 28 | Imitation learning objectives include behavior cloning and maximum entropy; following section addresses human feedback and preferences. |

The text scan also found replay and stabilization topics in `10.pdf`, and auxiliary tasks, normalization, and distributional topics in `14.pdf`. These observations do not establish that the proposed lesson-10 replay/target-network ablation covers that deck. The catalog's course ordering remains authoritative for navigation until the instructor resolves the discrepancy.

## Decisions needed before content approval

- Confirm the intended source for lesson 02, or explicitly approve teaching MDP material using another deck. Do not silently substitute `3.pdf`.
- Review the proposed lesson 09/10 activity split. Stabilization appears in part 1; part 2 addresses additional topics.
- Review lesson 11 scope: a behavior-cloning exercise alone does not represent the full imitation/IRL/human-feedback deck.
- Review full activity-to-slide mappings for all eleven lessons. The shell contains no invented page citations or copied lecture content.

