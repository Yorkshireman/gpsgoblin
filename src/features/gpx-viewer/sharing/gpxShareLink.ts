export const SHARE_LINK_MAX_URL_LENGTH = 192_000;
export const SHARE_LINK_MAX_DECODED_BYTES = 8_000_000;

const prefix = '#gpx-share=';
const version = 'v1';

const sharingUnavailable =
  'This browser cannot create share links. You can still send the GPX file itself.';
const damagedLink =
  'This share link is damaged. Ask the sender to make a new one.';
const unknownVersion = 'This shared file uses a newer link format.';
const linkTooLong =
  'This share link is too long to open safely. Ask the sender to share the file another way.';
const decodedContentTooLarge =
  'This shared file is too large to open safely. Ask the sender to share the file another way.';
const fileTooBigToShare = 'File too big to share.';

const isCompressionSupported = () => {
  return (
    typeof CompressionStream !== 'undefined' &&
    typeof DecompressionStream !== 'undefined'
  );
};

const toBase64Url = (bytes: Uint8Array) => {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replaceAll('=', '');
};

const fromBase64Url = (value: string) => {
  if (!/^[A-Za-z0-9_-]+$/.test(value)) throw new Error(damagedLink);
  try {
    const binary = atob(
      value.replaceAll('-', '+').replaceAll('_', '/') +
        '='.repeat((4 - (value.length % 4)) % 4)
    );
    return Uint8Array.from(binary, (character) => character.charCodeAt(0))
      .buffer;
  } catch {
    throw new Error(damagedLink);
  }
};

const readStream = async (
  stream: ReadableStream<Uint8Array>,
  limit?: number
) => {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const next = await reader.read();
      if (next.done) break;
      size += next.value.byteLength;
      if (limit !== undefined && size > limit) {
        await reader.cancel();
        throw new Error(decodedContentTooLarge);
      }
      chunks.push(next.value);
    }
  } catch (error) {
    if (error instanceof Error && error.message === decodedContentTooLarge)
      throw error;
    throw new Error(damagedLink);
  } finally {
    reader.releaseLock();
  }
  const result = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return result.buffer;
};

const compress = async (contents: ArrayBuffer) => {
  if (!isCompressionSupported()) throw new Error(sharingUnavailable);
  if (contents.byteLength > SHARE_LINK_MAX_DECODED_BYTES)
    throw new Error(decodedContentTooLarge);
  return readStream(
    new Blob([contents]).stream().pipeThrough(new CompressionStream('gzip'))
  );
};

export const getGpxShareLinkUnavailableReason = (file: File) => {
  if (!isCompressionSupported()) return sharingUnavailable;
  if (file.size > SHARE_LINK_MAX_DECODED_BYTES) return fileTooBigToShare;
  return undefined;
};

export const getGpxShareLinkLengthUnavailableReason = async (
  contents: ArrayBuffer,
  baseUrl: string
) => {
  const compressed = await compress(contents);
  const fragmentLength =
    prefix.length +
    version.length +
    1 +
    Math.ceil((compressed.byteLength * 4) / 3);
  if (baseUrl.length + fragmentLength > SHARE_LINK_MAX_URL_LENGTH)
    return fileTooBigToShare;
  return undefined;
};

export const encodeGpxShareLink = async (
  contents: ArrayBuffer,
  baseUrl: string
) => {
  const compressed = await compress(contents);
  const link = `${baseUrl}${prefix}${version}.${toBase64Url(new Uint8Array(compressed))}`;
  if (link.length > SHARE_LINK_MAX_URL_LENGTH) throw new Error(linkTooLong);
  return link;
};

export const decodeGpxShareLink = async (fragment: string) => {
  if (fragment.length > SHARE_LINK_MAX_URL_LENGTH) throw new Error(linkTooLong);
  if (!fragment.startsWith(prefix)) throw new Error(damagedLink);
  const [payloadVersion, encoded, ...rest] = fragment
    .slice(prefix.length)
    .split('.');
  if (payloadVersion !== version) throw new Error(unknownVersion);
  if (!encoded || rest.length) throw new Error(damagedLink);
  if (!isCompressionSupported()) throw new Error(sharingUnavailable);
  let decoded: ArrayBuffer;
  try {
    decoded = await readStream(
      new Blob([fromBase64Url(encoded)])
        .stream()
        .pipeThrough(new DecompressionStream('gzip')),
      SHARE_LINK_MAX_DECODED_BYTES
    );
  } catch (error) {
    if (error instanceof Error && error.message === decodedContentTooLarge)
      throw error;
    throw new Error(damagedLink);
  }
  try {
    new TextDecoder('utf-8', { fatal: true }).decode(decoded);
    return decoded;
  } catch {
    throw new Error(damagedLink);
  }
};
