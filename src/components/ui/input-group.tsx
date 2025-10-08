"use client";

import type { BoxProps, InputLeftElementProps, InputRightElementProps } from "@chakra-ui/react";
import { 
  InputGroup as ChakraInputGroup, // Se importa con un alias para evitar conflicto de nombres
  InputLeftElement, 
  InputRightElement 
} from "@chakra-ui/react";
import * as React from "react";

// La interfaz ahora usa los tipos de props correctos de Chakra
export interface CustomInputGroupProps extends BoxProps {
  startElementProps?: InputLeftElementProps;
  endElementProps?: InputRightElementProps;
  startElement?: React.ReactNode;
  endElement?: React.ReactNode;
  // Se espera un solo elemento Input como hijo
  children: React.ReactNode; 
}

/**
 * Componente personalizado de InputGroup que encapsula la lógica para añadir
 * elementos al inicio y al final de un campo de texto.
 */
export const CustomInputGroup = React.forwardRef<HTMLDivElement, CustomInputGroupProps>(
  function CustomInputGroup(props, ref) {
    const {
      startElement,
      startElementProps,
      endElement,
      endElementProps,
      children,
      ...rest
    } = props;

    return (
      // 1. Se usa el `InputGroup` real de Chakra como contenedor.
      //    Se le pasa el `ref` y el resto de las props (como `size`, `variant`, etc.).
      <ChakraInputGroup ref={ref} {...rest}>
        
        {/* 2. Si existe `startElement`, se renderiza dentro de un `InputLeftElement`. */}
        {startElement && (
          <InputLeftElement {...startElementProps}>
            {startElement}
          </InputLeftElement>
        )}

        {/* 3. El `Input` hijo se renderiza directamente.
               Chakra UI ajusta su padding izquierdo y derecho automáticamente
               cuando detecta que hay un `InputLeftElement` o `InputRightElement`.
               No es necesario usar `React.cloneElement` para calcular el padding. */}
        {children}

        {/* 4. Si existe `endElement`, se renderiza dentro de un `InputRightElement`. */}
        {endElement && (
          <InputRightElement {...endElementProps}>
            {endElement}
          </InputRightElement>
        )}
        
      </ChakraInputGroup>
    );
  }
);