# Commercial review

**Last reviewed:** 19 September 2026. **Status:** initial strategy baseline; no commercial performance dataset reviewed.

The [product spec](product-spec.md), especially sections 2, 3.3 and 23, owns strategy. The [AGENTS.md workflow](../AGENTS.md#commercial-project-management-what-next) governs recommendations. This file records evidence and decisions; it does not authorise implementation, spending, telemetry, publishing or merging. Check live repository/issue state before relying on this snapshot.

## Current decision

**Next:** complete and merge the prominent example experience, [issue #46](https://github.com/Yorkshireman/gpsgoblin/issues/46). Implementation is in progress on branch `46-prominent-gpx-example`; it is not yet merged or released. This is the owner's fixed next priority, not the output of an RPM or demand ranking. Documentation PRs #47 and #48 were merged; neither implemented the example.

**Why now:** let visitors inspect a real result without first obtaining a personal file. It serves both people who already have a file and those evaluating whether export is worthwhile.

**Expected outcome, not observed result:** clearer understanding of the existing viewer and an easy transition from example to personal file. No measured conversion, traffic or profit uplift is claimed.

**Done means:** the implementation ticket's acceptance criteria and required quality checks pass, its authorised PR is merged, and release status is verified separately. Commercial success is not a prerequisite for technical completion and is not established by passing tests.

**Reassess:** when the owner next asks after implementation/merge, verify what shipped and compare the strongest post-example opportunities. Do not use missing commercial data to delay the fixed example priority.

## Evidence snapshot

| Area            | Evidence / current knowledge                                                                                                                            | Missing evidence or next assessment                                                                                                    |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Product         | The GPX viewer is live at gpsgoblin.com. PR #47 merged example requirements; implementation for #46 is in progress but not yet merged or released.      | Verify the implementation PR, merge and production release before treating the example as shipped.                                     |
| Audience        | Owner-approved primary hypothesis: people with a file and an immediate task; initially GPX routes and recordings. Export-dependent users are secondary. | No comparative audience profitability study or user-testing results supplied.                                                          |
| Acquisition     | Search-led tool pages are the intended channel.                                                                                                         | Search Console impressions, queries, clicks, date ranges and tool visits not reviewed here. No traffic figure or keyword-volume claim. |
| Usefulness      | Local import and no-account UX are specified; the example has defined acceptance criteria.                                                              | Successful task completion, import-failure rates and user feedback not reviewed here. No new telemetry authorised.                     |
| Monetisation    | AdSense is the intended initial mechanism, not guaranteed approval or a launch dependency.                                                              | Current activation/approval status, revenue and page RPM not verified here. Do not record missing values as £0.                        |
| Costs           | Browser-local processing and static deployment are the agreed architecture; new spending requires approval.                                             | Actual domain allocation, supplier bills and operating profit not reviewed here. Architecture does not prove zero costs.               |
| Main constraint | No measured commercial bottleneck established.                                                                                                          | After the example, inspect accessible evidence before choosing between acquisition, usefulness, monetisation or cost work.             |

## Post-example opportunity pool — not a ranked backlog

- Another viewer or converter: assess file-task demand, competition, reachable acquisition and shared implementation leverage. FIT-versus-TCX order is unresolved.
- GPX quality or richer capabilities: distinguish failures preventing task completion from optional analysis; do not assume extra features are the best investment.
- Discoverability, targeted export guidance or monetisation readiness: assess the actual constraint and existing setup before proposing changes.
- A bounded investigation if evidence cannot support a choice: identify the decision it will resolve and a clear stopping point, rather than commission open-ended research.

At the next review, select and compare only the strongest few candidates using current evidence. This pool does not create tickets or approve features. Automatic routing can be considered once multiple viewers exist; APIs remain deferred and Bluetooth/cable retrieval remains outside the current workstream.

## Decision history

- **19 September 2026 — example first:** #46 remains the next implementation priority regardless of commercial ranking. Retain its existing scope and acceptance criteria.
- **19 September 2026 — revised commercial strategy:** owner accepted the review of PR #48. Replace the open-ended GPX-depth/export-incentive gate with evidence-backed opportunity selection. Primary audience is people who already have files, treated as a hypothesis rather than proven most profitable.
- **19 September 2026 — objective and management:** optimise sustainable total operating profit, not RPM, traffic or engagement independently. Owner approved a mandatory fresh-agent next-step review and a living commercial record. Development effort is secondary; recurring cash costs and quality boundaries remain material.

## Updating this review

Review priorities when asked after each merged ticket. Refresh commercial evidence monthly and at meaningful release checkpoints during authorised work; no recurring automation is created by this document. If a review is overdue, report staleness without blocking an obvious bounded next action.

For each material update, record the date, source/link, observation period, known facts, hypotheses, access gaps, chosen action, alternatives and rationale. Record intended commercial outcomes before implementation and actual observations afterwards. Replace the current snapshot as evidence changes; retain concise dated decisions above. Do not store personal activity data, credentials or raw private analytics exports in this public repository; use approved aggregates or mark data unavailable.

Use this compact decision entry:

- **Next / status / ticket:** one bounded action; proposed, approved, implemented, merged and released are distinct states.
- **Why now:** current constraint and plausible contribution to total profit.
- **Evidence and uncertainty:** sources, dates, observation period, confidence and unavailable data.
- **Alternatives:** why the strongest other options are not recommended now.
- **Done means:** technical/operational acceptance, intended commercial outcome and assessment method.
- **Reassess when:** a release checkpoint or appropriate observation window, and evidence that would support continuing or changing direction. Sparse early data is inconclusive, not failure.

Maintain this record within authorised ticket work when material facts change. For discussion-only requests, recommend edits without writing them. Do not require invented numerical thresholds, statistical significance or new analytics to make a sensible small investment.
