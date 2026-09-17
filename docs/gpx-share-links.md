# GPX share-link limits

GPSGoblin share links contain a gzip-compressed, versioned copy of the original
GPX bytes in the URL fragment. Fragments are not included in the HTTP request
that loads the viewer.

The initial limits are deliberately conservative:

| Constraint          |             Limit | Purpose                                                          |
| ------------------- | ----------------: | ---------------------------------------------------------------- |
| Complete URL length | 48,000 characters | Keep copied links below the common 64 KB compatibility boundary. |
| Decoded GPX content |   1,000,000 bytes | Bound decompression work before the normal GPX import begins.    |

These are sharing limits only. They do not restrict opening a GPX file through
the normal picker. Compression is checked before the Share button becomes
available; a file that cannot fit the link is still available for direct file
sharing.

Issue #27 explicitly authorises these sharing-only safety limits. They are not
general upload limits. The URL ceiling was chosen after a local check of the
ignored representative recordings, and the decoded-content ceiling bounds the
browser work before the normal importer starts.

The limits have focused codec coverage for valid round trips, damaged data,
unknown versions, URL length and decoded-content size. Local byte-level checks
against the ignored `private-recordings/` files confirmed that a 223 KB recording
fits the URL limit, while two 2–5 MB recordings are rejected by the decoded-size
limit. Those recordings remain uncommitted.
