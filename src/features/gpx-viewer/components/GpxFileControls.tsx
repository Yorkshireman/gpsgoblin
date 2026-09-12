import { Alert, Button, FileUpload, Flex, Spinner, Text } from '@chakra-ui/react';
import { useRef } from 'react';

import { GPX_IMPORT_DESCRIPTION } from '@/parsers/gpx';

type GpxFileControlsProps = Readonly<{
  canClear: boolean;
  showDropzone: boolean;
  isLoading: boolean;
  filename?: string;
  onClear: () => void;
  onCancel: () => void;
}>;

export const GpxFileControls = ({
  canClear,
  showDropzone,
  isLoading,
  filename,
  onClear,
  onCancel
}: GpxFileControlsProps) => {
  const chooser = useRef<HTMLButtonElement>(null);

  return (
    <>
      <FileUpload.Label srOnly>GPX file</FileUpload.Label>
      <FileUpload.HiddenInput />
      {showDropzone ? (
        <FileUpload.Dropzone _hover={{ bg: 'bg' }} cursor='default' disableClick width='full'>
          <FileUpload.DropzoneContent>
            <Text fontWeight='medium'>Drag and drop a GPX file here</Text>
            <Text color='fg.muted'>GPX files only</Text>
          </FileUpload.DropzoneContent>
        </FileUpload.Dropzone>
      ) : null}
      <Flex gap={2} align='center' wrap='wrap' width='full'>
        {filename ? (
          <Text fontWeight='medium' truncate minW={0} title={filename} flex='1 1 6rem'>
            {filename}
          </Text>
        ) : null}
        <FileUpload.Trigger asChild>
          <Button ref={chooser} type='button' variant='outline'>
            {filename ? 'Change GPX file' : 'Choose GPX file'}
          </Button>
        </FileUpload.Trigger>
        {canClear ? (
          <Button
            colorPalette='gray'
            type='button'
            variant='outline'
            onClick={() => {
              onClear();
              chooser.current?.focus();
              return;
            }}
          >
            Clear file
          </Button>
        ) : null}
      </Flex>
      {filename ? (
        <Text fontSize='sm' color='fg.muted'>
          {GPX_IMPORT_DESCRIPTION} Refreshing or clearing loses your work.
        </Text>
      ) : null}
      {isLoading ? (
        <Alert.Root role='status' status='info'>
          <Spinner aria-hidden='true' size='sm' />
          <Alert.Content>
            <Alert.Title>Opening GPX file</Alert.Title>
          </Alert.Content>
          <Button
            type='button'
            variant='outline'
            onClick={() => {
              onCancel();
              chooser.current?.focus();
              return;
            }}
          >
            Cancel import
          </Button>
        </Alert.Root>
      ) : null}
    </>
  );
};
