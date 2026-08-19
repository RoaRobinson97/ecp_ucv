"use client";

import React, { useState, useEffect } from 'react';
import { 
    Box, Heading, Text, Divider, useColorModeValue, VStack, Avatar,
    Table, Thead, Tbody, Tr, Th, Td, TableContainer, Badge, HStack, Icon, Center, Link as ChakraLink 
} from '@chakra-ui/react';
import { MdEmail, MdPhone } from 'react-icons/md'; 
import NextLink from 'next/link';
import { User, Course, FullProvider } from "@/data/types"; 
import { courseService } from '@/servicios/cursos-service';

export function ProfileOwnerView({ user, mode }: { user: User | FullProvider, mode: string }) {
    const [myCourses, setMyCourses] = useState<Course[]>([]);
    const [providerData, setProviderData] = useState<any>(null);

    const brandColor = "teal.500";
    const textColor = useColorModeValue("gray.600", "gray.400");
    
    const safeUser = user as any;
    const safeUserId = safeUser.id || safeUser.usuario_id || safeUser.ID || safeUser.sub;

    // ✨ DETERMINACIÓN ESTRICTA DE ROLES
    const isProveedor = safeUser.rol === 'proveedor' || safeUser.roles?.includes('proveedor');
    const isAdmin = safeUser.rol === 'admin' || safeUser.roles?.includes('admin') || safeUser.roles?.includes('deu_admin');
    const isCoordinador = safeUser.rol === 'coordinador' || safeUser.roles?.includes('coordinador');

    useEffect(() => {
        if (isProveedor && safeUserId) {
            fetch(`http://localhost:8080/providers?usuario_id=${safeUserId}`)
                .then(r => r.json())
                .then(d => {
                    if (d && d.length > 0) setProviderData(d[0]);
                })
                .catch(e => console.error("Error hidratando proveedor:", e));
        }
    }, [isProveedor, safeUserId]);

    useEffect(() => {
        async function loadMyCourses() {
            if (isProveedor && safeUserId) {
                try {
                    const [resCourses, resRequests] = await Promise.all([
                        fetch(`http://localhost:8080/courses?usuario_id=${safeUserId}`).then(r => r.ok ? r.json() : []),
                        fetch(`http://localhost:8080/course-requests?usuario_id=${safeUserId}`).then(r => r.ok ? r.json() : [])
                    ]);
                    
                    const allData = [...resCourses, ...resRequests];

                    const cursosLegales = allData.filter((c: any) => {
                        const hasContract = !!(c.documento_legal_id || c.contrato_id);
                        const estado = String(c.estado_gestion || c.estado).toLowerCase();
                        
                        const isVigente = [
                            'aprobado', 'aprobada', 'abierto', 'cerrado', 'solicitud-cierre'
                        ].includes(estado);
                        
                        return hasContract && isVigente;
                    });
                    
                    const uniqueCourses = Array.from(new Map(cursosLegales.map(c => [c.id, c])).values());
                    setMyCourses(uniqueCourses as Course[]);
                } catch (e) { 
                    console.error("Error cargando cursos:", e); 
                }
            }
        }
        loadMyCourses();
    }, [safeUserId, isProveedor]);

    // ✨ LÓGICA DE IDENTIDAD INSTITUCIONAL VS PROVEEDOR
    let displayName = "";
    let bioText = "";
    let displayBadge = "";
    let badgeColor = "teal";
    let isInstitutional = false;

    if (isAdmin) {
        isInstitutional = true;
        displayName = "Administrador del Sistema";
        bioText = "Dirección de Extensión Universitaria (DEU) - Gestión Central.";
        displayBadge = "ADMIN DEU";
        badgeColor = "purple";
    } else if (isCoordinador) {
        isInstitutional = true;
        displayName = "Coordinación de Extensión";
        bioText = `Facultad: ${safeUser.facultad || 'No especificada'}`;
        displayBadge = "COORDINADOR";
        badgeColor = "blue";
    } else {
        // Lógica normal para proveedores mortales
        displayName = (isProveedor && providerData?.nombre_proveedor)
            ? providerData.nombre_proveedor 
            : `${safeUser.first_name || safeUser.nombres || ''} ${safeUser.last_name || safeUser.apellidos || ''}`.trim();
        bioText = (isProveedor && providerData?.biografia) 
            ? providerData.biografia 
            : "Usuario de la plataforma.";
        
        const tipoLucro = providerData?.tipo_lucro || safeUser?.tipo_lucro || providerData?.tipo_proveedor || safeUser?.tipo_proveedor;
        if (tipoLucro) {
            displayBadge = String(tipoLucro).replace(/_/g, ' ').replace(/-/g, ' ');
            badgeColor = (tipoLucro === 'lucrativo' || tipoLucro === 'con-fines-de-lucro') ? 'blue' : 'green';
        }
    }

    const rawAvatar = providerData?.archivos?.logo || safeUser?.archivos?.logo || safeUser?.provider_avatar_url || safeUser?.avatar_url;
    // Si es institucional, evitamos avatares random y forzamos sus iniciales institucionales
    const avatarUrl = isInstitutional ? undefined : (rawAvatar || `https://i.pravatar.cc/150?u=${safeUserId}`);

    const extraEmails = (isProveedor && providerData?.emails_contacto) ? providerData.emails_contacto : [];
    const extraPhones = (isProveedor && providerData?.telefonos_contacto) ? providerData.telefonos_contacto : [];

    const getStatusBadge = (status: string | undefined) => {
        const lowerStatus = String(status).toLowerCase();
        switch (lowerStatus) {
            case 'abierto': return { color: "teal", label: "Abierto" };
            case 'cerrado': return { color: "blue", label: "Cerrado" };
            case 'aprobado':
            case 'aprobada': return { color: "green", label: "Aprobado" };
            case 'solicitud-cierre': return { color: "orange", label: "Cierre en Proceso" };
            default: return { color: "gray", label: status || "Desconocido" };
        }
    };

    return (
        <Box p={6} bg={useColorModeValue("white", "gray.700")} shadow="xl" rounded="lg" borderTop="6px solid" borderColor={brandColor} maxW="3xl" mx="auto">
            
            <HStack justify="space-between" mb={4}>
                <Heading size="xl">
                    {isAdmin ? "Panel de Administración" : isCoordinador ? "Panel de Coordinación" : "Mi Perfil"}
                </Heading>
                <Badge colorScheme="teal">{mode}</Badge>
            </HStack>
            <Divider my={4} />
            
            <VStack spacing={4} align="center" mb={8}>
                <Avatar 
                    size="2xl" 
                    name={displayName} 
                    src={avatarUrl} 
                    border="4px solid" 
                    borderColor={isInstitutional ? "gray.300" : brandColor} 
                    bg={isInstitutional ? "gray.600" : undefined}
                />
                
                <VStack spacing={1}>
                    <Heading size="lg" textAlign="center">{displayName}</Heading>
                    
                    {displayBadge && (
                        <Badge colorScheme={badgeColor} variant="solid" px={3} py={1} rounded="md" textTransform="uppercase" letterSpacing="wide">
                            {displayBadge}
                        </Badge>
                    )}
                </VStack>

                <Box textAlign="center" maxW="md" pt={2}>
                    <Text fontSize="md" color={textColor} fontWeight={isInstitutional ? "bold" : "normal"} fontStyle={isInstitutional ? "normal" : "italic"}>
                        {bioText}
                    </Text>
                </Box>

                <VStack spacing={2} pt={2} w="full" align="center">
                    <HStack spacing={2} fontSize="sm" color="teal.500" fontWeight="bold">
                        <Icon as={MdEmail} />
                        <Text>{providerData?.email || safeUser.email}</Text>
                    </HStack>

                    {/* Los extras solo se mapean si existen (y típicamente solo existen en proveedores) */}
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

            {/* Solo mostramos la tabla de cursos si el usuario es proveedor */}
            {isProveedor && (
                <>
                    <Heading size="md" mb={3} color="gray.600">Mis Cursos Disponibles</Heading>
                    
                    {myCourses.length > 0 ? (
                        <TableContainer border="1px" borderColor="gray.100" rounded="md">
                            <Table variant="simple" size="sm">
                                <Thead bg="gray.50">
                                    <Tr>
                                        <Th>ID Legal</Th>
                                        <Th>Título</Th>
                                        <Th textAlign="center">Estado</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {myCourses.map((c: any) => {
                                        const statusInfo = getStatusBadge(c.estado_gestion || c.estado);
                                        return (
                                            <Tr key={c.id}>
                                                <Td fontSize="xs" fontFamily="mono" color="gray.500">
                                                    {c.documento_legal_id || c.contrato_id || "VIGENTE"}
                                                </Td>
                                                <Td fontWeight="medium">
                                                    <ChakraLink as={NextLink} href={`/curso/${c.id}`} color="teal.500" _hover={{ textDecoration: 'underline' }}>
                                                        <Text noOfLines={1}>{c.titulo || c.nombre}</Text>
                                                    </ChakraLink>
                                                </Td>
                                                <Td textAlign="center">
                                                    <Badge colorScheme={statusInfo.color} variant="solid" px={2} rounded="md">
                                                        {statusInfo.label}
                                                    </Badge>
                                                </Td>
                                            </Tr>
                                        );
                                    })}
                                </Tbody>
                            </Table>
                        </TableContainer>
                    ) : (
                        <Center py={4} bg="gray.50" rounded="md" border="1px dashed" borderColor="gray.200">
                            <Text color="gray.500" fontSize="sm">No tienes cursos con amparo legal vigente actualmente.</Text>
                        </Center>
                    )}
                </>
            )}
        </Box>
    );
}