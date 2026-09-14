import type { GpxParseResult } from '@/domain/activityDocument';
import { readGpxXml } from './readGpxXml';

export const parseGpx = (fileText: string): GpxParseResult => {
  if (/<!DOCTYPE[\s>]/i.test(fileText)) {
    return {
      ok: false,
      error: 'This GPX file uses an unsupported format. Download a new GPX copy from the app that created it.'
    };
  }

  try {
    return readGpxXml(fileText);
  } catch {
    return {
      ok: false,
      error: 'The file is damaged or incomplete. Download a new copy and try again.'
    };
  }
};
