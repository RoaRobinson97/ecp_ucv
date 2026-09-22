"use client";

import React from 'react';
import { 
    Box, Heading, Text, Flex, VStack, Divider, Link as ChakraLink,
    useColorModeValue, Card, CardHeader, CardBody, Badge, Avatar, Stack 
} from "@chakra-ui/react";
import NextLink from 'next/link';

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

const PublicationCard = ({ publication }: { publication: any }) => {
    const cardBg = useColorModeValue("white", "gray.700");
    const dividerColor = useColorModeValue("gray.200", "gray.600");
    const dateColor = useColorModeValue("gray.500", "gray.400");
    const titleColor = useColorModeValue("gray.800", "white");
    const contentColor = useColorModeValue("gray.700", "gray.300");

    const formattedDate = publication.fecha 
        ? new Date(publication.fecha).toLocaleDateString('es-VE', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
        : 'Fecha no especificada';

    return (
        <Card bg={cardBg} variant="outline" borderColor={dividerColor} size="sm" shadow="sm" rounded="lg">
            <CardHeader pb={2}>
                <Heading size="sm" color={titleColor}>{publication.titulo}</Heading>
                <Text fontSize="xs" color={dateColor} mt={1} suppressHydrationWarning>
                    {formattedDate}
                </Text>
            </CardHeader>
            <Divider borderColor={dividerColor} borderWidth="1px" />
            <CardBody>
                <Text fontSize="sm" color={contentColor} whiteSpace="pre-wrap" fontWeight="medium">
                    {publication.contenido}
                </Text>
            </CardBody>
        </Card>
    );
};

export function CoursePublicView({ course }: { course: any }) {
    const provider = course?.providerDetails;

    const displayName = provider 
        ? provider.nombre_proveedor || `${provider.first_name || provider.nombres || ''} ${provider.last_name || provider.apellidos || ''}`.trim() || "Proveedor sin nombre"
        : "Colaborador sin nombre";

    // ✨ CORRECCIÓN DE AVATAR PARA PRODUCCIÓN (Evitar el localhost)
    const rawLogo = provider?.archivos?.logo || provider?.provider_avatar_url || provider?.avatar_url;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    let providerAvatarUrl = rawLogo ? rawLogo : `https://i.pravatar.cc/150?u=${provider?.id || 'default'}`;
    
    if (providerAvatarUrl && typeof providerAvatarUrl === 'string') {
        if (providerAvatarUrl.includes('localhost:8080') || providerAvatarUrl.includes('127.0.0.1:8080')) {
            try {
                const urlObj = new URL(providerAvatarUrl);
                providerAvatarUrl = urlObj.pathname;
            } catch (e) {
                providerAvatarUrl = providerAvatarUrl.replace(/http:\/\/(localhost|127\.0\.0\.1):8080/g, '');
            }
        }
        if (providerAvatarUrl.startsWith('uploads/')) {
            providerAvatarUrl = `/${providerAvatarUrl}`;
        }
        if (providerAvatarUrl.startsWith('/')) {
            providerAvatarUrl = `${baseUrl}${providerAvatarUrl}`;
        }
    }

    const cardBg = useColorModeValue("white", "gray.800");
    const headingColor = useColorModeValue("teal.600", "teal.300");
    const subHeadingColor = useColorModeValue("gray.700", "gray.200");
    const dividerColor = useColorModeValue("gray.200", "gray.600");
    const mutedTextColor = useColorModeValue("gray.500", "gray.400");
    const textColor = useColorModeValue("gray.800", "white");

    // ✨ EXTRACCIÓN ROBUSTA DE COHORTE Y PUBLICACIONES
    const cohorteActiva = course.cohorteActiva || (course.cohortes && course.cohortes.length > 0 ? course.cohortes[0] : null);
    
    // Sacamos las publicaciones de la cohorte activa, y si no hay, buscamos a nivel raíz del curso por si acaso
    const publicacionesMostrar = cohorteActiva?.publicaciones || course.publications || course.publicaciones || [];

    return (
        <Box maxW="4xl" mx="auto" p={{ base: 4, md: 8 }} my={8}>
            <VStack spacing={8} align="stretch">

                {/* Título Principal y Status */}
                <Box textAlign="center" px={{ base: 2, md: 8 }}>
                    <Heading 
                        as="h1" 
                        size={{ base: "lg", md: "xl" }} 
                        color={headingColor} 
                        fontWeight="extrabold"
                        letterSpacing="tight"
                        lineHeight="1.2"
                        mb={4}
                    >
                        {course.titulo || course.nombre}
                    </Heading>
                    <Badge 
                        colorScheme={cohorteActiva?.estado === 'activa' ? 'blue' : 'gray'} 
                        variant="solid" 
                        px={4} 
                        py={1.5} 
                        borderRadius="full"
                        textTransform="uppercase"
                        letterSpacing="wide"
                        fontWeight="bold"
                    >
                        {cohorteActiva?.estado === 'activa' ? 'Inscripciones Abiertas' : 'Próximamente'}
                    </Badge>
                </Box>

                {/* Tarjeta del Proveedor */}
                {provider && (
                    <Card direction={{ base: 'column', sm: 'row' }} overflow='hidden' variant='outline' bg="surface" borderColor="border" shadow="md" rounded="xl">
                        <Flex align="center" p={6}>
                            <Avatar size='xl' name={displayName} src={providerAvatarUrl} />
                        </Flex>
                        <Stack flex={1} justify="center">
                            <CardBody>
                                <Text fontSize="xs" textTransform="uppercase" letterSpacing="wide" color="text.muted" mb={1} fontWeight="bold">
                                    Dictado por:
                                </Text>
                                <Heading size='md' mb={2} color="text.primary">{displayName}</Heading>
                                
                                {(provider.tipo_lucro || provider.tipo_proveedor) && (
                                    <Badge 
                                        colorScheme={(provider.tipo_lucro === 'lucrativo' || provider.tipo_proveedor === 'con-fines-de-lucro') ? 'blue' : 'green'}
                                        variant="solid" fontSize="xs" px={2} py={0.5} rounded="md" mb={3}
                                    >
                                        {formatProviderType(provider.tipo_lucro || provider.tipo_proveedor)}
                                    </Badge>
                                )}

                                <Text fontSize="sm" color="text.muted" lineHeight="tall" fontWeight="medium">
                                    {provider.biografia || 'Colaborador de contenido educativo verificado por la UCV.'}
                                </Text>
                            </CardBody>
                        </Stack>
                    </Card>
                )}

                {/* Detalles Públicos Simplificados */}
                <Card bg="surface" variant="outline" borderColor="border" shadow="md" rounded="xl">
                    <CardBody p={{ base: 4, md: 8 }}>
                        <VStack align="start" spacing={6} divider={<Divider borderColor="border" borderWidth="1px" />}>
                            
                            <Box w="full">
                                <Heading size="sm" mb={2} color="primary" textTransform="uppercase" letterSpacing="wide">Propósito del Curso</Heading>
                                <Text color={textColor} whiteSpace="pre-wrap" lineHeight="tall" fontWeight="medium">
                                    {course.proposito || 'No especificado.'}
                                </Text>
                            </Box>
                            
                            {(course.fundamentacion || course.descripcion) && (
                                <Box w="full">
                                    <Heading size="sm" mb={2} color="primary" textTransform="uppercase" letterSpacing="wide">Fundamentación</Heading>
                                    <Text color={textColor} whiteSpace="pre-wrap" lineHeight="tall" fontWeight="medium">
                                        {course.fundamentacion || course.descripcion}
                                    </Text>
                                </Box>
                            )}

                            <Box w="full">
                                <Heading size="sm" mb={2} color="primary" textTransform="uppercase" letterSpacing="wide">Duración Estimada</Heading>
                                <Text color={textColor} fontWeight="medium">
                                    {course.duracion || 'No especificada.'} {course.duracion && !isNaN(Number(course.duracion)) ? 'horas académicas' : ''}
                                </Text>
                            </Box>

                            {course.perfil_docente && (
                                <Box w="full">
                                    <Heading size="sm" mb={2} color="primary" textTransform="uppercase" letterSpacing="wide">Perfil del Docente</Heading>
                                    <Text color={textColor} whiteSpace="pre-wrap" lineHeight="tall" fontWeight="medium">
                                        {course.perfil_docente}
                                    </Text>
                                </Box>
                            )}

                            {cohorteActiva && (
                                <Box w="full">
                                    <Heading size="sm" mb={2} color="primary" textTransform="uppercase" letterSpacing="wide">Fechas de la Cohorte Actual</Heading>
                                    <Text color={textColor} fontWeight="medium">
                                        Inicio: {new Date(cohorteActiva.fecha_inicio).toLocaleDateString('es-VE')} | Fin: {new Date(cohorteActiva.fecha_fin).toLocaleDateString('es-VE')}
                                    </Text>
                                </Box>
                            )}

                        </VStack>
                    </CardBody>
                </Card>

                {/* Muro de Publicaciones Públicas */}
                <Box mt={6}>
                    <Heading as="h2" size="md" color="primary" mb={6} borderBottomWidth="2px" pb={2} borderColor="border" textTransform="uppercase" letterSpacing="wide">
                        Anuncios y Novedades
                    </Heading>
                    
                    {publicacionesMostrar.length > 0 ? (
                        <VStack spacing={4} align="stretch">
                            {[...publicacionesMostrar]
                                .sort((a, b) => new Date(b.fecha || 0).getTime() - new Date(a.fecha || 0).getTime())
                                .map((pub: any) => (
                                    <PublicationCard key={pub.id} publication={pub} />
                                ))}
                        </VStack>
                    ) : (
                        <Box textAlign="center" py={8} bg="surface" rounded="xl" border="1px dashed" borderColor="border" shadow="sm">
                            <Text color="text.muted" fontSize="sm" fontWeight="medium">
                                No hay anuncios recientes para este curso.
                            </Text>
                        </Box>
                    )}
                </Box>

            </VStack>
        </Box>
    );
}