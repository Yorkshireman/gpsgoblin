// Browser boundary kept separate so Jest can substitute the Worker transport.
// Browser integration tests exercise the actual bundled worker.
export const createImportWorker = () => {
  return new Worker(new URL('./importWorker.ts', import.meta.url), { type: 'module' });
};
