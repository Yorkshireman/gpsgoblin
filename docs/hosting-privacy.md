# Cloudflare hosting privacy assessment

Assessed: 14 September 2026. Primary sources accessed on that date. Scope: Stage 1 Workers Static Assets hosting, workers.dev verification deployments and the public gpsgoblin.com deployment. This is technical evidence for [product-spec.md](product-spec.md) sections 13, 18 and O5/O6, not legal advice or a general certification of Cloudflare account settings.

## What the host can receive

Cloudflare's policy distinguishes visitors to its own website from end users of customer sites. For the latter, it describes processing IP addresses, routing and system information, and traffic data. It also describes derived network statistics and security information. Its retention policy uses purpose, sensitivity and legal obligations rather than a universal number of days. The reviewed policy does **not** establish a Workers Static Assets request/IP retention period for this account. Do not substitute the separate 1.1.1.1 DNS retention promise or claim that hosting collects nothing. [Cloudflare Privacy Policy, sections 2 and 11](https://www.cloudflare.com/privacypolicy/)

GPSGoblin's configuration deploys static files from `out/`, has no Worker application script or storage bindings, and sets `observability.enabled` to false. This limits application logging; it is not an account-wide switch for Cloudflare's network processing. Workers Logs is the separately configured facility for invocation/custom logs and exceptions. Platform metrics are another facility. [Repository configuration](../wrangler.jsonc), [Workers Logs](https://developers.cloudflare.com/workers/observability/logs/workers-logs/), [Workers metrics](https://developers.cloudflare.com/workers/observability/metrics-and-analytics/)

## Automatic network-error reports

On 14 September 2026 at 19:10:13 UTC, a read-only request to `https://gpsgoblin.andrew-stelmach.workers.dev/privacy` returned HTTP 200 with:

- `Report-To`: group `cf-nel`, endpoint on `a.nel.cloudflare.com/report/v4`, `max_age` 604800.
- `NEL`: `report_to` `cf-nel`, `success_fraction` 0, `max_age` 604800.

This confirms a reporting policy was served, not that a browser actually submitted a report. Under the NEL specification, zero success sampling excludes successful-request reports; omitted failure sampling defaults to all eligible failures. Browser support and delivery still matter. The 604800 seconds (seven days) is the browser policy lifetime, **not Cloudflare's report retention period**. [W3C NEL specification, section 4.1](https://www.w3.org/TR/network-error-logging/#policy-delivery)

Cloudflare's NEL documentation shows diagnostic fields including URL, referrer, request method, status, timing and failure type. It says it derives network provider (ASN), country and metro area from the source IP; that IP exists only during request processing and is not logged in its NEL pipeline. It says personally identifiable data is purged after processing and reports are not shared with third parties. These are Cloudflare's published NEL-specific statements; they do not establish retention for ordinary hosting traffic or a fixed duration for derived NEL statistics. [Cloudflare NEL documentation](https://developers.cloudflare.com/network-error-logging/)

Cloudflare documents a zone dashboard/API opt-out and a support-level permanent opt-out. These are zone controls. No reviewed source establishes a per-Worker setting for disabling NEL on the shared workers.dev domain. No account setting was changed or support request sent in this assessment. A future custom-domain configuration needs its own verification. [Cloudflare NEL opt-out](https://developers.cloudflare.com/network-error-logging/#privacy)

The practical copy implication is to disclose that supported browsers may send Cloudflare connection-failure diagnostics, including page addresses. This does not imply GPX upload: keep imported names, coordinates and measurements out of page URLs and outbound requests, and retain the synthetic-data network checks. NEL is browser-managed reporting, so an application request listener alone is insufficient to prove its absence.

## Web Analytics is separate

Cloudflare Web Analytics uses a JavaScript beacon, loaded from `static.cloudflareinsights.com`, with reports sent to `/cdn-cgi/rum` on the proxied site or Cloudflare's collection host. It is distinct from response-header NEL and edge analytics. Automatic injection can be enabled in the account for a proxied domain even without a repository script. Inspect actual returned HTML and network traffic, as well as configuration, before claiming it is absent on a new host. [Web Analytics collection](https://developers.cloudflare.com/web-analytics/data-metrics/data-origin-and-collection/), [Web Analytics setup](https://developers.cloudflare.com/web-analytics/get-started/), [Web Analytics FAQ](https://developers.cloudflare.com/web-analytics/faq/)

Product telemetry remains disabled under O6. This assessment does not approve Web Analytics, another tracker or changes to CSP to accommodate one.

## Owner-provided dashboard evidence — 14 September 2026

The GPSGoblin Worker overview screenshot showed Workers Logs and Workers Traces
disabled, zero bindings, the workers.dev hostname and no custom domains or
routes. This corroborates the repository configuration on the deployed Worker.

The owner confirmed that selecting Analytics → Web analytics directly opened
the initial “Get started with Web Analytics” hostname setup screen already
shared. This supports that Web Analytics has not been configured in the viewed
account; it is owner-provided UI evidence, not an API enumeration of sites.
Together with the absent beacon in the sampled hosted page, this supports Web
Analytics being inactive for GPSGoblin. No hostname was entered and no analytics
service was enabled. No further dashboard action is needed for this check.

These observations do not disable or negate Cloudflare's ordinary network
processing or the separately observed NEL headers. Public-domain checks below
cover returned pages and browser-observed requests, not every account setting.

## Public-domain verification — 14 September 2026

The issue #7 cutover checks loaded the public root, viewer, privacy and limitations
pages and ran eight hosted Chrome desktop/mobile hydration and security checks on
`https://gpsgoblin.com`. Synthetic activity canaries did not appear in outbound
requests. Sampled public pages contained no Web Analytics beacon; NEL remained
present and is disclosed. The automated map checks blocked external tiles, while
successful public-domain map use is owner-reported from the physical-phone check.

This reuses the recorded cutover evidence; it is not a second manual test. It does
not turn sampled browser traffic into proof of every Cloudflare account/zone
setting, every browser-managed NEL report or a fixed retention period.

## Evidence boundaries and remaining verification

The same hosted privacy page was loaded in a fresh automated Chrome context on
14 September 2026. Page-observed requests used only the testing origin; all ten
external script elements referenced same-origin Next assets, and the context had
no cookies after loading. This is a sample of that page, not proof of account-wide
settings or absence of browser-managed NEL reports. No Web Analytics beacon was
observed. Existing synthetic activity-canary tests also passed on the rebuilt
local export; they do not capture every browser-managed reporting mechanism.

The public privacy page now explains connection-failure reporting and the fact
that GPSGoblin keeps activity contents out of page addresses. It makes no fixed
host-retention or no-network-traffic promise. Next.js build telemetry previously
reported by GitHub Builds is separate from visitor traffic; configured Wrangler
metrics opt-out does not disable Next.js telemetry. Neither is represented as
visitor product analytics, and no build or account setting changed here.

- The source review and observed headers establish the need for ordinary-hosting and network-error-reporting disclosure. They do not certify all Cloudflare account/zone settings or establish a universal retention period.
- The public-host cutover checks inspected NEL, injected scripts and outbound activity canaries. The earlier workers.dev cookie sample and owner-provided dashboard evidence remain bounded evidence, not an account-wide certification.
- If a fixed retention promise or guaranteed NEL removal is required, obtain service/account-specific evidence before making that promise. The reviewed documentation is insufficient for either claim.
- Contact details remain indefinitely deferred and optional for later. The owner removed them as a launch requirement on 14 September 2026; they no longer block public release. Other privacy and host-verification requirements remain unchanged.
