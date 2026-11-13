// app/recuperar-contrasena/page.tsx
import React from 'react';
import { Flex } from "@chakra-ui/react";
import { RecuperarContrasenaForm } from "../../components/formularios/recuperar-contrasena-form";

export default function RecuperarContrasenaPage() {
  return (
    <Flex
      justifyContent="center"
      alignItems="center"
      minH="100vh"
      bg="gray.100"
      p={8}
    >
      <RecuperarContrasenaForm />
    </Flex>
  );
}
