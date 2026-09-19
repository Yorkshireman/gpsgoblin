import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import { render, screen } from '@testing-library/react';

import Home from './page';

describe('homepage', () => {
  it('offers the normal viewer and the example activity beside it', () => {
    render(
      <ChakraProvider value={defaultSystem}>
        <Home />
      </ChakraProvider>
    );

    expect(
      screen.getByRole('link', { name: 'Open GPX File Viewer' })
    ).toHaveAttribute('href', '/tools/gpx-file-viewer');
    expect(
      screen.getByRole('link', { name: 'Try an example' })
    ).toHaveAttribute('href', '/tools/gpx-file-viewer#example-activity');
  });
});
