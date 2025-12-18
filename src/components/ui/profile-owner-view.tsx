"use client";

import { 
    Box, Heading, Text, Divider, useColorModeValue, VStack, Avatar,
    Table, Thead, Tbody, Tr, Th, Td, TableContainer, Badge,
    HStack, // ✨ Añadido para alinear iconos y texto
    Icon    // ✨ Añadido para mostrar iconos
} from '@chakra-ui/react';
import React from 'react';

// ✨ ADICIÓN: Importamos los tipos globales
import { User, Course } from "@/data/types"; 
import { MdEmail, MdPhone } from 'react-icons/md'; // ✨ Añadido para iconos

// --------------------------------------------------------
// Componente ProfileOwnerView
// --------------------------------------------------------

export function ProfileOwnerView({ user, mode }: { user: User, mode: string }) {
    const cardBg = useColorModeValue("white", "gray.700");
    const textColor = useColorModeValue("gray.600", "gray.400");
    const mutedTextColor = useColorModeValue("gray.500", "gray.400"); // Color para el contacto

    const avatarUrl = user.avatarUrl ?? `https://i.pravatar.cc/150?u=${user.name}`;
    const bio = user.bio ?? "Este usuario aún no ha definido su biografía.";
    const courses = user.courses ?? [];
    const documentStatus = user.documentStatus ?? "N/A";

    return (
        <Box p={6} bg={cardBg} shadow="xl" rounded="lg" border="3px" borderColor="teal.500" maxW="3xl" mx="auto">
            
            <Heading size="xl" mb={4}>Mi Perfil y Documentación Legal</Heading>
            <Text fontSize="lg" color="teal.500" fontWeight="bold">Modo: {mode}</Text>
            <Divider my={4} />

            {/* SECCIÓN 1: PERFIL VISUAL (Actualizado con Contacto) */}
            <VStack spacing={4} align="center" mb={6}>
                <Avatar size="xl" name={user.name} src={avatarUrl} />
                <Heading size="lg">{user.name}</Heading>
                
                {/* Biografía */}
                <Box textAlign="center" maxW="md">
                    <Text color={textColor} fontSize="md" fontStyle="italic">Biografía:</Text>
                    <Text fontSize="md">{bio}</Text>
                </Box>

                {/* ✨ ADICIÓN: Información de Contacto Pública */}
                <VStack align="stretch" spacing={1} pt={4}>
                    {(user.contactEmails && user.contactEmails.length > 0) && (
                        <HStack spacing={2} fontSize="sm" color={mutedTextColor} justify="center">
                            <Icon as={MdEmail} color="teal.500" boxSize={5} />
                            <Text>{user.contactEmails.join(', ')}</Text>
                        </HStack>
                    )}
                    {(user.contactPhones && user.contactPhones.length > 0) && (
                        <HStack spacing={2} fontSize="sm" color={mutedTextColor} justify="center">
                            <Icon as={MdPhone} color="teal.500" boxSize={5} />
                            <Text>{user.contactPhones.join(', ')}</Text>
                        </HStack>
                    )}
                </VStack>
                {/* --- FIN DE LA ADICIÓN --- */}

            </VStack>

            <Divider my={6} />

            {/* SECCIÓN 2: TABLA DE CURSOS (Sin cambios) */}
            <Heading size="md" mb={3}>Cursos a mi cargo</Heading>
            <Text mb={3} color={textColor} fontSize="sm">
                Estos son los cursos asignados. La columna Estado indica si el curso está activo para el usuario.
            </Text>
            
            {courses.length > 0 ? (
                <TableContainer mb={6}>
                    <Table variant="simple" size="sm">
                        <Thead>
                            <Tr>
                                <Th>ID</Th>
                                <Th>Título del Curso</Th>
                                <Th>Duración</Th>
                                <Th>Estado</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {courses.map(course => (
                                <Tr key={course.id}>
                                    <Td>{course.id}</Td>
                                    <Td fontWeight="medium">{course.titulo}</Td>
                                    <Td>{course.duracion}</Td>
                                    <Td>
                                        <Badge colorScheme="green">Asignado</Badge>
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
                <Text as="span" color="orange.500" ml={2} fontWeight="bold">{documentStatus}</Text>
            </Text>

        </Box>
    );
}