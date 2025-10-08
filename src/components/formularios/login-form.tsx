"use client";

import React, { useState } from 'react';
import {
  Box,
  Button,
  VStack,
  Heading,
  useColorModeValue,
  Text,
  Link,
  Flex, // Para alinear el enlace de "Olvidé mi contraseña"
  Alert, // Para mostrar errores de login
  AlertIcon,
  InputGroup, // Necesario para el botón de mostrar/ocultar contraseña
  InputRightElement,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons'; // Iconos para el botón
import { useAuth } from "@/app/context/auth-context";
import { useRouter } from "next/navigation";
import { FormControl, FormLabel, Input } from "@/components/ui/form-controls";

export const LoginForm = () => {
  // 1. Estado Unificado y Estados Adicionales para UX
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  // 2. Manejador de Cambios Genérico (reutilizado)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };

  // 3. Simulación de Login Asíncrono con Manejo de Errores
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true); // Activa el estado de carga en el botón
    setError('');

    // Simula una llamada a una API (que podría tardar un poco)
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Lógica de autenticación (ejemplo)
    // if (formData.email === "admin@test.com" && formData.password === "password") {
    //   login("ec-user-002", "admin");
    //   router.push('/');
    // } else {
    //   setError("El correo electrónico o la contraseña son incorrectos.");
    // }
    login("ec-user-002", "admin");
    router.push('/');

    setIsLoading(false); // Desactiva el estado de carga
  };

  const formBgColor = useColorModeValue("white", "gray.700");

  return (
    <Box
      bg={formBgColor}
      p={8}
      rounded="lg"
      shadow="lg"
      w="full"
      maxW="md"
    >
      <Heading as="h1" size="xl" textAlign="center" mb={6}>
        Iniciar Sesión
      </Heading>
      
      <form onSubmit={handleLogin}>
        <VStack spacing={4} align="stretch">
          
          {/* Muestra un mensaje de error si existe */}
          {error && (
            <Alert status="error" rounded="md">
              <AlertIcon />
              {error}
            </Alert>
          )}

          <FormControl id="email" isRequired>
            <FormLabel>Email</FormLabel>
            <Input
              type="email"
              name="email"
              placeholder="tu.correo@ejemplo.com"
              value={formData.email}
              onChange={handleChange}
            />
          </FormControl>

          {/* 4. Campo de Contraseña con Botón de Visibilidad */}
          <FormControl id="password" isRequired>
            <FormLabel>Contraseña</FormLabel>
            <InputGroup>
              <Input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="********"
                value={formData.password}
                onChange={handleChange}
              />
              <InputRightElement>
                <Button variant="ghost" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <ViewOffIcon /> : <ViewIcon />}
                </Button>
              </InputRightElement>
            </InputGroup>
          </FormControl>

          <Flex justify="flex-end">
            <Link color="teal.500" fontSize="sm">
              ¿Olvidaste tu contraseña?
            </Link>
          </Flex>

          <Button
            type="submit"
            colorScheme="teal"
            size="lg"
            w="full"
            isLoading={isLoading} // El botón muestra un spinner mientras carga
            mt={4}
          >
            Acceder
          </Button>

        </VStack>
      </form>

      <Text mt={6} textAlign="center">
        ¿Aún no tienes una cuenta?{' '}
        <Link color="teal.500" href="/registro" fontWeight="bold">
          Regístrate
        </Link>
      </Text>
    </Box>
  );
};