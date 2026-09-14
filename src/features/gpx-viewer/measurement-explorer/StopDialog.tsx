import { Dialog, Portal, Stack } from '@chakra-ui/react';
import type { ReactNode } from 'react';

export const StopDialog = ({ children, onClose, returnFocus }: Readonly<{
  children: ReactNode; onClose: () => void; returnFocus: () => HTMLElement | null;
}>) => {
  return <Dialog.Root open size='lg' placement='center' scrollBehavior='inside' motionPreset='none'
    finalFocusEl={returnFocus} onOpenChange={details => { if (!details.open) onClose(); }}>
    <Portal><Dialog.Backdrop /><Dialog.Positioner padding={2}>
      <Dialog.Content maxH='calc(100dvh - 16px)'>
        <Dialog.Header px={3} py={1}><Dialog.Title fontSize='md'>Review possible stop</Dialog.Title></Dialog.Header>
        <Dialog.Body px={2} py={1}><Stack gap={1}>{children}</Stack></Dialog.Body>
      </Dialog.Content>
    </Dialog.Positioner></Portal>
  </Dialog.Root>;
};
