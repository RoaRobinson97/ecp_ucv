// components/ui/profile-owner-view.tsx (FINAL CON CURSOS Y PERFIL VISUAL)
"use client";

import { 
    Box, Heading, Text, Divider, useColorModeValue, VStack, Avatar,
    Table, Thead, Tbody, Tr, Th, Td, TableContainer, Badge 
} from '@chakra-ui/react';
import React from 'react';

// --- DEFINICIÓN DE INTERFACES (Necesarias para la data del servidor) ---
export interface Course { 
    id: string;
    nombre: string;
    estado_gestion: 'Pendiente' | 'En Revisión' | 'Aprobado' | 'N/A';
}

// 🚨 Interfaz UserData COMPLETA para ProfileOwnerView
interface UserData {
    name: string;
    documentStatus: string;
    bio: string;
    avatarUrl: string;
    courses: Course[]; 
}

// --- MOCK DE DATOS DE CURSOS (Solo como fallback/simulación) ---
const mockCourses: Course[] = [
    { id: 'C001', nombre: 'Introducción a React Hooks', estado_gestion: 'Aprobado' },
    { id: 'C002', nombre: 'Arquitectura de Microservicios', estado_gestion: 'Pendiente' },
    { id: 'C003', nombre: 'Diseño UX Avanzado', estado_gestion: 'En Revisión' },
];

// Vista para el Proveedor: Aquí se implementaría la lógica de subir documentos.
export function ProfileOwnerView({ user, mode }: { user: UserData, mode: string }) {
    const cardBg = useColorModeValue("white", "gray.700");
    const textColor = useColorModeValue("gray.600", "gray.400");
    const uploadAreaBg = useColorModeValue("teal.50", "gray.800"); 

    // Usamos los cursos que vienen del servidor (prop `user.courses`)
    const userCourses = user.courses || mockCourses;

    return (
        <Box p={6} bg={cardBg} shadow="xl" rounded="lg" border="3px" borderColor="teal.500" maxW="3xl" mx="auto">
            
            <Heading size="xl" mb={4}>Mi Perfil y Documentación Legal</Heading>
            <Text fontSize="lg" color="teal.500" fontWeight="bold">Modo: {mode}</Text>
            <Divider my={4} />

            {/* SECCIÓN 1: PERFIL VISUAL COMPLETO */}
            <VStack spacing={4} align="center" mb={6}>
                <Avatar size="xl" name={user.name} src={user.avatarUrl} />
                <Heading size="lg">{user.name}</Heading>
                <Box textAlign="center" maxW="md">
                    <Text color={textColor} fontSize="md" fontStyle="italic">Biografía:</Text>
                    <Text fontSize="md">{user.bio}</Text>
                </Box>
            </VStack>

            <Divider my={6} />

            {/* SECCIÓN 2: TABLA DE CURSOS ASIGNADOS */}
            <Heading size="md" mb={3}>Cursos a mi cargo</Heading>
            <Text mb={3} color={textColor} fontSize="sm">
                Estos son los cursos que tienes asignados. El estado de gestión indica el progreso de la documentación requerida para cada uno.
            </Text>
            
            {userCourses.length > 0 ? (
                <TableContainer mb={6}>
                    <Table variant="simple" size="sm">
                        <Thead>
                            <Tr>
                                <Th>ID</Th>
                                <Th>Nombre del Curso</Th>
                                <Th>Estado de Gestión</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {userCourses.map(course => (
                                <Tr key={course.id}>
                                    <Td>{course.id}</Td>
                                    <Td fontWeight="medium">{course.nombre}</Td>
                                    <Td>
                                        {/* Lógica de colores para los Badges */}
                                        <Badge 
                                            colorScheme={
                                                course.estado_gestion === 'Aprobado' ? 'green' : 
                                                course.estado_gestion === 'En Revisión' ? 'orange' : 
                                                'red'
                                            }
                                        >
                                            {course.estado_gestion}
                                        </Badge>
                                    </Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                </TableContainer>
            ) : (
                <Text textAlign="center" color={textColor} fontStyle="italic" mt={4}>
                    Aún no tienes cursos asignados.
                </Text>
            )}
            
            <Divider my={6} />
            
            <Text mb={6} fontWeight="semibold" textAlign="center" fontSize="lg">
                Documentos Legales: 
                <Text as="span" color="orange.500" ml={2} fontWeight="bold">{user.documentStatus}</Text>
            </Text>

        </Box>
    );
}