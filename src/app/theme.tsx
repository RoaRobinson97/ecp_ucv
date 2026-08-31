// app/theme.ts o src/theme.ts
import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  // ✨ Tipografía interceptada de Next.js
  fonts: {
    heading: 'var(--font-montserrat), sans-serif',
    body: 'var(--font-montserrat), sans-serif',
  },
  semanticTokens: {
    colors: {
      // 1. Fondos Estructurales
      background: { default: "#f7fafc", _dark: "gray.800" }, 
      surface:    { default: "white", _dark: "gray.700" }, 
      border:     { default: "gray.200", _dark: "gray.600" }, 
      navbar:     { default: "#0c5d56", _dark: "#021716" },
      rowhover:   { default: "blackAlpha.200", _dark: "whiteAlpha.200" },
      
      // 2. Tipografía
      "text.primary": { default: "gray.800", _dark: "whiteAlpha.900" },
      "text.muted":   { default: "gray.600", _dark: "gray.400" },

      // 3. Marca UCV e Interfaz
      primary:    { default: "#0d9488", _dark: "#319795" }, 
      secondary:  { default: "#2563eb", _dark: "#173da6" }, 
      
      // 4. Estados (Usando paleta de Chakra para consistencia)
      success:    { default: "green.600", _dark: "green.300" },
      warning:    { default: "orange.500", _dark: "orange.300" },
      danger:     { default: "red.600", _dark: "red.300" },
      info:       { default: "blue.500", _dark: "blue.300" },
      neutral:    { default: "gray.100", _dark: "gray.700" },
    },
  },
  styles: {
    global: {
      "html, body": {
        // Asignación directa. Cero lógica condicional.
        bg: "background", 
        color: "text.primary",
        minHeight: "100vh",
      },
    },
  },
});

export default theme;