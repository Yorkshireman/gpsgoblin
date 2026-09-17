import { createShareWorker } from './createShareWorker';

export type CompressionResponse =
  Readonly<{ bytes: Uint8Array; ok: true }> | Readonly<{ ok: false }>;

export const compressShareBytes = (contents: ArrayBuffer) => {
  return new Promise<Uint8Array>((resolve, reject) => {
    const worker = createShareWorker();

    worker.onmessage = (event: MessageEvent<CompressionResponse>) => {
      worker.terminate();

      if (event.data.ok) resolve(event.data.bytes);
      else reject(new Error('Brotli compression failed'));
    };

    worker.onerror = () => {
      worker.terminate();
      reject(new Error('Brotli compression failed'));
    };

    worker.postMessage(contents);
  });
};
