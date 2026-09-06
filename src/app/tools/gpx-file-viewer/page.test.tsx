import userEvent from '@testing-library/user-event';
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import { render, screen } from '@testing-library/react';

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
});
