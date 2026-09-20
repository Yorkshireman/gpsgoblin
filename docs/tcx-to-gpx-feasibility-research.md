# TCX-to-GPX feasibility

**Investigated:** 20 September 2026

**Decision:** technically feasible, but **do not implement it as the next commercial investment** on the evidence currently available. Do not create a delivery ticket yet.

## Executive decision

TCX-to-GPX avoids the FIT decoder's binary-profile dependency. GPSGoblin can parse a deliberately narrow TCX 2 document locally with its existing ISC-licensed XML parser, preserve geographic points into GPX 1.1, and keep conversion off the server. No paid service or new runtime supplier is required.

That technical result does not establish a worthwhile next investment:

- Garmin Connect, Strava and Polar Flow already let their users export an activity directly as GPX as well as TCX. For those common sources, conversion is often an avoidable extra step. [Garmin export documentation](https://support.garmin.com/en-IN/?faq=W1TvTPW8JZ6LfJSfK512Q8), [Strava export documentation](https://support.strava.com/hc/en-us/articles/216918437-Exporting-your-Data-and-Bulk-Export), [Polar export documentation](https://support.polar.com/us-en/export-training-sessions-flow)
- Strava, Garmin Connect, komoot and Polar Flow accept TCX directly for at least some activity or route imports. Converting first is therefore not a general requirement for those destinations. [Strava upload documentation](https://support.strava.com/en-us/articles/15402066-how-do-i-get-my-activities-to-strava), [Garmin activity-upload documentation](https://support.garmin.com/en-GB/?faq=Ht3ZP52Kju075uKvqTqu99), [komoot import documentation](https://support.komoot.com/hc/en-us/articles/10115477099674-Export-and-import-Routes-and-Activities), [Polar route-import documentation](https://support.polar.com/en/how-to-import-route)
- Google My Maps is one real compatibility example: it lists GPX among accepted formats but not TCX. This establishes a possible task, not its frequency or GPSGoblin's ability to acquire it. [Google My Maps import documentation](https://support.google.com/mymaps/answer/3024836?co=GENIE.Platform%3DDesktop&hl=en-GB)
- Free browser-local TCX-to-GPX tools already advertise the same basic job and privacy property. TrailSplits explicitly supports TCX activities and courses; GMaps To GPX, TelemetryHero and FitFileLab also advertise local TCX conversion. Their claims establish active competing offers, not correctness, usage or profitability. [TrailSplits](https://trailsplits.com/tools/gpx-converter), [GMaps To GPX](https://gmapstogpx.com/tools/tcx-to-gpx), [TelemetryHero](https://www.telemetryhero.com/fit-to-gpx), [FitFileLab](https://www.fitfilelab.com/)

No reviewed first-party source supplies search volume, attainable rankings, successful conversion counts, advertising yield or profit. The commercial confidence is therefore **low**. Lower engineering risk than FIT is not a reason by itself to build TCX next.

Reconsider a delivery ticket only when existing Search Console queries, a user report, or a named destination provides evidence of a recurring TCX-only compatibility task. A future ticket should then use the bounded scope and gates below rather than reopening the format from scratch.

## Format provenance and licence boundary

Garmin publishes the [`TrainingCenterDatabasev2.xsd`](https://www8.garmin.com/xmlschemas/TrainingCenterDatabasev2.xsd) at a Garmin domain. Its own annotation says it defines the Garmin Training Center format. Garmin also publishes the related [`ActivityExtensionv2.xsd`](https://www8.garmin.com/xmlschemas/ActivityExtensionv2.xsd) and the GPX-oriented [`TrackPointExtensionv2.xsd`](https://www8.garmin.com/xmlschemas/TrackPointExtensionv2.xsd).

The three inspected schema files contain structural declarations but no copyright notice, licence grant or permission to redistribute them or generated derivatives. Garmin's general terms say site content is protected and normally licensed only for personal, non-commercial access unless Garmin expressly authorises another use. Those general terms do not provide a clear open-source redistribution licence for the schemas. [Garmin Terms of Use](https://www.garmin.com/en-US/legal/terms-of-use/)

This is not the same dependency problem as FIT: a TCX reader does not need to distribute a comprehensive generated profile table. A narrow implementation can recognise the published XML namespace and the small set of element meanings necessary for interoperability. However, this investigation is not legal advice and does not establish permission to copy an XSD into GPSGoblin, generate source code from it, or reproduce its documentation.

The defensible implementation boundary is therefore:

- do not vendor Garmin's XSD files or generated schema code;
- do not copy Garmin schema documentation into source comments or product copy;
- implement the small supported data model independently and record the direct source for each format fact;
- refer users and maintainers to Garmin's canonical schema URLs rather than republishing the schemas;
- obtain Garmin permission or qualified legal advice before bundling a schema or a schema-derived generated model; and
- describe compatibility as a tested subset of TCX 2, not as Garmin certification or complete TCX support.

GPSGoblin's output remains GPX 1.1. The Topografix documentation defines GPX as WGS84 coordinates and metric measurements, with tracks made of logically connected track segments and points containing required latitude/longitude plus optional elevation and time. GPX extensions may contain elements from other namespaces. [Topografix GPX 1.1 schema documentation](https://www.topografix.com/GPX/1/1/)

## TCX 2 structures that affect conversion

The canonical schema makes TCX a container for more than recorded paths. A `TrainingCenterDatabase` may contain activities, multisport sessions, workouts, courses, folders and source metadata. Treating every TCX file as one flat track would be incorrect. [`TrainingCenterDatabasev2.xsd`](https://www8.garmin.com/xmlschemas/TrainingCenterDatabasev2.xsd)

### Activities

An activity has a required sport and ID, one or more laps, and optional notes, training metadata, creator and extensions. Each lap has summary values and zero or more `Track` elements; each track contains ordered trackpoints. A trackpoint requires time but may omit position, and may also include altitude, accumulated distance, heart rate, cadence, sensor state and extensions. [`TrainingCenterDatabasev2.xsd`](https://www8.garmin.com/xmlschemas/TrainingCenterDatabasev2.xsd)

A multisport session contains a first sport and later sports, with optional transition laps between them. These are distinct source entities and must never be flattened silently into one continuous GPX track. [`TrainingCenterDatabasev2.xsd`](https://www8.garmin.com/xmlschemas/TrainingCenterDatabasev2.xsd)

### Courses

A course has a name, optional lap summaries, zero or more tracks, notes, course points, creator and extensions. Course points separately carry a short name, time, position, optional altitude, a typed cue such as left/right/food/danger, and optional notes. Course lap summaries do not define trackpoint ranges, so they cannot safely be converted into GPX segment boundaries by position alone. [`TrainingCenterDatabasev2.xsd`](https://www8.garmin.com/xmlschemas/TrainingCenterDatabasev2.xsd)

### Extensions

TCX's extension slots allow elements from other namespaces. Garmin's Activity Extension v2 defines trackpoint speed, running cadence and watts, plus lap-level speed, cadence, steps and power summaries. Exporters may also add their own namespaces. [`ActivityExtensionv2.xsd`](https://www8.garmin.com/xmlschemas/ActivityExtensionv2.xsd)

The Garmin GPX TrackPoint Extension v2 can represent heart rate, cadence and speed in GPX, among other fields, but not all TCX core, lap, course-cue or power semantics have a direct field there. Its own documentation describes these as values GPX 1.1 core cannot represent. [`TrackPointExtensionv2.xsd`](https://www8.garmin.com/xmlschemas/TrackPointExtensionv2.xsd)

Because the extension schema has the same unresolved redistribution boundary as the TCX schema, the smallest clearly bounded first release would produce core GPX only and disclose sensor/summary loss. Preserving Garmin extensions should be a separate, explicitly provenance-cleared decision, not an unreviewed addition hidden inside the converter.

## Bounded preservation and loss contract

If commercial evidence later justifies implementation, the first converter should accept one uncompressed TCX 2 XML file and make the user choose one geographic entity. It should not present a workout-only document, a non-geographic indoor activity, or an unsupported namespace/version as a successful conversion.

| TCX input                                        | GPX 1.1 output                                             | Required behaviour                                                                                                                                                                                         |
| ------------------------------------------------ | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| One selected activity                            | One `trk`                                                  | Use the activity ID or a safe display name as source identity; retain sport only as an explained loss unless a separately reviewed extension mapping is approved.                                          |
| Each source `Track` within the selected activity | One `trkseg`, in source order                              | Preserve every existing discontinuity. Lap changes naturally create new tracks when the source contains them; do not join tracks or invent points between them.                                            |
| Positioned trackpoint                            | One `trkpt`                                                | Preserve valid latitude/longitude exactly within GPX ranges; preserve available valid altitude and original timestamp.                                                                                     |
| Unpositioned trackpoint                          | No `trkpt`                                                 | GPX trackpoints require coordinates. Count and disclose omitted samples; never attach their measurements to a different geographic point. If none are positioned, do not create an empty-success download. |
| One selected course                              | One `trk` with one `trkseg` per source course `Track`      | Preserve source track order. Do not turn course lap summaries into inferred boundaries.                                                                                                                    |
| Course point                                     | Optional GPX `wpt`, only if included in the approved scope | Position, name, time, altitude and notes can be represented. Disclose that a waypoint does not guarantee preservation of turn/cue behaviour; do not promise destination navigation compatibility.          |
| Multiple activities/courses or multisport legs   | Explicit entity selection                                  | Keep all source structure in memory. Do not merge entities. A later multisport export is separate scope.                                                                                                   |

The pre-download loss summary must identify, when present:

- activity/course lap summaries and lap semantics;
- sport, training plan/workout metadata, folders, creator/device details and source totals;
- accumulated distance and sensor state;
- heart rate, cadence, speed, power, calories and all unsupported extension data;
- transition semantics and unselected multisport legs;
- course cue type or other course-point semantics not carried into the approved GPX mapping; and
- unpositioned samples, invalid points and any entire source track that produces no GPX points.

This is deliberately stricter than saying “GPS is preserved.” A source activity can contain timed sensor samples without positions, and a course can contain navigation cues that a basic GPX track loses. Strava itself says its TCX export contains heart rate, cadence and watts beyond its GPX export; Polar similarly distinguishes route data in GPX from richer training data in TCX. [Strava export documentation](https://support.strava.com/hc/en-us/articles/216918437-Exporting-your-Data-and-Bulk-Export), [Polar export documentation](https://support.polar.com/us-en/export-training-sessions-flow)

## Browser-local implementation and security

The existing dependency is sufficient. GPSGoblin already pins [`saxes` 6.0.0](https://github.com/lddubeau/saxes), an ISC-licensed, browser-capable, namespace-aware streaming parser. Its documentation describes it as non-validating: it checks XML well-formedness but does not enforce an XSD. A TCX adapter must therefore enforce the supported namespace, root structure, required relationships and value constraints itself rather than claiming full schema validation.

Use the same architecture as GPX import:

- parse in a dedicated Web Worker so large or hostile input does not run the conversion loop on the UI thread; browser workers run scripts in a background context and communicate by messages. [MDN Web Workers guide](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers)
- reject any `DOCTYPE` declaration before parsing; never resolve external entities, `xsi:schemaLocation`, embedded URLs or remote schemas;
- process namespace URI plus local name, not user-controlled prefixes;
- retain only supported typed values and source structure, while still requiring all ignored XML to be well formed;
- validate all numbers as finite and within the TCX/GPX coordinate constraints; reject malformed required values rather than repairing them silently;
- treat source text only as data and XML-escape it during GPX serialization; never insert source markup into page HTML or an active DOM;
- serialize with a purpose-built GPX writer, then validate the bytes independently against GPX 1.1 and inspect key known-answer values; and
- preserve cancellation, stale-response protection and recovery behaviour from the existing import worker.

Using a browser DOM parser would allocate a complete in-memory tree. MDN also warns that parsed content becomes dangerous if inserted into the visible DOM. The existing SAX/worker approach is both a better memory fit and easier to keep away from HTML injection sinks. [MDN `DOMParser.parseFromString`](https://developer.mozilla.org/en-US/docs/Web/API/DOMParser/parseFromString)

No hard byte, point, XML-depth or processing-time limit should be invented in this investigation. Before release, benchmark representative and adversarial TCX files against the existing GPX baseline, then bring any proposed user-facing limit back for owner agreement under O4.

## Exporter, importer and fixture evidence

The official product documentation shows meaningful exporter variation that a future fixture set must cover:

| Source or destination            | First-party evidence                                                                                                                                                                                                                                                                                                                         | Consequence                                                                                                                                                                               |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Garmin Connect                   | Exports activity GPX and TCX separately; warns that very long TCX/GPX exports can be empty or incomplete and recommends FIT in that case. [export formats](https://support.garmin.com/en-IN/?faq=W1TvTPW8JZ6LfJSfK512Q8), [empty/incomplete export warning](https://support.garmin.com/en-GB/?faq=BBISz2o26Z37QlY14mTLF9)                    | Fixture: normal outdoor activity, multiple laps/tracks, and a long/partial-export failure case. Do not imply the converter can recover data Garmin did not export.                        |
| Strava                           | Exports TCX only for activities with GPS; says TCX contains heart rate, cadence, watts and power while GPX is also directly available. [export documentation](https://support.strava.com/hc/en-us/articles/216918437-Exporting-your-Data-and-Bulk-Export)                                                                                    | Fixture: permissioned outdoor activity with extensions and a direct-GPX comparison. No indoor-TCX promise.                                                                                |
| Polar Flow                       | Exports GPX, TCX and FIT; describes GPX as route data and TCX as carrying training data, and supports multisport TCX exports. [export documentation](https://support.polar.com/us-en/export-training-sessions-flow)                                                                                                                          | Fixtures: ordinary activity, non-geographic activity and multisport structure.                                                                                                            |
| Garmin Connect import            | Accepts FIT, GPX and TCX activities, but notes that third-party TCX can lack Garmin-required structure; GPX needs time. [upload documentation](https://support.garmin.com/en-AU/?faq=j3epr66mmJ0V26Yq0SO6IA)                                                                                                                                 | A generated GPX passing GPSGoblin's parser is insufficient. Test a synthetic/permissioned output through an independent validator and, if Garmin is a claimed destination, Garmin itself. |
| Google My Maps                   | Lists GPX but not TCX; other-file limit is 40 MB and imports must stay within its documented data restrictions. [import documentation](https://support.google.com/mymaps/answer/3024836?co=GENIE.Platform%3DDesktop&hl=en-GB)                                                                                                                | This is the clearest reviewed compatibility task. Do not promise success for every GPX or ignore My Maps limits.                                                                          |
| Strava, komoot and Polar imports | Each accepts TCX directly in the documented activity/route flow. [Strava](https://support.strava.com/en-us/articles/15402066-how-do-i-get-my-activities-to-strava), [komoot](https://support.komoot.com/hc/en-us/articles/10115477099674-Export-and-import-Routes-and-Activities), [Polar](https://support.polar.com/en/how-to-import-route) | Do not market these as destinations that generally require TCX conversion.                                                                                                                |

No public exporter fixture was copied into the repository during this investigation. A delivery ticket must obtain synthetic or permissioned, sanitised fixtures with recorded exporter/version provenance. It must include TCX 2 activities, courses, multisport, missing positions, multiple tracks, common extensions, unknown extensions, malformed XML, `DOCTYPE`, duplicate/invalid values and empty geographic content.

## Recurring cost and maintenance

Within the existing static deployment, runtime monetary cost is effectively unchanged: parsing and serialization happen on the person's device, with no conversion API, account integration, storage, egress service or paid dependency. This does not make the feature free overall.

Recurring burdens would be:

- monitoring Garmin, Strava and Polar exporter changes and refreshing permissioned fixtures;
- maintaining namespace/version and extension coverage without overstating full TCX compatibility;
- regression-testing XML security, large-file memory, worker cancellation and output escaping;
- testing GPX output independently as destinations change their import rules;
- keeping loss copy aligned with actual fields and supported mappings; and
- maintaining an indexable converter page in a crowded free-tool category.

The principal commercial cost is opportunity cost: design, fixture acquisition, compatibility QA and ongoing support would be spent on a task whose reachable demand and revenue are unmeasured.

## Go/no-go gates

### Current result: no-go for a delivery ticket

Do not create or implement a TCX-to-GPX ticket solely because FIT is blocked or TCX is easier. The current evidence fails the commercial gate: a real destination gap exists, but common exporters already offer GPX, common importers often accept TCX, free local converters are plentiful, and no acquisition or revenue evidence differentiates GPSGoblin.

### Evidence that would change the decision

Create a bounded ticket only if at least one of these appears:

- existing Search Console data shows recurring, relevant TCX-to-GPX queries or impressions with a credible page opportunity;
- a user report names a source/destination pair where direct GPX export or TCX import is unavailable or fails, with a permissioned representative file;
- a first-party destination changes its documented formats in a way that creates a clear TCX-to-GPX need; or
- an adjacent, already-approved TCX viewer supplies the parser, fixtures and source model, materially reducing incremental delivery and maintenance while preserving a useful conversion task.

Even then, implementation must stop before UI work if any technical gate fails:

1. No Garmin schema or generated derivative is bundled without an explicit permission/legal decision.
2. The parser distinguishes TCX 2 activities, courses, multisport and unsupported workout-only content without flattening structure.
3. The field-by-field preservation/loss contract above is approved, including the core-GPX-only extension decision.
4. Permissioned Garmin, Strava and Polar fixtures plus synthetic hostile cases produce known-answer results.
5. Output passes an independent GPX 1.1 validation and at least one named-destination interoperability check; self-reimport is not enough.
6. Browser performance and recovery pass representative desktop/phone checks without an unapproved hard limit.

Technical acceptance would prove a trustworthy bounded conversion. Commercial success would still require people to discover and complete the task and, when monetisation is separately approved, contribute revenue above operating cost. Shipping another indexable page is not success by itself.
