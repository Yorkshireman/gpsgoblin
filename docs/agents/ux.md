# UX workflow

Use this workflow for user-facing planning, implementation and review across GPSGoblin. [Product specification sections 4.1–4.4](../product-spec.md#4-shared-user-experience) define the requirements; this document defines how to assess them. Scale the investigation to the changed flow. Work with no user-visible effect does not require browser UX checks.

## Before changing the flow

Identify the user's task and affected states: initial/empty, processing, loaded/results, selected or adjusted, and relevant errors or missing-data cases. Inspect the existing flow when available. For a new flow, describe the intended arrangement and feedback before implementing it.

For each important interaction, identify:

- The control or visible target the user acts on.
- The result that changes and any linked result elsewhere, such as a map marker.
- What is visible together at desktop and phone sizes.
- Whether seeing the result requires scrolling, switching views or expanding details, and how selection/focus is preserved.

Completion criterion: the affected interactions have explicit feedback expectations. Do not assume that rendering a result somewhere in the DOM makes it discoverable.

## Verify in the whole page

For layout or flow changes, use these browser **content viewport** sizes as the baseline:

| Context | Width × height in CSS pixels |
| --- | --- |
| Desktop | 1440 × 900 |
| Short laptop window | 1280 × 720 |
| Phone | 390 × 844 |
| Small/short phone | 375 × 667 |

These are test cases, not required CSS breakpoints or a claim of physical-device coverage. Add relevant sizes or real-device checks when the change warrants them. For a local change, focus on the affected states and dimensions and explain any narrower coverage.

Inspect viewport screenshots and perform the interactions in context. A full-page screenshot is useful for ordering but hides the fold. Record the viewport dimensions and relevant scroll position; check how much of the active visualisation, its controls and its feedback can be seen at once. Check the screen immediately after import, selection or adjustment, before scrolling to make an assertion pass.

Exercise the visible target a person would use, including a drawn chart line or switch label. Confirm both the immediate feedback and any linked result. Include keyboard operation and relevant touch behaviour; desktop mouse emulation alone does not establish mobile usability. Look for clipped content, horizontal overflow, scroll traps, focus loss and layout jumps. Try longer names, warnings, missing measurements and increased text size where they affect the flow.

Use existing browser tooling and representative, permitted data. Keep personal recordings and screenshots local unless their publication is authorised. Add focused regression coverage for interaction failures; avoid creating a large E2E suite merely to assert every layout measurement.

Completion criterion: the affected controls have been exercised and their results visually inspected in the relevant viewports. State any browser/device or tooling limitations instead of claiming unperformed checks.

## Report and keep scope clear

For planning, turn control/result gaps into acceptance criteria. For implementation or review, report the sizes and states checked, what feedback remained visible and any unresolved problems. Distinguish functional success from usability: a changed marker outside the viewport is a linked result, but not visible feedback.

Fix regressions introduced by the authorised change. Surface existing broader layout problems separately and link a follow-up when authorised; do not silently expand the ticket into a redesign. The GPX workspace follow-up is [issue #10](https://github.com/Yorkshireman/gpsgoblin/issues/10); its proposed layouts are not universal templates for every tool. Preserve agreed requirements, recommended defaults and unresolved design choices as distinct categories.

Completion criterion: the completion report accounts for the UX expectations identified at the start, including any explicitly deferred work.
