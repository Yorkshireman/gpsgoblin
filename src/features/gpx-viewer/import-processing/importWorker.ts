import { parseGpx } from '@/parsers/gpx';
import type { ImportRequest, ImportResponse } from './workerMessages';

// A dedicated worker handles one request; the caller terminates it on completion or cancellation.
self.addEventListener('message', async (event: MessageEvent<ImportRequest>) => {
  const { requestId, file } = event.data;
  let response: ImportResponse;
  try {
    response = { requestId, result: parseGpx(await file.text()) };
  } catch {
    response = {
      requestId,
      result: {
        ok: false,
        error: 'The file could not be read or processed. Try exporting it again or choose another GPX file.'
      }
    };
  }
  self.postMessage(response);
  return;
});
