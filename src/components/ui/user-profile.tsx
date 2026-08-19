"use client";

import React, { useState, useEffect } from "react";
import { 
    Box, Heading, Text, Avatar, VStack, useColorModeValue, Divider, 
    Table, Thead, Tbody, Tr, Th, Td, TableContainer, Badge,
    HStack, Icon, Spinner, Center
} from '@chakra-ui/react';
import { Course, User, FullProvider } from "@/data/types"; 
import { MdEmail, MdPhone } from 'react-icons/md'; 
import { courseService } from "@/servicios/cursos-service";

export function UserProfileClient({ user }: { user: User | FullProvider }) {
    const [courses, setCourses] = useState<Course[]>([]);
    const [isLoadingCourses, setIsLoadingCourses] = useState(false);
    
    // ✨ FIX 1: Estado para atrapar la info del proveedor si el componente superior no la envió
    const [providerData, setProviderData] = useState<any>(null);

    const cardBg = useColorModeValue("white", "gray.700");
    const textColor = useColorModeValue("gray.600", "gray.400");
    const headerBg = useColorModeValue("gray.50", "gray.800");
    const tableBorder = useColorModeValue("gray.100", "gray.600");
    const brandColor = "teal.500";

    const isProvider = user.rol === 'proveedor';
    const safeUserId = (user as any).id || (user as any).usuario_id || (user as any).ID;

    // ✨ AUTO-HIDRATACIÓN: Buscamos la info del proveedor (avatar, bio) directo de la BD
    useEffect(() => {
        if (isProvider && safeUserId) {
            fetch(`http://localhost:8080/providers?usuario_id=${safeUserId}`)
                .then(r => r.json())
                .then(d => {
                    if (d && d.length > 0) setProviderData(d[0]);
                })
                .catch(e => console.error("Error hidratando proveedor:", e));
        }
    }, [isProvider, safeUserId]);

    // ✨ Unimos la data del usuario base con la del proveedor
    const combinedUser = { ...(user as any), ...providerData };

    // Adaptado a los nombres combinados
    const displayName = (isProvider && combinedUser.nombre_proveedor) 
        ? combinedUser.nombre_proveedor 
        : `${combinedUser.first_name || combinedUser.nombres || ''} ${combinedUser.last_name || combinedUser.apellidos || ''}`.trim() || 'Usuario Desconocido';

    const bioText = (isProvider && combinedUser.biografia) 
        ? combinedUser.biografia 
        : "Usuario de la plataforma.";

    // ✨ FIX AVATAR: Ya lee correctamente desde la data combinada
    const rawAvatar = combinedUser.archivos?.logo || combinedUser.provider_avatar_url || combinedUser.avatar_url;
    const avatarUrl = rawAvatar 
        ? (rawAvatar.startsWith('/') ? `http://localhost:8080${rawAvatar}` : rawAvatar) 
        : `https://i.pravatar.cc/150?u=${safeUserId}`;

    // Extraer arreglos de contacto
    const extraEmails = (isProvider && combinedUser.emails_contacto) ? combinedUser.emails_contacto : [];
    const extraPhones = (isProvider && combinedUser.telefonos_contacto) ? combinedUser.telefonos_contacto : [];

    useEffect(() => {
        async function loadPublicCourses() {
            if (!isProvider || !safeUserId) return;
            setIsLoadingCourses(true);
            try {
                const result = await courseService.getCoursesByUserId(safeUserId);
                const publicCourses = result.courses.filter((c: any) => {
                    const estado = String(c.estado_gestion || c.estado).toLowerCase();
                    // ✨ FIX 2: Agregamos "cerrado" para que los cursos con amparo legal aparezcan
                    return estado === 'aprobado' || estado === 'abierto' || estado === 'cerrado';
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
                <Avatar size="2xl" name={displayName} src={avatarUrl} border="2px solid" borderColor={brandColor} />
                
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

                {/* SECCIÓN DE CONTACTO */}
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
                                                <Text noOfLines={1}>{course.titulo || course.nombre}</Text>
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