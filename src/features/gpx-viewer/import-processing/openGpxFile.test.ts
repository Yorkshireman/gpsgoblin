import { openGpxFile } from '.';
import type { ImportRequest, ImportResponse } from './workerMessages';

const mockWorker: {
  onmessage: ((event: MessageEvent<ImportResponse>) => void) | null;
  onerror: (() => void) | null;
  onmessageerror: (() => void) | null;
  postMessage: jest.Mock<void, [ImportRequest]>;
  terminate: jest.Mock;
} = { onmessage: null, onerror: null, onmessageerror: null, postMessage: jest.fn(), terminate: jest.fn() };

jest.mock('./createImportWorker', () => ({ createImportWorker: () => mockWorker }));

beforeEach(() => {
  jest.useFakeTimers();
  mockWorker.postMessage.mockClear();
  mockWorker.terminate.mockClear();
});
afterEach(() => {
  jest.useRealTimers();
});

it('does not start a cancelled import', async () => {
  const controller = new AbortController();
  controller.abort();
  await expect(openGpxFile(new File(['<gpx/>'], 'route.gpx'), controller.signal)).rejects.toMatchObject({ name: 'AbortError' });
});

it('allows a long import to finish instead of imposing a processing deadline', async () => {
  const pending = openGpxFile(new File(['<gpx/>'], 'route.gpx'), new AbortController().signal);
  await jest.advanceTimersByTimeAsync(60000);
  expect(mockWorker.terminate).not.toHaveBeenCalled();
  const requestId = mockWorker.postMessage.mock.calls[0][0].requestId;
  mockWorker.onmessage?.(new MessageEvent('message', { data: { requestId, result: { ok: false, error: 'Completed processing' } } }));
  await expect(pending).resolves.toEqual({ ok: false, error: 'Completed processing' });
});

it.each(['error', 'messageerror'] as const)('recovers from a worker %s with a useful recovery result', async event => {
  const pending = openGpxFile(new File(['<gpx/>'], 'route.gpx'), new AbortController().signal);
  expect(mockWorker[`on${event}`]).not.toBeNull();
  mockWorker[`on${event}`]?.();
  await expect(pending).resolves.toEqual({ ok: false, error: 'The file could not be processed. Try again or choose another GPX file.' });
});

it('cancels pending work and ignores a late response', async () => {
  const controller = new AbortController();
  const pending = openGpxFile(new File(['<gpx/>'], 'route.gpx'), controller.signal);
  const rejection = expect(pending).rejects.toMatchObject({ name: 'AbortError' });
  const lateMessage = mockWorker.onmessage;
  controller.abort();
  lateMessage?.(new MessageEvent('message', { data: { requestId: mockWorker.postMessage.mock.calls[0][0].requestId, result: { ok: false, error: 'Late result' } } }));
  await rejection;
  expect(jest.getTimerCount()).toBe(0);
});

it('ignores a response for a different request and accepts its own result', async () => {
  const pending = openGpxFile(new File(['<gpx/>'], 'route.gpx'), new AbortController().signal);
  const requestId = mockWorker.postMessage.mock.calls[0][0].requestId;
  mockWorker.onmessage?.(new MessageEvent('message', { data: { requestId: requestId - 1, result: { ok: false, error: 'Wrong request' } } }));
  mockWorker.onmessage?.(new MessageEvent('message', { data: { requestId, result: { ok: false, error: 'Correct request' } } }));
  await expect(pending).resolves.toEqual({ ok: false, error: 'Correct request' });
  expect(jest.getTimerCount()).toBe(0);
});

it('sends a large file to the worker and lets the user cancel it', async () => {
  const controller = new AbortController();
  const pending = openGpxFile(new File(['x'.repeat(3 * 1024 * 1024)], 'large.gpx'), controller.signal);
  const rejection = expect(pending).rejects.toMatchObject({ name: 'AbortError' });
  expect(mockWorker.postMessage).toHaveBeenCalled();
  controller.abort();
  await rejection;
  expect(mockWorker.terminate).toHaveBeenCalled();
});

it('releases the worker and returns a recovery error if sending the file fails', async () => {
  mockWorker.postMessage.mockImplementationOnce(() => { throw new Error('Structured clone failed'); });
  await expect(openGpxFile(new File(['<gpx/>'], 'route.gpx'), new AbortController().signal)).resolves.toEqual({ ok: false, error: 'The file could not be processed. Try again or choose another GPX file.' });
  expect(jest.getTimerCount()).toBe(0);
});
