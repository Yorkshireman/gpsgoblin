import { parseGpx } from '@/parsers/gpx';
import { createMeasurementStore } from '@/analysis/prepared-measurements';
import type { ImportRequest, ImportResponse } from './workerMessages';

let measurements: ReturnType<typeof createMeasurementStore> | undefined;

// One file session owns compact derived measurements. Source XML and sample
// objects are released on this side once the import response has been sent.
self.addEventListener('message', async (event: MessageEvent<ImportRequest>) => {
  if ('type' in event.data && event.data.type === 'view') {
    const { requestId, settings } = event.data;
    try {
      if (!measurements) throw new Error('No open measurements');
      const view = measurements.prepareView(settings);
      const response: ImportResponse = { type: 'view', requestId, ok: true, view };
      self.postMessage(response, { transfer: view.analysis
        ? [view.analysis.metrics.buffer, view.display.buffer] : [view.display.buffer] });
    } catch {
      const response: ImportResponse = { type: 'view', requestId: event.data.requestId, ok: false,
        error: 'Measurements could not be updated. Try again or reopen the file.' };
      self.postMessage(response);
    }
    return;
  }
  if (!('file' in event.data)) return;
  const { requestId, file } = event.data;
  let response: ImportResponse;
  try {
    const result = parseGpx(await file.text());
    if (result.ok) measurements = createMeasurementStore(result.document);
    response = { requestId, result };
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
