import { Container, Flex, Image, Link, Text } from '@chakra-ui/react';
import NextLink from 'next/link';

export const SiteHeader = () => {
  return (
    <Container
      as="header"
      maxW="1600px"
      borderBottomWidth="1px"
      px={{ base: 2, md: 6 }}
    >
      <Flex align="center" minH="56px">
        <Link
          asChild
          color="fg"
          minH="44px"
          px={2}
          rounded="sm"
          textDecoration="none"
          _hover={{ color: 'action.fg' }}
        >
          <NextLink href="/" aria-label="GPSGoblin home">
            <Flex align="center" gap={2}>
              <Image src="/icon.svg" alt="" aria-hidden="true" boxSize="32px" />
              <Text fontFamily="heading" fontSize="xl" fontWeight="semibold">
                GPSGoblin
              </Text>
            </Flex>
          </NextLink>
        </Link>
      </Flex>
    </Container>
  );
};
