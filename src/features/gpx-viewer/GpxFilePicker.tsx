'use client';

import { Alert, FileUpload, Stack, Text } from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
import type { DragEvent, ReactNode } from 'react';

import type { ImportedGpxDocument } from '@/domain/activityDocument';

import { GpxDocumentResults } from './components/GpxDocumentResults';
import { GpxFileControls } from './components/GpxFileControls';
import { openGpxFile } from './import-processing';
import type { MeasurementSession } from './import-processing';
import type { SelectedGpxItem } from './selectedGpxItem';

const oneFileMessage =
  'Open one GPX file at a time. Choose a single file to replace the current file.';

const initialItem = (
  document: ImportedGpxDocument
): SelectedGpxItem | undefined => {
  const track = document.tracks[0];
  const route = document.routes[0];
  const waypoint = document.waypoints[0];
  return track
    ? { kind: 'track', id: track.id }
    : route
      ? { kind: 'route', id: route.id }
      : waypoint
        ? { kind: 'waypoint', id: waypoint.id }
        : undefined;
};

export const GpxFilePicker = ({
  emptyStateHelp,
  resultsHelp
}: Readonly<{
  emptyStateHelp?: ReactNode;
  resultsHelp?: ReactNode;
}>) => {
  const [filename, setFilename] = useState<string>();
  const [error, setError] = useState<string>();
  const [notice, setNotice] = useState<string>();
  const [workspace, setWorkspace] = useState<{
    document: ImportedGpxDocument;
    measurements: MeasurementSession;
    revision: number;
  }>();
  const document = workspace?.document;
  const [isLoading, setIsLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SelectedGpxItem>();
  const activeImport = useRef<AbortController | undefined>(undefined);
  const activeMeasurements = useRef<MeasurementSession | undefined>(undefined);

  useEffect(() => {
    return () => {
      activeImport.current?.abort();
      activeMeasurements.current?.dispose();
    };
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
      if (activeImport.current !== controller || controller.signal.aborted) {
        if (result.ok) result.measurements.dispose();
        return;
      }
      if (!result.ok) {
        setError(result.error);
        return;
      }
      activeMeasurements.current?.dispose();
      activeMeasurements.current = result.measurements;
      setWorkspace((previous) => {
        return {
          document: result.document,
          measurements: result.measurements,
          revision: (previous?.revision ?? 0) + 1
        };
      });
      setFilename(file.name);
      setSelectedItem(initialItem(result.document));
    } catch {
      if (activeImport.current === controller && !controller.signal.aborted) {
        setError(
          'The file could not be read. Try again or choose another GPX file.'
        );
      }
    } finally {
      if (activeImport.current === controller) {
        activeImport.current = undefined;
        setIsLoading(false);
      }
    }
    return;
  };

  const resetView = () => {
    if (!workspace) return;
    setSelectedItem(initialItem(workspace.document));
    // Remount all viewer state, including disclosures and map position, without
    // rereading the file or replacing its measurement session.
    setWorkspace({ ...workspace, revision: workspace.revision + 1 });
    setError(undefined);
    setNotice('View reset.');
    return;
  };

  const clearFile = () => {
    cancelPending();
    activeMeasurements.current?.dispose();
    activeMeasurements.current = undefined;
    setWorkspace(undefined);
    setFilename(undefined);
    setSelectedItem(undefined);
    setError(undefined);
    setNotice('File closed.');
    return;
  };

  const handleFileReject = (details: FileUpload.FileRejectDetails) => {
    cancelPending();
    setNotice(undefined);
    const errors = details.files.flatMap((rejected) => rejected.errors);
    setError(
      errors.some((error) => error === 'TOO_MANY_FILES')
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
      colorPalette="action"
      onFileAccept={handleFileAccept}
      onFileReject={handleFileReject}
      onDropCapture={handleDropCapture}
      maxFiles={1}
      width="full"
      maxW={document ? 'full' : '2xl'}
      bg={document ? undefined : 'bg'}
      p={document ? 0 : { base: 3, md: 5 }}
      borderWidth={document ? 0 : '1px'}
      borderColor="border.subtle"
      rounded="xl"
      gap={3}
    >
      {!document ? (
        <Stack gap={3} maxW="prose">
          <Text>See your route, elevation, speed and pace.</Text>
          <Text color="fg.muted" fontSize="sm">
            Your file stays on your device.
          </Text>
        </Stack>
      ) : null}
      <GpxFileControls
        filename={filename}
        showDropzone={!document && !isLoading && !error}
        canClear={Boolean(document || error || isLoading)}
        isLoading={isLoading}
        onReset={workspace ? resetView : undefined}
        onClear={clearFile}
        onCancel={() => {
          cancelPending();
          setNotice('Import cancelled.');
          return;
        }}
      />
      {notice ? (
        <Text role="status" fontSize="sm">
          {notice}
        </Text>
      ) : null}
      {error ? (
        <Alert.Root status="error">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Unable to open GPX file</Alert.Title>
            <Alert.Description>{error}</Alert.Description>
            {document ? (
              <Text fontSize="sm">Your previous file is still open.</Text>
            ) : null}
          </Alert.Content>
        </Alert.Root>
      ) : null}
      {workspace ? (
        <GpxDocumentResults
          key={workspace.revision}
          document={workspace.document}
          measurements={workspace.measurements}
          filename={filename}
          onItemChange={setSelectedItem}
          selectedItem={selectedItem}
        >
          {resultsHelp}
        </GpxDocumentResults>
      ) : (
        emptyStateHelp
      )}
    </FileUpload.Root>
  );
};
