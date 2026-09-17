# Fragment-only GPX share links

GPSGoblin shares GPX files without server storage by placing a compressed,
versioned payload in a URL fragment. The recipient decodes that payload in the
viewer and the app removes it from the visible address after opening; sending
the link is therefore equivalent to sending the file. This preserves the
browser-only product boundary and avoids ongoing hosting costs, at the cost of
links being bearer links that cannot be revoked or made to expire.

## Consequences

- Sharing requires an explicit, plain-language confirmation and must explain
  what the recipient will see.
- The payload must never be placed in a query string or included in analytics,
  error reporting, social metadata or other outbound requests.
- Initial sharing uses the original GPX file. Optional location protection is
  a separate sanitised-copy capability, not a map-only concealment.
