'use client';

import { calculateTrackDistanceMetres } from '@/analysis/geometry/calculateTrackDistanceMetres';
import type { ImportedGpxDocument } from '@/domain/activityDocument';
import { parseGpx } from '@/parsers/gpx/parseGpx';
import { useState } from 'react';
import { Alert, Button, FileUpload, Stack, Stat, Text } from '@chakra-ui/react';

const formatDistance = (distanceMetres: number) => {
  return `${(distanceMetres / 1000).toFixed(1)} km`;
};

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
  const [document, setDocument] = useState<ImportedGpxDocument>();

  const handleFileAccept = async (details: FileUpload.FileAcceptDetails) => {
    const file = details.files[0];

    if (!file) {
      return;
    }

    const fileText = await readFileAsText(file);
    const result = parseGpx(fileText);

    if (!result.ok) {
      setDocument(undefined);
      setError(result.error);
      return;
    }

    setError(undefined);
    setDocument(result.document);
  };

  const track = document?.tracks[0];
  const distanceMetres = calculateTrackDistanceMetres(track?.segments ?? []);

  return (
    <FileUpload.Root
      accept={{
        'application/gpx+xml': ['.gpx'],
        'application/xml': ['.gpx']
      }}
      colorPalette='green'
      onFileAccept={handleFileAccept}
      maxFiles={1}
    >
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
      {document ? (
        <Stack gap={4} width='full'>
          <Alert.Root status='success'>
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title>Your GPX file is ready</Alert.Title>
              <Alert.Description>{track?.name ?? 'Unnamed track'}</Alert.Description>
            </Alert.Content>
          </Alert.Root>

          <Stat.Root>
            <Stat.Label>Calculated distance</Stat.Label>
            <Stat.ValueText>{formatDistance(distanceMetres)}</Stat.ValueText>
            <Stat.HelpText>Based on the recorded GPS points</Stat.HelpText>
          </Stat.Root>
        </Stack>
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
