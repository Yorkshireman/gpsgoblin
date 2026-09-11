'use client';

import { Alert, FileUpload, Heading, Stack, Text } from '@chakra-ui/react';
import { useState } from 'react';

import type { ImportedGpxDocument } from '@/domain/activityDocument';
import { parseGpx } from '@/parsers/gpx';

import { GpxDocumentResults } from './components/GpxDocumentResults';
import { GpxFileControls } from './components/GpxFileControls';
import type { SelectedGpxItem } from './selectedGpxItem';

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
  const [filename, setFilename] = useState<string>();
  const [error, setError] = useState<string>();
  const [document, setDocument] = useState<ImportedGpxDocument>();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SelectedGpxItem>();

  const handleFileAccept = async (details: FileUpload.FileAcceptDetails) => {
    const file = details.files[0];

    if (!file) {
      return;
    }

    setIsLoading(true);
    setError(undefined);

    try {
      const fileText = await readFileAsText(file);
      const result = parseGpx(fileText);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setDocument(result.document);
      setFilename(file.name);

      const firstTrack = result.document.tracks[0];
      const firstRoute = result.document.routes[0];
      const firstWaypoint = result.document.waypoints[0];

      if (firstTrack) {
        setSelectedItem({ kind: 'track', id: firstTrack.id });
      } else if (firstRoute) {
        setSelectedItem({ kind: 'route', id: firstRoute.id });
      } else if (firstWaypoint) {
        setSelectedItem({ kind: 'waypoint', id: firstWaypoint.id });
      } else {
        setSelectedItem(undefined);
      }
    } catch {
      setError('The file could not be read.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (details: FileUpload.FileChangeDetails) => {
    if (details.acceptedFiles.length > 0 || details.rejectedFiles.length > 0) {
      return;
    }

    setDocument(undefined);
    setFilename(undefined);
    setSelectedItem(undefined);
    setError(undefined);
  };

  const handleFileReject = () => {
    setError('Choose a file with a .gpx filename.');
  };

  return (
    <FileUpload.Root
      accept={{
        'application/gpx+xml': ['.gpx'],
        'application/xml': ['.gpx']
      }}
      colorPalette='green'
      disabled={isLoading}
      onFileAccept={handleFileAccept}
      onFileChange={handleFileChange}
      onFileReject={handleFileReject}
      maxFiles={1}
      width='full'
      maxW={document ? 'full' : '2xl'}
      gap={3}
    >
      {!document ? (
        <Stack gap={3} maxW='prose'>
          <Heading as='h2' size='xl'>
            Open a GPX file
          </Heading>
          <Text>
            Inspect routes, elevation and available timing. Your file stays on your device; this
            tool does not upload it.
          </Text>
          <Text color='fg.muted' fontSize='sm'>
            Choose or drop a file. Refreshing or clearing the workspace loses your work.
          </Text>
        </Stack>
      ) : null}
      <GpxFileControls
        filename={filename}
        canClear={Boolean(document || error)}
        isLoading={isLoading}
      />
      {error ? (
        <Alert.Root status='error'>
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Unable to open GPX file</Alert.Title>
            <Alert.Description>{error}</Alert.Description>
          </Alert.Content>
        </Alert.Root>
      ) : null}
      {document ? (
        <GpxDocumentResults
          document={document}
          filename={filename}
          onItemChange={setSelectedItem}
          selectedItem={selectedItem}
        />
      ) : null}
    </FileUpload.Root>
  );
};
