"use client";

import React, { useState } from 'react';
import {
  Box,
  Button,
  VStack,
  Heading,
  Text,
  Link,
  useToast,
  Select, 
  FormControl, FormLabel, Input, FormErrorMessage 
} from "@chakra-ui/react";
import { useAuth } from "@/app/context/auth-context";
import { useRouter } from "next/navigation";
import { authService } from '@/servicios/auth-service';

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
    
    if (formData.password !== formData.confirmPassword) {
      setPasswordError("Las contraseñas no coinciden.");
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        ci: formData.cedula,             
        first_name: formData.firstName,  
        last_name: formData.lastName,    
        date_of_birth: formData.date_of_birth,
        gender: formData.gender,         
        education_level: formData.education_level,
        address: formData.address,
        email: formData.email,
        password: formData.password,
        rol: 'visitante' 
      };

      // 1. Registro
      await authService.register(payload);
      
      toast({
        title: "Cuenta Creada con Éxito.",
        description: "Tu perfil ha sido registrado en el sistema.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // 2. Auto-login blindado
      try {
        const response = await authService.login(formData.email, formData.password);
        
        const realToken = response.token || response.access_token || response.Token || response.jwt;
        
        let realId = "";
        if (realToken) {
            try {
                const base64Url = realToken.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const decodedToken = JSON.parse(window.atob(base64));
                realId = decodedToken.id || decodedToken.sub || decodedToken.userId || decodedToken.usuario_id || "";
            } catch (e) {
                console.warn("No se pudo decodificar el token JWT en el frontend");
            }
        }
        
        const realUser = response.usuario || response.user || response.User || {
            id: realId, 
            nombres: formData.firstName,
            apellidos: formData.lastName,
            email: formData.email,
            rol: 'visitante'
        };
        
        login(realUser);
        
        window.location.href = '/';

      } catch (loginErr) {
        toast({
            title: "Redirección",
            description: "Registro completado. Por favor, inicia sesión con tus nuevas credenciales.",
            status: "info",
            duration: 5000,
            isClosable: true,
            position: "top"
        });
        
        window.location.href = '/login'; 
      }

    } catch (err: any) {
      toast({
        title: "Error al registrar",
        description: err.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top"
      });
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
      my={{ base: 8, md: 12 }} // ✨ CORRECCIÓN: Margen vertical para despegarlo del Navbar y el footer
    >
      <Heading 
        as="h1" 
        size="lg" 
        textAlign="center" 
        mb={8} 
        color="text.primary"
        fontWeight="bold"
      >
        Crear Cuenta
      </Heading>
      <form onSubmit={handleRegister}>
        <VStack spacing={5}>
          {formFields.map((field) => (
            <FormControl key={field.id} id={field.id} isRequired={field.isRequired}>
              <FormLabel fontWeight="semibold" color="text.primary">{field.label}</FormLabel>
              {field.type === 'select' ? (
                <Select
                  name={field.id}
                  value={formData[field.id as keyof typeof formData]}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  bg="background"
                  borderColor="border"
                  focusBorderColor="primary"
                  color="text.primary"
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
                  bg="background"
                  borderColor="border"
                  focusBorderColor="primary"
                  color="text.primary"
                />
              )}
            </FormControl>
          ))}

          <FormControl id="confirmPassword" isRequired isInvalid={!!passwordError}>
            <FormLabel fontWeight="semibold" color="text.primary">Confirmar Contraseña</FormLabel>
            <Input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              bg="background"
              borderColor="border"
              focusBorderColor="primary"
              color="text.primary"
            />
            {passwordError && <FormErrorMessage fontWeight="bold">{passwordError}</FormErrorMessage>}
          </FormControl>

          <Button
            type="submit"
            bg="primary"
            color="white"
            _hover={{ bg: "teal.600" }} // Asumiendo que primary es un teal
            size="lg"
            w="full"
            mt={6}
            shadow="md"
            isLoading={isLoading}
            loadingText="Registrando..."
          >
            Registrarse
          </Button>
        </VStack>
      </form>
      
      <Text mt={8} textAlign="center" color="text.muted">
        ¿Ya tienes una cuenta?{' '}
        <Link color="primary" href="/login" fontWeight="bold" _hover={{ textDecoration: 'underline' }}>
          Inicia Sesión
        </Link>
      </Text>
    </Box>
  );
};