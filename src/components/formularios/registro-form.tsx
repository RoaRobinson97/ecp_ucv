"use client";

import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Heading,
  useColorModeValue,
  Text,
} from "@chakra-ui/react";
import { useAuth } from "@/app/context/auth-context"; // <-- Importa el hook de autenticación
import { useRouter } from "next/navigation"; // <-- Importa el hook de navegación

export const RegisterForm = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [cedula, setCedula] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  // Obtenemos la función login del contexto
  const { login } = useAuth(); 
  // Obtenemos el enrutador para redirigir
  const router = useRouter(); 

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setError('');

    // Aquí iría la lógica de registro real (ej. llamada a una API)
    console.log("Nombre:", firstName);
    console.log("Apellido:", lastName);
    console.log("Cédula:", cedula);
    console.log("Email:", email);
    console.log("Contraseña:", password);

    // Simulación de registro exitoso
    login("user-123",'admin'); // <-- Pasa un ID de usuario de ejemplo
    
    // Redirecciona al usuario a la página de inicio o a su perfil
    router.push("/");
  };

  const formBgColor = useColorModeValue("white", "gray.700");
  const inputBorderColor = useColorModeValue("gray.300", "gray.600");

  return (
    <Box
      bg={formBgColor}
      p={8}
      rounded="lg"
      shadow="md"
      w="full"
      maxW="sm"
    >
      <Heading as="h1" size="xl" textAlign="center" mb={6}>
        Crear Cuenta
      </Heading>
      <form onSubmit={handleRegister}>
        <Stack spacing={4}>
          <FormControl id="firstName">
            <FormLabel>Nombre</FormLabel>
            <Input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              borderColor={inputBorderColor}
            />
          </FormControl>
          <FormControl id="lastName">
            <FormLabel>Apellido</FormLabel>
            <Input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              borderColor={inputBorderColor}
            />
          </FormControl>
          <FormControl id="cedula">
            <FormLabel>Cédula</FormLabel>
            <Input
              type="text"
              value={cedula}
              onChange={(e) => setCedula(e.target.value)}
              required
              borderColor={inputBorderColor}
            />
          </FormControl>
          <FormControl id="email">
            <FormLabel>Email</FormLabel>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              borderColor={inputBorderColor}
            />
          </FormControl>
          <FormControl id="password">
            <FormLabel>Contraseña</FormLabel>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              borderColor={inputBorderColor}
            />
          </FormControl>
          <FormControl id="confirmPassword">
            <FormLabel>Confirmar Contraseña</FormLabel>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              borderColor={inputBorderColor}
            />
            {error && <Text color="red.500" fontSize="sm" mt={1}>{error}</Text>}
          </FormControl>
          <Button
            type="submit"
            colorScheme="teal"
            size="lg"
            w="full"
            mt={4}
          >
            Registrarse
          </Button>
        </Stack>
      </form>
    </Box>
  );
};