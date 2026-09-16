import { Container, Heading, Stack } from '@chakra-ui/react';
import type { ReactNode } from 'react';

export const InformationPage = ({
  title,
  children
}: {
  title: string;
  children: ReactNode;
}) => {
  return (
    <Container
      as="main"
      maxW="3xl"
      px={{ base: 4, md: 6 }}
      py={{ base: 6, md: 10 }}
    >
      <Stack gap={5} lineHeight="tall">
        <Heading as="h1" size={{ base: '2xl', md: '3xl' }}>
          {title}
        </Heading>
        {children}
      </Stack>
    </Container>
  );
};
