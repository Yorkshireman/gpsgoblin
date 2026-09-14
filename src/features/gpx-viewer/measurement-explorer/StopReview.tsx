import { Box, Button, Checkbox, Flex, NativeSelect, Stack, Text } from '@chakra-ui/react';
import type { MeasurementPoint, StopEvidence, StopCandidate } from '@/analysis/measurements';
import { displayUnits, formatDuration, formatMeasurement } from '../measurementDisplay';

type StopReviewProps = Readonly<{
  evidence: StopEvidence;
  selected?: StopCandidate;
  onSelect: (id: string | undefined, trigger?: HTMLElement) => void;
}>;

export const StopReview = ({ evidence, selected, onSelect }: StopReviewProps) => {
  return <Box as='details' fontSize='sm'>
    <Box as='summary' cursor='pointer'>Review possible stops ({evidence.candidates.length})</Box>
    {evidence.candidates.length ? <NativeSelect.Root mt={2}>
      <NativeSelect.Field aria-label='Inspect possible stop' value={selected?.id ?? ''} onChange={event => {
        onSelect(evidence.candidates.find(candidate => { return candidate.id === event.target.value; })?.endSampleId, event.currentTarget);
      }}>
        <option value=''>Choose an interval…</option>
        {evidence.candidates.map((candidate, index) => {
          return <option key={candidate.id} value={candidate.id}>Possible stop {index + 1} · {formatDuration(candidate.seconds)}</option>;
        })}
      </NativeSelect.Field>
      <NativeSelect.Indicator />
    </NativeSelect.Root> : <Text mt={2} fontSize='xs'>No possible stops found. This does not prove continuous movement.</Text>}
    <Text mt={2} fontSize='xs'>Method: at least 60 seconds within a 10 m spatial extent, with observations at most 10 seconds apart. Dense observation coverage: {formatDuration(evidence.eligibleSeconds)}. Other intervals are not classified. Timer pauses and recording gaps do not prove a stop.</Text>
  </Box>;
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

export const SelectedStop = ({ candidate, points, labels, confirmed, excluded, pending, onConfirm, onClear }: SelectedStopProps) => {
  return <Stack as='section' aria-label='Selected possible stop' gap={1} p={2} rounded='md' bg='blue.subtle' color='blue.fg' fontSize='sm'>
    <Flex justify='space-between' align='center' gap={2}>
      <Text fontWeight='semibold'>Possible stop · {formatDuration(candidate.seconds)}</Text>
      <Button variant='ghost' size='xs' minH='44px' onClick={onClear}>Clear stop</Button>
    </Flex>
    <Text fontSize='xs'>{formatMeasurement(points[candidate.startIndex].distanceMetres / labels.metresPerDistance, labels.distance)}–{formatMeasurement(points[candidate.endIndex].distanceMetres / labels.metresPerDistance, labels.distance)} · {excluded ? 'Excluded' : 'Included'}</Text>
    <Text fontSize='xs'>{candidate.uncertainty.join(' ')}</Text>
    <Checkbox.Root checked={confirmed} disabled={pending} onCheckedChange={event => { onConfirm(event.checked === true); }} minH='44px' colorPalette='blue'>
      <Checkbox.HiddenInput />
      <Checkbox.Control><Checkbox.Indicator /></Checkbox.Control>
      <Checkbox.Label>I confirm this was a stop; exclude it</Checkbox.Label>
    </Checkbox.Root>
  </Stack>;
};
