import React from 'react';
import { Flex } from "@chakra-ui/react";
import { SolicitudForm } from "../../components/formularios/solicitud-form";

export default function SolicitarOrganizacionPage() {
  return (
    <Flex
      justifyContent="center"
      alignItems="center"
      minH="100vh"
      bg="gray.100"
    >
      <SolicitudForm />
    </Flex>
  );
}