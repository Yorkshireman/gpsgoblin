'use client';

import { Button, FileUpload, Text } from '@chakra-ui/react';

export const GpxFilePicker = () => {
  return (
    <FileUpload.Root
      accept={{
        'application/gpx+xml': ['.gpx'],
        'application/xml': ['.gpx']
      }}
      maxFiles={1}
    >
      <FileUpload.Label>GPX file</FileUpload.Label>
      <FileUpload.HiddenInput />

      <FileUpload.Dropzone>
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
    </FileUpload.Root>
  );
};
