"use client";
import { 
    Box, Heading, Text, Avatar, VStack, useColorModeValue, Divider, 
    Table, Thead, Tbody, Tr, Th, Td, TableContainer, Badge,
    HStack, // ✨ Añadido
    Icon    // ✨ Añadido
} from '@chakra-ui/react';
import React from 'react';
// ✨ ADICIÓN: Importamos Course desde tipos globales
import { Course } from "@/data/types"; 
import { MdEmail, MdPhone } from 'react-icons/md'; // ✨ Añadido para iconos

// Vista estándar/pública del perfil
export function UserProfileClient({ 
    name, 
    bio, 
    avatarUrl, 
    courses,
    providerType,
    contactEmails,  // ✨ ADICIÓN: Nueva prop
    contactPhones   // ✨ ADICIÓN: Nueva prop
}: { 
    name: string, 
    bio: string, 
    avatarUrl: string,
    courses: Course[] | undefined,
    providerType: 'con-fines-de-lucro' | 'sin-fines-de-lucro' | undefined,
    contactEmails?: string[], // ✨ ADICIÓN: Tipo de la prop
    contactPhones?: string[]  // ✨ ADICIÓN: Tipo de la prop
}) {
    const cardBg = useColorModeValue("white", "gray.700");
    const textColor = useColorModeValue("gray.600", "gray.400");
    const mutedTextColor = useColorModeValue("gray.500", "gray.400"); // Color para el contacto
    
    const userCourses = courses || []; 
    
    const formatProviderType = (type: string) => {
        return type === 'con-fines-de-lucro' 
            ? 'Organización con Fines de Lucro' 
            : 'Organización Sin Fines de Lucro';
    };

    // Lógica de color actualizada para estados en minúscula
    const getStatusColor = (status: string | undefined) => {
        switch (status) {
            case 'aprobado': return 'green';
            case 'pendiente': return 'orange';
            case 'rechazado': return 'red';
            default: return 'gray';
        }
    };

    // Lógica de texto actualizada para estados en minúscula
    const getStatusText = (status: string | undefined) => {
        switch (status) {
            case 'aprobado': return 'Activo';
            case 'pendiente': return 'En Preparación';
            case 'rechazado': return 'No disponible';
            default: return 'N/A';
        }
    };

    return (
        <Box p={8} bg={cardBg} shadow="xl" rounded="lg" maxW="2xl" mx="auto">
            
            {/* SECCIÓN 1: PERFIL VISUAL */}
            <VStack spacing={4} align="center" mb={6}>
                <Avatar size="2xl" name={name} src={avatarUrl} />
                <Heading size="xl" mt={2}>{name}</Heading>
                
                {/* Badge de Tipo de Proveedor */}
                {providerType && (
                    <Badge 
                        colorScheme={providerType === 'con-fines-de-lucro' ? 'blue' : 'green'}
                        variant="solid"
                        fontSize="sm"
                        px={3}
                        py={1}
                        rounded="md"
                    >
                        {formatProviderType(providerType)}
                    </Badge>
                )}

                {/* Biografía */}
                <Box textAlign="center" maxW="md" pt={2}>
                    <Text color={textColor} fontSize="md" fontStyle="italic">
                        Biografía:
                    </Text>
                    <Text fontSize="lg">
                        {bio}
                    </Text>
                </Box>

                {/* ✨ ADICIÓN: Información de Contacto Pública */}
                <VStack align="stretch" spacing={1} pt={4}>
                    {(contactEmails && contactEmails.length > 0) && (
                        <HStack spacing={2} fontSize="sm" color={mutedTextColor} justify="center">
                            <Icon as={MdEmail} color="teal.500" boxSize={5} />
                            <Text>{contactEmails.join(', ')}</Text>
                        </HStack>
                    )}
                    {(contactPhones && contactPhones.length > 0) && (
                        <HStack spacing={2} fontSize="sm" color={mutedTextColor} justify="center">
                            <Icon as={MdPhone} color="teal.500" boxSize={5} />
                            <Text>{contactPhones.join(', ')}</Text>
                        </HStack>
                    )}
                </VStack>
                {/* --- FIN DE LA ADICIÓN --- */}

            </VStack>

            <Divider my={6} />
            
            {/* SECCIÓN 2: TABLA DE CURSOS */}
            <Heading size="lg" mb={4} textAlign="center" color="teal.500">Cursos Dictados</Heading>
            
            {userCourses.length > 0 ? (
                <TableContainer>
                    <Table variant="simple" size="md">
                        <Thead>
                            <Tr>
                                <Th>Nombre del Curso</Th>
                                <Th textAlign="center">Estado</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {userCourses.map(course => (
                                <Tr key={course.id}>
                                    <Td fontWeight="medium">{course.titulo}</Td>
                                    <Td textAlign="center">
                                        <Badge 
                                            colorScheme={getStatusColor(course.estado_gestion)}
                                            variant="subtle"
                                        >
                                            {getStatusText(course.estado_gestion)}
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
                Esta es la vista estándar del perfil.
            </Text>
        </Box>
    );
}