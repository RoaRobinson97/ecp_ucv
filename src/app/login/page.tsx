// app/login/page.tsx
import React from 'react';
import { Flex, Box } from "@chakra-ui/react";
import { LoginForm } from "../../components/formularios/login-form";

export default function LoginPage() {
  return (
    <Flex
      justifyContent="center"
      alignItems="center"
      minH="100vh"
      bg="gray.100"
    >
      <LoginForm />
    </Flex>
  );
}