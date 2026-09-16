import { Button, Flex, Text } from '@chakra-ui/react';
import { formatDuration } from '../measurementDisplay';

export const CalculationBasis = ({
  mode,
  excludedSeconds,
  onInclude
}: Readonly<{
  mode: 'speed' | 'pace';
  excludedSeconds: number;
  onInclude: () => void;
}>) => {
  return (
    <Flex align="center" justify="space-between" gap={2}>
      <Text fontWeight="semibold">
        Moving {mode} · stops left out: {formatDuration(excludedSeconds)}
      </Text>
      <Button
        size="xs"
        minH="44px"
        flexShrink={0}
        variant="outline"
        onClick={onInclude}
      >
        Include stops
      </Button>
    </Flex>
  );
};
