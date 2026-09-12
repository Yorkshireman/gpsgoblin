'use client';

import { Alert, FileUpload, Heading, Stack, Text } from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
import type { DragEvent } from 'react';

import type { ImportedGpxDocument } from '@/domain/activityDocument';
import { GPX_IMPORT_DESCRIPTION } from '@/parsers/gpx';

import { GpxDocumentResults } from './components/GpxDocumentResults';
import { GpxFileControls } from './components/GpxFileControls';
import { openGpxFile } from './import-processing';
import type { SelectedGpxItem } from './selectedGpxItem';

const oneFileMessage =
  'Open one GPX file at a time. Choose a single file to replace the current file.';

export const GpxFilePicker = () => {
  const [filename, setFilename] = useState<string>();
  const [error, setError] = useState<string>();
  const [notice, setNotice] = useState<string>();
  const [document, setDocument] = useState<ImportedGpxDocument>();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SelectedGpxItem>();
  const activeImport = useRef<AbortController | undefined>(undefined);

  useEffect(() => {
    return () => activeImport.current?.abort();
  }, []);

  const cancelPending = () => {
    activeImport.current?.abort();
    activeImport.current = undefined;
    setIsLoading(false);
    return;
  };

  const handleFileAccept = async (details: FileUpload.FileAcceptDetails) => {
    const file = details.files[0];
    if (!file) return;
    cancelPending();
    const controller = new AbortController();
    activeImport.current = controller;
    setIsLoading(true);
    setError(undefined);
    setNotice(undefined);
    try {
      const result = await openGpxFile(file, controller.signal);
      if (activeImport.current !== controller || controller.signal.aborted) return;
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
      if (activeImport.current === controller && !controller.signal.aborted) {
        setError('The file could not be read. Try again or choose another GPX file.');
      }
    } finally {
      if (activeImport.current === controller) {
        activeImport.current = undefined;
        setIsLoading(false);
      }
    }
    return;
  };

  const clearFile = () => {
    cancelPending();
    setDocument(undefined);
    setFilename(undefined);
    setSelectedItem(undefined);
    setError(undefined);
    setNotice('Workspace cleared.');
    return;
  };

  const handleFileReject = (details: FileUpload.FileRejectDetails) => {
    cancelPending();
    setNotice(undefined);
    const errors = details.files.flatMap(rejected => rejected.errors);
    setError(
      errors.some(error => error === 'TOO_MANY_FILES')
        ? oneFileMessage
        : 'Choose a file with a .gpx filename.'
    );
    return;
  };

  const handleDropCapture = (event: DragEvent<HTMLDivElement>) => {
    // The single-file picker otherwise silently takes the first dropped file.
    if (event.dataTransfer.files.length > 1) {
      event.preventDefault();
      event.stopPropagation();
      cancelPending();
      setNotice(undefined);
      setError(oneFileMessage);
    }
    return;
  };

  return (
    <FileUpload.Root
      accept={{ 'application/gpx+xml': ['.gpx'], 'application/xml': ['.gpx'] }}
      // The picker is transient; only successful imports become workspace data.
      acceptedFiles={[]}
      colorPalette='green'
      onFileAccept={handleFileAccept}
      onFileReject={handleFileReject}
      onDropCapture={handleDropCapture}
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
            {GPX_IMPORT_DESCRIPTION}
          </Text>
          <Text color='fg.muted' fontSize='sm'>
            Refreshing or clearing the workspace loses your work.
          </Text>
        </Stack>
      ) : null}
      <GpxFileControls
        filename={filename}
        showDropzone={!document && !isLoading && !error}
        canClear={Boolean(document || error || isLoading)}
        isLoading={isLoading}
        onClear={clearFile}
        onCancel={() => {
          cancelPending();
          setNotice('Import cancelled.');
          return;
        }}
      />
      {notice ? (
        <Text role='status' fontSize='sm'>{notice}</Text>
      ) : null}
      {error ? (
        <Alert.Root status='error'>
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Unable to open GPX file</Alert.Title>
            <Alert.Description>{error}</Alert.Description>
            <Text fontSize='sm'>
              {document ? 'Your previous file is still open. ' : ''}
              Choose another GPX 1.1 file or export it again from the source app.
            </Text>
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
