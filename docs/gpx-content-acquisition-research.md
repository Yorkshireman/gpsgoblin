# GPX help-content acquisition pilot

**Checked:** 20 September 2026

**Status:** research and bounded recommendation; not implementation approval

**Scope:** official Google Search guidance and first-party Garmin Connect, Strava, komoot, Wahoo and Polar workflows. No provider account workflow, keyword-volume study, Search Console account or user file was available. No search demand, attainable ranking, advertising yield or profit is established.

## Decision

Do not wait for Search Console evidence before publishing any help content. Run a **two-page GPX help pilot** that independently solves two distinct user problems and leads to the released GPX viewer only when that viewer can actually help:

1. **How to get and open a GPX file** — one comparative, end-to-end guide covering the verified Garmin Connect, Strava, komoot and Polar Flow paths, desktop/mobile differences, the exact GPX choice, download/ZIP handling and opening the result in GPSGoblin.
2. **Why a GPX file is empty or missing data** — a recovery guide that distinguishes no GPS positions, long/incomplete exports, ZIP archives, unsupported FIT/TCX/GPX 1.0 files, and missing elevation/time/device readings.

This is not a new product direction. The [product specification](product-spec.md#21-product-concept--agreed) already says that useful tools and their explanatory pages are the primary planned search-acquisition channel. It also explicitly calls for a plainly named **How to get your GPX file** route near file selection, with verified source-specific instructions, desktop/mobile differences and honest format limits ([section 4.6](product-spec.md#46-gpx-value-and-manual-file-acquisition--agreed-direction)).

The pilot refines the current commercial-review position rather than disproving it. There is still no demonstrated query gap or revenue opportunity. However, the provider documentation below now establishes concrete, recurring workflow and recovery problems that fit the agreed audience and released tool. Search Console should set the baseline and measure the pilot, not act as an indefinite prerequisite for pages that do not yet exist.

Do **not** launch separate near-duplicate pages for every provider, device, sport or wording variant. Add a source-specific page later only when its workflow and recovery advice are materially distinct and Search Console, user evidence or first-hand testing supports it.

## Why a bounded pilot fits Google's guidance

[Google's people-first content guidance](https://developers.google.com/search/docs/fundamentals/creating-helpful-content) says SEO is useful when it supports content made for an intended audience that demonstrates experience, fits the site's purpose and leaves the reader able to achieve their goal. It warns against content made primarily for search visits, publishing across many topics hoping some perform, extensive automation and mainly summarising other sources. The page was last updated 10 December 2025 when checked.

The proposed pages fit GPSGoblin's narrow subject, answer tasks faced immediately before or during use of its released viewer, and can add original value through:

- a cross-provider decision table instead of making readers assemble incompatible instructions themselves;
- an end-to-end path from the service that owns the activity to a privacy-conscious file inspection result;
- GPSGoblin-specific compatibility and measurement explanations;
- a diagnostic decision tree that tells the reader when the current viewer cannot help; and
- tested screenshots or observations from the actual provider and GPSGoblin workflows when permissioned accounts are available during delivery.

[Google's spam policies](https://developers.google.com/search/docs/essentials/spam-policies) define doorway abuse to include substantially similar, query-targeted pages that funnel visitors to the actually useful portion of a site. They define scaled-content abuse as many pages created primarily to manipulate rankings, especially unoriginal or low-value pages, regardless of how they were produced. The page was last updated 28 August 2026 when checked. A family of lightly reworded “view Garmin/Strava/Polar/runner/cyclist GPX” pages would approach those failure modes. Two materially different pages in a clear help hierarchy would not depend on that pattern.

## Verified source workflows and useful gaps

| Source         | Officially documented route to a file                                                                                                                                                                                                                                                            | Limitations relevant to guidance                                                                                                                                                                                                                                                                                                                                                                           | What GPSGoblin can usefully add now                                                                                                                                                                                                                                                                                                               |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Garmin Connect | Garmin documents exporting a timed activity from the **Garmin Connect website** as original file (usually FIT), TCX or GPX. The user opens an activity and chooses the export format from the settings menu. [Garmin export guide](https://support.garmin.com/en-AU/?faq=W1TvTPW8JZ6LfJSfK512Q8) | Garmin says an indoor activity without GPS can create an empty GPX, and a very long activity can produce an empty or incomplete GPX; in those cases it recommends the original FIT file. [Garmin empty/incomplete export guide](https://support.garmin.com/en-GB/?faq=BBISz2o26Z37QlY14mTLF9)                                                                                                              | Tell the reader to choose **Export to GPX** only for a geographic activity, then open that file. Diagnose an empty result without implying GPSGoblin can recover coordinates Garmin did not export. State that the current viewer cannot open the recommended FIT fallback.                                                                       |
| Strava         | Strava documents GPX export from an activity page and says data export is available only on the **Strava website**. [Strava export guide](https://support.strava.com/en-us/articles/15401919-how-do-i-export-my-strava-data)                                                                     | Strava says an activity without GPS data produces an unreadable or empty GPX. Its original export is often FIT; TCX and GPX have different data coverage.                                                                                                                                                                                                                                                  | Explain website versus app expectations, choose **Export GPX** rather than **Export Original**, then open the downloaded file. Explain why an indoor/non-GPS session is not a viable GPX-viewer task.                                                                                                                                             |
| komoot         | komoot documents GPX export for routes and completed activities from both its **app and website**. [komoot export/import guide](https://support.komoot.com/hc/en-us/articles/10115477099674-Export-and-import-Routes-and-Activities)                                                             | The starting region must be unlocked; only one item can be exported at a time. The GPX contains route geometry, not planned waypoints, voice navigation or komoot maps. Android normally saves to Downloads; iOS can prompt to save or open in another app.                                                                                                                                                | Give genuinely useful mobile and desktop branches, explain where the file went, and set expectations about geometry that is present versus navigation detail that was never exported. The viewer can inspect the resulting route but cannot restore omitted komoot content.                                                                       |
| Polar Flow     | Polar documents individual-session export from the **Flow web service** as GPX, TCX, CSV, FIT or a ZIP package. [Polar export guide](https://support.polar.com/us-en/export-training-sessions-flow)                                                                                              | Polar describes GPX as route data while richer training data can be exported in other formats. A ZIP must be extracted before a GPX is opened in another service, and values can differ when another product recalculates or filters them.                                                                                                                                                                 | Explain choosing GPX for route inspection, extracting a ZIP first, and why the current viewer does not show heart rate, cadence, power or every Polar total. Do not present normal recalculation differences as corruption.                                                                                                                       |
| Wahoo          | The Wahoo app documents downloading a completed activity as a **FIT** file through the phone's native sharing menu. [Wahoo activity-sharing guide](https://support.wahoofitness.com/hc/en-us/articles/204280874-Share-an-activity-to-a-third-party-app-Wahoo-app)                                | Wahoo's route-import documentation accepts FIT, GPX and TCX files, but that is an import-to-device workflow, not evidence of GPX activity export. It also says the app/cloud can reject a corrupt or non-viable route. [Wahoo route-import guide](https://support.wahoofitness.com/hc/en-us/articles/25936827245970-Import-a-FIT-GPX-or-TCX-route-file-via-the-Wahoo-app-for-ELEMNT-ACE-BOLT-3-and-ROAM-3) | Do not publish a “view your Wahoo activity” GPX funnel yet. A short note in the comparative guide should say that Wahoo's documented activity download is FIT, GPSGoblin's released viewer cannot open it, and renaming the extension is not conversion. Reconsider a dedicated guide when FIT support exists or a verified GPX workflow appears. |

These are more than five copies of “click Export.” They reveal distinct user decisions: whether an app or website can export, whether the session has geographic data, which of several formats to select, whether the download is still inside a ZIP, what the provider deliberately omits and whether the released viewer supports the result.

## Page scopes

### 1. How to get and open a GPX file

The page should answer the task without requiring the tool link:

1. Start with a source chooser and say which sources have a supported GPX path.
2. Give short verified steps for Garmin Connect, Strava, komoot and Polar Flow, with **website**, **app** or **both** visible before the steps.
3. Say exactly which export option to choose and where the file normally appears; include Polar ZIP extraction.
4. State what will be missing before the reader spends effort exporting.
5. Offer **Open this GPX in GPSGoblin** only after the user has a compatible `.gpx` file; repeat that the file stays on their device and no account is required.
6. Include the honest Wahoo FIT stop case and link to the recovery page for empty or unexpected files.

Put a compact **How to get your GPX file** link near the existing viewer file chooser, as already required by the specification. Do not move the long guide above the tool or force existing file holders through it.

### 2. Why a GPX file is empty or missing data

Use a recovery decision tree rather than provider summaries:

- **The downloaded item is ZIP:** extract it, then choose the `.gpx` file; do not rename the ZIP.
- **It is FIT or TCX:** the current viewer does not support it; export GPX at the source if available and appropriate; do not rename the extension.
- **The GPX is empty or has no route:** check whether the activity used GPS. Garmin and Strava both document empty/unreadable GPX output for activities without GPS.
- **A long Garmin activity is incomplete:** export the original FIT as Garmin recommends, but explain that GPSGoblin cannot yet open it.
- **The map works but a chart is absent:** elevation requires height values; speed and pace require usable positions and times. This is a file-capability issue, not necessarily corruption.
- **Device readings or navigation cues are missing:** explain the provider's format losses and GPSGoblin's released scope. Do not promise recovery of data absent from the GPX or unsupported by the viewer.
- **The file is GPX 1.0 or malformed:** direct the reader to a compatible source export or explain the tested GPX 1.1 boundary; do not claim that changing a filename fixes it.

This page should offer the viewer when inspection can distinguish or display the available content, but its primary success is a correct diagnosis and recovery action. Sometimes the useful outcome is telling the reader that the present tool is not suitable.

## Search Console and assessment

[Search Console's Performance report](https://support.google.com/webmasters/answer/7576553?hl=en) reports clicks, impressions, click-through rate and average position by query, page, country, device and date. Google recommends using query and page views to understand what is already showing, inspecting low-CTR pages and focusing more on impression/click trends than position alone. [Performance report tasks](https://support.google.com/webmasters/answer/17010961?hl=en)

Inference: current Search Console data can reveal queries already associated with the existing viewer, but it cannot be treated as a complete catalogue of demand for help pages that do not exist and have never earned impressions. Low-volume sites may also lack some query features, and privacy/anonymisation can omit query data. Therefore:

1. Before release, record the existing viewer's available query, page, impression, click, CTR and device baseline; do not interpret missing data as zero demand.
2. Publish both pages with unique titles/descriptions, crawlable links from the relevant viewer/help hierarchy and sitemap inclusion. Avoid a word-count target and unnecessary structured data.
3. Review guide and viewer queries, pages, impressions, clicks, CTR and device split after roughly four weeks, then again around eight weeks if evidence is sparse, matching the existing [commercial assessment plan](commercial-review.md#monetisation-and-assessment-plan). These are learning windows, not automatic success or kill thresholds.
4. Inspect whether the pages appear for the intended problems and whether titles accurately set expectations. Improve a demonstrated mismatch; do not multiply pages solely because one phrase appeared.
5. Treat Search Console as acquisition evidence only. Without separately approved privacy-conscious product measurement or voluntary feedback, it cannot prove that guide visitors successfully opened a file or that the pages caused revenue.
6. Assess commercial success only when actual revenue and matching operating costs are available. Impressions, clicks and page count are means, not profit.

## Delivery boundaries and go/no-go rule

A single bounded ticket should cover the two pages, the nearby viewer help link, crawlable navigation and release verification. Before publishing, recheck every source path against its official documentation and, where a permissioned account is available, execute the workflow on relevant desktop and phone viewports. Mark steps that were documentation-verified but not account-tested. Use no private activity file in screenshots or fixtures.

The ticket should not include a CMS, blog framework, provider integration, OAuth, analytics, advertising, FIT/TCX support or a broad content calendar. Static Next.js pages fit the current architecture and add no inherent paid supplier. The recurring burden is keeping provider steps and compatibility claims current.

Technical completion means both pages are accurate, independently useful, accessible and indexable; the viewer link is easy to find without obstructing file selection; phone/desktop instructions are validated; unsupported formats and recovery limits are honest; and repository checks pass. Commercial success remains unproven until the pages earn relevant acquisition and, once monetisation is separately approved, contribute revenue above their maintenance and operating cost.

Expand beyond the pilot only when at least one of the following exists:

- Search Console shows a distinct recurring problem for which the current page is a poor match;
- permissioned user reports or task observations identify a recurring unresolved workflow;
- a provider's workflow is sufficiently different to require standalone treatment; or
- a newly released GPSGoblin format/tool creates a genuinely different end-to-end task.

Otherwise maintain the two pages and resist turning provider, device, sport or wording combinations into thin acquisition pages.
