import type { MeasurementViewRequest, PackedMeasurementView } from '@/analysis/prepared-measurements';
import type { ImportResponse } from './workerMessages';

export type MeasurementSession = Readonly<{
  prepareView: (settings: MeasurementViewRequest, signal: AbortSignal) => Promise<PackedMeasurementView>;
  dispose: () => void;
}>;

type PendingView = {
  requestId: number;
  settings: MeasurementViewRequest;
  signal: AbortSignal;
  resolve: (value: PackedMeasurementView) => void;
  reject: (error: Error) => void;
  abort: () => void;
};

const cancelled = () => {
  return new DOMException('Measurement update cancelled', 'AbortError');
};

// Keep at most one running calculation and the newest queued settings. An
// obsolete result cannot replace the displayed view or build an unbounded queue.
export const createMeasurementSession = (worker: Worker): MeasurementSession => {
  let nextId = 0;
  let running: PendingView | undefined;
  let queued: PendingView | undefined;
  let disposed = false;
  const detach = (pending: PendingView) => {
    pending.signal.removeEventListener('abort', pending.abort);
    return;
  };
  const fail = () => {
    disposed = true;
    for (const pending of [running, queued]) {
      if (!pending) continue;
      detach(pending);
      pending.reject(new Error('Measurements could not be updated. Clear and reopen the file to try again.'));
    }
    running = undefined;
    queued = undefined;
    worker.terminate();
    return;
  };
  const send = (pending: PendingView) => {
    running = pending;
    try {
      worker.postMessage({ type: 'view', requestId: pending.requestId, settings: pending.settings });
    } catch {
      fail();
    }
    return;
  };
  worker.onmessage = (event: MessageEvent<ImportResponse>) => {
    const response = event.data;
    if (!('type' in response) || response.type !== 'view' || response.requestId !== running?.requestId) return;
    const completed = running;
    running = undefined;
    detach(completed);
    if (!completed.signal.aborted) {
      if (response.ok) completed.resolve(response.view);
      else completed.reject(new Error(response.error));
    }
    if (queued) {
      const pending = queued;
      queued = undefined;
      send(pending);
    }
    return;
  };
  worker.onerror = fail;
  worker.onmessageerror = fail;
  return {
    prepareView: (settings, signal) => {
      return new Promise((resolve, reject) => {
        if (signal.aborted) { reject(cancelled()); return; }
        if (disposed) { reject(new Error('Measurements are unavailable. Clear and reopen the file to try again.')); return; }
        const pending: PendingView = {
          requestId: ++nextId, settings, signal, resolve, reject,
          abort: () => {
            detach(pending);
            if (queued === pending) queued = undefined;
            reject(cancelled());
            return;
          }
        };
        signal.addEventListener('abort', pending.abort, { once: true });
        if (running) {
          if (queued) { detach(queued); queued.reject(cancelled()); }
          queued = pending;
        } else send(pending);
        return;
      });
    },
    dispose: () => {
      if (disposed) return;
      disposed = true;
      for (const pending of [running, queued]) {
        if (!pending) continue;
        detach(pending);
        pending.reject(cancelled());
      }
      running = undefined;
      queued = undefined;
      worker.onmessage = null;
      worker.onerror = null;
      worker.onmessageerror = null;
      worker.terminate();
      return;
    }
  };
};
