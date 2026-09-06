'use client';

import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type { ReactNode } from 'react';

type ProviderProps = {
  children: ReactNode;
};

export function Provider({ children }: ProviderProps) {
  return (
    <ChakraProvider value={defaultSystem}>
      <NextThemesProvider
        attribute='class'
        defaultTheme='system'
        disableTransitionOnChange
        enableSystem
      >
        {children}
      </NextThemesProvider>
    </ChakraProvider>
  );
}
