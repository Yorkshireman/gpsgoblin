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

describe('when a phone user opens the sharing confirmation', () => {
  const link = 'https://gpsgoblin.com/#gpx-share=v1.test';
  let createLink: jest.Mock<Promise<string>, []>;
  let onNotice: jest.Mock;
  let share: jest.Mock<Promise<void>, []>;
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(async () => {
    user = userEvent.setup();

    createLink = jest.fn().mockResolvedValue(link);
    share = jest.fn().mockResolvedValue(undefined);

    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: share
    });
    jest
      .spyOn(window, 'matchMedia')
      .mockReturnValue({ matches: true } as MediaQueryList);

    onNotice = renderButton(createLink);

    await user.click(screen.getByRole('button', { name: 'Share GPX file' }));
  });

  test('explains what sharing the link means', () => {
    expect(createLink).not.toHaveBeenCalled();
    expect(
      screen.getByText(
        'Anyone with the link can see its locations and pass it on. It cannot be taken back.'
      )
    ).toBeVisible();
  });

  describe('when they share the link', () => {
    beforeEach(async () => {
      await user.click(screen.getByRole('button', { name: 'Share link' }));
    });

    test('opens the platform share sheet with the generated link', () => {
      expect(createLink).toHaveBeenCalledTimes(1);
      expect(share).toHaveBeenCalledWith({
        title: 'Shared GPX file',
        url: link
      });
      expect(onNotice).toHaveBeenCalledWith('Share link sent.');
    });
  });
});

describe('when sharing is unavailable', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(async () => {
    user = userEvent.setup();
    render(
      <ChakraProvider value={defaultSystem}>
        <GpxShareButton
          createLink={jest.fn()}
          onNotice={jest.fn()}
          unavailableReason="File too big to share."
        />
      </ChakraProvider>
    );

    await user.click(
      screen.getByRole('button', { name: 'Sharing unavailable' })
    );
  });

  test('reveals the reason when the icon is tapped', () => {
    expect(
      screen.getByRole('button', { name: 'Sharing unavailable' })
    ).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByText('File too big to share.')).toBeVisible();
  });
});

describe('when a desktop user confirms sharing', () => {
  const link = 'https://gpsgoblin.com/#gpx-share=v1.test';
  let createLink: jest.Mock<Promise<string>, []>;
  let onNotice: jest.Mock;
  let share: jest.Mock<Promise<void>, []>;
  let user: ReturnType<typeof userEvent.setup>;
  let writeText: jest.Mock<Promise<void>, [string]>;

  beforeEach(async () => {
    user = userEvent.setup();

    createLink = jest.fn().mockResolvedValue(link);
    share = jest.fn().mockResolvedValue(undefined);
    writeText = jest.fn().mockResolvedValue(undefined);

    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: share
    });
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText }
    });

    onNotice = renderButton(createLink);

    await user.click(screen.getByRole('button', { name: 'Share GPX file' }));
    await user.click(screen.getByRole('button', { name: 'Copy link' }));
  });

  test('copies the generated link instead of using the share sheet', () => {
    expect(writeText).toHaveBeenCalledWith(link);
    expect(share).not.toHaveBeenCalled();
    expect(onNotice).toHaveBeenCalledWith('Share link copied.');
  });
});
