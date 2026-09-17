import {
  Button,
  Dialog,
  HStack,
  Portal,
  Stack,
  Text,
  Tooltip
} from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';

const copySuccessDuration = 2_000;

type GpxShareButtonProps = Readonly<{
  createLink: () => Promise<string>;
  onNotice: (notice: string) => void;
  unavailableReason?: string;
}>;

const copyLink = async (link: string) => {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(link);
    return;
  }

  const input = document.createElement('textarea');
  input.value = link;
  input.setAttribute('readonly', '');
  input.style.position = 'fixed';
  input.style.opacity = '0';
  document.body.append(input);
  input.select();
  const copied = document.execCommand('copy');
  input.remove();
  if (!copied) throw new Error('Copy failed');
};

export const GpxShareButton = ({
  createLink,
  onNotice,
  unavailableReason
}: GpxShareButtonProps) => {
  const [copyError, setCopyError] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [open, setOpen] = useState(false);
  const [unavailableTooltipOpen, setUnavailableTooltipOpen] = useState(false);
  const closeTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    return () => {
      if (closeTimer.current !== undefined) {
        window.clearTimeout(closeTimer.current);
      }
    };
  }, []);

  const useShareSheet =
    Boolean(navigator.share) && window.matchMedia('(max-width: 767px)').matches;
  const actionColorPalette = copySuccess ? 'green' : undefined;
  const actionLabel = copySuccess
    ? 'Link copied'
    : isSharing
      ? 'Creating link…'
      : useShareSheet
        ? 'Share link'
        : 'Copy link';
  const icon = (
    <svg
      aria-hidden="true"
      fill="none"
      height="20"
      viewBox="0 0 24 24"
      width="20"
    >
      <path
        d="M12 3v12m0-12 4 4m-4-4L8 7M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );

  const closeDialog = () => {
    if (closeTimer.current !== undefined) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = undefined;
    }

    setCopyError(false);
    setCopySuccess(false);
    setOpen(false);
    return;
  };

  const share = async () => {
    setCopyError(false);
    setIsSharing(true);
    let link: string;
    try {
      link = await createLink();
    } catch {
      setCopyError(true);
      setIsSharing(false);
      return;
    }

    if (useShareSheet && navigator.share) {
      try {
        await navigator.share({ title: 'Shared GPX file', url: link });
        closeDialog();
        setIsSharing(false);
        onNotice('Share link sent.');
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          closeDialog();
          setIsSharing(false);
          onNotice('Sharing cancelled.');
          return;
        }
      }
    }

    try {
      await copyLink(link);
      setCopySuccess(true);
      setIsSharing(false);
      onNotice('Share link copied.');
      closeTimer.current = window.setTimeout(() => {
        closeTimer.current = undefined;
        setCopySuccess(false);
        setOpen(false);
      }, copySuccessDuration);
    } catch {
      setCopyError(true);
      setIsSharing(false);
    }
    return;
  };

  const shareControl = unavailableReason ? (
    <Tooltip.Root
      onOpenChange={(details) => {
        setUnavailableTooltipOpen(details.open);
      }}
      open={unavailableTooltipOpen}
      positioning={{ placement: 'bottom' }}
    >
      <Tooltip.Trigger asChild>
        <Button
          aria-disabled="true"
          aria-label="Sharing unavailable"
          cursor="not-allowed"
          onClick={() => {
            setUnavailableTooltipOpen(true);
          }}
          opacity="0.5"
          type="button"
          variant="outline"
        >
          {icon}
        </Button>
      </Tooltip.Trigger>
      <Portal>
        <Tooltip.Positioner>
          <Tooltip.Content>{unavailableReason}</Tooltip.Content>
        </Tooltip.Positioner>
      </Portal>
    </Tooltip.Root>
  ) : (
    <Dialog.Trigger asChild>
      <Button aria-label="Share GPX file" type="button" variant="outline">
        {icon}
      </Button>
    </Dialog.Trigger>
  );

  return (
    <Dialog.Root
      motionPreset="none"
      onOpenChange={(details) => {
        if (details.open) setOpen(true);
        else closeDialog();
      }}
      open={open}
      placement="center"
    >
      {shareControl}
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner padding={2}>
          <Dialog.Content maxW="lg">
            <Dialog.Header>
              <Dialog.Title>Share this file</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Stack gap={3}>
                <Text>
                  This link contains your GPX file. Sending it is like sending
                  the file itself.
                </Text>
                <Text>
                  Opening it loads the GPX Viewer for the recipient. GPSGoblin
                  does not store your file.
                </Text>
                <Text>
                  Anyone with the link can see its locations and pass it on. It
                  cannot be taken back.
                </Text>
                {copyError ? (
                  <Text color="fg.error">
                    The link could not be created or copied. Try again or send
                    the GPX file itself.
                  </Text>
                ) : null}
              </Stack>
            </Dialog.Body>
            <Dialog.Footer>
              <HStack gap={2}>
                <Button asChild type="button" variant="outline">
                  <Dialog.ActionTrigger>Cancel</Dialog.ActionTrigger>
                </Button>
                <Button
                  colorPalette={actionColorPalette}
                  disabled={copySuccess || isSharing}
                  onClick={share}
                  type="button"
                >
                  {actionLabel}
                </Button>
              </HStack>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};
