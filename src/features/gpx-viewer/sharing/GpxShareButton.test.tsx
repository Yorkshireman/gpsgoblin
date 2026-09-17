import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';

import { GpxShareButton } from './GpxShareButton';

const renderButton = (
  createLink: () => Promise<string>,
  onNotice = jest.fn()
) => {
  render(
    <ChakraProvider value={defaultSystem}>
      <GpxShareButton createLink={createLink} onNotice={onNotice} />
    </ChakraProvider>
  );
  return onNotice;
};

afterEach(() => {
  jest.restoreAllMocks();
});

it('waits for the confirmation before creating a link and uses the platform share sheet', async () => {
  const user = userEvent.setup();
  const createLink = jest
    .fn()
    .mockResolvedValue('https://gpsgoblin.com/#gpx-share=v1.test');
  const share = jest.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, 'share', {
    configurable: true,
    value: share
  });
  const onNotice = renderButton(createLink);

  await user.click(screen.getByRole('button', { name: 'Share GPX file' }));
  expect(createLink).not.toHaveBeenCalled();
  expect(
    screen.getByText(
      'Anyone with the link can see its locations and pass it on. It cannot be taken back.'
    )
  ).toBeVisible();
  await user.click(screen.getByRole('button', { name: 'Share link' }));

  expect(createLink).toHaveBeenCalledTimes(1);
  expect(share).toHaveBeenCalledWith({
    title: 'Shared GPX file',
    url: 'https://gpsgoblin.com/#gpx-share=v1.test'
  });
  expect(onNotice).toHaveBeenCalledWith('Share link sent.');
});

it('keeps the share button visible and explains when sharing is unavailable', () => {
  render(
    <ChakraProvider value={defaultSystem}>
      <GpxShareButton
        createLink={jest.fn()}
        unavailableReason="This file is too large to share as a link."
        onNotice={jest.fn()}
      />
    </ChakraProvider>
  );

  expect(screen.getByRole('button', { name: 'Share GPX file' })).toBeDisabled();
});
