import userEvent from '@testing-library/user-event';
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import { render, screen, within } from '@testing-library/react';

import GpxFileViewerPage from './page';

describe('GPX file viewer', () => {
  it('"Choose GPX file" button is visible', () => {
    render(
      <ChakraProvider value={defaultSystem}>
        <GpxFileViewerPage />
      </ChakraProvider>
    );

    expect(screen.getByRole('button', { name: 'Choose GPX file' })).toBeVisible();
  });

  it('"Drag and drop a GPX file here" prompt is visible', () => {
    render(
      <ChakraProvider value={defaultSystem}>
        <GpxFileViewerPage />
      </ChakraProvider>
    );

    expect(screen.getByText('Drag and drop a GPX file here')).toBeVisible();
  });

  it('"route.gpx" is visible after selecting it', async () => {
    const user = userEvent.setup();
    render(
      <ChakraProvider value={defaultSystem}>
        <GpxFileViewerPage />
      </ChakraProvider>
    );

    const file = new File(['<gpx version="1.1"></gpx>'], 'route.gpx', {
      type: 'application/gpx+xml'
    });

    await user.upload(screen.getByLabelText('GPX file'), file);

    expect(screen.getByText('route.gpx')).toBeVisible();
  });

  it('"Morning route" is visible after selecting a valid GPX file', async () => {
    const user = userEvent.setup();

    render(
      <ChakraProvider value={defaultSystem}>
        <GpxFileViewerPage />
      </ChakraProvider>
    );

    const file = new File(
      [
        `
        <gpx
          version="1.1"
          creator="GPSGoblin test"
          xmlns="http://www.topografix.com/GPX/1/1"
        >
          <trk>
            <name>Morning route</name>
            <trkseg>
              <trkpt lat="53.1000" lon="-1.2000" />
            </trkseg>
          </trk>
        </gpx>
      `
      ],
      'route.gpx',
      { type: 'application/gpx+xml' }
    );

    await user.upload(screen.getByLabelText('GPX file'), file);

    expect(await screen.findByText('Morning route')).toBeVisible();
  });

  it('shows an error after selecting a malformed GPX file', async () => {
    const user = userEvent.setup();

    render(
      <ChakraProvider value={defaultSystem}>
        <GpxFileViewerPage />
      </ChakraProvider>
    );

    const file = new File(['<gpx version="1.1"><trk></gpx>'], 'broken.gpx', {
      type: 'application/gpx+xml'
    });

    await user.upload(screen.getByLabelText('GPX file'), file);

    expect(await screen.findByText('The file contains malformed XML.')).toBeVisible();
  });

  it('shows the calculated track distance and its basis', async () => {
    const user = userEvent.setup();

    render(
      <ChakraProvider value={defaultSystem}>
        <GpxFileViewerPage />
      </ChakraProvider>
    );

    const file = new File(
      [
        `
          <gpx
            version="1.1"
            creator="GPSGoblin test"
            xmlns="http://www.topografix.com/GPX/1/1"
          >
            <trk>
              <name>Equator route</name>
              <trkseg>
                <trkpt lat="0" lon="0" />
                <trkpt lat="0" lon="1" />
              </trkseg>
            </trk>
          </gpx>
        `
      ],
      'equator-route.gpx',
      { type: 'application/gpx+xml' }
    );

    await user.upload(screen.getByLabelText('GPX file'), file);

    expect(await screen.findByText('Calculated distance')).toBeVisible();
    expect(screen.getByText('111.2 km')).toBeVisible();
    expect(screen.getByText('Based on the recorded GPS points')).toBeVisible();
  });

  // src/app/tools/gpx-file-viewer/page.test.tsx
  it('keeps the previous route visible when another GPX file cannot be opened', async () => {
    const user = userEvent.setup();

    render(
      <ChakraProvider value={defaultSystem}>
        <GpxFileViewerPage />
      </ChakraProvider>
    );

    const fileInput = screen.getByLabelText('GPX file');
    const validFile = new File(
      [
        `
          <gpx
            version="1.1"
            creator="GPSGoblin test"
            xmlns="http://www.topografix.com/GPX/1/1"
          >
            <trk>
              <name>Morning route</name>
              <trkseg>
                <trkpt lat="53.1" lon="-1.2" />
              </trkseg>
            </trk>
          </gpx>
        `
      ],
      'route.gpx',
      { type: 'application/gpx+xml' }
    );

    const malformedFile = new File(['<gpx version="1.1"><trk></gpx>'], 'broken.gpx', {
      type: 'application/gpx+xml'
    });

    await user.upload(fileInput, validFile);
    expect(await screen.findByText('Morning route')).toBeVisible();

    await user.upload(fileInput, malformedFile);

    expect(await screen.findByText('The file contains malformed XML.')).toBeVisible();
    expect(screen.getByText('Morning route')).toBeVisible();
  });

  it('clears the opened route when the user clears the file', async () => {
    const user = userEvent.setup();

    render(
      <ChakraProvider value={defaultSystem}>
        <GpxFileViewerPage />
      </ChakraProvider>
    );

    const file = new File(
      [
        `
          <gpx version="1.1" xmlns="http://www.topografix.com/GPX/1/1">
            <trk>
              <name>Morning route</name>
              <trkseg>
                <trkpt lat="53.1" lon="-1.2" />
              </trkseg>
            </trk>
          </gpx>
        `
      ],
      'route.gpx',
      { type: 'application/gpx+xml' }
    );

    await user.upload(screen.getByLabelText('GPX file'), file);
    expect(await screen.findByText('Morning route')).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Clear file' }));

    expect(screen.queryByText('Morning route')).not.toBeInTheDocument();
    expect(screen.queryByText('route.gpx')).not.toBeInTheDocument();
  });

  it('explains when a GPX file contains no track to display', async () => {
    const user = userEvent.setup();

    render(
      <ChakraProvider value={defaultSystem}>
        <GpxFileViewerPage />
      </ChakraProvider>
    );

    const file = new File(
      [
        `
          <gpx
            version="1.1"
            creator="GPSGoblin test"
            xmlns="http://www.topografix.com/GPX/1/1"
          />
        `
      ],
      'empty.gpx',
      { type: 'application/gpx+xml' }
    );

    await user.upload(screen.getByLabelText('GPX file'), file);

    expect(
      await screen.findByText('This GPX file does not contain a track to display.')
    ).toBeVisible();
  });

  it('explains when a GPX track contains no points to display', async () => {
    const user = userEvent.setup();

    render(
      <ChakraProvider value={defaultSystem}>
        <GpxFileViewerPage />
      </ChakraProvider>
    );

    const file = new File(
      [
        `
          <gpx
            version="1.1"
            creator="GPSGoblin test"
            xmlns="http://www.topografix.com/GPX/1/1"
          >
            <trk>
              <trkseg />
            </trk>
          </gpx>
        `
      ],
      'empty-track.gpx',
      { type: 'application/gpx+xml' }
    );

    await user.upload(screen.getByLabelText('GPX file'), file);

    expect(
      await screen.findByText('This GPX file does not contain any track points to display.')
    ).toBeVisible();
  });

  describe('map region', () => {
    it('shows a readable route map region after selecting a valid GPX file', async () => {
      const user = userEvent.setup();

      render(
        <ChakraProvider value={defaultSystem}>
          <GpxFileViewerPage />
        </ChakraProvider>
      );

      const file = new File(
        [
          `
            <gpx
              version="1.1"
              creator="GPSGoblin test"
              xmlns="http://www.topografix.com/GPX/1/1"
            >
              <trk>
                <name>Morning route</name>
                <trkseg>
                  <trkpt lat="53.1" lon="-1.2" />
                </trkseg>
                <trkseg>
                  <trkpt lat="53.2" lon="-1.3" />
                </trkseg>
              </trk>
            </gpx>
          `
        ],
        'route.gpx',
        { type: 'application/gpx+xml' }
      );

      await user.upload(screen.getByLabelText('GPX file'), file);

      const routeMap = await screen.findByRole('region', {
        name: 'Route map'
      });

      expect(routeMap).toBeVisible();
      expect(within(routeMap).getByText('Morning route')).toBeVisible();
      expect(within(routeMap).getByText('2 track segments')).toBeVisible();
    });
  });
});
