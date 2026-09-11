import { Alert, Button, FileUpload, Flex, Spinner, Text } from '@chakra-ui/react';

type GpxFileControlsProps = Readonly<{
  canClear: boolean;
  isLoading: boolean;
  filename?: string;
}>;

export const GpxFileControls = ({ canClear, isLoading, filename }: GpxFileControlsProps) => {
  return (
    <>
      <FileUpload.Label srOnly>GPX file</FileUpload.Label>
      <FileUpload.HiddenInput />
      {!filename ? (
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
          <Button type='button' variant='outline'>
            {filename ? 'Change GPX file' : 'Choose GPX file'}
          </Button>
        </FileUpload.Trigger>
        {canClear ? (
          <FileUpload.ClearTrigger asChild>
            <Button colorPalette='gray' type='button' variant='outline'>
              Clear file
            </Button>
          </FileUpload.ClearTrigger>
        ) : null}
      </Flex>
      {isLoading ? (
        <Alert.Root role='status' status='info'>
          <Spinner aria-hidden='true' size='sm' />
          <Alert.Content>
            <Alert.Title>Opening GPX file</Alert.Title>
          </Alert.Content>
        </Alert.Root>
      ) : null}
    </>
  );
};
