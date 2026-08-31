"use client";

import React from 'react';
import { Box, Heading, Text, VStack, Divider, Flex, Card, CardHeader, CardBody, Avatar, Badge, Stack } from "@chakra-ui/react";

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
    const provider = course?.providerDetails;

    const displayName = provider 
        ? provider.nombre_proveedor || `${provider.first_name || provider.nombres || ''} ${provider.last_name || provider.apellidos || ''}`.trim() || "Proveedor sin nombre"
        : "Proveedor sin nombre";

    const rawLogo = provider?.archivos?.logo || provider?.provider_avatar_url || provider?.avatar_url;
    const providerAvatarUrl = rawLogo 
        ? (rawLogo.startsWith('/') ? `http://localhost:8080${rawLogo}` : rawLogo)
        : `https://i.pravatar.cc/150?u=${provider?.id || 'default'}`;

    return (
        <Box maxW="4xl" mx="auto" p={{ base: 4, md: 8 }} my={8}>
            <VStack spacing={8} align="stretch">
                
                {/* Cabecera del Curso */}
                <Box textAlign="center" px={{ base: 2, md: 8 }}>
                    <Heading 
                        as="h1" 
                        size={{ base: "lg", md: "xl" }} 
                        color="primary" 
                        fontWeight="extrabold"
                        letterSpacing="tight"
                        lineHeight="1.2"
                        mb={4}
                    >
                        {course.titulo || course.nombre}
                    </Heading>
                    <Badge 
                        colorScheme={course.cohorteActiva?.estado === 'activa' ? 'blue' : 'gray'} 
                        variant="solid" // ✨ CORRECCIÓN VISUAL: Alto contraste para la etiqueta
                        px={4} 
                        py={1.5} 
                        borderRadius="full"
                        textTransform="uppercase"
                        letterSpacing="wide"
                        fontWeight="bold"
                    >
                        {course.cohorteActiva?.estado === 'activa' ? 'Inscripciones Abiertas' : 'Próximamente'}
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
                                    {provider.biografia || 'Proveedor de contenido educativo verificado por la UCV.'}
                                </Text>
                            </CardBody>
                        </Stack>
                    </Card>
                )}

                {/* Detalles Públicos */}
                <Card bg="surface" variant="outline" borderColor="border" shadow="md" rounded="xl">
                    <CardBody p={{ base: 4, md: 8 }}>
                        <VStack align="start" spacing={6} divider={<Divider borderColor="border" borderWidth="1px" />}>
                            <Box w="full">
                                <Heading size="sm" mb={2} color="primary" textTransform="uppercase" letterSpacing="wide">Propósito del Curso</Heading>
                                {/* ✨ CORRECCIÓN VISUAL: Añadido fontWeight="medium" a los bloques de lectura */}
                                <Text color="text.primary" whiteSpace="pre-wrap" lineHeight="tall" fontWeight="medium">{course.proposito || 'No especificado.'}</Text>
                            </Box>
                            
                            {course.fundamentacion && (
                                <Box w="full">
                                    <Heading size="sm" mb={2} color="primary" textTransform="uppercase" letterSpacing="wide">Fundamentación</Heading>
                                    <Text color="text.primary" whiteSpace="pre-wrap" lineHeight="tall" fontWeight="medium">{course.fundamentacion}</Text>
                                </Box>
                            )}

                            <Box w="full">
                                <Heading size="sm" mb={2} color="primary" textTransform="uppercase" letterSpacing="wide">Duración Estimada</Heading>
                                <Text color="text.primary" fontWeight="medium">{course.duracion || 'No especificada.'} horas académicas</Text>
                            </Box>

                            {course.perfil_docente && (
                                <Box w="full">
                                    <Heading size="sm" mb={2} color="primary" textTransform="uppercase" letterSpacing="wide">Perfil del Docente</Heading>
                                    <Text color="text.primary" whiteSpace="pre-wrap" lineHeight="tall" fontWeight="medium">{course.perfil_docente}</Text>
                                </Box>
                            )}

                            {course.cohorteActiva && (
                                <Box w="full">
                                    <Heading size="sm" mb={2} color="primary" textTransform="uppercase" letterSpacing="wide">Fechas de la Cohorte Actual</Heading>
                                    <Text color="text.primary" fontWeight="medium">Inicio: {new Date(course.cohorteActiva.fecha_inicio).toLocaleDateString()} | Fin: {new Date(course.cohorteActiva.fecha_fin).toLocaleDateString()}</Text>
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
                    
                    {course.cohorteActiva?.publicaciones && course.cohorteActiva.publicaciones.length > 0 ? (
                        <VStack spacing={4} align="stretch">
                            {[...course.cohorteActiva.publicaciones]
                                .sort((a, b) => new Date(b.fecha || 0).getTime() - new Date(a.fecha || 0).getTime())
                                .map((pub: any) => (
                                    <Card key={pub.id} bg="surface" variant="outline" borderColor="border" size="sm" shadow="md" rounded="lg">
                                        <CardHeader pb={2}>
                                            <Heading size="sm" color="text.primary">{pub.titulo}</Heading>
                                            <Text fontSize="xs" color="text.muted" mt={1}>
                                                {new Date(pub.fecha).toLocaleDateString('es-VE', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute:'2-digit' })}
                                            </Text>
                                        </CardHeader>
                                        <Divider borderColor="border" borderWidth="1px" />
                                        <CardBody>
                                            <Text fontSize="sm" color="text.primary" whiteSpace="pre-wrap" lineHeight="tall" fontWeight="medium">{pub.contenido}</Text>
                                        </CardBody>
                                    </Card>
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