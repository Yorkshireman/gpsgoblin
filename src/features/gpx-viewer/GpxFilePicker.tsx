'use client';

import { Alert, FileUpload, Stack, Text } from '@chakra-ui/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { DragEvent, ReactNode } from 'react';

import type { ImportedGpxDocument } from '@/domain/activityDocument';

import { GpxDocumentResults } from './components/GpxDocumentResults';
import { GpxFileControls } from './components/GpxFileControls';
import { openGpxFile } from './import-processing';
import type { MeasurementSession } from './import-processing';
import type { SelectedGpxItem } from './selectedGpxItem';
import {
  decodeGpxShareLink,
  encodeGpxShareLink,
  getGpxShareLinkLengthUnavailableReason,
  getGpxShareLinkUnavailableReason
} from './sharing';

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
  children
}: Readonly<{ children?: ReactNode }>) => {
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
  const [share, setShare] = useState<{
    unavailableReason?: string;
  }>();
  const [sourceFile, setSourceFile] = useState<File>();
  const activeImport = useRef<AbortController | undefined>(undefined);
  const activeMeasurements = useRef<MeasurementSession | undefined>(undefined);
  const sharePreparation = useRef(0);
  const sharedImportAttempted = useRef(false);

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

  const prepareShareAvailability = useCallback(async (file: File) => {
    const unavailableReason = getGpxShareLinkUnavailableReason(file);
    const preparation = ++sharePreparation.current;
    if (unavailableReason) {
      setShare({ unavailableReason });
      return;
    }

    setShare({ unavailableReason: 'Preparing a share link…' });

    try {
      const linkUnavailableReason =
        await getGpxShareLinkLengthUnavailableReason(
          await file.arrayBuffer(),
          `${window.location.origin}${window.location.pathname}`
        );

      if (sharePreparation.current === preparation)
        setShare(
          linkUnavailableReason
            ? { unavailableReason: linkUnavailableReason }
            : {}
        );
    } catch (error) {
      if (sharePreparation.current !== preparation) return;

      setShare({
        unavailableReason:
          error instanceof Error
            ? error.message
            : 'This file cannot be shared as a link. You can still send the GPX file itself.'
      });
    }
    return;
  }, []);

  const openFile = useCallback(
    async (file: File, successNotice?: string) => {
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
        setSelectedItem(initialItem(result.document));
        setSourceFile(file);

        void prepareShareAvailability(file);
        if (successNotice) setNotice(successNotice);
        return true;
      } catch {
        if (activeImport.current === controller && !controller.signal.aborted) {
          setError(
            'The file could not be read. Try again or choose another GPX file.'
          );
        }
        return false;
      } finally {
        if (activeImport.current === controller) {
          activeImport.current = undefined;
          setIsLoading(false);
        }
      }
      return;
    },
    [prepareShareAvailability]
  );

  const handleFileAccept = async (details: FileUpload.FileAcceptDetails) => {
    const file = details.files[0];
    if (!file) return;
    await openFile(file);
    return;
  };

  useEffect(() => {
    if (sharedImportAttempted.current) return;
    sharedImportAttempted.current = true;
    const fragment = window.location.hash;
    if (!fragment.startsWith('#gpx-share=')) return;

    const openSharedFile = async () => {
      try {
        const contents = await decodeGpxShareLink(fragment);

        const opened = await openFile(
          new File([contents], 'shared-route.gpx', {
            type: 'application/gpx+xml'
          }),
          'Shared GPX file opened.'
        );

        if (opened)
          window.history.replaceState(
            window.history.state,
            '',
            `${window.location.pathname}${window.location.search}`
          );
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : 'This share link could not be opened. Ask the sender to make a new one.'
        );
      }
    };

    void openSharedFile();
  }, [openFile]);

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
    sharePreparation.current += 1;
    setShare(undefined);
    setSourceFile(undefined);
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
      bg={document ? undefined : 'bg'}
      borderColor="border.subtle"
      borderWidth={document ? 0 : '1px'}
      colorPalette="green"
      gap={3}
      maxFiles={1}
      maxW={document ? 'full' : '2xl'}
      onFileAccept={handleFileAccept}
      onFileReject={handleFileReject}
      onDropCapture={handleDropCapture}
      p={document ? 0 : { base: 3, md: 5 }}
      rounded="xl"
      width="full"
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
        canClear={Boolean(document || error || isLoading)}
        filename={filename}
        isLoading={isLoading}
        onCancel={() => {
          cancelPending();
          setNotice('Import cancelled.');
          return;
        }}
        onClear={clearFile}
        onReset={workspace ? resetView : undefined}
        share={
          document
            ? {
                ...share,
                createLink: async () => {
                  if (!sourceFile)
                    throw new Error(
                      'This file is no longer open. Choose it again to share it.'
                    );
                  return encodeGpxShareLink(
                    await sourceFile.arrayBuffer(),
                    `${window.location.origin}${window.location.pathname}`
                  );
                },
                onNotice: setNotice
              }
            : undefined
        }
        showDropzone={!document && !isLoading && !error}
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
          document={workspace.document}
          filename={filename}
          key={workspace.revision}
          measurements={workspace.measurements}
          onItemChange={setSelectedItem}
          selectedItem={selectedItem}
        >
          {children}
        </GpxDocumentResults>
      ) : (
        children
      )}
    </FileUpload.Root>
  );
};
