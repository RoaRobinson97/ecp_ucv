"use client";

import React, { useState, useEffect } from 'react';
import {
    Box, Heading, Text, Flex, VStack, HStack, Divider, Link as ChakraLink,
    useColorModeValue, Card, CardHeader, CardBody, Grid, GridItem, Badge, Avatar, Stack,
    Button, Input, Textarea, FormControl, FormLabel, useToast
} from "@chakra-ui/react";
import NextLink from 'next/link';
import { courseService } from '@/servicios/cursos-service';
import { userService } from '@/servicios/users-service';
import CohortManagementPanel from '@/components/formularios/gestion-cohorte-form';

const getStatusColorScheme = (status?: string): string => {
    switch (status) {
        case 'aprobado':
        case 'aprobada': return 'green';
        case 'abierto': return 'blue';
        case 'rechazado':
        case 'rechazada': return 'red';
        case 'cerrado': return 'gray';
        case 'pendiente':
        case 'under_review': return 'yellow';
        case 'solicitud-cierre': return 'orange'; 
        default: return 'gray';
    }
};

const formatStatusText = (status?: string): string => {
    switch (status) {
        case 'aprobado':
        case 'aprobada': return 'Aprobado';
        case 'abierto': return 'Abierto';
        case 'rechazado':
        case 'rechazada': return 'Rechazado';
        case 'cerrado': return 'Cerrado';
        case 'pendiente':
        case 'under_review': return 'Pendiente Revisión';
        case 'solicitud-cierre': return 'Cierre en Proceso'; 
        default: return 'Desconocido';
    }
};

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

const KeyDetail = ({ label, value }: { label: string; value?: string | null }) => {
    const labelColor = useColorModeValue("gray.600", "gray.400");
    const valueColor = useColorModeValue("gray.800", "white");
    const boxBg = useColorModeValue("gray.100", "gray.700");
    const boxBorder = useColorModeValue("gray.200", "gray.600");

    return (
        <Box>
            <Text fontWeight="semibold" fontSize="sm" color={labelColor} mb={1}>{label}</Text>
            <Box p={2} bg={boxBg} borderWidth="1px" borderColor={boxBorder} borderRadius="md">
                {value ? (
                    <Text whiteSpace="pre-wrap" color={valueColor}>{value}</Text>
                ) : (
                    <Text as="i" color="gray.500">No especificado</Text>
                )}
            </Box>
        </Box>
    );
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
        <Card bg={cardBg} variant="outline" borderColor={dividerColor} size="sm">
            <CardHeader pb={2}>
                <Heading size="sm" color={titleColor}>{publication.titulo}</Heading>
                <Text fontSize="xs" color={dateColor} mt={1} suppressHydrationWarning>
                    {formattedDate}
                </Text>
            </CardHeader>
            <Divider borderColor={dividerColor} />
            <CardBody>
                <Text fontSize="sm" color={contentColor} whiteSpace="pre-wrap">
                    {publication.contenido}
                </Text>
            </CardBody>
        </Card>
    );
};

export function CourseOwnerView({ initialCourse, currentUser }: { initialCourse: any, currentUser: any }) {
    const [course, setCourse] = useState(initialCourse);
    const [provider, setProvider] = useState<any>(null);    
    const toast = useToast(); 

    const [isAddingPub, setIsAddingPub] = useState(false);
    const [newPubTitle, setNewPubTitle] = useState('');
    const [newPubContent, setNewPubContent] = useState('');
    const [isSubmittingPub, setIsSubmittingPub] = useState(false);
    
    const cardBg = useColorModeValue("white", "gray.800");
    const innerBoxBg = useColorModeValue("gray.100", "gray.700");
    const innerBoxBorder = useColorModeValue("gray.200", "gray.600");
    const headingColor = useColorModeValue("teal.600", "teal.300");
    const subHeadingColor = useColorModeValue("gray.700", "gray.200");
    const labelColor = useColorModeValue("gray.600", "gray.400");
    const dividerColor = useColorModeValue("gray.200", "gray.600");
    const mutedTextColor = useColorModeValue("gray.500", "gray.400");
    const formCardBg = useColorModeValue("gray.50", "gray.800"); 
    const inputBg = useColorModeValue("white", "gray.900");
    const inputBorder = useColorModeValue("gray.300", "gray.600");
    const inputColor = useColorModeValue("gray.800", "white");

    useEffect(() => {
        if (initialCourse?.id) {
            courseService.getCourseById(initialCourse.id)
                .then(freshData => {
                    if (freshData) {
                        setCourse(freshData);
                    }
                })
                .catch(err => console.warn("No se pudo refrescar el curso:", err));
        }
    }, [initialCourse?.id]);

    useEffect(() => {
        const providerUserId = course.usuario_id || course.user_id;
        if (providerUserId) {
            userService.getProviderDetails(String(providerUserId))
                .then(data => setProvider(data))
                .catch(err => console.warn("Could not fetch provider details", err));
        }
    }, [course.usuario_id, course.user_id]);

    const ultimaCohorte = course.cohorteActiva || (course.cohortes?.length > 0 ? course.cohortes[0] : null);
    const publicacionesMostrar = ultimaCohorte?.publicaciones || [];

    // ✨ Limpieza de URL para archivos (CV y Avatar)
    const getCleanFileUrl = (url?: string | null) => {
        if (!url || typeof url !== 'string') return null;
        let clean = url.replace(/^https?:\/\/(localhost|127\.0\.0\.1):8080/, '');
        if (clean.startsWith('uploads/')) clean = `/${clean}`;
        return clean;
    };

    const cvFacilitadorUrl = getCleanFileUrl(course.cv_facilitador_url);

    // ✨ Desglose de Módulos en tarjetas
    const parseModulos = (rawText?: string) => {
        if (!rawText || typeof rawText !== 'string') return [];
        const blocks = rawText.split(/\n\s*\n/).map(b => b.trim()).filter(Boolean);
        
        return blocks.map((block, idx) => {
            const lines = block.split('\n').map(l => l.trim());
            const headerLine = lines.find(l => /^m[oó]dulo/i.test(l)) || `Módulo ${idx + 1}`;
            const contenidoLine = lines.find(l => /^contenido:/i.test(l));
            const competenciaLine = lines.find(l => /^competencia:/i.test(l));

            if (contenidoLine || competenciaLine) {
                return {
                    isStructured: true,
                    header: headerLine,
                    contenido: contenidoLine ? contenidoLine.replace(/^contenido:\s*/i, '') : 'No especificado',
                    competencia: competenciaLine ? competenciaLine.replace(/^competencia:\s*/i, '') : 'No especificado'
                };
            }
            return { isStructured: false, raw: block };
        });
    };

    const modulosParsed = parseModulos(course.contenido_competencias);

    const handleAddPublication = async () => {
        if (!newPubTitle.trim() || !newPubContent.trim()) {
            toast({ title: "Campos vacíos", description: "El título y contenido son requeridos.", status: "warning", duration: 3000 });
            return;
        }

        if (!ultimaCohorte || !ultimaCohorte.id) {
            toast({ title: "Acción denegada", description: "Debes abrir una cohorte antes de poder publicar anuncios.", status: "error", duration: 4000 });
            return;
        }

        setIsSubmittingPub(true);
        try {
            const newPublication = {
                id: `pub-${Date.now()}`,
                course_id: course.id,
                cohort_id: ultimaCohorte.id, 
                titulo: newPubTitle,
                contenido: newPubContent,
                fecha: new Date().toISOString()
            };

            const savedPub = await courseService.addPublication(newPublication);

            setCourse((prev: any) => {
                const updatedCohortes = [...(prev.cohortes || [])];
                const pubToRender = savedPub || newPublication; 

                const indexActiva = updatedCohortes.findIndex(c => c.id === ultimaCohorte.id);
                if (indexActiva !== -1) {
                    updatedCohortes[indexActiva] = {
                        ...updatedCohortes[indexActiva],
                        publicaciones: [pubToRender, ...(updatedCohortes[indexActiva].publicaciones || [])]
                    };
                }
                
                return { 
                    ...prev, 
                    cohortes: updatedCohortes,
                    cohorteActiva: updatedCohortes[indexActiva] || prev.cohorteActiva
                };
            });

            setNewPubTitle('');
            setNewPubContent('');
            setIsAddingPub(false);
            toast({ title: "Publicación guardada", status: "success", duration: 3000 });
        } catch (error) {
            toast({ title: "Error al conectar con la base de datos", status: "error", duration: 3000 });
        } finally {
            setIsSubmittingPub(false);
        }
    };

    const loggedInUserId = String(currentUser?.id || currentUser?.sub || currentUser?.userID || '');
    const courseOwnerId = String(course.usuario_id || course.user_id || '');
    const isOwner = loggedInUserId === courseOwnerId;
    
    const canManageCohort = isOwner; 
    const canCreatePublication = isOwner && !!ultimaCohorte && ultimaCohorte.estado === 'activa';

    const displayStatus = course.estado_gestion || course.estado;
    const rawAvatar = provider ? (provider.archivos?.logo ?? provider.provider_avatar_url ?? provider.avatar_url) : null;
    const providerAvatarUrl = provider ? (getCleanFileUrl(rawAvatar) ?? `https://i.pravatar.cc/150?u=${provider.id}`) : undefined;

    return (
        <Box maxW="5xl" mx="auto" p={{ base: 4, md: 8 }} my={8}>
            <VStack spacing={8} align="stretch">

                {provider && (
                    <Card direction={{ base: 'column', sm: 'row' }} overflow='hidden' variant='outline' bg={cardBg} mb={6} borderColor={dividerColor} shadow="sm">
                        <Flex align="center" p={4}>
                            <Avatar size='xl' name={provider.nombre_proveedor || provider.nombres || 'Proveedor'} src={providerAvatarUrl} mr={4} />
                        </Flex>
                        <Stack flex={1}>
                            <CardBody>
                                <Text fontSize="sm" color={mutedTextColor} mb={1}>Ofrecido por:</Text>
                                <Heading size='lg' color={subHeadingColor} mb={1}>{provider.nombre_proveedor || `${provider.nombres} ${provider.apellidos}`}</Heading>
                                
                                {(provider.tipo_lucro || provider.tipo_proveedor) && (
                                    <Badge 
                                        colorScheme={(provider.tipo_lucro === 'lucrativo' || provider.tipo_proveedor === 'con-fines-de-lucro') ? 'blue' : 'green'}
                                        variant="solid" fontSize="xs" px={2} py={0.5} rounded="md" mb={2}
                                    >
                                        {formatProviderType(provider.tipo_lucro || provider.tipo_proveedor)}
                                    </Badge>
                                )}

                                <Text py='1' fontSize="sm" color={mutedTextColor}>
                                    {provider.biografia || 'Proveedor de contenido educativo.'}
                                </Text>
                                <ChakraLink as={NextLink} href={`/profile/${provider.id || provider.usuario_id}`} color="teal.500" fontWeight="medium" fontSize="sm">
                                    Ver perfil completo
                                </ChakraLink>
                            </CardBody>
                        </Stack>
                    </Card>
                )}

                <Box textAlign="center">
                    <Heading as="h1" size={{ base: "xl", md: "2xl" }} color={headingColor} mb={3}>
                        {course.titulo || course.nombre}
                    </Heading>
                    {displayStatus && (
                        <Badge colorScheme={getStatusColorScheme(displayStatus)} variant="solid" fontSize="xs" px={3} py={1} borderRadius="full" textTransform="uppercase">
                            {formatStatusText(displayStatus)}
                        </Badge>
                    )}
                    {course.codigo_proveedor && (
                        <Text fontSize="xs" color={mutedTextColor} mt={2}>
                            (Código: {course.codigo_proveedor})
                        </Text>
                    )}

                    {course.link_certificados && (
                        <Box mt={4}>
                            <Button 
                                as="a" href={course.link_certificados} target="_blank" rel="noopener noreferrer"
                                colorScheme="teal" size="sm" leftIcon={<span aria-hidden="true">📥</span>}
                            >
                                Resultados Cohorte Anterior
                            </Button>
                        </Box>
                    )}
                </Box>

                <Card bg={cardBg} variant="outline" borderColor={dividerColor} shadow="sm">
                    <CardBody>
                        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={{ base: 6, md: 8 }}>
                            <GridItem colSpan={{ base: 1, md: 2 }}>
                                <Heading as="h2" size="md" mb={4} borderBottomWidth="1px" pb={2} borderColor={dividerColor} color={subHeadingColor}>
                                    Descripción General (Vista Privada)
                                </Heading>
                            </GridItem>
                            <GridItem><KeyDetail label="Propósito" value={course.proposito} /></GridItem>
                            <GridItem><KeyDetail label="Fundamentación" value={course.fundamentacion || course.descripcion} /></GridItem>
                            <GridItem><KeyDetail label="Duración" value={course.duracion} /></GridItem>
                            <GridItem><KeyDetail label="Estructura de Costos" value={course.estructura_costos} /></GridItem>

                            <GridItem colSpan={{ base: 1, md: 2 }} pt={6}>
                                <Heading as="h2" size="md" mb={4} borderBottomWidth="1px" pb={2} borderColor={dividerColor} color={subHeadingColor}>
                                    Perfiles y Exigencias
                                </Heading>
                            </GridItem>
                            <GridItem><KeyDetail label="Perfil del Docente" value={course.perfil_docente} /></GridItem>
                            <GridItem><KeyDetail label="Perfiles de Ingreso/Egreso" value={course.perfiles} /></GridItem>
                            
                            {/* ✨ SÍNTESIS CURRICULAR DEL FACILITADOR (PDF) */}
                            <GridItem colSpan={{ base: 1, md: 2 }}>
                                <Text fontWeight="semibold" fontSize="sm" color={labelColor} mb={1}>
                                    Síntesis Curricular del Facilitador(es) (PDF)
                                </Text>
                                <Box p={3} bg={innerBoxBg} borderWidth="1px" borderColor={innerBoxBorder} borderRadius="md">
                                    {cvFacilitadorUrl ? (
                                        <HStack justify="space-between" align="center" flexWrap="wrap" gap={2}>
                                            <Text fontSize="sm" color={inputColor}>
                                                Documento PDF adjunto con el resumen curricular del facilitador.
                                            </Text>
                                            <Button
                                                as="a"
                                                href={cvFacilitadorUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                size="sm"
                                                colorScheme="teal"
                                            >
                                                Ver / Descargar CV (PDF)
                                            </Button>
                                        </HStack>
                                    ) : (
                                        <Text as="i" fontSize="sm" color="gray.500">
                                            No se adjuntó archivo PDF en esta formulación.
                                        </Text>
                                    )}
                                </Box>
                            </GridItem>

                            <GridItem colSpan={{ base: 1, md: 2 }}><KeyDetail label="Exigencias" value={course.exigencias} /></GridItem>

                            <GridItem colSpan={{ base: 1, md: 2 }} pt={6}>
                                <Heading as="h2" size="md" mb={4} borderBottomWidth="1px" pb={2} borderColor={dividerColor} color={subHeadingColor}>
                                    Aspectos Curriculares y Logísticos
                                </Heading>
                            </GridItem>

                            {/* ✨ DESGLOSE DE MÓDULOS Y COMPETENCIAS */}
                            <GridItem colSpan={{ base: 1, md: 2 }}>
                                <Text fontWeight="semibold" fontSize="sm" color={labelColor} mb={2}>
                                    Contenido por Módulos y Competencias
                                </Text>
                                {modulosParsed.length > 0 ? (
                                    <VStack spacing={3} align="stretch" w="100%">
                                        {modulosParsed.map((mod, idx) => (
                                            <Box key={idx} p={4} bg={innerBoxBg} borderWidth="1px" borderColor={innerBoxBorder} rounded="md">
                                                {mod.isStructured ? (
                                                    <VStack align="start" spacing={2}>
                                                        <Badge colorScheme="teal" variant="subtle" px={2} py={0.5} rounded="md" fontSize="xs">
                                                            {mod.header}
                                                        </Badge>
                                                        <Box>
                                                            <Text fontSize="xs" fontWeight="bold" color="teal.500" textTransform="uppercase">
                                                                Contenido Programático:
                                                            </Text>
                                                            <Text fontSize="sm" color={inputColor} whiteSpace="pre-wrap">
                                                                {mod.contenido}
                                                            </Text>
                                                        </Box>
                                                        <Box>
                                                            <Text fontSize="xs" fontWeight="bold" color="teal.500" textTransform="uppercase">
                                                                Competencia a Desarrollar:
                                                            </Text>
                                                            <Text fontSize="sm" color={inputColor} whiteSpace="pre-wrap">
                                                                {mod.competencia}
                                                            </Text>
                                                        </Box>
                                                    </VStack>
                                                ) : (
                                                    <Text fontSize="sm" color={inputColor} whiteSpace="pre-wrap">
                                                        {mod.raw}
                                                    </Text>
                                                )}
                                            </Box>
                                        ))}
                                    </VStack>
                                ) : (
                                    <Box p={2} bg={innerBoxBg} borderWidth="1px" borderColor={innerBoxBorder} borderRadius="md">
                                        <Text as="i" color="gray.500">No especificado</Text>
                                    </Box>
                                )}
                            </GridItem>

                            <GridItem><KeyDetail label="Estructura Curricular" value={course.estructura_curricular} /></GridItem>
                            <GridItem><KeyDetail label="Estrategias de Evaluación" value={course.evaluacion} /></GridItem>
                            <GridItem colSpan={{ base: 1, md: 2 }}><KeyDetail label="Cronograma Anual" value={course.cronograma} /></GridItem>

                            {/* ✨ BIBLIOGRAFÍA */}
                            <GridItem colSpan={{ base: 1, md: 2 }}>
                                <KeyDetail label="Bibliografía" value={course.bibliografia} />
                            </GridItem>
                        </Grid>
                    </CardBody>
                </Card>

                {/* Panel de Gestión de Cohorte */}
                {canManageCohort && <CohortManagementPanel course={course} />}

                {/* Muro de Publicaciones */}
                <Box mt={8}>
                    <Flex justify="space-between" align="center" mb={6} borderBottomWidth="1px" pb={2} borderColor={dividerColor}>
                        <VStack align="start" spacing={0}>
                            <Heading as="h2" size="lg" color={headingColor}>
                                Muro de Publicaciones
                            </Heading>
                            {ultimaCohorte && (
                                <Badge colorScheme={ultimaCohorte.estado === 'activa' ? "green" : "gray"} mt={1} fontSize="xs">
                                    {ultimaCohorte.nombre_cohorte} • ({ultimaCohorte.estado === 'activa' ? 'Activa' : 'Cerrada'})
                                </Badge>
                            )}
                        </VStack>

                        {canCreatePublication && (
                            <Button 
                                size="sm" colorScheme="teal" variant={isAddingPub ? "outline" : "solid"}
                                onClick={() => setIsAddingPub(!isAddingPub)}
                            >
                                {isAddingPub ? 'Cancelar' : '+ Nueva Publicación'}
                            </Button>
                        )}
                    </Flex>

                    {canCreatePublication && isAddingPub && (
                        <Card bg={formCardBg} variant="outline" borderColor={dividerColor} mb={6}>
                            <CardBody>
                                <VStack spacing={4} align="stretch">
                                    <FormControl isRequired>
                                        <FormLabel fontSize="sm" fontWeight="semibold">Título de la publicación</FormLabel>
                                        <Input 
                                            bg={inputBg} borderColor={inputBorder} color={inputColor}
                                            value={newPubTitle} onChange={(e) => setNewPubTitle(e.target.value)}
                                            placeholder="Ej: Nuevo material disponible" 
                                        />
                                    </FormControl>
                                    <FormControl isRequired>
                                        <FormLabel fontSize="sm" fontWeight="semibold">Mensaje o contenido</FormLabel>
                                        <Textarea 
                                            bg={inputBg} borderColor={inputBorder} color={inputColor}
                                            value={newPubContent} onChange={(e) => setNewPubContent(e.target.value)}
                                            placeholder="Escribe aquí las novedades..." rows={4}
                                        />
                                    </FormControl>
                                    <Flex justify="flex-end">
                                        <Button colorScheme="teal" isLoading={isSubmittingPub} onClick={handleAddPublication}>
                                            Publicar
                                        </Button>
                                    </Flex>
                                </VStack>
                            </CardBody>
                        </Card>
                    )}

                    {publicacionesMostrar.length > 0 ? (
                        <VStack spacing={4} align="stretch">
                            {[...publicacionesMostrar]
                                .sort((a: any, b: any) => new Date(b.fecha || 0).getTime() - new Date(a.fecha || 0).getTime())
                                .map((pub: any) => (
                                    <PublicationCard key={pub.id} publication={pub} />
                                ))}
                        </VStack>
                    ) : (
                        <Text color={mutedTextColor} fontSize="sm" textAlign="center" py={4}>
                            Aún no hay publicaciones en este curso. ¡Crea la primera!
                        </Text>
                    )}
                </Box>

                <VStack spacing={1} mt={4}>
                    <Text textAlign="center" color={mutedTextColor} fontSize="xs">ID del Curso: {course.id}</Text>
                </VStack>

            </VStack>
        </Box>
    );
}