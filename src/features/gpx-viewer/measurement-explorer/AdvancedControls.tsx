import { Box, Icon, Text } from '@chakra-ui/react';
import type { ReactNode } from 'react';

export const AdvancedControls = ({
  children
}: Readonly<{ children: ReactNode }>) => {
  return (
    <Box
      as="details"
      width="full"
      fontSize="sm"
      borderWidth="1px"
      borderColor="border"
      rounded="lg"
      css={{
        '&[open] > summary .advanced-chevron': { transform: 'rotate(180deg)' }
      }}
    >
      <Box
        as="summary"
        display="flex"
        alignItems="center"
        gap={2.5}
        minH="44px"
        px={3}
        py={2}
        cursor="pointer"
        listStyleType="none"
        bg="bg.subtle"
        color="fg"
        rounded="lg"
        _hover={{ bg: 'bg.muted' }}
        _focusVisible={{
          outline: '2px solid',
          outlineColor: 'green.focusRing',
          outlineOffset: '2px'
        }}
        css={{ '&::-webkit-details-marker': { display: 'none' } }}
      >
        <Icon boxSize={4} color="fg.muted" flexShrink={0}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M4 7h5m4 0h7M4 17h9m4 0h3" />
            <circle cx="11" cy="7" r="2" />
            <circle cx="15" cy="17" r="2" />
          </svg>
        </Icon>
        <Text as="span" fontWeight="medium" flex={1}>
          Advanced Controls
        </Text>
        <Icon
          className="advanced-chevron"
          boxSize={4}
          color="fg.muted"
          flexShrink={0}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </Icon>
      </Box>
      <Box px={3} pb={3} pt={1}>
        {children}
      </Box>
    </Box>
  );
};
