'use client';

import { Button, FileUpload } from '@chakra-ui/react';

export function GpxFilePicker() {
  return (
    <FileUpload.Root
      accept={{
        'application/gpx+xml': ['.gpx'],
        'application/xml': ['.gpx']
      }}
      maxFiles={1}
    >
      <FileUpload.HiddenInput />

      <FileUpload.Trigger asChild>
        <Button type='button' variant='outline' width={{ base: 'full', md: 'auto' }}>
          Choose GPX file
        </Button>
      </FileUpload.Trigger>
    </FileUpload.Root>
  );
}
