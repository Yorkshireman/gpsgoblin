import {
  decodeGpxShareLink,
  encodeGpxShareLink,
  SHARE_LINK_MAX_DECODED_BYTES,
  SHARE_LINK_MAX_URL_LENGTH
} from './gpxShareLink';
import { Blob } from 'node:buffer';
import { CompressionStream, DecompressionStream } from 'node:stream/web';
import { TextDecoder, TextEncoder } from 'node:util';
import { gzipSync } from 'node:zlib';

Object.assign(globalThis, {
  Blob,
  CompressionStream,
  DecompressionStream,
  TextDecoder,
  TextEncoder
});

const gpx =
  '<gpx version="1.1"><wpt lat="53.8" lon="-1.5"><name>Share fixture</name></wpt></gpx>';
const gpxBytes = new TextEncoder().encode(gpx);

it('encodes a versioned GPX payload in a URL fragment and decodes the original file', async () => {
  const link = await encodeGpxShareLink(
    gpxBytes.buffer,
    'https://gpsgoblin.com/tools/gpx-file-viewer'
  );

  expect(link).toMatch(
    /^https:\/\/gpsgoblin\.com\/tools\/gpx-file-viewer#gpx-share=v1\./
  );
  expect(link).not.toContain('?');

  await expect(decodeGpxShareLink(new URL(link).hash)).resolves.toEqual(
    gpxBytes.buffer
  );
});

it('rejects an unknown share-link version', async () => {
  await expect(
    decodeGpxShareLink('#gpx-share=v2.not-a-real-payload')
  ).rejects.toThrow('This shared file uses a newer link format.');
});

it('rejects damaged share-link data', async () => {
  await expect(decodeGpxShareLink('#gpx-share=v1.%')).rejects.toThrow(
    'This share link is damaged. Ask the sender to make a new one.'
  );
});

it('rejects a link that exceeds the sharing URL limit', async () => {
  const fragment = `#gpx-share=v1.${'a'.repeat(SHARE_LINK_MAX_URL_LENGTH)}`;

  await expect(decodeGpxShareLink(fragment)).rejects.toThrow(
    'This share link is too long to open safely. Ask the sender to share the file another way.'
  );
});

it('does not create a link from content above the decoded-content safety limit', async () => {
  await expect(
    encodeGpxShareLink(
      new ArrayBuffer(SHARE_LINK_MAX_DECODED_BYTES + 1),
      'https://gpsgoblin.com/tools/gpx-file-viewer'
    )
  ).rejects.toThrow(
    'This shared file is too large to open safely. Ask the sender to share the file another way.'
  );
});

it('rejects compressed link data that expands beyond the decoded-content safety limit', async () => {
  const compressed = gzipSync(
    new Uint8Array(SHARE_LINK_MAX_DECODED_BYTES + 1)
  ).toString('base64url');

  await expect(
    decodeGpxShareLink(`#gpx-share=v1.${compressed}`)
  ).rejects.toThrow(
    'This shared file is too large to open safely. Ask the sender to share the file another way.'
  );
});
