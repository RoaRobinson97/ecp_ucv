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
import { User } from '@/data/types'

export const LoginForm = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useAuth(); // Esta función ahora espera un objeto User completo
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
            // 1. El servicio valida y crea la cookie 'auth_token'
            const userData: User = await authService.login(formData.email, formData.password) as User;
            
            // 2. Le avisamos a React que el usuario entró (para el Navbar, etc.)
            login(userData); 
            
            // 3. ✨ Redirección inteligente y DURA
            if (userData.rol === 'admin' || userData.rol === 'coordinador') {
                window.location.href = '/admin/solicitudes';
            } else if (userData.rol === 'proveedor') {
                window.location.href = `/profile/${userData.id}`; 
            } else {
                window.location.href = '/'; // Estudiantes o visitantes van al inicio
            }

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // ✨ 2. CREAMOS LA FUNCIÓN QUE RECIBIRÁ LOS DATOS DEL HELPER
    const handleDevUserSelect = (email: string, password: string) => {
        // Esta función actualiza el estado del formulario con los datos seleccionados
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
                    
                    {/* ✨ 3. RENDERIZAMOS EL HELPER SOLO EN MODO DE DESARROLLO */}
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
