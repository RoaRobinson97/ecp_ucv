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
} from "@chakra-ui/react";
import { useAuth } from "@/app/context/auth-context";
import { useRouter } from "next/navigation";
import { FormControl, FormLabel, Input, FormErrorMessage } from "@/components/ui/form-controls";

// --- CAMBIO PRINCIPAL AQUÍ ---
// 1. Agregamos la propiedad 'isRequired' a cada campo.
// Para desarrollo/simulación, puedes ponerlos en 'false'.
// Para producción, simplemente cámbialos a 'true'.
const formFields = [
  { id: "firstName", label: "Nombre", type: "text", isRequired: false },
  { id: "lastName", label: "Apellido", type: "text", isRequired: false },
  { id: "cedula", label: "Cédula", type: "text", isRequired: false },
  { id: "email", label: "Email", type: "email", isRequired: false },
  { id: "password", label: "Contraseña", type: "password", isRequired: false },
];

// Control para el campo de confirmación de contraseña
const isConfirmPasswordRequired = false;

export const RegisterForm = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    cedula: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');

  const { login } = useAuth();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setError('');

    console.log("Datos del formulario:", formData);

    login("ec-user-002", 'admin');
    router.push("/");
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
        Crear Cuenta
      </Heading>
      <form onSubmit={handleRegister}>
        <VStack spacing={4}>
          {formFields.map((field) => (
            // 2. Leemos la propiedad 'isRequired' del objeto del campo.
            <FormControl key={field.id} id={field.id} isRequired={field.isRequired}>
              <FormLabel>{field.label}</FormLabel>
              <Input
                type={field.type}
                name={field.id}
                value={formData[field.id as keyof typeof formData]}
                onChange={handleChange}
              />
            </FormControl>
          ))}

          {/* Hacemos lo mismo para el campo de confirmación */}
          <FormControl id="confirmPassword" isRequired={isConfirmPasswordRequired} isInvalid={!!error}>
            <FormLabel>Confirmar Contraseña</FormLabel>
            <Input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
            {error && <FormErrorMessage>{error}</FormErrorMessage>}
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
        </VStack>
      </form>
      
      <Text mt={6} textAlign="center">
        ¿Ya tienes una cuenta?{' '}
        <Link color="teal.500" href="/login" fontWeight="bold">
          Inicia Sesión
        </Link>
      </Text>
    </Box>
  );
};