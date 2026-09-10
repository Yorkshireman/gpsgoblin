'use client';

import type { ImportedGpxDocument } from '@/domain/activityDocument';
import { parseGpx } from '@/parsers/gpx';
import { RouteMap } from './RouteMap';
import { useState } from 'react';
import {
  Alert,
  Button,
  Field,
  FileUpload,
  Heading,
  NativeSelect,
  Spinner,
  Stack,
  Stat,
  Text
} from '@chakra-ui/react';

import {
  calculatePathDistanceMetres,
  calculateTrackDistanceMetres
} from '@/analysis/geometry/calculateTrackDistanceMetres';

type SelectedItem = Readonly<{
  kind: 'track' | 'route';
  id: string;
}>;

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
  const [isLoading, setIsLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SelectedItem>();

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

      const firstTrack = result.document.tracks[0];
      const firstRoute = result.document.routes[0];

      if (firstTrack) {
        setSelectedItem({ kind: 'track', id: firstTrack.id });
      } else if (firstRoute) {
        setSelectedItem({ kind: 'route', id: firstRoute.id });
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
    setSelectedItem(undefined);
    setError(undefined);
  };

  const handleFileReject = () => {
    setError('Choose a file with a .gpx filename.');
  };

  const track =
    selectedItem?.kind === 'track'
      ? document?.tracks.find(candidate => {
          return candidate.id === selectedItem.id;
        })
      : undefined;

  const route =
    selectedItem?.kind === 'route'
      ? document?.routes.find(candidate => {
          return candidate.id === selectedItem.id;
        })
      : undefined;

  const distanceMetres = track
    ? calculateTrackDistanceMetres(track.segments)
    : route
      ? calculatePathDistanceMetres(route.points)
      : undefined;

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
      {isLoading ? (
        <Alert.Root role='status' status='info'>
          <Spinner aria-hidden='true' size='sm' />
          <Alert.Content>
            <Alert.Title>Opening GPX file</Alert.Title>
          </Alert.Content>
        </Alert.Root>
      ) : null}
      {document || error ? (
        <FileUpload.ClearTrigger asChild>
          <Button
            colorPalette='gray'
            type='button'
            variant='outline'
            width={{ base: 'full', md: 'auto' }}
          >
            Clear file
          </Button>
        </FileUpload.ClearTrigger>
      ) : null}
      {document ? (
        <Stack gap={4} width='full'>
          <Alert.Root status='success'>
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title>Your GPX file is ready</Alert.Title>
            </Alert.Content>
          </Alert.Root>
          {document.tracks.length + document.routes.length > 1 ? (
            <Field.Root>
              <Field.Label>Item to inspect</Field.Label>
              <NativeSelect.Root>
                <NativeSelect.Field
                  value={selectedItem?.id ?? ''}
                  onChange={event => {
                    const id = event.currentTarget.value;
                    const isTrack = document.tracks.some(candidate => {
                      return candidate.id === id;
                    });

                    setSelectedItem({
                      kind: isTrack ? 'track' : 'route',
                      id
                    });
                  }}
                >
                  {document.tracks.map((candidate, index) => {
                    return (
                      <option key={candidate.id} value={candidate.id}>
                        Track: {candidate.name ?? `Unnamed track ${index + 1}`}
                      </option>
                    );
                  })}
                  {document.routes.map((candidate, index) => {
                    return (
                      <option key={candidate.id} value={candidate.id}>
                        Route: {candidate.name ?? `Unnamed route ${index + 1}`}
                      </option>
                    );
                  })}
                </NativeSelect.Field>
                <NativeSelect.Indicator />
              </NativeSelect.Root>
              <Field.HelperText>Choose which track or route to display.</Field.HelperText>
            </Field.Root>
          ) : null}
          {distanceMetres !== undefined ? (
            <Stat.Root>
              <Stat.Label>Calculated distance</Stat.Label>
              <Stat.ValueText>{formatDistance(distanceMetres)}</Stat.ValueText>
              <Stat.HelpText>
                {track
                  ? 'Based on the recorded GPS points'
                  : 'Based on straight lines between route points'}
              </Stat.HelpText>
            </Stat.Root>
          ) : null}
          {track ? <RouteMap track={track} /> : null}
          {route ? (
            <Stack as='section' aria-labelledby='planned-route-heading' gap={3}>
              <Heading as='h3' id='planned-route-heading' size='lg'>
                Planned route
              </Heading>
              <RouteMap route={route} />
            </Stack>
          ) : null}
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
