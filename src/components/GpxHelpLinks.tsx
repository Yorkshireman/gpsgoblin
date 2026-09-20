import NextLink from 'next/link';
import { Link, Stack } from '@chakra-ui/react';

export const GpxHelpLinks = () => {
  return (
    <Stack
      as="nav"
      aria-label="GPX help"
      align={{ base: 'stretch', sm: 'center' }}
      direction={{ base: 'column', sm: 'row' }}
      gap={{ base: 0, sm: 4 }}
    >
      <Link asChild minH="44px" alignContent="center">
        <NextLink href="/help/how-to-get-a-gpx-file">
          How to get a GPX file
        </NextLink>
      </Link>
      <Link asChild minH="44px" alignContent="center">
        <NextLink href="/help/gpx-file-empty-or-missing-data">
          Troubleshoot a GPX file
        </NextLink>
      </Link>
    </Stack>
  );
};
