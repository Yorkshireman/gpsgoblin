import { Container, Flex, Link } from '@chakra-ui/react';
import NextLink from 'next/link';

export const SiteFooter = () => {
  return (
    <Container as='footer' maxW='1600px' px={{ base: 3, md: 6 }} py={6} borderTopWidth='1px'>
      <Flex as='nav' aria-label='Site links' gap={2} wrap='wrap'>
        <Link asChild minH='44px' px={2}><NextLink href='/'>GPSGoblin home</NextLink></Link>
        <Link asChild minH='44px' px={2}><NextLink href='/tools/gpx-file-viewer'>GPX File Viewer</NextLink></Link>
        <Link asChild minH='44px' px={2}><NextLink href='/privacy'>Privacy</NextLink></Link>
        <Link asChild minH='44px' px={2}><NextLink href='/limitations'>Support and limitations</NextLink></Link>
      </Flex>
    </Container>
  );
};
