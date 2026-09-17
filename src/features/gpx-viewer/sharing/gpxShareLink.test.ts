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

describe('when encoding a valid GPX file', () => {
  let link: string;

  beforeEach(async () => {
    link = await encodeGpxShareLink(
      gpxBytes.buffer,
      'https://gpsgoblin.com/tools/gpx-file-viewer'
    );
  });

  test('uses a versioned URL fragment', () => {
    expect(link).toMatch(
      /^https:\/\/gpsgoblin\.com\/tools\/gpx-file-viewer#gpx-share=v1\./
    );
    expect(link).not.toContain('?');
  });

  describe('when the recipient opens the link', () => {
    let decoded: ArrayBuffer;

    beforeEach(async () => {
      decoded = await decodeGpxShareLink(new URL(link).hash);
    });

    test('restores the original GPX bytes', () => {
      expect(decoded).toEqual(gpxBytes.buffer);
    });
  });
});

describe('when opening an invalid share link', () => {
  describe('when its version is unknown', () => {
    let opening: Promise<ArrayBuffer>;

    beforeEach(() => {
      opening = decodeGpxShareLink('#gpx-share=v2.not-a-real-payload');
    });

    test('explains that the link format is newer', async () => {
      await expect(opening).rejects.toThrow(
        'This shared file uses a newer link format.'
      );
    });
  });

  describe('when its payload is damaged', () => {
    let opening: Promise<ArrayBuffer>;

    beforeEach(() => {
      opening = decodeGpxShareLink('#gpx-share=v1.%');
    });

    test('offers a recovery message', async () => {
      await expect(opening).rejects.toThrow(
        'This share link is damaged. Ask the sender to make a new one.'
      );
    });
  });
});

describe('when share-link limits are exceeded', () => {
  describe('when opening an overlong link', () => {
    let opening: Promise<ArrayBuffer>;

    beforeEach(() => {
      const fragment = `#gpx-share=v1.${'a'.repeat(SHARE_LINK_MAX_URL_LENGTH)}`;

      opening = decodeGpxShareLink(fragment);
    });

    test('rejects the link', async () => {
      await expect(opening).rejects.toThrow(
        'This share link is too long to open safely. Ask the sender to share the file another way.'
      );
    });
  });

  describe('when creating a link above the decoded-content safety limit', () => {
    let creating: Promise<string>;

    beforeEach(() => {
      creating = encodeGpxShareLink(
        new ArrayBuffer(SHARE_LINK_MAX_DECODED_BYTES + 1),
        'https://gpsgoblin.com/tools/gpx-file-viewer'
      );
    });

    test('does not create the link', async () => {
      await expect(creating).rejects.toThrow(
        'This shared file is too large to open safely. Ask the sender to share the file another way.'
      );
    });
  });

  describe('when compressed data expands beyond the decoded-content safety limit', () => {
    let opening: Promise<ArrayBuffer>;

    beforeEach(() => {
      const compressed = gzipSync(
        new Uint8Array(SHARE_LINK_MAX_DECODED_BYTES + 1)
      ).toString('base64url');

      opening = decodeGpxShareLink(`#gpx-share=v1.${compressed}`);
    });

    test('rejects the link', async () => {
      await expect(opening).rejects.toThrow(
        'This shared file is too large to open safely. Ask the sender to share the file another way.'
      );
    });
  });
});
