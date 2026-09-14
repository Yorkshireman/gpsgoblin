import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

// Static HTML cannot use per-request nonces. Hash the exact exported scripts,
// including Next's hydration payload and next-themes' initial theme script.
const output = path.resolve('out');
const hashes = new Set();
const htmlFiles = readdirSync(output, { recursive: true }).filter((file) => {
  return file.endsWith('.html');
});
if (!htmlFiles.length) throw new Error('Build the static export before generating headers.');
for (const file of htmlFiles) {
  const html = readFileSync(path.join(output, file), 'utf8');
  for (const [, attributes, script] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    if (!/\bsrc\s*=/i.test(attributes)) {
      hashes.add(`'sha256-${createHash('sha256').update(script).digest('base64')}'`);
    }
  }
}
const policy = [
  "default-src 'self'",
  `script-src 'self' ${[...hashes].sort().join(' ')}`,
  "script-src-attr 'none'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "connect-src 'self' https://tile.openstreetmap.org",
  "worker-src 'self'",
  "font-src 'self'",
  "object-src 'none'",
  "base-uri 'none'",
  "frame-ancestors 'none'",
  "form-action 'none'"
].join('; ');
const headers = `/*
  Content-Security-Policy: ${policy}
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  X-Frame-Options: DENY
  Permissions-Policy: camera=(), microphone=(), geolocation=()

https://:version.:subdomain.workers.dev/*
  X-Robots-Tag: noindex
`;
// Cloudflare Static Assets rejects individual lines over 2,000 characters. Fail the
// build rather than ship a silently missing policy as the site grows.
if (headers.split('\n').some((line) => { return line.length > 2000; })) {
  throw new Error('Security headers exceed the Cloudflare Static Assets line limit.');
}
writeFileSync(path.join(output, '_headers'), headers);
console.log(`Generated security headers for ${htmlFiles.length} HTML files (${hashes.size} inline script hashes).`);
