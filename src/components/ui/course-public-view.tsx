"use client";

import React from 'react';
import { Box, Heading, Text, VStack, Divider, Flex, useColorModeValue, Card, CardHeader, CardBody, Avatar, Badge, Stack, Button, Icon } from "@chakra-ui/react";
import { MdFileDownload } from 'react-icons/md';

// ✨ FIX: Función idéntica a la vista Owner para que entienda "lucrativo"
const formatProviderType = (type?: string): string => {
    const normalizedType = String(type).toLowerCase();
    switch (normalizedType) {
        case 'lucrativo':
        case 'con-fines-de-lucro': 
            return 'Con Fines de Lucro';
        case 'no_lucrativo':
        case 'sin-fines-de-lucro': 
            return 'Sin Fines de Lucro';
        default: 
            return 'Tipo no especificado';
    }
};

export function CoursePublicView({ course }: { course: any }) {
    const cardBg = useColorModeValue("white", "gray.800");
    const dividerColor = useColorModeValue("gray.200", "gray.600");
    const mutedTextColor = useColorModeValue("gray.500", "gray.400");
    const brandColor = useColorModeValue("teal.600", "teal.300");

    // ✨ EXTRAEMOS EL PROVEEDOR QUE MANDÓ EL PAGE.TSX
    const provider = course?.providerDetails;

    // ✨ BLINDAJE DEL NOMBRE
    const displayName = provider 
        ? provider.nombre_proveedor || `${provider.first_name || provider.nombres || ''} ${provider.last_name || provider.apellidos || ''}`.trim() || "Proveedor sin nombre"
        : "Proveedor sin nombre";

    // ✨ BLINDAJE DEL LOGO
    const rawLogo = provider?.archivos?.logo || provider?.provider_avatar_url || provider?.avatar_url;
    const providerAvatarUrl = rawLogo 
        ? (rawLogo.startsWith('/') ? `http://localhost:8080${rawLogo}` : rawLogo)
        : `https://i.pravatar.cc/150?u=${provider?.id || 'default'}`;

    return (
        <Box maxW="4xl" mx="auto" p={{ base: 4, md: 8 }} my={8}>
            <VStack spacing={8} align="stretch">
                
                {/* Cabecera del Curso */}
                <Box textAlign="center">
                    <Heading as="h1" size={{ base: "xl", md: "2xl" }} color={brandColor} mb={3}>
                        {course.titulo || course.nombre}
                    </Heading>
                    <Badge colorScheme={course.cohorteActiva?.estado === 'activa' ? 'blue' : 'gray'} variant="solid" px={3} py={1} borderRadius="full">
                        {course.cohorteActiva?.estado === 'activa' ? 'Inscripciones Abiertas' : 'Próximamente'}
                    </Badge>
                </Box>

                {/* Tarjeta del Proveedor */}
                {provider && (
                    <Card direction={{ base: 'column', sm: 'row' }} overflow='hidden' variant='outline' bg={cardBg} borderColor={dividerColor} shadow="sm">
                        <Flex align="center" p={4}>
                            <Avatar size='lg' name={displayName} src={providerAvatarUrl} mr={4} />
                        </Flex>
                        <Stack flex={1}>
                            <CardBody>
                                <Text fontSize="sm" color={mutedTextColor} mb={1}>Dictado por:</Text>
                                <Heading size='md' mb={1}>{displayName}</Heading>
                                
                                {/* ✨ FIX APLICADO AQUÍ */}
                                {(provider.tipo_lucro || provider.tipo_proveedor) && (
                                    <Badge 
                                        colorScheme={(provider.tipo_lucro === 'lucrativo' || provider.tipo_proveedor === 'con-fines-de-lucro') ? 'blue' : 'green'}
                                        variant="solid" fontSize="xs" px={2} py={0.5} rounded="md" mb={2}
                                    >
                                        {formatProviderType(provider.tipo_lucro || provider.tipo_proveedor)}
                                    </Badge>
                                )}

                                <Text py='1' fontSize="sm" color={mutedTextColor}>
                                    {provider.biografia || 'Proveedor de contenido educativo verificado por la UCV.'}
                                </Text>
                            </CardBody>
                        </Stack>
                    </Card>
                )}

                {/* Detalles Públicos */}
                <Card bg={cardBg} variant="outline" borderColor={dividerColor} shadow="sm">
                    <CardBody>
                        <VStack align="start" spacing={4} divider={<Divider borderColor={dividerColor} />}>
                            <Box w="full">
                                <Heading size="sm" mb={2} color="gray.600">Propósito del Curso</Heading>
                                <Text whiteSpace="pre-wrap">{course.proposito || 'No especificado.'}</Text>
                            </Box>
                            
                            {course.fundamentacion && (
                                <Box w="full">
                                    <Heading size="sm" mb={2} color="gray.600">Fundamentación</Heading>
                                    <Text whiteSpace="pre-wrap">{course.fundamentacion}</Text>
                                </Box>
                            )}

                            <Box w="full">
                                <Heading size="sm" mb={2} color="gray.600">Duración Estimada</Heading>
                                <Text>{course.duracion || 'No especificada.'} horas académicas</Text>
                            </Box>

                            {course.perfil_docente && (
                                <Box w="full">
                                    <Heading size="sm" mb={2} color="gray.600">Perfil del Docente</Heading>
                                    <Text whiteSpace="pre-wrap">{course.perfil_docente}</Text>
                                </Box>
                            )}

                            {course.cohorteActiva && (
                                <Box w="full">
                                    <Heading size="sm" mb={2} color="gray.600">Fechas de la Cohorte Actual</Heading>
                                    <Text>Inicio: {new Date(course.cohorteActiva.fecha_inicio).toLocaleDateString()} | Fin: {new Date(course.cohorteActiva.fecha_fin).toLocaleDateString()}</Text>
                                </Box>
                            )}
                        </VStack>
                    </CardBody>
                </Card>

                {/* Muro de Publicaciones Públicas */}
                <Box mt={4}>
                    <Heading as="h2" size="lg" color={brandColor} mb={4} borderBottomWidth="1px" pb={2} borderColor={dividerColor}>
                        Anuncios y Novedades
                    </Heading>
                    
                    {course.cohorteActiva?.publicaciones && course.cohorteActiva.publicaciones.length > 0 ? (
                        <VStack spacing={4} align="stretch">
                            {[...course.cohorteActiva.publicaciones]
                                .sort((a, b) => new Date(b.fecha || 0).getTime() - new Date(a.fecha || 0).getTime())
                                .map((pub: any) => (
                                    <Card key={pub.id} bg={cardBg} variant="outline" borderColor={dividerColor} size="sm">
                                        <CardHeader pb={2}>
                                            <Heading size="sm">{pub.titulo}</Heading>
                                            <Text fontSize="xs" color={mutedTextColor} mt={1}>
                                                {new Date(pub.fecha).toLocaleDateString('es-VE', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute:'2-digit' })}
                                            </Text>
                                        </CardHeader>
                                        <Divider borderColor={dividerColor} />
                                        <CardBody>
                                            <Text fontSize="sm" whiteSpace="pre-wrap">{pub.contenido}</Text>
                                        </CardBody>
                                    </Card>
                                ))}
                        </VStack>
                    ) : (
                        <Text color={mutedTextColor} fontSize="sm" textAlign="center" py={4}>
                            No hay anuncios recientes para este curso.
                        </Text>
                    )}
                </Box>
            </VStack>
        </Box>
    );
}