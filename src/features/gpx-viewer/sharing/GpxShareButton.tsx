import { Button, Dialog, Portal, Stack, Text } from '@chakra-ui/react';
import { useState } from 'react';

type GpxShareButtonProps = Readonly<{
  unavailableReason?: string;
  createLink: () => Promise<string>;
  onNotice: (notice: string) => void;
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
  unavailableReason,
  createLink,
  onNotice
}: GpxShareButtonProps) => {
  const [open, setOpen] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const useShareSheet =
    Boolean(navigator.share) && window.matchMedia('(max-width: 767px)').matches;
  const actionLabel = useShareSheet ? 'Share link' : 'Copy link';

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
        setOpen(false);
        setIsSharing(false);
        onNotice('Share link sent.');
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          setOpen(false);
          setIsSharing(false);
          onNotice('Sharing cancelled.');
          return;
        }
      }
    }
    try {
      await copyLink(link);
      setOpen(false);
      setIsSharing(false);
      onNotice('Share link copied.');
    } catch {
      setCopyError(true);
      setIsSharing(false);
    }
    return;
  };

  return (
    <Dialog.Root
      open={open}
      placement="center"
      motionPreset="none"
      onOpenChange={(details) => {
        setOpen(details.open);
        if (!details.open) setCopyError(false);
      }}
    >
      <Dialog.Trigger asChild>
        <Button
          aria-label="Share GPX file"
          aria-describedby={
            unavailableReason ? 'gpx-share-unavailable-reason' : undefined
          }
          disabled={Boolean(unavailableReason)}
          title={unavailableReason}
          type="button"
          variant="outline"
        >
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
        </Button>
      </Dialog.Trigger>
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
              <Dialog.CloseTrigger asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Dialog.CloseTrigger>
              <Button disabled={isSharing} type="button" onClick={share}>
                {isSharing ? 'Creating link…' : actionLabel}
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};
