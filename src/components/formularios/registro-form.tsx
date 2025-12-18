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
  Alert,
  AlertIcon,
  useToast,
  Select, // ✨ Importamos Select de Chakra UI
} from "@chakra-ui/react";
import { useAuth } from "@/app/context/auth-context";
import { useRouter } from "next/navigation";
import { FormControl, FormLabel, Input, FormErrorMessage } from "@/components/ui/form-controls";
import { authService } from '@/servicios/auth-service';
import { User } from '@/data/types';

// ✨ Definimos las opciones para los dropdowns
const genderOptions = [
  { value: "masculino", label: "Masculino" },
  { value: "femenino", label: "Femenino" },
  { value: "otro", label: "Otro" }
];

const educationOptions = [
  { value: "primaria", label: "Primaria" },
  { value: "bachillerato", label: "Bachillerato" },
  { value: "tecnico_superior", label: "Técnico Superior" },
  { value: "universitaria_incompleta", label: "Universitaria Incompleta" },
  { value: "universitaria_completa", label: "Universitaria Completa" },
  { value: "postgrado", label: "Postgrado" }
];

// ✨ Actualizamos la configuración de campos
const formFields = [
  { id: "firstName", label: "Nombres", type: "text", isRequired: true },
  { id: "lastName", label: "Apellidos", type: "text", isRequired: true },
  { id: "cedula", label: "Cédula / CI", type: "text", isRequired: true },
  { id: "date_of_birth", label: "Fecha de Nacimiento", type: "date", isRequired: true }, // Nuevo
  { 
    id: "gender", 
    label: "Género", 
    type: "select", 
    options: genderOptions, 
    isRequired: true,
    placeholder: "Selecciona tu género"
  }, // Nuevo Dropdown
  { 
    id: "education_level", 
    label: "Nivel Educativo", 
    type: "select", 
    options: educationOptions, 
    isRequired: true,
    placeholder: "Selecciona nivel educativo"
  }, // Nuevo Dropdown
  { id: "address", label: "Dirección", type: "text", isRequired: true }, // Nuevo
  { id: "email", label: "Email", type: "email", isRequired: true },
  { id: "password", label: "Contraseña", type: "password", isRequired: true },
];

export const RegisterForm = () => {
  // ✨ Estado inicial actualizado con todos los campos
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    cedula: '',
    date_of_birth: '',
    gender: '',
    education_level: '',
    address: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  
  const [serverError, setServerError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const router = useRouter();
  const toast = useToast();

  // Maneja cambios en Inputs y Selects
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setPasswordError('');
    setServerError('');
    
    if (formData.password !== formData.confirmPassword) {
      setPasswordError("Las contraseñas no coinciden.");
      return;
    }

    setIsLoading(true);

    try {
      // ✨ Mapeamos los datos del formulario al JSON exacto que pide tu backend
      const payload = {
        ci: formData.cedula,
        first_name: formData.firstName,
        last_name: formData.lastName,
        date_of_birth: formData.date_of_birth,
        gender: formData.gender,
        education_level: formData.education_level,
        address: formData.address,
        username: formData.email, // Mapeamos email a username
        password: formData.password
      };

      const newUser = await authService.register(payload) as User;
      
      toast({
        title: "Cuenta Creada con Éxito.",
        description: "Hemos creado tu cuenta. Serás redirigido automáticamente.",
        status: "success",
        duration: 4000,
        isClosable: true,
      });

      login(newUser);
      router.push("/");

    } catch (err: any) {
      setServerError(err.message);
    } finally {
      setIsLoading(false);
    }
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

          {serverError && (
            <Alert status="error" rounded="md">
              <AlertIcon />
              {serverError}
            </Alert>
          )}

          {/* ✨ Renderizado dinámico de campos (Input o Select) */}
          {formFields.map((field) => (
            <FormControl key={field.id} id={field.id} isRequired={field.isRequired}>
              <FormLabel>{field.label}</FormLabel>
              
              {field.type === 'select' ? (
                // Renderizar Dropdown (Select)
                <Select
                  name={field.id}
                  value={formData[field.id as keyof typeof formData]}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                >
                  {field.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              ) : (
                // Renderizar Input normal (text, email, password, date)
                <Input
                  type={field.type}
                  name={field.id}
                  value={formData[field.id as keyof typeof formData]}
                  onChange={handleChange}
                />
              )}
            </FormControl>
          ))}

          {/* Confirmar Contraseña (se mantiene igual, fuera del loop) */}
          <FormControl id="confirmPassword" isRequired isInvalid={!!passwordError}>
            <FormLabel>Confirmar Contraseña</FormLabel>
            <Input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
            {passwordError && <FormErrorMessage>{passwordError}</FormErrorMessage>}
          </FormControl>

          <Button
            type="submit"
            colorScheme="teal"
            size="lg"
            w="full"
            mt={4}
            isLoading={isLoading}
            loadingText="Registrando..."
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