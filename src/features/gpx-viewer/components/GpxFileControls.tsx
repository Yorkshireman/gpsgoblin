import { Alert, Button, FileUpload, Spinner, Text } from '@chakra-ui/react';

type GpxFileControlsProps = Readonly<{
  canClear: boolean;
  isLoading: boolean;
}>;

export const GpxFileControls = ({ canClear, isLoading }: GpxFileControlsProps) => {
  return (
    <>
      <FileUpload.Label>GPX file</FileUpload.Label>
      <FileUpload.HiddenInput />

      <FileUpload.Dropzone _hover={{ bg: 'bg' }} cursor='default' disableClick>
        <FileUpload.DropzoneContent>
          <Text fontWeight='medium'>Drag and drop a GPX file here</Text>
          <Text color='fg.muted'>GPX files only</Text>
        </FileUpload.DropzoneContent>
      </FileUpload.Dropzone>

      <FileUpload.Trigger asChild>
        <Button type='button' variant='outline' width={{ base: 'full', md: 'auto' }}>
          Choose GPX file
        </Button>
      </FileUpload.Trigger>
      <FileUpload.List />
      {isLoading ? (
        <Alert.Root role='status' status='info'>
          <Spinner aria-hidden='true' size='sm' />
          <Alert.Content>
            <Alert.Title>Opening GPX file</Alert.Title>
          </Alert.Content>
        </Alert.Root>
      ) : null}
      {canClear ? (
        <FileUpload.ClearTrigger asChild>
          <Button
            colorPalette='gray'
            type='button'
            variant='outline'
            width={{ base: 'full', md: 'auto' }}
          >
            Clear file
          </Button>
        </FileUpload.ClearTrigger>
      ) : null}
    </>
  );
};
