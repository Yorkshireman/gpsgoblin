import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import { render, screen } from '@testing-library/react';

import Home from './page';

describe('homepage', () => {
  it('leads with the viewer action and offers the example below it', () => {
    render(
      <ChakraProvider value={defaultSystem}>
        <Home />
      </ChakraProvider>
    );

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'See your GPX route on a map'
      })
    ).toBeInTheDocument();
    expect(
      screen.getByText('Free tools for GPS and activity files')
    ).toBeInTheDocument();

    const viewerLink = screen.getByRole('link', {
      name: 'View your GPX file'
    });
    const exampleLink = screen.getByRole('link', { name: 'Try an example' });
    expect(viewerLink).toHaveAttribute('href', '/tools/gpx-file-viewer');
    expect(exampleLink).toHaveAttribute(
      'href',
      '/tools/gpx-file-viewer#example-activity'
    );
    expect(
      viewerLink.compareDocumentPosition(exampleLink) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();

    expect(
      screen.getByRole('link', { name: 'How to get a GPX file' })
    ).toHaveAttribute('href', '/help/how-to-get-a-gpx-file');
    expect(
      screen.getByRole('link', { name: 'Troubleshoot a GPX file' })
    ).toHaveAttribute('href', '/help/gpx-file-empty-or-missing-data');
  });
});
