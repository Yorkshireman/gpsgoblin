import userEvent from '@testing-library/user-event';
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import { render, screen, within } from '@testing-library/react';

import GpxFileViewerPage from './page';
import { createTestFile } from './pageTestFixtures';

describe('GPX file viewer', () => {
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
      expect(
        screen.getByText('Based on straight lines between route points')
      ).toBeVisible();
      expect(
        screen.queryByText('Based on the recorded GPS points')
      ).not.toBeInTheDocument();
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
      expect(
        screen.getByText('Based on straight lines between route points')
      ).toBeVisible();
      expect(
        screen.queryByRole('combobox', { name: 'Item to inspect' })
      ).not.toBeInTheDocument();
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
