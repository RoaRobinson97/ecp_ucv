"use client";

import React, { useState } from 'react';
import {
  Alert,
  AlertIcon,
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Link,
  Text,
  VStack,
} from "@chakra-ui/react";
import NextLink from 'next/link';
import { authService } from '@/servicios/auth-service';

export const RecuperarContrasenaForm = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      // El backend responde lo mismo exista o no la cuenta.
      setMessage(await authService.forgotPassword(email.trim()));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      bg="surface"
      p={{ base: 6, md: 8 }}
      rounded="xl"
      shadow="xl"
      borderWidth="1px"
      borderColor="border"
      w="full"
      maxW="md"
      mx="auto"
      my={{ base: 8, md: 12 }}
    >
      <Heading as="h1" size="lg" textAlign="center" mb={4} color="text.primary" fontWeight="bold">
        Recuperar contraseña
      </Heading>

      {message ? (
        <Alert status="success" rounded="md">
          <AlertIcon />
          {message}
        </Alert>
      ) : (
        <form onSubmit={handleSubmit}>
          <VStack spacing={5} align="stretch">
            <Text color="text.muted" textAlign="center">
              Escribe el correo con el que inicias sesión y te enviaremos un enlace para crear una nueva contraseña.
            </Text>

            {error && (
              <Alert status="error" rounded="md">
                <AlertIcon />
                {error}
              </Alert>
            )}

            <FormControl id="email" isRequired>
              <FormLabel fontWeight="semibold" color="text.primary">Email</FormLabel>
              <Input
                type="email"
                name="email"
                placeholder="tu.correo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                bg="background"
                borderColor="border"
                focusBorderColor="primary"
                color="text.primary"
              />
            </FormControl>

            <Button
              type="submit"
              bg="primary"
              color="white"
              _hover={{ bg: "teal.600" }}
              size="lg"
              w="full"
              shadow="md"
              isLoading={isLoading}
              loadingText="Enviando..."
            >
              Enviar enlace
            </Button>
          </VStack>
        </form>
      )}

      <Text mt={8} textAlign="center" color="text.muted">
        <Link as={NextLink} href="/login" color="primary" fontWeight="bold" _hover={{ textDecoration: 'underline' }}>
          Volver a iniciar sesión
        </Link>
      </Text>
    </Box>
  );
};
