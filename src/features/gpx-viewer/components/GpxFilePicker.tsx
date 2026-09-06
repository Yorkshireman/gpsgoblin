'use client';

import { parseGpx } from '@/parsers/gpx/parseGpx';
import { useState } from 'react';
import { Alert, Button, FileUpload, Heading, Text } from '@chakra-ui/react';

const readFileAsText = (file: File) => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.addEventListener('load', () => {
      resolve(typeof reader.result === 'string' ? reader.result : '');
    });

    reader.addEventListener('error', () => {
      reject(reader.error);
    });

    reader.readAsText(file);
  });
};

export const GpxFilePicker = () => {
  const [error, setError] = useState<string>();
  const [trackName, setTrackName] = useState<string>();

  const handleFileAccept = async (details: FileUpload.FileAcceptDetails) => {
    const file = details.files[0];

    if (!file) {
      return;
    }

    const fileText = await readFileAsText(file);
    const result = parseGpx(fileText);

    if (!result.ok) {
      setTrackName(undefined);
      setError(result.error);
      return;
    }

    setError(undefined);
    setTrackName(result.document.tracks[0]?.name ?? 'Unnamed track');
  };

  return (
    <FileUpload.Root
      accept={{
        'application/gpx+xml': ['.gpx'],
        'application/xml': ['.gpx']
      }}
      onFileAccept={handleFileAccept}
      maxFiles={1}
    >
      <FileUpload.Label>GPX file</FileUpload.Label>
      <FileUpload.HiddenInput />

      <FileUpload.Dropzone disableClick>
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
      {trackName ? (
        <Heading as='h3' size='lg'>
          {trackName}
        </Heading>
      ) : null}
      {error ? (
        <Alert.Root status='error'>
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Unable to open GPX file</Alert.Title>
            <Alert.Description>{error}</Alert.Description>
          </Alert.Content>
        </Alert.Root>
      ) : null}
    </FileUpload.Root>
  );
};
