import userEvent from '@testing-library/user-event';
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import { fireEvent, render, screen, within } from '@testing-library/react';

import GpxFileViewerPage from './page';
import { createTestFile } from './pageTestFixtures';

describe('GPX file viewer', () => {
  it('offers imperial elevation for a waypoint-only file', async () => {
    const user = userEvent.setup();
    await user.upload(
      screen.getByLabelText('GPX file'),
      new File(
        [
          '<gpx version="1.1" xmlns="http://www.topografix.com/GPX/1/1"><wpt lat="0" lon="0"><ele>100</ele></wpt></gpx>'
        ],
        'waypoint.gpx',
        { type: 'application/gpx+xml' }
      )
    );
    await user.selectOptions(
      await screen.findByRole('combobox', { name: 'Display units' }),
      'imperial'
    );
    expect(screen.getByText('Elevation: 328.1 ft')).toBeVisible();
  });

  it('shows measurements, changes units and lets a keyboard-accessible point selector inspect source values', async () => {
    const user = userEvent.setup();
    await user.upload(
      screen.getByLabelText('GPX file'),
      new File(
        [
          `<gpx version="1.1" xmlns="http://www.topografix.com/GPX/1/1"><trk><trkseg>
      <trkpt lat="0" lon="0"><ele>0</ele><time>2026-09-11T12:00:00Z</time></trkpt>
      <trkpt lat="0" lon="0.01"><ele>100</ele><time>2026-09-11T12:01:00Z</time></trkpt>
      </trkseg></trk></gpx>`
        ],
        'measurements.gpx',
        { type: 'application/gpx+xml' }
      )
    );
    expect(await screen.findByRole('heading', { name: 'Elevation profile' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Interval speed' })).toBeVisible();
    expect(screen.getByText('60.0 s')).toBeVisible();
    fireEvent.change(screen.getByRole('slider', { name: 'Inspect point' }), {
      target: { value: '1' }
    });
    const selection = screen.getByRole('region', { name: 'Selected measurement' });
    expect(within(selection).getByText('100.0 m')).toBeVisible();
    expect(within(selection).getByText('2026-09-11T12:01:00Z')).toBeVisible();
    await user.selectOptions(screen.getByRole('combobox', { name: 'Display units' }), 'imperial');
    expect(within(selection).getByText('328.1 ft')).toBeVisible();
    await user.selectOptions(screen.getByRole('combobox', { name: 'Speed or pace' }), 'pace');
    expect(screen.getByRole('heading', { name: 'Interval pace' })).toBeVisible();
    expect(within(selection).getByText(/min\/mi/)).toBeVisible();
  });

  beforeEach(() => {
    render(
      <ChakraProvider value={defaultSystem}>
        <GpxFileViewerPage />
      </ChakraProvider>
    );
  });

  describe('file input', () => {
    it('shows the file picker button', () => {
      expect(screen.getByRole('button', { name: 'Choose GPX file' })).toBeVisible();
    });

    it('shows the drag-and-drop prompt', () => {
      expect(screen.getByText('Drag and drop a GPX file here')).toBeVisible();
    });

    it('shows the selected filename', async () => {
      const user = userEvent.setup();

      const file = createTestFile('filenameOnly');

      await user.upload(screen.getByLabelText('GPX file'), file);

      expect(screen.getByText('route.gpx')).toBeVisible();
    });

    it('clears the opened track and filename', async () => {
      const user = userEvent.setup();

      const file = createTestFile('singleTrack');

      await user.upload(screen.getByLabelText('GPX file'), file);
      expect(await screen.findByText('Morning route')).toBeVisible();

      await user.click(screen.getByRole('button', { name: 'Clear file' }));

      expect(screen.queryByText('Morning route')).not.toBeInTheDocument();
      expect(screen.queryByText('route.gpx')).not.toBeInTheDocument();
    });
  });

  describe('map availability', () => {
    it('keeps distance and file details available when the browser cannot render maps', async () => {
      const user = userEvent.setup();
      const file = createTestFile('equatorTrack');

      await user.upload(screen.getByLabelText('GPX file'), file);

      expect(await screen.findByText('Map unavailable')).toBeVisible();
      expect(screen.getByText(/This browser cannot display the map/)).toBeVisible();
      expect(screen.getByText('111.2 km')).toBeVisible();
      expect(screen.getByRole('region', { name: 'File details' })).toBeVisible();
      expect(screen.queryByText('Unable to open GPX file')).not.toBeInTheDocument();
    });

    it('explains a singleton segment and removes the notice when a drawable segment is selected', async () => {
      const user = userEvent.setup();
      const file = createTestFile('selectableSegments');

      await user.upload(screen.getByLabelText('GPX file'), file);
      const selector = await screen.findByRole('combobox', { name: 'Track segment' });

      await user.selectOptions(
        selector,
        within(selector).getByRole('option', { name: 'Segment 3' })
      );
      expect(screen.getByText('No line to display')).toBeVisible();
      expect(screen.getByText('0.0 km')).toBeVisible();

      await user.selectOptions(
        selector,
        within(selector).getByRole('option', { name: 'Segment 2' })
      );
      expect(screen.queryByText('No line to display')).not.toBeInTheDocument();
      expect(screen.getByText('222.4 km')).toBeVisible();
    });
  });

  describe('source metadata', () => {
    it('shows file details as text and keeps them when the selection changes', async () => {
      const user = userEvent.setup();
      const file = createTestFile('sourceMetadata');

      await user.upload(screen.getByLabelText('GPX file'), file);

      const details = await screen.findByRole('region', { name: 'File details' });
      expect(within(details).getByText('Weekend walk')).toBeVisible();
      expect(within(details).getByText('GPSGoblin test exporter')).toBeVisible();
      expect(within(details).getByText('<strong>Original file notes</strong>')).toBeVisible();
      expect(details.querySelector('strong')).toBeNull();

      await user.selectOptions(
        screen.getByRole('combobox', { name: 'Item to inspect' }),
        'route-0'
      );

      expect(within(details).getByText('Weekend walk')).toBeVisible();
      expect(within(details).getByText('GPSGoblin test exporter')).toBeVisible();
    });

    it('hides absent fields and removes the section when the next file has no metadata', async () => {
      const user = userEvent.setup();
      const fileInput = screen.getByLabelText('GPX file');

      await user.upload(fileInput, createTestFile('singleTrack'));

      const details = await screen.findByRole('region', { name: 'File details' });
      expect(within(details).getByText('GPSGoblin test')).toBeVisible();
      expect(within(details).queryByText('Name')).not.toBeInTheDocument();
      expect(within(details).queryByText('Description')).not.toBeInTheDocument();

      await user.upload(fileInput, createTestFile('multipleTracks'));
      await screen.findByRole('combobox', { name: 'Item to inspect' });

      expect(screen.queryByRole('region', { name: 'File details' })).not.toBeInTheDocument();
    });

    it('shows only the selected track or route description, as text', async () => {
      const user = userEvent.setup();
      const file = createTestFile('sourceMetadata');

      await user.upload(screen.getByLabelText('GPX file'), file);

      const selector = await screen.findByRole('combobox', { name: 'Item to inspect' });
      const map = screen.getByRole('region', { name: 'Route map' });
      expect(within(map).getByText('<em>Recorded walk notes</em>')).toBeVisible();
      expect(map.querySelector('em')).toBeNull();

      await user.selectOptions(selector, 'track-1');

      expect(screen.queryByText('<em>Recorded walk notes</em>')).not.toBeInTheDocument();

      await user.selectOptions(selector, 'route-0');

      const routeMap = screen.getByRole('region', { name: 'Route map' });
      expect(within(routeMap).getByText('Follow the ridge')).toBeVisible();
      expect(screen.queryByText('<em>Recorded walk notes</em>')).not.toBeInTheDocument();
    });
  });

  describe('invalid files', () => {
    it('explains malformed XML', async () => {
      const user = userEvent.setup();

      const file = createTestFile('malformedXml');

      await user.upload(screen.getByLabelText('GPX file'), file);

      expect(await screen.findByText('The file contains malformed XML.')).toBeVisible();
    });

    it('keeps the previous result when another file cannot be opened', async () => {
      const user = userEvent.setup();

      const fileInput = screen.getByLabelText('GPX file');
      const validFile = createTestFile('singleTrack');

      const malformedFile = createTestFile('malformedXml');

      await user.upload(fileInput, validFile);
      expect(await screen.findByText('Morning route')).toBeVisible();

      await user.upload(fileInput, malformedFile);

      expect(await screen.findByText('The file contains malformed XML.')).toBeVisible();
      expect(screen.getByText('Morning route')).toBeVisible();
    });

    it('explains an empty GPX document', async () => {
      const user = userEvent.setup();

      const file = createTestFile('emptyDocument');

      await user.upload(screen.getByLabelText('GPX file'), file);

      expect(
        await screen.findByText('This GPX file does not contain a track to display.')
      ).toBeVisible();
    });

    it('explains a track with no points', async () => {
      const user = userEvent.setup();

      const file = createTestFile('emptyTrack');

      await user.upload(screen.getByLabelText('GPX file'), file);

      expect(
        await screen.findByText('This GPX file does not contain any track points to display.')
      ).toBeVisible();
    });

    it('explains an unsupported filename', async () => {
      const user = userEvent.setup({ applyAccept: false });

      const file = createTestFile('unsupportedFile');

      await user.upload(screen.getByLabelText('GPX file'), file);

      expect(await screen.findByText('Choose a file with a .gpx filename.')).toBeVisible();
    });
  });

  describe('recorded tracks', () => {
    it('shows the imported track name', async () => {
      const user = userEvent.setup();

      const file = createTestFile('singleTrack');

      await user.upload(screen.getByLabelText('GPX file'), file);

      expect(await screen.findByText('Morning route')).toBeVisible();
    });

    it('shows the calculated distance and its basis', async () => {
      const user = userEvent.setup();

      const file = createTestFile('equatorTrack');

      await user.upload(screen.getByLabelText('GPX file'), file);

      expect(await screen.findByText('Calculated distance')).toBeVisible();
      expect(screen.getByText('111.2 km')).toBeVisible();
      expect(screen.getByText('Based on the recorded GPS points')).toBeVisible();
    });

    it('lets the user choose which track to inspect', async () => {
      const user = userEvent.setup();

      const file = createTestFile('multipleTracks');

      await user.upload(screen.getByLabelText('GPX file'), file);

      const selector = await screen.findByRole('combobox', {
        name: 'Item to inspect'
      });

      expect(selector).toHaveValue('track-0');

      await user.selectOptions(selector, 'track-1');

      const routeMap = screen.getByRole('region', { name: 'Route map' });
      expect(within(routeMap).getByText('Evening track')).toBeVisible();
    });

    describe('track segments', () => {
      it('selects a segment and restores the total without counting gaps', async () => {
        const user = userEvent.setup();

        await user.upload(screen.getByLabelText('GPX file'), createTestFile('selectableSegments'));

        const selector = await screen.findByRole('combobox', { name: 'Track segment' });
        expect(selector).toHaveValue('');
        expect(within(selector).getByRole('option', { name: 'All segments' })).toBeInTheDocument();
        expect(screen.getByText('333.6 km')).toBeVisible();

        await user.selectOptions(
          selector,
          within(selector).getByRole('option', { name: 'Segment 2' })
        );
        expect(screen.getByText('222.4 km')).toBeVisible();
        expect(screen.getByText('Track segment 2 of 3')).toBeVisible();

        await user.selectOptions(
          selector,
          within(selector).getByRole('option', { name: 'Segment 3' })
        );
        expect(screen.getByText('0.0 km')).toBeVisible();
        expect(screen.getByText('Track segment 3 of 3')).toBeVisible();

        await user.selectOptions(
          selector,
          within(selector).getByRole('option', { name: 'All segments' })
        );
        expect(screen.getByText('333.6 km')).toBeVisible();
        expect(screen.getByText('3 track segments')).toBeVisible();
      });

      it('resets segment selection when switching tracks or replacing the file', async () => {
        const user = userEvent.setup();
        const fileInput = screen.getByLabelText('GPX file');

        await user.upload(fileInput, createTestFile('selectableSegments'));

        const selector = await screen.findByRole('combobox', { name: 'Track segment' });
        await user.selectOptions(
          selector,
          within(selector).getByRole('option', { name: 'Segment 2' })
        );

        const itemSelector = screen.getByRole('combobox', { name: 'Item to inspect' });
        await user.selectOptions(itemSelector, 'track-1');
        expect(screen.queryByRole('combobox', { name: 'Track segment' })).not.toBeInTheDocument();

        await user.selectOptions(itemSelector, 'track-0');
        expect(screen.getByRole('combobox', { name: 'Track segment' })).toHaveValue('');
        expect(screen.getByText('333.6 km')).toBeVisible();

        const restoredSelector = screen.getByRole('combobox', { name: 'Track segment' });
        await user.selectOptions(
          restoredSelector,
          within(restoredSelector).getByRole('option', { name: 'Segment 2' })
        );
        await user.upload(fileInput, createTestFile('segmentedTrack'));
        expect(await screen.findByText('Morning route')).toBeVisible();
        expect(screen.getByRole('combobox', { name: 'Track segment' })).toHaveValue('');
        expect(screen.getByText('2 track segments')).toBeVisible();
      });
    });

    it('shows a readable map region with the track segment count', async () => {
      const user = userEvent.setup();

      const file = createTestFile('segmentedTrack');

      await user.upload(screen.getByLabelText('GPX file'), file);

      const routeMap = await screen.findByRole('region', {
        name: 'Route map'
      });

      expect(routeMap).toBeVisible();
      expect(within(routeMap).getByText('Morning route')).toBeVisible();
      expect(within(routeMap).getByText('2 track segments')).toBeVisible();
    });
  });

  describe('planned routes', () => {
    it('lets the user select a route from a mixed file', async () => {
      const user = userEvent.setup();

      const file = createTestFile('trackAndRoute');

      await user.upload(screen.getByLabelText('GPX file'), file);

      const selector = await screen.findByRole('combobox', {
        name: 'Item to inspect'
      });

      expect(within(selector).getByRole('option', { name: /Morning track/ })).toBeInTheDocument();
      const routeOption = within(selector).getByRole('option', {
        name: /Hill route/
      });

      await user.selectOptions(selector, routeOption);

      const routeDetails = screen.getByRole('region', {
        name: 'Planned route'
      });

      expect(within(routeDetails).getByText('Hill route')).toBeVisible();
      expect(within(routeDetails).getByText('2 route points')).toBeVisible();
      expect(screen.getByText('111.2 km')).toBeVisible();
      expect(screen.getByText('Based on straight lines between route points')).toBeVisible();
      expect(screen.queryByText('Based on the recorded GPS points')).not.toBeInTheDocument();
    });

    it('automatically displays the only route without a selector', async () => {
      const user = userEvent.setup();

      const file = createTestFile('routeOnly');

      await user.upload(screen.getByLabelText('GPX file'), file);

      const routeDetails = await screen.findByRole('region', {
        name: 'Planned route'
      });

      expect(within(routeDetails).getByText('Equator route')).toBeVisible();
      expect(within(routeDetails).getByText('2 route points')).toBeVisible();
      expect(screen.getByText('111.2 km')).toBeVisible();
      expect(screen.getByText('Based on straight lines between route points')).toBeVisible();
      expect(screen.queryByRole('combobox', { name: 'Item to inspect' })).not.toBeInTheDocument();
    });
  });

  describe('waypoints', () => {
    it('selects waypoints independently and restores track and route results', async () => {
      const user = userEvent.setup();

      const file = createTestFile('trackRouteAndWaypoints');

      await user.upload(screen.getByLabelText('GPX file'), file);
      const selector = await screen.findByRole('combobox', { name: 'Item to inspect' });
      expect(selector).toHaveValue('track-0');
      await user.selectOptions(
        selector,
        within(selector).getByRole('option', { name: 'Waypoint: Summit' })
      );

      const details = screen.getByRole('region', { name: 'Waypoint' });
      expect(within(details).getByText('Summit')).toBeVisible();
      expect(within(details).getByText('A place to rest')).toBeVisible();
      expect(within(details).getByText('Latitude: 53.1°')).toBeVisible();
      expect(within(details).getByText('Longitude: -1.2°')).toBeVisible();
      expect(within(details).getByText('Elevation: 0 m')).toBeVisible();
      expect(within(details).getByRole('region', { name: 'Waypoint map' })).toBeVisible();
      expect(screen.queryByText('Calculated distance')).not.toBeInTheDocument();

      await user.selectOptions(
        selector,
        within(selector).getByRole('option', { name: 'Waypoint: Unnamed waypoint 2' })
      );
      expect(within(details).getByText('Unnamed waypoint')).toBeVisible();
      expect(within(details).getByText('Latitude: 54°')).toBeVisible();
      expect(within(details).queryByText(/Elevation:/)).not.toBeInTheDocument();
      expect(within(details).queryByText('A place to rest')).not.toBeInTheDocument();

      await user.selectOptions(selector, 'route-0');
      expect(screen.getByText('111.2 km')).toBeVisible();
      expect(screen.getByText('Based on straight lines between route points')).toBeVisible();
      expect(screen.queryByRole('region', { name: 'Waypoint' })).not.toBeInTheDocument();

      await user.selectOptions(selector, 'track-0');
      expect(screen.getByText('Based on the recorded GPS points')).toBeVisible();

      await user.selectOptions(selector, 'waypoint-0');
      await user.click(screen.getByRole('button', { name: 'Clear file' }));
      expect(screen.queryByRole('region', { name: 'Waypoint' })).not.toBeInTheDocument();
      expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    });

    it('automatically displays a lone waypoint with no invented measurements', async () => {
      const user = userEvent.setup();

      const file = createTestFile('waypointOnly');
      await user.upload(screen.getByLabelText('GPX file'), file);

      const details = await screen.findByRole('region', { name: 'Waypoint' });
      expect(within(details).getByText('Unnamed waypoint')).toBeVisible();
      expect(within(details).getByText('Latitude: 0°')).toBeVisible();
      expect(within(details).getByText('Longitude: 0°')).toBeVisible();
      expect(within(details).queryByText(/Elevation:/)).not.toBeInTheDocument();
      expect(screen.queryByText('Calculated distance')).not.toBeInTheDocument();
      expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    });
  });
});
