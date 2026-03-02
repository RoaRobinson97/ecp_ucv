"use client";

import React, { useState, useEffect } from "react";
import { 
    Box, Heading, Text, Avatar, VStack, useColorModeValue, Divider, 
    Table, Thead, Tbody, Tr, Th, Td, TableContainer, Badge,
    HStack, Icon, Spinner, Center
} from '@chakra-ui/react';
import { Course, User, FullProvider } from "@/data/types"; 
import { MdEmail, MdPhone } from 'react-icons/md'; // ✨ Íconos de contacto
import { courseService } from "@/servicios/cursos-service";

export function UserProfileClient({ user }: { user: User | FullProvider }) {
    // 1️⃣ HOOKS DE ESTADO (React)
    const [courses, setCourses] = useState<Course[]>([]);
    const [isLoadingCourses, setIsLoadingCourses] = useState(false);

    // 2️⃣ HOOKS DE ESTILO Y CONTEXTO (Chakra UI)
    // Se declaran todos arriba para evitar errores de orden de Hooks
    const cardBg = useColorModeValue("white", "gray.700");
    const textColor = useColorModeValue("gray.600", "gray.400");
    const headerBg = useColorModeValue("gray.50", "gray.800");
    const tableBorder = useColorModeValue("gray.100", "gray.600");
    const brandColor = "teal.500";

    // 3️⃣ LÓGICA DE DERIVACIÓN (Variables calculadas)
    const isProvider = user.rol === 'proveedor';
    
    const displayName = (isProvider && 'nombre_proveedor' in user) 
        ? (user as FullProvider).nombre_proveedor 
        : `${user.nombres} ${user.apellidos}`;

    const bioText = (isProvider && 'biografia' in user) 
        ? (user as FullProvider).biografia 
        : (user.biografia || "Usuario de la plataforma.");

    const avatarUrl = (user as any).avatarUrl ?? `https://i.pravatar.cc/150?u=${user.id}`;

    // Extraer arreglos de contacto si es proveedor
    const extraEmails = (isProvider && 'emails_contacto' in user) ? (user as FullProvider).emails_contacto : [];
    const extraPhones = (isProvider && 'telefonos_contacto' in user) ? (user as FullProvider).telefonos_contacto : [];

    // 4️⃣ EFECTO PARA CARGAR CURSOS
    useEffect(() => {
        async function loadPublicCourses() {
            if (!isProvider) return;
            setIsLoadingCourses(true);
            try {
                const result = await courseService.getCoursesByUserId(user.id);
                const publicCourses = result.courses.filter((c: Course) => 
                    c.estado_gestion === 'aprobado' || c.estado_gestion === 'abierto'
                );
                setCourses(publicCourses);
            } catch (error) {
                console.error("Error cargando cursos públicos:", error);
            } finally {
                setIsLoadingCourses(false);
            }
        }
        loadPublicCourses();
    }, [user.id, isProvider]);

    const getStatusColor = (status: string | undefined) => {
        return status === 'abierto' ? 'green' : 'blue';
    };

    // 5️⃣ RENDERIZADO
    return (
        <Box p={8} bg={cardBg} shadow="xl" rounded="lg" maxW="2xl" mx="auto" borderTop="4px solid" borderColor={brandColor}>
            
            <VStack spacing={4} align="center" mb={6}>
                <Avatar size="2xl" name={displayName} src={avatarUrl} border="2px solid" borderColor={brandColor} />
                
                <VStack spacing={1}>
                    <Heading size="xl" textAlign="center">{displayName}</Heading>
                    
                    {isProvider && 'tipo_proveedor' in user && (
                        <Badge colorScheme="teal" variant="subtle" px={2} py={1} rounded="md">
                            {(user as FullProvider).tipo_proveedor.replace(/-/g, ' ')}
                        </Badge>
                    )}
                </VStack>

                <Box textAlign="center" maxW="md" pt={2}>
                    <Text fontSize="md" color={textColor} fontStyle="italic">
                        {bioText}
                    </Text>
                </Box>

                {/* ✨ SECCIÓN DE CONTACTO */}
                <VStack spacing={2} pt={4} w="full" align="center">
                    {/* Email principal (de la cuenta) */}
                    <HStack spacing={2} fontSize="sm" color="teal.500" fontWeight="bold">
                        <Icon as={MdEmail} />
                        <Text>{user.email}</Text>
                    </HStack>

                    {/* Emails adicionales (si es proveedor) */}
                    {extraEmails?.map((email) => (
                        <HStack key={email} spacing={2} fontSize="sm" color={textColor}>
                            <Icon as={MdEmail} opacity={0.6} />
                            <Text>{email}</Text>
                        </HStack>
                    ))}

                    {/* Teléfonos adicionales (si es proveedor) */}
                    {extraPhones?.map((phone) => (
                        <HStack key={phone} spacing={2} fontSize="sm" color={textColor}>
                            <Icon as={MdPhone} color="green.500" />
                            <Text>{phone}</Text>
                        </HStack>
                    ))}
                </VStack>
            </VStack>

            {isProvider && (
                <Box mt={4}>
                    <Divider my={6} />
                    <Heading size="md" mb={4} textAlign="center" color="teal.500">Oferta Académica</Heading>
                    
                    {isLoadingCourses ? (
                        <Center py={10}><Spinner color="teal.500" size="xl" /></Center>
                    ) : courses.length > 0 ? (
                        <TableContainer border="1px" borderColor={tableBorder} rounded="md">
                            <Table variant="simple" size="md">
                                <Thead bg={headerBg}>
                                    <Tr>
                                        <Th>Curso</Th>
                                        <Th textAlign="center">Estado</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {courses.map((course: Course) => (
                                        <Tr key={course.id}>
                                            <Td fontWeight="medium">
                                                <Text noOfLines={1}>{course.titulo}</Text>
                                            </Td>
                                            <Td textAlign="center">
                                                <Badge 
                                                    colorScheme={getStatusColor(course.estado_gestion)}
                                                    variant="subtle"
                                                    px={3}
                                                    rounded="full"
                                                >
                                                    {course.estado_gestion === 'abierto' ? 'Inscripciones Abiertas' : 'Próximamente'}
                                                </Badge>
                                            </Td>
                                        </Tr>
                                    ))}
                                </Tbody>
                            </Table>
                        </TableContainer>
                    ) : (
                        <Text textAlign="center" color={textColor} fontStyle="italic" py={4}>
                            Este proveedor no tiene cursos disponibles para el público actualmente.
                        </Text>
                    )}
                </Box>
            )}

            <Box mt={10} pt={4} borderTop="1px" borderColor={tableBorder}>
                <Text fontSize="xs" color="gray.400" textAlign="center">
                    Perfil verificado por la Dirección de Extensión Universitaria (DEU)
                </Text>
            </Box>
        </Box>
    );
}