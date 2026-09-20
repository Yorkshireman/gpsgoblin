import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import { render, screen } from '@testing-library/react';

import { SiteFooter } from './SiteFooter';

describe('site footer', () => {
  it('links every published help page from crawlable navigation', () => {
    render(
      <ChakraProvider value={defaultSystem}>
        <SiteFooter />
      </ChakraProvider>
    );

    expect(
      screen.getByRole('link', { name: 'Get a GPX file' })
    ).toHaveAttribute('href', '/help/how-to-get-a-gpx-file');
    expect(
      screen.getByRole('link', { name: 'GPX troubleshooting' })
    ).toHaveAttribute('href', '/help/gpx-file-empty-or-missing-data');
  });
});
