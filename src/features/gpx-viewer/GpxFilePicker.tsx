'use client';

import { Alert, Button, FileUpload, Stack, Text } from '@chakra-ui/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { DragEvent, ReactNode } from 'react';

import type { ImportedGpxDocument } from '@/domain/activityDocument';

import { GpxDocumentResults } from './components/GpxDocumentResults';
import { GpxFileControls } from './components/GpxFileControls';
import { openGpxFile } from './import-processing';
import type { MeasurementSession } from './import-processing';
import type { SelectedGpxItem } from './selectedGpxItem';
import { useExampleActivity } from './useExampleActivity';

const oneFileMessage =
  'Open one GPX file at a time. Choose a single file to replace the current file.';
type ImportSource = 'example' | 'personal';

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
  resultsHelp,
  waypointHelp
}: Readonly<{
  emptyStateHelp?: ReactNode;
  resultsHelp?: ReactNode;
  waypointHelp?: ReactNode;
}>) => {
  const [filename, setFilename] = useState<string>();
  const [error, setError] = useState<string>();
  const [failedSource, setFailedSource] = useState<ImportSource>();
  const [loadedSource, setLoadedSource] = useState<ImportSource>();
  const [loadingSource, setLoadingSource] = useState<ImportSource>();
  const [notice, setNotice] = useState<string>();
  const [workspace, setWorkspace] = useState<{
    document: ImportedGpxDocument;
    measurements: MeasurementSession;
    revision: number;
  }>();
  const document = workspace?.document;
  const [selectedItem, setSelectedItem] = useState<SelectedGpxItem>();
  const activeImport = useRef<AbortController | undefined>(undefined);
  const activeMeasurements = useRef<MeasurementSession | undefined>(undefined);

  useEffect(() => {
    return () => {
      activeImport.current?.abort();
      activeMeasurements.current?.dispose();
    };
  }, []);

  const cancelPending = useCallback(() => {
    activeImport.current?.abort();
    activeImport.current = undefined;
    setLoadingSource(undefined);
    return;
  }, []);

  const importFile = useCallback(
    async (
      getFile: (signal: AbortSignal) => Promise<File>,
      source: ImportSource
    ) => {
      cancelPending();
      const controller = new AbortController();
      activeImport.current = controller;
      setLoadingSource(source);
      setError(undefined);
      setFailedSource(undefined);
      setNotice(undefined);
      try {
        const file = await getFile(controller.signal);
        const result = await openGpxFile(file, controller.signal);
        if (activeImport.current !== controller || controller.signal.aborted) {
          if (result.ok) result.measurements.dispose();
          return false;
        }
        if (!result.ok) {
          setError(result.error);
          setFailedSource(source);
          return false;
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
        setLoadedSource(source);
        setSelectedItem(initialItem(result.document));
        return true;
      } catch {
        if (activeImport.current === controller && !controller.signal.aborted) {
          setError(
            source === 'example'
              ? 'The example activity could not be opened. Try again or choose your own GPX file.'
              : 'The file could not be read. Try again or choose another GPX file.'
          );
          setFailedSource(source);
        }
        return false;
      } finally {
        if (activeImport.current === controller) {
          activeImport.current = undefined;
          setLoadingSource(undefined);
        }
      }
    },
    [cancelPending]
  );

  const importExampleActivity = useCallback(
    async (getFile: (signal: AbortSignal) => Promise<File>) => {
      return importFile(getFile, 'example');
    },
    [importFile]
  );
  const { clearExampleMarker, loadExample } = useExampleActivity(
    importExampleActivity
  );

  const handleFileAccept = async (details: FileUpload.FileAcceptDetails) => {
    const file = details.files[0];
    if (!file) return;
    const imported = await importFile(async () => file, 'personal');
    if (imported) clearExampleMarker();
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
    setLoadedSource(undefined);
    setSelectedItem(undefined);
    setError(undefined);
    setFailedSource(undefined);
    setNotice('File closed.');
    clearExampleMarker();
    return;
  };

  const handleFileReject = (details: FileUpload.FileRejectDetails) => {
    cancelPending();
    setNotice(undefined);
    setFailedSource('personal');
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
      setFailedSource('personal');
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
        canClear={Boolean(document || error || loadingSource)}
        filename={filename}
        isExample={loadedSource === 'example' || loadingSource === 'example'}
        isLoading={Boolean(loadingSource)}
        isLoadingExample={loadingSource === 'example'}
        onClear={clearFile}
        onCancel={() => {
          if (loadingSource === 'example') clearExampleMarker();
          cancelPending();
          setNotice('Import cancelled.');
          return;
        }}
        onReset={workspace ? resetView : undefined}
        onTryExample={
          !workspace && !loadingSource && failedSource !== 'example'
            ? loadExample
            : undefined
        }
        showDropzone={!document && !loadingSource && !error}
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
            <Alert.Title>
              {failedSource === 'example'
                ? 'Unable to open example activity'
                : 'Unable to open GPX file'}
            </Alert.Title>
            <Alert.Description>{error}</Alert.Description>
            {document ? (
              <Text fontSize="sm">Your previous file is still open.</Text>
            ) : null}
            {failedSource === 'example' ? (
              <Button
                alignSelf="start"
                colorPalette="action"
                mt={2}
                type="button"
                onClick={loadExample}
              >
                Try again
              </Button>
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
          {selectedItem?.kind === 'waypoint' ? waypointHelp : resultsHelp}
        </GpxDocumentResults>
      ) : (
        emptyStateHelp
      )}
    </FileUpload.Root>
  );
};
