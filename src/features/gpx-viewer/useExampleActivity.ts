'use client';

import { useCallback, useEffect } from 'react';

const exampleActivityHash = '#example-activity';
const exampleActivityPath = '/examples/example-activity.gpx';

type ImportExampleActivity = (
  getFile: (signal: AbortSignal) => Promise<File>
) => Promise<unknown>;

export const useExampleActivity = (
  importExampleActivity: ImportExampleActivity
) => {
  const clearExampleMarker = useCallback(() => {
    if (window.location.hash !== exampleActivityHash) return;
    window.history.replaceState(
      window.history.state,
      '',
      `${window.location.pathname}${window.location.search}`
    );
    return;
  }, []);

  const loadExample = useCallback(async () => {
    if (window.location.hash !== exampleActivityHash) {
      window.history.replaceState(
        window.history.state,
        '',
        `${window.location.pathname}${window.location.search}${exampleActivityHash}`
      );
    }
    await importExampleActivity(async (signal) => {
      const response = await fetch(exampleActivityPath, { signal });
      if (!response.ok) throw new Error('Example request failed');
      return new File([await response.blob()], 'example-activity.gpx', {
        type: 'application/gpx+xml'
      });
    });
    return;
  }, [importExampleActivity]);

  useEffect(() => {
    if (window.location.hash !== exampleActivityHash) return;
    const startExample = window.setTimeout(() => {
      void loadExample();
    });
    return () => {
      window.clearTimeout(startExample);
    };
  }, [loadExample]);

  return { clearExampleMarker, loadExample };
};
