"use client";

import React from "react";
import {
  Avatar as ChakraAvatar,
  AvatarProps as ChakraAvatarProps,
  AvatarGroup as ChakraAvatarGroup,
  AvatarGroupProps as ChakraAvatarGroupProps,
} from "@chakra-ui/react";

// Heredamos todas las propiedades nativas de Avatar de Chakra v2
export interface AvatarProps extends ChakraAvatarProps {}

// Exportamos nuestro Avatar personalizado (que en v2 ya maneja iniciales e imágenes solo)
export const Avatar = React.forwardRef<HTMLSpanElement, AvatarProps>(
  function Avatar(props, ref) {
    return <ChakraAvatar ref={ref} {...props} />;
  }
);

// Exportamos el AvatarGroup compatible con v2
export const AvatarGroup = React.forwardRef<HTMLDivElement, ChakraAvatarGroupProps>(
  function AvatarGroup(props, ref) {
    return <ChakraAvatarGroup ref={ref} {...props} />;
  }
);