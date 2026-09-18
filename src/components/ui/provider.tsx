'use client';

import { ChakraProvider } from '@chakra-ui/react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { createThemeSystem } from '@/theme';

type ProviderProps = {
  children: ReactNode;
};

export const Provider = ({ children }: ProviderProps) => {
  // Chakra caches CSS property order. A shared server system can inherit the
  // order from another request and generate a different hash during hydration.
  const [system] = useState(() => {
    return createThemeSystem();
  });
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      disableTransitionOnChange
      enableSystem
    >
      <ChakraProvider value={system}>{children}</ChakraProvider>
    </NextThemesProvider>
  );
};
