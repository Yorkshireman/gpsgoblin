# Workers Static Assets deployment

The owner approved Workers Static Assets on 14 September 2026, replacing the
undeployed Pages plan. `wrangler.jsonc` serves only the Next static export `out/`.
There is no application Worker script, OpenNext adapter, server-side GPX handling,
asset binding or custom-domain route in this configuration. Worker observability
is disabled; Cloudflare's platform logging/services still need an owner assessment.

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

These are reference settings for the guided dashboard setup, not a record that
an application has been created or deployed:

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
it. Select that branch for initial verification if creating the application now,
without attaching gpsgoblin.com. Once reviewed work is merged, use master as the
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
