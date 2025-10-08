// components/ui/user-profile.tsx (ACTUALIZADO)
"use client";
import { 
    Box, Heading, Text, Avatar, VStack, useColorModeValue, Divider, 
    Table, Thead, Tbody, Tr, Th, Td, TableContainer, Badge 
} from '@chakra-ui/react';
import React from 'react';

// --- DEFINICIÓN DE INTERFACES (Copiadas de profile-coordinator-review.tsx) ---
export interface Course { 
    id: string;
    nombre: string;
    // En la vista estándar/pública, solo nos interesa si está 'Aprobado' o no para mostrar al cliente. 
    // Usamos el tipo completo por consistencia de datos, pero podemos simplificar la visualización.
    estado_gestion: 'Pendiente' | 'En Revisión' | 'Aprobado' | 'N/A';
}

const mockCourses: Course[] = [
    { id: 'C001', nombre: 'Introducción a React Hooks', estado_gestion: 'Aprobado' },
    { id: 'C002', nombre: 'Arquitectura de Microservicios', estado_gestion: 'Aprobado' },
    { id: 'C003', nombre: 'Diseño UX Avanzado', estado_gestion: 'En Revisión' },
];
// ----------------------------------------------------------------------------


// Vista estándar/pública del perfil para roles que no requieren gestión documental
export function UserProfileClient({ 
    name, 
    bio, 
    avatarUrl, 
    courses // 🚨 NUEVA PROP: Lista de cursos
}: { 
    name: string, 
    bio: string, 
    avatarUrl: string,
    courses: Course[] | undefined // Definido como opcional o puede ser undefined
}) {
    const cardBg = useColorModeValue("white", "gray.700");
    const textColor = useColorModeValue("gray.600", "gray.400");
    
    // Usa los cursos que llegan por props o el mock si no hay datos
    const userCourses = courses || mockCourses; 
    
    return (
        <Box p={8} bg={cardBg} shadow="xl" rounded="lg" maxW="2xl" mx="auto">
            
            {/* SECCIÓN 1: PERFIL VISUAL */}
            <VStack spacing={4} align="center" mb={6}>
                <Avatar size="2xl" name={name} src={avatarUrl} />
                <Heading size="xl" mt={2}>{name}</Heading>
                <Box textAlign="center" maxW="md">
                    <Text color={textColor} fontSize="md" fontStyle="italic">
                        Biografía:
                    </Text>
                    <Text fontSize="lg">
                        {bio}
                    </Text>
                </Box>
            </VStack>

            <Divider my={6} />
            
            {/* SECCIÓN 2: TABLA DE CURSOS (Añadida) */}
            <Heading size="lg" mb={4} textAlign="center" color="teal.500">Cursos Dictados</Heading>
            
            {userCourses.length > 0 ? (
                <TableContainer>
                    <Table variant="simple" size="md">
                        <Thead>
                            <Tr>
                                {/* Ocultamos el ID para una vista más limpia si no es relevante */}
                                <Th>Nombre del Curso</Th>
                                <Th textAlign="center">Estado</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {userCourses.map(course => (
                                <Tr key={course.id}>
                                    <Td fontWeight="medium">{course.nombre}</Td>
                                    <Td textAlign="center">
                                        <Badge 
                                            // Coloreamos el estado de forma simplificada para la vista de cliente
                                            colorScheme={course.estado_gestion === 'Aprobado' ? 'green' : 'orange'}
                                            variant="subtle"
                                        >
                                            {/* Solo mostramos Aprobado o En Revisión para la vista pública */}
                                            {course.estado_gestion === 'Aprobado' ? 'Activo' : 'En Preparación'}
                                        </Badge>
                                    </Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                </TableContainer>
            ) : (
                <Text textAlign="center" color={textColor} fontStyle="italic" mt={4}>
                    Este perfil aún no tiene cursos activos asociados.
                </Text>
            )}

            <Divider my={6} />
            
            <Text fontSize="sm" color="gray.500" textAlign="center">
                Esta es la vista estándar del perfil del proveedor/cliente.
            </Text>
        </Box>
    );
}