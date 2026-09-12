import type { GpxParseResult } from '@/domain/activityDocument';
import { createImportWorker } from './createImportWorker';
import type { ImportRequest, ImportResponse } from './workerMessages';

let nextRequestId = 0;

export const openGpxFile = (file: File, signal: AbortSignal): Promise<GpxParseResult> => {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException('Import cancelled', 'AbortError'));
      return;
    }
    let worker: Worker;
    try {
      worker = createImportWorker();
    } catch {
      resolve({
        ok: false,
        error: 'Background processing is unavailable. Try a current browser with workers enabled, then choose your GPX file again.'
      });
      return;
    }
    const requestId = ++nextRequestId;
    const cleanup = () => {
      signal.removeEventListener('abort', abort);
      worker.onmessage = null;
      worker.onerror = null;
      worker.onmessageerror = null;
      worker.terminate();
      return;
    };
    const abort = () => {
      cleanup();
      reject(new DOMException('Import cancelled', 'AbortError'));
      return;
    };
    signal.addEventListener('abort', abort, { once: true });
    worker.onmessage = (event: MessageEvent<ImportResponse>) => {
      if (event.data.requestId !== requestId || signal.aborted) return;
      cleanup();
      resolve(event.data.result);
      return;
    };
    const fail = () => {
      cleanup();
      resolve({
        ok: false,
        error: 'The file could not be processed. Try again or choose another GPX file.'
      });
      return;
    };
    worker.onerror = fail;
    worker.onmessageerror = fail;
    try {
      const request: ImportRequest = { requestId, file };
      worker.postMessage(request);
    } catch {
      fail();
    }
    return;
  });
};
