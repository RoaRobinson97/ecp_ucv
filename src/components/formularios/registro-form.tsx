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
  Select, 
  FormControl, FormLabel, Input, FormErrorMessage 
} from "@chakra-ui/react";
import { useAuth } from "@/app/context/auth-context";
import { useRouter } from "next/navigation";
import { authService } from '@/servicios/auth-service';
import { User } from '@/data/types';

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

const formFields = [
  { id: "firstName", label: "Nombres", type: "text", isRequired: true },
  { id: "lastName", label: "Apellidos", type: "text", isRequired: true },
  { id: "cedula", label: "Cédula / CI", type: "text", isRequired: true },
  { id: "date_of_birth", label: "Fecha de Nacimiento", type: "date", isRequired: true }, 
  { 
    id: "gender", 
    label: "Género", 
    type: "select", 
    options: genderOptions, 
    isRequired: true,
    placeholder: "Selecciona tu género"
  }, 
  { 
    id: "education_level", 
    label: "Nivel Educativo", 
    type: "select", 
    options: educationOptions, 
    isRequired: true,
    placeholder: "Selecciona nivel educativo"
  }, 
  { id: "address", label: "Dirección", type: "text", isRequired: true }, 
  { id: "email", label: "Email", type: "email", isRequired: true },
  { id: "password", label: "Contraseña", type: "password", isRequired: true },
];

export const RegisterForm = () => {
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
      const payload = {
        cedula: formData.cedula,
        nombres: formData.firstName,
        apellidos: formData.lastName,
        fecha_de_nacimiento: formData.date_of_birth,
        genero: formData.gender, 
        nivel_educativo: formData.education_level,
        direccion: formData.address,
        email: formData.email,
        password: formData.password,
        rol: 'visitante' 
      };

      // 1. Registramos al usuario (Lo guarda en la BD)
      await authService.register(payload);
      
      // 2. ✨ AUTO-LOGIN SILENCIOSO: Obligamos al sistema a generar la cookie 'auth_token'
      const loggedUser = await authService.login(formData.email, formData.password) as User;

      toast({
        title: "Cuenta Creada con Éxito.",
        description: "Iniciando sesión automáticamente...",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // 3. Le avisamos a React
      login(loggedUser);
      
      // 4. ✨ Redirección dura para forzar a Next.js a leer la cookie fresca en el servidor
      window.location.href = "/";

    } catch (err: any) {
      setServerError(err.message || "Ocurrió un error al registrar el usuario.");
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

          {formFields.map((field) => (
            <FormControl key={field.id} id={field.id} isRequired={field.isRequired}>
              <FormLabel>{field.label}</FormLabel>
              
              {field.type === 'select' ? (
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
                <Input
                  type={field.type}
                  name={field.id}
                  value={formData[field.id as keyof typeof formData]}
                  onChange={handleChange}
                />
              )}
            </FormControl>
          ))}

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