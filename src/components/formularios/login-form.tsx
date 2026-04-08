// Este es el componente LoginForm que va dentro de tu archivo de formularios
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
    Flex,
    Alert,
    AlertIcon,
    InputGroup,
    InputRightElement,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { useAuth } from "@/app/context/auth-context"; 
import { useRouter } from "next/navigation";
import { FormControl, FormLabel, Input } from "@/components/ui/form-controls";
import { authService } from '@/servicios/auth-service';
import { DevLoginHelper } from '@/components/dev/DevLoginHelper';

export const LoginForm = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useAuth(); 
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prevData => ({ ...prevData, [name]: value }));
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await authService.login(formData.email, formData.password);
            
            // Extraemos el usuario del formato de Go
            const realUser = response.usuario || response.user || response.User; 

            if (!realUser) {
                throw new Error("El servidor no devolvió los datos del usuario. Revisa la consola.");
            }
            
            // Pasamos los datos extraídos al Contexto
            login(realUser); 
            
            // ✨ Redirección directa al home (/) para todos los usuarios
            window.location.href = '/'; 

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDevUserSelect = (email: string, password: string) => {
        setFormData({ email, password });
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
                    
                    {process.env.NODE_ENV === 'development' && (
                        <DevLoginHelper onUserSelect={handleDevUserSelect} />
                    )}

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
                        isLoading={isLoading}
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