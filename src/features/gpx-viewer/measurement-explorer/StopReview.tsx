import {
  Box,
  Button,
  Checkbox,
  Flex,
  NativeSelect,
  Stack,
  Text,
  useRecipe
} from '@chakra-ui/react';
import type {
  MeasurementPoint,
  StopEvidence,
  StopCandidate
} from '@/analysis/measurements';
import {
  displayUnits,
  formatDuration,
  formatMeasurement
} from '../measurementDisplay';

type StopReviewProps = Readonly<{
  evidence: StopEvidence;
  selected?: StopCandidate;
  onSelect: (id: string | undefined, trigger?: HTMLElement) => void;
}>;

export const StopSearchResult = ({
  evidence
}: Readonly<{ evidence: StopEvidence }>) => {
  return (
    <Text fontSize="xs">
      {evidence.eligibleSeconds > 0
        ? 'No stops found to leave out. Some stops may have been missed.'
        : 'Your position was not recorded often enough, or the times cannot be used. We cannot check for stops.'}
    </Text>
  );
};

export const StopReview = ({
  evidence,
  selected,
  onSelect
}: StopReviewProps) => {
  return (
    <Box as="details" fontSize="sm">
      <Box as="summary" cursor="pointer">
        Review possible stops ({evidence.candidates.length})
      </Box>
      {evidence.candidates.length ? (
        <NativeSelect.Root mt={2}>
          <NativeSelect.Field
            aria-label="Inspect possible stop"
            value={selected?.id ?? ''}
            onChange={(event) => {
              onSelect(
                evidence.candidates.find((candidate) => {
                  return candidate.id === event.target.value;
                })?.endSampleId,
                event.currentTarget
              );
            }}
          >
            <option value="">Choose a possible stop…</option>
            {evidence.candidates.map((candidate, index) => {
              return (
                <option key={candidate.id} value={candidate.id}>
                  Possible stop {index + 1} ·{' '}
                  {formatDuration(candidate.seconds)}
                </option>
              );
            })}
          </NativeSelect.Field>
          <NativeSelect.Indicator />
        </NativeSelect.Root>
      ) : (
        <StopSearchResult evidence={evidence} />
      )}
      {evidence.candidates.length > 0 ? (
        <Text mt={2} fontSize="xs">
          We look for places where your GPS position barely changed for at least
          a minute. Review each possible stop and choose whether to leave it
          out.
        </Text>
      ) : null}
    </Box>
  );
};

type SelectedStopProps = Readonly<{
  candidate: StopCandidate;
  points: readonly MeasurementPoint[];
  labels: ReturnType<typeof displayUnits>;
  confirmed: boolean;
  excluded: boolean;
  pending: boolean;
  onConfirm: (confirmed: boolean) => void;
  onClear: () => void;
}>;

export const SelectedStop = ({
  candidate,
  points,
  labels,
  confirmed,
  excluded,
  pending,
  onConfirm,
  onClear
}: SelectedStopProps) => {
  const selectionPanel = useRecipe({ key: 'selectionPanel' });
  return (
    <Stack
      as="section"
      aria-label="Selected possible stop"
      gap={1}
      p={2}
      rounded="md"
      css={selectionPanel()}
      fontSize="sm"
    >
      <Flex justify="space-between" align="center" gap={2}>
        <Text fontWeight="semibold">
          Possible stop · {formatDuration(candidate.seconds)}
        </Text>
        <Button variant="ghost" size="xs" minH="44px" onClick={onClear}>
          Back to chart
        </Button>
      </Flex>
      <Text fontSize="xs">
        {formatMeasurement(
          points[candidate.startIndex].distanceMetres /
            labels.metresPerDistance,
          labels.distance
        )}
        –
        {formatMeasurement(
          points[candidate.endIndex].distanceMetres / labels.metresPerDistance,
          labels.distance
        )}{' '}
        ·{' '}
        {excluded ? 'Left out of speed and pace' : 'Included in speed and pace'}
      </Text>
      <Text fontSize="xs">
        Slow movement or climbing can look like a stop. Only tick the box if you
        stopped.
      </Text>
      <Checkbox.Root
        checked={confirmed}
        disabled={pending}
        onCheckedChange={(event) => {
          onConfirm(event.checked === true);
        }}
        minH="44px"
        colorPalette="selection"
      >
        <Checkbox.HiddenInput />
        <Checkbox.Control>
          <Checkbox.Indicator />
        </Checkbox.Control>
        <Checkbox.Label>I stopped here — leave this time out</Checkbox.Label>
      </Checkbox.Root>
    </Stack>
  );
};
