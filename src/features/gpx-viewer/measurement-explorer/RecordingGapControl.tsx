import { Box, NativeSelect } from '@chakra-ui/react';
import type { MeasurementPoint } from '@/analysis/measurements';
import { formatDuration } from '../measurementDisplay';

type RecordingGapControlProps = Readonly<{
  points: readonly MeasurementPoint[];
  selectedId?: string;
  onSelect: (id: string | undefined) => void;
}>;

export const RecordingGapControl = ({ points, selectedId, onSelect }: RecordingGapControlProps) => {
  const gaps = points.filter(point => { return Boolean(point.recordingGap); });
  if (!gaps.length) return null;
  return <Box as='details' fontSize='sm'>
    <Box as='summary' cursor='pointer' color='fg.muted'>{gaps.length} recording {gaps.length === 1 ? 'gap' : 'gaps'}</Box>
    <NativeSelect.Root size='sm' minW={0} mt={2}>
      <NativeSelect.Field aria-label='Inspect recording gap' value={gaps.some(point => { return point.sample.id === selectedId; }) ? selectedId : ''}
        onChange={event => { onSelect(event.target.value || undefined); }}>
        <option value=''>Inspect a gap…</option>
        {gaps.map((point, index) => {
          return <option key={point.sample.id} value={point.sample.id}>Gap {index + 1} · {formatDuration(point.recordingGap?.seconds ?? null)}</option>;
        })}
      </NativeSelect.Field>
      <NativeSelect.Indicator />
    </NativeSelect.Root>
  </Box>;
};
