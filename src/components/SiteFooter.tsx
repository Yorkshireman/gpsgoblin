import { Container, Flex, Link } from '@chakra-ui/react';
import NextLink from 'next/link';

export const SiteFooter = () => {
  return (
    <Container
      as="footer"
      maxW="1600px"
      px={{ base: 3, md: 6 }}
      py={1}
      borderTopWidth="1px"
    >
      <Flex
        as="nav"
        aria-label="Site links"
        columnGap={2}
        justify={{ base: 'center', md: 'start' }}
        rowGap={0}
        wrap="wrap"
      >
        <Link asChild minH="44px" px={2} alignContent="center">
          <NextLink href="/tools/gpx-file-viewer">GPX File Viewer</NextLink>
        </Link>
        <Link asChild minH="44px" px={2} alignContent="center">
          <NextLink href="/privacy">Privacy</NextLink>
        </Link>
        <Link asChild minH="44px" px={2} alignContent="center">
          <NextLink href="/limitations">Support</NextLink>
        </Link>
      </Flex>
    </Container>
  );
};
