// app/providers.tsx
"use client";

import { ChakraProvider } from '@chakra-ui/react';
import { ContextProvider } from '@/app/context/context-provider';
import theme from "./theme"; 

// ✨ Única línea modificada: agregamos 'default'
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ChakraProvider theme={theme}>
      <ContextProvider>
        {children}
      </ContextProvider>
    </ChakraProvider>
  );
}