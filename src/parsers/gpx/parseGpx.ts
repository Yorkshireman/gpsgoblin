import type { GpxParseResult } from '@/domain/activityDocument';
import { readGpxXml } from './readGpxXml';

export const parseGpx = (fileText: string): GpxParseResult => {
  if (/<!DOCTYPE[\s>]/i.test(fileText)) {
    return {
      ok: false,
      error: 'GPX files containing a DOCTYPE declaration are not supported.'
    };
  }

  try {
    return readGpxXml(fileText);
  } catch {
    return {
      ok: false,
      error: 'The file contains malformed XML.'
    };
  }
};
