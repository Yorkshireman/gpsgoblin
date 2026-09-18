import { compressBrotli } from './brotliCodec';
import type { CompressionResponse } from './compressShareBytes';

self.addEventListener('message', async (event: MessageEvent<ArrayBuffer>) => {
  let response: CompressionResponse;

  try {
    const bytes = await compressBrotli(event.data);
    response = { bytes, ok: true };
  } catch {
    response = { ok: false };
  }

  self.postMessage(response);
  return;
});
