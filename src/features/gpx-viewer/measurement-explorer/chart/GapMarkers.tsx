import { chartPosition } from './chartPosition';
import { IconButton, Portal, Tooltip } from '@chakra-ui/react';
import { DefaultZIndexes, ZIndexLayer, useXAxisScale, usePlotArea } from 'recharts';
import type { ChartMeasurement } from '../../measurementDisplay';

type GapMarkersProps = Readonly<{
  data: readonly ChartMeasurement[];
  selectedId?: string;
  onSelect: (id: string | undefined, trigger?: HTMLElement) => void;
  onHover: () => void;
}>;

export const GapMarkers = ({ data, selectedId, onSelect, onHover }: GapMarkersProps) => {
  const scale = useXAxisScale();
  const area = usePlotArea();
  if (!scale || !area) return null;
  const groups: { x: number; ids: string[]; hasStops: boolean }[] = [];
  for (const point of data) {
    if ((!point.recordingGap && !point.possibleStop) || !point.sampleId) continue;
    const scaled = scale(chartPosition(point));
    if (scaled === undefined) continue;
    const x = Math.max(area.x + 22, Math.min(area.x + area.width - 22, scaled));
    const previous = groups.at(-1);
    if (previous && x - previous.x < 44) { previous.ids.push(point.sampleId); previous.hasStops ||= Boolean(point.possibleStop); }
    else groups.push({ x, ids: [point.sampleId], hasStops: Boolean(point.possibleStop) });
  }
  return <ZIndexLayer zIndex={DefaultZIndexes.label + 3}>
    {groups.map((group, index) => {
      const selectedIndex = selectedId ? group.ids.indexOf(selectedId) : -1;
      const label = group.ids.length > 1
        ? `${group.ids.length} nearby ${group.hasStops ? "possible stops or recording gaps; select to see the next one" : "recording gaps; select to see the next one"}`
        : `${group.hasStops ? "Possible stop" : "Recording gap"} ${index + 1}`;
      return <foreignObject key={group.ids[0]} x={group.x - 22} y={0} width={44} height={44} overflow='visible'>
        <Tooltip.Root openDelay={250} closeDelay={0}>
          <Tooltip.Trigger asChild>
            <IconButton aria-label={label} aria-pressed={selectedIndex >= 0} width='44px' height='44px' size='sm'
              colorPalette='blue' variant='ghost' color='blue.fg' bg='transparent'
              onPointerEnter={onHover}
              onClick={event => { onSelect(group.ids.length === 1 && selectedIndex === 0 ? undefined : group.ids[(selectedIndex + 1) % group.ids.length], event.currentTarget); }}>
              <svg aria-hidden='true' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth={selectedIndex >= 0 ? 2 : 1.5}>
                {selectedIndex >= 0 ? <circle cx='12' cy='12' r='11' fill='currentColor' fillOpacity='0.12' stroke='none' /> : null}
                {group.hasStops ? <text x='12' y='16' textAnchor='middle' fontSize='10' fill='currentColor' stroke='none'>Stop?</text> : <path d='M4 12h4m8 0h4M10 7l-2 10m8-10-2 10' />}
              </svg>
            </IconButton>
          </Tooltip.Trigger>
          <Portal>
            <Tooltip.Positioner>
              <Tooltip.Content>{label}{group.ids.length === 1 ? selectedIndex >= 0 ? ' · Select again to close details' : ' · Select to inspect' : ''}</Tooltip.Content>
            </Tooltip.Positioner>
          </Portal>
        </Tooltip.Root>
      </foreignObject>;
    })}
  </ZIndexLayer>;
};
