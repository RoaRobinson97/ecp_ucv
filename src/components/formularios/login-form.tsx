// Este es el componente LoginForm que va dentro de tu archivo de formularios
"use client";

import React, { useState } from 'react';
import {
    Box,
    Button,
    VStack,
    Heading,
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
            my={{ base: 8, md: 12 }} // Consistencia de márgenes con el RegisterForm
        >
            <Heading 
                as="h1" 
                size="lg" 
                textAlign="center" 
                mb={8} 
                color="text.primary"
                fontWeight="bold"
            >
                Iniciar Sesión
            </Heading>
            
            <form onSubmit={handleLogin}>
                <VStack spacing={5} align="stretch">
                    
                    {/* {process.env.NODE_ENV === 'development' && (
                        <DevLoginHelper onUserSelect={handleDevUserSelect} />
                    )} */}

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
                            value={formData.email}
                            onChange={handleChange}
                            bg="background"
                            borderColor="border"
                            focusBorderColor="primary"
                            color="text.primary"
                        />
                    </FormControl>

                    <FormControl id="password" isRequired>
                        <FormLabel fontWeight="semibold" color="text.primary">Contraseña</FormLabel>
                        <InputGroup>
                            <Input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                placeholder="********"
                                value={formData.password}
                                onChange={handleChange}
                                bg="background"
                                borderColor="border"
                                focusBorderColor="primary"
                                color="text.primary"
                            />
                            <InputRightElement>
                                <Button 
                                    variant="ghost" 
                                    onClick={() => setShowPassword(!showPassword)}
                                    color="text.muted"
                                    _hover={{ bg: "transparent", color: "text.primary" }}
                                >
                                    {showPassword ? <ViewOffIcon /> : <ViewIcon />}
                                </Button>
                            </InputRightElement>
                        </InputGroup>
                    </FormControl>

                    <Flex justify="flex-end">
                        <Link color="primary" fontSize="sm" fontWeight="medium" _hover={{ textDecoration: 'underline' }}>
                            ¿Olvidaste tu contraseña?
                        </Link>
                    </Flex>

                    <Button
                        type="submit"
                        bg="primary"
                        color="white"
                        _hover={{ bg: "teal.600" }} // Asumiendo que el primary base es teal
                        size="lg"
                        w="full"
                        mt={6}
                        shadow="md"
                        isLoading={isLoading}
                        loadingText="Accediendo..."
                    >
                        Acceder
                    </Button>

                </VStack>
            </form>

            <Text mt={8} textAlign="center" color="text.muted">
                ¿Aún no tienes una cuenta?{' '}
                <Link color="primary" href="/registro" fontWeight="bold" _hover={{ textDecoration: 'underline' }}>
                    Regístrate
                </Link>
            </Text>
        </Box>
    );
};