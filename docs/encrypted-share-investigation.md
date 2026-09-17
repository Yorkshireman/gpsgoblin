# Zero-cost encrypted short share links — issue #32

Assessed: 17 September 2026. Scope: investigation only, as required by
[issue #32](https://github.com/Yorkshireman/gpsgoblin/issues/32). No service was
provisioned, file uploaded, sharing feature implemented or deployment performed.
Personal recordings were not used or published.

## Recommendation and evidence boundary

Recommend a separately authorised, bounded implementation using **Cloudflare
Workers Free and D1 Free**, with encryption on the sender's device and the key
in the link fragment. Under the documented Free plans, exhaustion rejects work
rather than charging overages. This can meet **zero additional service cost**
provided the account remains on Free and no billable products are enabled.
It cannot guarantee permanent free pricing, unlimited usage or availability
under abuse. If those are required, the requirement cannot be met by this
assessment. Existing domain costs remain outside the incremental sharing cost.
[Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/),
[D1 exhaustion policy](https://developers.cloudflare.com/d1/reference/faq/).

Evidence quality: provider limits and billing behaviour are **documented primary
evidence**, checked on the assessment date. Capacity examples and the proposed
architecture are **design estimates**, not measured service performance.
Messaging compatibility is **unverified for the proposed links**. The owner's
tests in #32 and [PR #31](https://github.com/Yorkshireman/gpsgoblin/pull/31) establish
the rejected long-link approach's limitation; they do not establish that a new
design works. No real-device or new browser UX checks took place in this
documentation-only investigation.

The checked-out master branch has no sharing module; the IDE's named sharing
files exist on PR #31's retained branch, `docs/fragment-only-gpx-sharing`.
That PR is open, draft and explicitly rejected for release. Its confirmation
UI and import flow could be reused in later work, but its current behaviour
must not be described as released.

## Service comparison

| Service                    | Storage, operations and bandwidth                                                                                                                                                                                                             | Exhaustion and conclusion                                                                                                                                                                                      |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Workers Free + D1 Free     | Worker: 100,000 requests/day and 10 ms CPU/invocation. D1: 5 million rows read/day, 100,000 rows written/day, 500 MB per database, 5 GB account total across up to ten databases; maximum BLOB/string/row 2,000,000 bytes. No D1 egress fees. | Worker requests and D1 queries fail at caps. Best candidate with accepted outages; use one database initially.                                                                                                 |
| Workers + R2               | Standard free allowance: 10 GB-month, 1 million Class A and 10 million Class B operations/month; free egress.                                                                                                                                 | Storage and operations beyond the allowance are billable. Reject for strict zero-cost operation; an alert is not a cap.                                                                                        |
| Supabase Free              | 500 MB database, 1 GB file storage, 5 GB uncached and 5 GB cached egress; unlimited API requests.                                                                                                                                             | Free has no usage charges, but quota excess can cause restrictions after grace periods, and inactive projects pause after a week. Alternative with more operational uncertainty for infrequently opened links. |
| Firebase Spark / Firestore | 1 GiB storage, 50,000 reads, 20,000 writes and 20,000 deletes/day; 10 GiB outbound/month; maximum document 1 MiB.                                                                                                                             | Spark shuts off affected usage instead of billing overages. TTL deletion and Cloud Functions require billing; Cloud Storage now requires Blaze. Less suitable for unattended expiry without another service.   |

Sources: [Workers limits](https://developers.cloudflare.com/workers/platform/limits/),
[D1 limits](https://developers.cloudflare.com/d1/platform/limits/),
[D1 pricing](https://developers.cloudflare.com/d1/platform/pricing/),
[R2 pricing](https://developers.cloudflare.com/r2/pricing/),
[Supabase pricing](https://supabase.com/pricing),
[Supabase cost controls](https://supabase.com/docs/guides/platform/cost-control),
[Supabase quota restrictions](https://supabase.com/docs/guides/platform/billing-faq),
[Firestore quotas](https://firebase.google.com/docs/firestore/quotas),
[Firebase plan behaviour](https://firebase.google.com/docs/projects/billing/firebase-pricing-plans),
[Firebase Storage billing change](https://firebase.google.com/docs/storage/faqs-storage-changes-announced-sept-2024).

Workers KV Free is another hard-capped alternative: 1 GB stored, 100,000 reads/day
and 1,000 writes, deletes and lists/day each, with no egress fees. It supports
25 MiB values and automatic expiry, but eventual consistency complicates immediate
recipient opening/deletion and conflicting concurrent updates undermine atomic
admission counters. It needs stronger coordination or acceptance of that friction;
prefer D1 for the initial bounded design.
[KV pricing](https://developers.cloudflare.com/kv/platform/pricing/),
[KV writes and expiry](https://developers.cloudflare.com/kv/api/write-key-value-pairs/).

D1 reads count scanned rows, not just returned rows. Deletes and index changes
consume writes too. Index lookups and expiry; measure actual query metadata before
setting budgets. Daily limits reset at midnight UTC. Cloudflare specifically
confirmed Free read/write enforcement on 1 September 2026; exceeding limits does
not remove stored data.
[D1 accounting](https://developers.cloudflare.com/d1/platform/pricing/),
[enforcement announcement](https://developers.cloudflare.com/changelog/post/2026-09-01-d1-free-tier-limit-enforcement/).

## Proposed bounded design

These are recommendations for a separate ticket, not agreed requirements.

1. Keep ordinary viewing local. Only an explicit **Create share link** action
   compresses and encrypts the selected GPX. Encrypt the filename, format and
   original file bytes inside a versioned envelope; do not expose them as server
   metadata. Optional start/finish protection is separate scope.
2. Use browser Web Crypto AES-256-GCM with a fresh random key per share and a
   fresh 96-bit IV. Authenticate the format version and share identifier as
   additional data. Store only ciphertext, IV, version, random identifier,
   expiry and a hash of a separate deletion capability. Never send the encryption
   key to the API. AES-GCM and key generation are specified by
   [Web Cryptography](https://www.w3.org/TR/webcrypto-2/).
3. Upload binary ciphertext to a small application Worker with a D1 binding.
   Do not parse, compress or decrypt GPX on the Worker. Generate a cryptographically
   random 128-bit identifier; avoid sequential IDs and content hashes. Keep
   binding credentials and challenge secrets out of the static build.
4. Return a link shaped like
   `https://gpsgoblin.com/tools/gpx-file-viewer#share=v1.ID.KEY`. Base64url gives
   22 characters for a 128-bit ID and 43 for a 256-bit key: **about 120 characters**
   independent of file size. The IV stays with ciphertext. Put both ID and key
   in the fragment so generic preview requests need neither. Fragments are
   separated before resource dereferencing under
   [RFC 3986 section 3.5](https://www.rfc-editor.org/rfc/rfc3986#section-3.5).
5. On opening, capture the fragment into memory and remove it from the address
   before other application work. Retrieve ciphertext by ID, authenticate/decrypt,
   decompress with bounded output, then use the existing local import flow.
   Never send the complete link in fetch, logging, diagnostics or analytics.
   The API ID is opaque but still sensitive metadata. Preserve any existing
   viewer workspace until successful import; offer a clear way to reopen after
   failure without losing the key prematurely.
6. Serve the viewer and generic sharing metadata as static assets, even when
   the share API is exhausted. Limit Worker routing to API paths rather than
   running it before every site asset. Static-asset requests are free/unlimited,
   while Worker-first paths can return 429 at the Free request cap.
   [Static Assets billing and routing](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/).

### Capacity, admission and abuse

Prototype one D1 database, seven-day link validity and a **1,000,000-byte encrypted
payload ceiling**. These limits need owner agreement before implementation; they
apply to optional sharing, not local viewing. D1's row cap makes unrestricted file
sharing impossible with a single-row design. Do not silently truncate or simplify
the original file. Benchmark representative small, ordinary and large synthetic
GPX files, including compression ratios, phone memory and Worker serialization
CPU, before accepting this ceiling. Chunking is a separate complexity decision.

For sizing only: at 100 new shares/day, seven days and 250,000 bytes average
ciphertext, live payload is 175 MB. At 1,000,000 bytes average it is 700 MB,
already beyond one Free database. Indexes, metadata and SQLite overhead require
extra space. At three recipient opens/share, the same example needs roughly
400 API requests/day before challenges, retries, deletion and cleanup; these
are scenarios, not traffic forecasts or guaranteed throughput. There is no
separate bandwidth overage for D1, but latency/CPU and usage policies still need
validation. See [D1 transfer pricing](https://developers.cloudflare.com/d1/platform/pricing/).

Use an atomic database admission transaction for daily creation count and total
active payload bytes; account for concurrent writes, failed uploads and retries.
Suggested starting budgets are 100 creations/day and 250 MB live ciphertext,
with a measured database-size guard below 500 MB. Reserve write capacity for
deletion/cleanup, and read/request headroom for legitimate recipients. Do not
confuse payload bytes with actual database size or consider a counter sufficient
for provider quotas. Avoid automatic retries that amplify an outage.

Require a verified Turnstile challenge before upload and a coarse per-client
throttle; reject unsupported methods, oversized streamed bodies and malformed
envelopes early. Turnstile's Free plan allows unlimited challenges, but tokens
must be checked server-side and are single-use with five-minute validity. This
adds a third-party browser request and possible challenge friction.
[Turnstile plans](https://developers.cloudflare.com/turnstile/plans/),
[server validation](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/).

Origin/CORS checks are supplementary, not authentication. A client can upload
arbitrary encrypted material; the server cannot prove it is GPX without defeating
the privacy design. Disallow listing/search, use unguessable IDs, return only
binary attachments from the API, and never serve uploads as HTML. Provide an
operator disable/delete procedure and assess provider acceptable-use obligations
before release. Do not require a new public contact setup, which remains deferred.
Abuse can consume the entire free request allowance even when admission rejects
uploads. Challenges and throttles reduce abuse; **they cannot guarantee
availability against a distributed attacker**.

### Expiry, deletion and failures

Reject expired records on every retrieval using server time. Run scheduled,
indexed, bounded cleanup; expiry is not deletion by itself. Provide an optional
sender-only deletion capability, separate from the recipient link. Losing it
means relying on expiry; cancelling the share sheet after upload must not be
described as deleting the share. Avoid automatic durable browser storage unless
separately approved.

D1 Free supports seven days of Time Travel recovery. Deleted ciphertext may
therefore remain recoverable in provider history after removal from the active
table. Cleanup can be delayed by outages or exhausted write quota. Do not promise
erasure from every backup at the expiry instant, or assign a fixed retention
period to provider network logs. Restoring a database must not reactivate expired
or explicitly deleted shares: preserve deletion records across restoration or
disable all restored shares until reconciled.
[D1 Time Travel](https://developers.cloudflare.com/d1/reference/time-travel/).

| State                                                                   | Proposed user feedback and behaviour                                                                                                                           |
| ----------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Offline, creation denied, full storage or provider outage               | “A share link could not be created. Your file is still open. Try again later.” Retain original and viewer choices.                                             |
| Payload exceeds agreed sharing ceiling                                  | Explain that this file cannot use share links; keep local viewing available. Do not offer a GPX attachment as the product solution.                            |
| Expired, deleted or absent                                              | “This share link is no longer available. Ask the sender to create a new one.” Avoid claiming expiry when absence cannot be distinguished.                      |
| Read limit or temporary network/service failure                         | “This shared file could not be opened right now. Try opening the link again later.” Distinguish temporary failure from permanent absence.                      |
| Missing key, unsupported version, authentication failure or invalid GPX | Explain damaged/unsupported link and ask for a new one; never render unauthenticated bytes. Use bounded decompression and existing malformed-input validation. |

Provider rejection may happen before application code runs, so client recovery
must tolerate non-JSON error pages, 429/5xx and Worker error 1027. There is no
fallback to a paid plan, another billable store or the rejected oversized link.
Confirm the actual **Workers subscription**, not just the zone's Free plan;
keep R2 and other paid products disabled. Capture account billing evidence before
release and recheck terms before later upgrades. No dashboard/account verification
was performed in this investigation.

## Privacy and security implications

This design conflicts with the current no-upload/no-cloud-storage boundary in
[product-spec section 13](product-spec.md#13-privacy-security-and-third-party-boundaries)
and the [fragment-only ADR](adr/0001-fragment-only-gpx-share-links.md).
Implementation requires an explicitly approved exception for optional encrypted
sharing, an updated ADR/specification and a reviewed privacy inventory. Keep
ordinary import/local-viewing promises intact while qualifying universal claims
on the landing page, privacy page, metadata, help and share confirmation.

Suggested confirmation: “Creating a link uploads an encrypted copy of your file.
Anyone with the link can open its locations and pass it on. The link works for
seven days.” The duration is provisional. Explain optional deletion, and that
deleting a share cannot remove copies already saved by recipients. Remove
“GPSGoblin does not store your file” from the reused sharing dialog.

Cloudflare receives ciphertext, its size, share access identifiers/times, IP
addresses and ordinary connection information; Turnstile adds its own processing.
The key remains absent from ordinary HTTP requests, but the full link is visible
to sender/recipient messaging clients, the clipboard and potentially browser
history, extensions and screenshots. Anyone obtaining the full link can decrypt
and forward it. Fragment removal reduces exposure, not all prior traces.
Generic previews must contain no route, filename, location or share-specific
title. Do not perform consume-on-first-read: previews/scanners must not revoke
a link. Document network-error-report metadata separately as in
[the existing hosting assessment](hosting-privacy.md).

Encryption protects stored content from a provider/database reader **without
the key**. It does not protect against compromised application JavaScript or a
provider that changes the delivered decrypting client. Isolate sensitive sharing
work from future advertising/analytics scripts; retain strict CSP and synthetic
network canaries. Test that keys, filenames and plaintext never leave the browser
except through the deliberately selected messaging share action. No claim of
independent security audit or legal compliance is made here.

## Sender/recipient friction and messaging evidence

Sender: confirm upload, wait for compression/encryption/upload, then tap a fresh
**Share link** button or copy the ready link. Do not call `navigator.share()` only
after awaiting a potentially slow upload: Web Share requires transient user
activation. A second explicit tap gives reliable activation; retain the ready
link when sharing is cancelled. Share URL data, not a TXT/GPX file. The API cannot
tell the website which target was chosen, and completion is not proof of message
delivery. [Web Share specification](https://www.w3.org/TR/web-share/).

Recipient: tap an ordinary HTTPS link, then automatically retrieve/decrypt/import
in the viewer without registration, manual download or file selection. Internet
access and an unexpired share are necessary. Some in-app browsers may need an
“Open in browser” recovery; validate before prescribing this as normal friction.
Short length addresses the observed long-message/TXT problem by design, but it
does not prove fragment preservation or clickability in either messaging app.

Signal documents HTTPS link previews and optional preview generation; that is
not a specification of maximum URL length or fragment preservation. No reviewed
first-party WhatsApp/Signal source establishes end-to-end acceptance of this
particular encrypted-link format on all four app/platform combinations.
[Signal preview support](https://support.signal.org/hc/en-us/articles/360022474332-Link-Previews).

Before release, record **WhatsApp iOS, WhatsApp Android, Signal iOS and Signal
Android** results, with app/OS/browser versions. Use synthetic GPX only. For each,
exercise native URL sharing and pasted links, previews on/off, recipient tapping
and forwarding, in-app/external browser handling, complete fragment preservation,
automatic loading, expiry and service failure. Explicitly verify a normal
clickable message rather than a TXT attachment. Native messaging checks need
real-device evidence; Playwright viewport emulation cannot substitute for it.

## Proposed separate implementation ticket

Proposed title: **Add bounded encrypted GPX share links on hard-capped free storage**.
No issue or PR was published by this investigation.

Scope: browser compression/encryption; minimal upload/read/delete Worker and D1
schema; seven-day expiry and cleanup; challenge/admission limits; ready-link share
UI and normal recipient import; copy/privacy/spec/ADR updates; operator disable
and rollback procedure. Reuse reviewed parts of PR #31 where appropriate.
Exclude accounts, paid services, permanent storage, public galleries, route
previews, GPX attachments, location sanitisation and advanced analysis.

Acceptance criteria:

- Approve the storage exception, proposed expiry, deletion UX and payload/global
  budgets before implementation. Keep any owner-approved sharing size ceiling
  distinct from unrestricted local-viewing goals.
- Verify actual Free subscription and no enabled billing dependencies; demonstrate
  denial at local budgets and document provider exhaustion behaviour without
  exhausting public production quotas. Never auto-upgrade.
- Round-trip synthetic GPX bytes unchanged; authenticate tampering/version/ID;
  test concurrent admission, retries, cancellation, bounded decompression,
  expiry, deletion, backup restore and cleanup quota exhaustion.
- Measure phone processing/memory and Worker CPU/row size at proposed limits;
  choose lower limits or stop if Free cannot support representative use.
- Exercise confirmation, ready/share/copy, loaded recipient and all error states
  in the whole page at 1440×900, 1280×720, 390×844 and 375×667, including keyboard
  and touch. Keep progress and feedback beside the action; preserve the viewer
  and focus on failure. Separately complete the four real-device messaging tests.
- Audit all public privacy/copy surfaces and outbound synthetic canaries; generic
  metadata only, no plaintext/key logging, no activity analytics. Review storage
  retention, supplier obligations and abuse operations before release.
- Run repository-required checks and obtain separate deployment authorisation.

The investigation recommendation is complete; implementation, account verification,
benchmarks, security/UX validation and messaging compatibility remain future gates.
