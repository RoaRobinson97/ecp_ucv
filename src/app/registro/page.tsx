import React from 'react';
import { Flex } from "@chakra-ui/react";
import { RegisterForm } from "@/components/formularios/registro-form";

export default function RegisterPage() {
  return (
    <Flex
      justifyContent="center"
      alignItems="center"
      minH="100vh"
      bg="gray.100"
      padding={8}
    >
      <RegisterForm />
    </Flex>
  );
}