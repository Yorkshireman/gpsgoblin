import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import { render, screen } from '@testing-library/react';

import GpxFileEmptyOrMissingDataPage, { metadata } from './page';

describe('empty or missing GPX data help page', () => {
  it('gives a practical next action for each supported diagnosis', () => {
    render(
      <ChakraProvider value={defaultSystem}>
        <GpxFileEmptyOrMissingDataPage />
      </ChakraProvider>
    );

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Why a GPX file is empty or missing data'
      })
    ).toBeVisible();
    for (const heading of [
      'You downloaded a ZIP file',
      'The file is FIT or TCX',
      'The GPX has no route',
      'A long Garmin activity is incomplete',
      'The map works but a chart is missing',
      'Device readings or navigation details are missing',
      'The file is GPX 1.0 or malformed'
    ]) {
      expect(
        screen.getByRole('heading', { level: 2, name: heading })
      ).toBeVisible();
    }
    expect(
      screen.getByRole('link', { name: 'Open the GPX File Viewer' })
    ).toHaveAttribute('href', '/tools/gpx-file-viewer');
    expect(
      screen.getByRole('link', { name: 'Learn how to get a GPX file' })
    ).toHaveAttribute('href', '/help/how-to-get-a-gpx-file');
  });

  it('publishes unique metadata and a canonical URL', () => {
    expect(metadata).toEqual(
      expect.objectContaining({
        alternates: {
          canonical: 'https://gpsgoblin.com/help/gpx-file-empty-or-missing-data'
        },
        title: 'Why a GPX file is empty or missing data — GPSGoblin'
      })
    );
  });
});
