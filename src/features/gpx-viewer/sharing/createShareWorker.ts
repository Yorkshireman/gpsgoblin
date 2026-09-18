export const createShareWorker = () => {
  return new Worker(new URL('./shareWorker.ts', import.meta.url), {
    type: 'module'
  });
};
