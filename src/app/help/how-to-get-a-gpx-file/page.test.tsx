import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import { render, screen, within } from '@testing-library/react';

import HowToGetAGpxFilePage, { metadata } from './page';

describe('how to get and open a GPX file page', () => {
  it('helps people choose a supported export and continue to the viewer', () => {
    render(
      <ChakraProvider value={defaultSystem}>
        <HowToGetAGpxFilePage />
      </ChakraProvider>
    );

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'How to get and open a GPX file'
      })
    ).toBeVisible();
    expect(
      screen.getByRole('link', { name: 'Garmin Connect Website' })
    ).toHaveAttribute('href', '#garmin-heading');
    expect(
      screen.getByRole('link', {
        name: 'komoot Website or mobile app'
      })
    ).toHaveAttribute('href', '#komoot-heading');
    expect(
      screen.getByRole('link', {
        name: 'Wahoo FIT only — GPSGoblin cannot open it'
      })
    ).toHaveAttribute('href', '#wahoo-heading');
    expect(
      screen.getByRole('heading', { level: 2, name: 'Garmin Connect' })
    ).toBeVisible();
    expect(
      screen.getByRole('heading', { level: 2, name: 'Strava' })
    ).toBeVisible();
    expect(
      screen.getByRole('heading', { level: 2, name: 'komoot' })
    ).toBeVisible();
    expect(
      screen.getByRole('heading', { level: 2, name: 'Polar Flow' })
    ).toBeVisible();
    expect(
      screen.getByRole('heading', { level: 2, name: 'Wahoo uses FIT' })
    ).toBeVisible();
    const viewerLinks = screen.getAllByRole('link', {
      name: 'Explore my GPX file'
    });
    const sourceChooser = screen.getByRole('heading', {
      level: 2,
      name: 'Choose your service'
    });

    expect(viewerLinks).toHaveLength(2);
    expect(viewerLinks[0]).toHaveAttribute('href', '/tools/gpx-file-viewer');
    expect(
      viewerLinks[0]?.compareDocumentPosition(sourceChooser) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
    expect(viewerLinks[1]).toHaveAttribute('href', '/tools/gpx-file-viewer');
    expect(
      screen.getByRole('link', {
        name: 'Troubleshoot an empty or incomplete GPX file'
      })
    ).toHaveAttribute('href', '/help/gpx-file-empty-or-missing-data');
  });

  it('publishes unique metadata and a canonical URL', () => {
    expect(metadata).toEqual(
      expect.objectContaining({
        alternates: {
          canonical: 'https://gpsgoblin.com/help/how-to-get-a-gpx-file'
        },
        title: 'How to get and open a GPX file — GPSGoblin'
      })
    );
  });

  it.each([
    ['Garmin Connect', /Choose GPX only when the activity has GPS positions/],
    ['Strava', /Do not choose Export Original/],
    ['komoot', /The starting region must be unlocked/],
    ['Polar Flow', /Polar describes GPX as route data/]
  ])('states %s limitations before its export steps', (heading, warning) => {
    render(
      <ChakraProvider value={defaultSystem}>
        <HowToGetAGpxFilePage />
      </ChakraProvider>
    );

    const section = screen
      .getByRole('heading', { name: heading })
      .closest('section');

    expect(section).not.toBeNull();

    const content = within(section!);
    const limitation = content.getByText(warning);
    const steps = content.getByRole('list');

    expect(
      limitation.compareDocumentPosition(steps) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
  });
});
