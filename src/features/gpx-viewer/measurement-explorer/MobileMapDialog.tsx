import type { ReactNode } from 'react';
import { Button, Dialog, Portal, Text } from '@chakra-ui/react';
import type { MeasurementPoint } from '@/analysis/measurements';

type MobileMapDialogProps = Readonly<{
  mapView: ReactNode;
  selected: MeasurementPoint | undefined;
}>;

export const MobileMapDialog = ({ mapView, selected }: MobileMapDialogProps) => {
  return (
    <Dialog.Root placement='center' size='full' scrollBehavior='inside' motionPreset='none' lazyMount unmountOnExit>
      <Dialog.Trigger asChild>
        <Button display={{ base: 'inline-flex', lg: 'none' }} variant='outline' mb={2}>
          View on map
        </Button>
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content height='100dvh' minH={0} maxH='100dvh'>
            <Dialog.Header flexShrink={0}>
              <Dialog.Title>{selected ? 'Selected location' : 'Route map'}</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body minH={0} overflowY='auto'>
              {mapView}
              {selected ? (
                <Text fontSize='sm'>
                  {selected.sample.latitudeDegrees}°, {selected.sample.longitudeDegrees}°
                </Text>
              ) : null}
            </Dialog.Body>
            <Dialog.Footer flexShrink={0}>
              <Dialog.CloseTrigger asChild position='static'>
                <Button>Back to chart</Button>
              </Dialog.CloseTrigger>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};
