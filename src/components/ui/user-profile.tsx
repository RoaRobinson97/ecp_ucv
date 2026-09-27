"use client";

import React, { useState, useEffect } from "react";
import { 
    Box, Heading, Text, Avatar, VStack, useColorModeValue, Divider, 
    Table, Thead, Tbody, Tr, Th, Td, TableContainer, Badge,
    HStack, Icon, Spinner, Center, Link as ChakraLink
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { Course, User, FullProvider } from "@/data/types"; 
import { MdEmail, MdPhone } from 'react-icons/md'; 
import { courseService } from "@/servicios/cursos-service";
import { userService } from "@/servicios/users-service";

export function UserProfileClient({ user }: { user: User | FullProvider }) {
    const [courses, setCourses] = useState<Course[]>([]);
    const [isLoadingCourses, setIsLoadingCourses] = useState(false);
    const [providerData, setProviderData] = useState<any>(null);

    const cardBg = useColorModeValue("white", "gray.700");
    const textColor = useColorModeValue("gray.600", "gray.400");
    const headerBg = useColorModeValue("gray.50", "gray.800");
    const tableBorder = useColorModeValue("gray.100", "gray.600");
    const brandColor = "teal.500";

    const safeUser = user as any;
    const isProvider = safeUser.rol === 'proveedor' || safeUser.roles?.includes('proveedor');
    const safeUserId = safeUser.id || safeUser.usuario_id || safeUser.ID || safeUser.sub;

    // ✨ Usamos userService para que funcione en producción sin errores de localhost
    useEffect(() => {
        if (isProvider && safeUserId) {
            userService.getProviderDetails(String(safeUserId))
                .then(d => {
                    if (d) setProviderData(d);
                })
                .catch(e => console.error("Error hidratando colaborador:", e));
        }
    }, [isProvider, safeUserId]);

    const combinedUser = { ...safeUser, ...providerData };

    const displayName = (isProvider && combinedUser.nombre_proveedor) 
        ? combinedUser.nombre_proveedor 
        : `${combinedUser.first_name || combinedUser.nombres || ''} ${combinedUser.last_name || combinedUser.apellidos || ''}`.trim() || 'Usuario';

    const bioText = (isProvider && combinedUser.biografia) 
        ? combinedUser.biografia 
        : "Usuario de la plataforma.";

    // ✨ SIN IMÁGENES RANDOM: Si no hay logo propio, queda undefined y Chakra muestra las iniciales
    const rawAvatar = combinedUser.archivos?.logo || combinedUser.provider_avatar_url || combinedUser.avatar_url;
    let avatarUrl = rawAvatar || undefined;

    if (avatarUrl && typeof avatarUrl === 'string') {
        if (avatarUrl.includes('localhost:8080') || avatarUrl.includes('127.0.0.1:8080')) {
            try {
                const urlObj = new URL(avatarUrl);
                avatarUrl = urlObj.pathname;
            } catch (e) {
                avatarUrl = avatarUrl.replace(/http:\/\/(localhost|127\.0\.0\.1):8080/g, '');
            }
        }
        if (avatarUrl.startsWith('uploads/')) {
            avatarUrl = `/${avatarUrl}`;
        }
    }

    const extraEmails = (isProvider && combinedUser.emails_contacto) ? combinedUser.emails_contacto : [];
    const extraPhones = (isProvider && combinedUser.telefonos_contacto) ? combinedUser.telefonos_contacto : [];

    useEffect(() => {
        async function loadPublicCourses() {
            if (!isProvider || !safeUserId) return;
            setIsLoadingCourses(true);
            try {
                const result = await courseService.getCoursesByUserId(String(safeUserId), { limit: 100 });
                const publicCourses = (result.courses || []).filter((c: any) => {
                    const hasContract = !!(c.documento_legal_id || c.contrato_id);
                    const estado = String(c.estado_gestion || c.estado).toLowerCase();
                    return hasContract && (estado === 'aprobado' || estado === 'aprobada' || estado === 'abierto' || estado === 'cerrado');
                });
                setCourses(publicCourses);
            } catch (error) {
                console.error("Error cargando cursos públicos:", error);
            } finally {
                setIsLoadingCourses(false);
            }
        }
        loadPublicCourses();
    }, [safeUserId, isProvider]);

    const getStatusColor = (status: string | undefined) => {
        const st = String(status).toLowerCase();
        if (st === 'abierto') return 'green';
        if (st === 'cerrado') return 'blue';
        return 'teal';
    };

    return (
        <Box p={8} bg={cardBg} shadow="xl" rounded="lg" maxW="2xl" mx="auto" borderTop="4px solid" borderColor={brandColor}>
            
            <VStack spacing={4} align="center" mb={6}>
                <Avatar 
                    size="2xl" 
                    name={displayName} 
                    src={avatarUrl} 
                    border="2px solid" 
                    borderColor={brandColor} 
                />
                
                <VStack spacing={1}>
                    <Heading size="xl" textAlign="center">{displayName}</Heading>
                    
                    {isProvider && (combinedUser.tipo_lucro || combinedUser.tipo_proveedor) && (
                        <Badge colorScheme="teal" variant="subtle" px={3} py={1} rounded="md" textTransform="uppercase">
                            {String(combinedUser.tipo_lucro || combinedUser.tipo_proveedor).replace(/_/g, ' ').replace(/-/g, ' ')}
                        </Badge>
                    )}
                </VStack>

                <Box textAlign="center" maxW="md" pt={2}>
                    <Text fontSize="md" color={textColor} fontStyle="italic">
                        {bioText}
                    </Text>
                </Box>

                <VStack spacing={2} pt={4} w="full" align="center">
                    <HStack spacing={2} fontSize="sm" color="teal.500" fontWeight="bold">
                        <Icon as={MdEmail} />
                        <Text>{combinedUser.email || user.email}</Text>
                    </HStack>

                    {extraEmails?.map((email: string) => (
                        <HStack key={email} spacing={2} fontSize="sm" color={textColor}>
                            <Icon as={MdEmail} opacity={0.6} />
                            <Text>{email}</Text>
                        </HStack>
                    ))}

                    {extraPhones?.map((phone: string) => (
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
                                    {courses.map((course: any) => (
                                        <Tr key={course.id}>
                                            <Td fontWeight="medium">
                                                <ChakraLink as={NextLink} href={`/curso/${course.id}`} color="teal.500" _hover={{ textDecoration: 'underline' }}>
                                                    <Text noOfLines={1}>{course.titulo || course.nombre}</Text>
                                                </ChakraLink>
                                            </Td>
                                            <Td textAlign="center">
                                                <Badge 
                                                    colorScheme={getStatusColor(course.estado_gestion || course.estado)}
                                                    variant="subtle"
                                                    px={3}
                                                    rounded="full"
                                                >
                                                    {(course.estado_gestion || course.estado) === 'abierto' ? 'Inscripciones Abiertas' : 'Amparado / Vigente'}
                                                </Badge>
                                            </Td>
                                        </Tr>
                                    ))}
                                </Tbody>
                            </Table>
                        </TableContainer>
                    ) : (
                        <Text textAlign="center" color={textColor} fontStyle="italic" py={4}>
                            Este colaborador no tiene cursos disponibles para el público actualmente.
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