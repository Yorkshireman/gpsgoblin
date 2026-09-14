# Workers Static Assets deployment

The owner approved Workers Static Assets on 14 September 2026, replacing the
undeployed Pages plan. `wrangler.jsonc` serves only the Next static export `out/`.
The apex gpsgoblin.com custom domain is recorded in Wrangler; workers_dev is
disabled and preview_urls remains enabled. There is no application Worker script,
OpenNext adapter, server-side GPX handling or asset binding. Worker observability
is disabled; verified platform behaviour and dashboard evidence are recorded in
[hosting privacy](hosting-privacy.md).

## Local validation

Use Node 24.20.0 and pnpm 12.3.4 (the package manager is pinned in package.json).
Wrangler is pinned in the lockfile. Its esbuild/workerd installation scripts are
explicitly allowed in pnpm-workspace.yaml; other existing restrictions remain.

- `pnpm build`: produces `out/` and generates CSP hashes and preview headers.
- `WRANGLER_SEND_METRICS=false pnpm deploy:check`: validates the asset configuration without uploading.
- `pnpm test:browser:hosting --workers=2`: starts an isolated local Workers emulator and runs security/hydration checks; stops it on completion.
- `WRANGLER_SEND_METRICS=false pnpm preview:hosting`: optional manual localhost preview on port 4186; stop with Ctrl+C.

The hosting test uses the actual Workers asset emulator. The ordinary browser
suite retains its small Python server, which recognises only our two header rules.
Neither establishes deployed Cloudflare behaviour.

## Cloudflare build settings

The GitHub integration has been deployed and verified on workers.dev; see
[release evidence](release-readiness.md). Current build settings:

| Setting | Value |
| --- | --- |
| Product | Workers, with GitHub integration |
| Repository | Yorkshireman/gpsgoblin |
| Worker name | gpsgoblin (must match wrangler.jsonc) |
| Root directory | Repository root |
| Build command | `pnpm run build` |
| Deploy command | `pnpm exec wrangler deploy` |
| Non-production branch command | `pnpm exec wrangler versions upload` |
| Build environment | `NODE_VERSION=24.20.0`, `PNPM_VERSION=12.3.4`, `WRANGLER_SEND_METRICS=false` |

The configuration must be committed and pushed to the branch being built first.
It currently lives on `feat/7-release-verification`; master does not yet contain
it. That branch is currently the temporary production build branch for the
workers.dev testing deployment. gpsgoblin.com is now attached; see the cutover evidence in release-readiness.md. Once reviewed work is merged, use master as the
production build branch and enable non-production branch builds for previews.
Do not treat the initial workers.dev deployment as public-release approval.

## Host and release checks

The generated `_headers` includes Cloudflare's documented host pattern
`https://:version.:subdomain.workers.dev/*` with `X-Robots-Tag: noindex`. This
covers the default worker URL as well as version/branch-alias URLs; it does not
match gpsgoblin.com. Noindex does not prevent someone opening a shared URL.

Before release, verify real HTTPS responses for the default worker URL, an
immutable version preview and a branch alias: CSP and noindex, direct nested
URLs, custom 404s, chart/map/import workers, and no prohibited outbound activity
contents. Keep canonical/sitemap metadata at https://gpsgoblin.com.

Custom-domain cutover is a separate authorised action after release gates pass.
Attach gpsgoblin.com, set `workers_dev: false` in the committed configuration,
and verify the public domain has no preview noindex header, the default route is
disabled, and preview URLs still work with noindex. This replaces the earlier
Pages-specific redirect requirement. No Pages project exists to redirect.
Keep a known-good deployed version for rollback; account-specific rollback and
build-branch settings still need confirmation on the actual host. Contact details
remain indefinitely deferred; this configuration does not declare release readiness.

## Sources

- [Workers migration guide](https://developers.cloudflare.com/workers/static-assets/migration-guides/migrate-from-pages/)
- [Static Assets headers](https://developers.cloudflare.com/workers/static-assets/headers/)
- [HTML routing](https://developers.cloudflare.com/workers/static-assets/routing/advanced/html-handling/)
- [Build branches](https://developers.cloudflare.com/workers/ci-cd/builds/build-branches/)
- [Preview URLs](https://developers.cloudflare.com/workers/versions-and-deployments/preview-urls/)

## Cutover preparation (historical plan)

Preparation checked 14 September 2026. The subsequent apex cutover was executed
by the owner and verified; see release-readiness.md. The observations below are
the pre-cutover rollback baseline.
Public DNS currently delegates to ns51.domaincontrol.com and
ns52.domaincontrol.com. Apex A records returned 13.248.243.5 and 76.223.105.230;
www is a CNAME to gpsgoblin.com. HTTPS returned the GoDaddy placeholder
(Server DPS). No MX or AAAA answers were returned by the sampled queries; this
is not a full authoritative zone export.

Cloudflare requires an active zone for a Workers Custom Domain. Before changing
nameservers, export/review the complete existing DNS zone, including TXT, mail,
verification and DNSSEC/DS settings. Preserve the placeholder during DNS onboarding.
Select only the free plan; registration remains with the existing registrar.
The owner must authorise DNS onboarding/cutover; these notes do not authorise it.

Once that prerequisite and release approval are satisfied, the implementation
change is to add a routes entry with pattern gpsgoblin.com and custom_domain true,
set workers_dev false and retain preview_urls true. Keep this change out of the
automatically deployed branch until cutover is authorised. The existing www
hostname needs a deliberate redirect to the canonical apex, preserving path and
query, plus HTTPS verification; attaching the apex alone does not cover www.

After deployment, check root and nested pages, canonical/Open Graph metadata,
sitemap/robots, absence of noindex on the public domain, disabled default
workers.dev route and retained noindex previews. Repeat privacy canaries,
CSP/hydration checks and the bounded map-referrer check on the public host.
Inspect its actual cookies, NEL and script injection. Only then record the
public-host gates as passed.

Merge order after authorisation is #20, then #21 with its base updated/reconciled
against the squash merge; rerun checks if reconciliation changes source. Move
Cloudflare's production build branch to master after master contains the hosting
setup. Keep non-production builds enabled. Do not close #6/#7 while their
remaining applicable acceptance criteria are incomplete.

Rollback has two different targets. An application regression can use a verified
previous Worker version (4342ec3a-9cac-4a0b-b833-874d5773ad49 was tested) through
Workers deployment rollback, followed by public-host verification. Restoring the
GoDaddy placeholder requires removing the custom-domain attachment and restoring
the captured DNS/routing configuration; Worker version rollback alone does not
restore the previous host. Keep the complete DNS export and placeholder service
available until the cutover is accepted. No rollback was performed as a test.

Sources: [Custom Domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/),
[rollbacks](https://developers.cloudflare.com/workers/versions-and-deployments/rollbacks/).
