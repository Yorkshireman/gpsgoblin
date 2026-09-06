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
});
