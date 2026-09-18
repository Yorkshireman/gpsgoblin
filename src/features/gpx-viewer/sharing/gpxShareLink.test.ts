/** @jest-environment node */

import {
  decodeGpxShareLink,
  encodeGpxShareLink,
  SHARE_LINK_MAX_DECODED_BYTES,
  SHARE_LINK_MAX_URL_LENGTH
} from './gpxShareLink';
import { Blob } from 'node:buffer';
import { CompressionStream, DecompressionStream } from 'node:stream/web';
import { TextDecoder, TextEncoder } from 'node:util';
import { brotliCompressSync, gzipSync } from 'node:zlib';

import { compressBrotli } from './brotliCodec';

jest.mock('./compressShareBytes', () => {
  return {
    compressShareBytes: (contents: ArrayBuffer) => {
      return compressBrotli(contents);
    }
  };
});

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
      /^https:\/\/gpsgoblin\.com\/tools\/gpx-file-viewer#gpx-share=v2\./
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

describe('when opening an existing gzip share link', () => {
  let decoded: ArrayBuffer;

  beforeEach(async () => {
    const compressed = gzipSync(gpxBytes).toString('base64url');

    decoded = await decodeGpxShareLink(`#gpx-share=v1.${compressed}`);
  });

  test('restores the original GPX bytes', () => {
    expect(decoded).toEqual(gpxBytes.buffer);
  });
});

describe('when sharing a detailed synthetic track', () => {
  let gzipLength: number;
  let link: string;
  let original: Uint8Array<ArrayBuffer>;

  beforeEach(async () => {
    const points = Array.from({ length: 5_000 }, (_, index) => {
      return `<trkpt lat="${53 + index / 100_000}" lon="${-1 + index / 100_000}"><ele>${index % 100}</ele><time>${new Date(index * 1_000).toISOString()}</time></trkpt>`;
    }).join('');

    original = new TextEncoder().encode(
      `<gpx version="1.1"><trk><trkseg>${points}</trkseg></trk></gpx>`
    );
    gzipLength = gzipSync(original).toString('base64url').length;

    link = await encodeGpxShareLink(original.buffer, 'https://gpsgoblin.com');
  });

  test('produces a shorter link than gzip', () => {
    expect(new URL(link).hash.length).toBeLessThan(gzipLength);
  });

  describe('when the recipient opens the link', () => {
    let decoded: ArrayBuffer;

    beforeEach(async () => {
      decoded = await decodeGpxShareLink(new URL(link).hash);
    });

    test('preserves every original byte', () => {
      expect(decoded).toEqual(original.buffer);
    });
  });
});

describe('when opening an invalid share link', () => {
  describe('when its version is unknown', () => {
    let opening: Promise<ArrayBuffer>;

    beforeEach(() => {
      opening = decodeGpxShareLink('#gpx-share=v3.not-a-real-payload');
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

  describe('when its Brotli payload is truncated', () => {
    let opening: Promise<ArrayBuffer>;

    beforeEach(() => {
      const compressed = brotliCompressSync(gpxBytes);

      opening = decodeGpxShareLink(
        `#gpx-share=v2.${compressed.subarray(0, -1).toString('base64url')}`
      );
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

  describe('when Brotli data expands beyond the decoded-content safety limit', () => {
    let opening: Promise<ArrayBuffer>;

    beforeEach(() => {
      const compressed = brotliCompressSync(
        new Uint8Array(SHARE_LINK_MAX_DECODED_BYTES + 1)
      ).toString('base64url');

      opening = decodeGpxShareLink(`#gpx-share=v2.${compressed}`);
    });

    test('rejects the link while decompressing', async () => {
      await expect(opening).rejects.toThrow(
        'This shared file is too large to open safely. Ask the sender to share the file another way.'
      );
    });
  });
});
