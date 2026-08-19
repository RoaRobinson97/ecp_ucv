"use client";

import React, { useState, useEffect } from 'react';
import {
    Box, Heading, Text, Flex, VStack, Divider, Link as ChakraLink,
    Spinner, Alert, AlertIcon, useColorModeValue, Card, CardHeader,
    CardBody, Grid, GridItem, Badge, Avatar, Stack,
    Button, Input, Textarea, FormControl, FormLabel, useToast
} from "@chakra-ui/react";
import NextLink from 'next/link';
import { courseService } from '@/servicios/cursos-service';
import { userService } from '@/servicios/users-service';
import { useAuth } from '@/app/context/auth-context';
import CohortManagementPanel from '@/components/formularios/gestion-cohorte-form';
import { Course, Publication, FullProvider } from '@/data/types';

type CourseStatus = Course['estado_gestion'];

const getStatusColorScheme = (status?: CourseStatus): string => {
    switch (status) {
        case 'aprobado': return 'green';
        case 'abierto': return 'blue';
        case 'rechazado': return 'red';
        case 'cerrado': return 'gray';
        case 'pendiente': return 'yellow';
        default: return 'gray';
    }
};

const formatStatusText = (status?: CourseStatus): string => {
    switch (status) {
        case 'aprobado': return 'Aprobado';
        case 'abierto': return 'Abierto';
        case 'rechazado': return 'Rechazado';
        case 'cerrado': return 'Cerrado';
        case 'pendiente': return 'Pendiente Revisión';
        default: return 'Desconocido';
    }
};

const formatProviderType = (type?: string): string => {
    // Normalizamos el string por seguridad
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

const PublicationCard = ({ publication }: { publication: Publication }) => {
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
                <Flex justify="space-between" align="center">
                    <Heading size="sm" color={titleColor}>{publication.titulo}</Heading>
                </Flex>
                <Text fontSize="xs" color={dateColor} mt={1}>{formattedDate}</Text>
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

export default function CourseClientPage({ courseId }: { courseId: string }) {
    // 1. TODOS LOS HOOKS ARRIBA (Sin excepciones)
    const [course, setCourse] = useState<Course | null>(null);
    const [provider, setProvider] = useState<FullProvider | null>(null);    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user: loggedInUser, isHydrated } = useAuth();
    const toast = useToast(); 

    const [isAddingPub, setIsAddingPub] = useState(false);
    const [newPubTitle, setNewPubTitle] = useState('');
    const [newPubContent, setNewPubContent] = useState('');
    const [isSubmittingPub, setIsSubmittingPub] = useState(false);
    
    const cardBg = useColorModeValue("white", "gray.800");
    const headingColor = useColorModeValue("teal.600", "teal.300");
    const subHeadingColor = useColorModeValue("gray.700", "gray.200");
    const dividerColor = useColorModeValue("gray.200", "gray.600");
    const mutedTextColor = useColorModeValue("gray.500", "gray.400");
    const linkColor = "teal.500";
    
    const formCardBg = useColorModeValue("gray.50", "gray.800"); 
    const inputBg = useColorModeValue("white", "gray.900");
    const inputBorder = useColorModeValue("gray.300", "gray.600");
    const inputColor = useColorModeValue("gray.800", "white");

    useEffect(() => {
        if (!isHydrated) return;

        const fetchCourseAndProviderData = async () => {
            try {
                setLoading(true); setError(null); setCourse(null); setProvider(null);

                const courseData = await courseService.getCourseById(courseId) as Course;
                if (!courseData) throw new Error('Curso no encontrado.');

                const publicacionesBack = await courseService.getPublicationsByCourse(courseId);
                
                if (courseData.cohortes && courseData.cohortes.length > 0) {
                    const cohorteActualId = courseData.cohortes[0].id;
                    courseData.cohortes[0].publicaciones = publicacionesBack.filter(
                        (pub: Publication) => pub.cohort_id === cohorteActualId
                    );
                    (courseData as any).publications = [];
                } else {
                    (courseData as any).publications = [];
                }

                setCourse(courseData);

                // ✨ HIDRATACIÓN ROBUSTA DEL PROVEEDOR
                const providerUserId = courseData.user_id || (courseData as any).userId;
                if (providerUserId) {
                    try {
                        const provRes = await fetch(`http://localhost:8080/providers?usuario_id=${providerUserId}`);
                        if (provRes.ok) {
                            const provList = await provRes.json();
                            if (provList && provList.length > 0) {
                                setProvider(provList[0]);
                            } else {
                                const providerData = await userService.getProviderDetails(String(providerUserId)) as FullProvider;
                                setProvider(providerData);
                            }
                        }
                    } catch (providerError: any) {
                        console.warn("Could not fetch provider details:", providerError.message);
                    }
                }

            } catch (err: any) {
                setError(err.message || 'Ocurrió un error inesperado al cargar los datos.');
            } finally {
                setLoading(false);
            }
        };
        fetchCourseAndProviderData();
    }, [courseId, isHydrated]);

    // 2. VALIDACIONES Y RETORNOS CONDICIONALES ABAJO DE LOS HOOKS
    if (!isHydrated || loading) {
        return (
            <Flex justify="center" align="center" minH="80vh">
                <Spinner thickness="4px" speed="0.65s" emptyColor="gray.200" color="teal.500" size="xl" />
            </Flex>
        );
    }
    if (error) {
        return (
            <Box maxW="4xl" mx="auto" p={8} my={8}>
                <Alert status="error" rounded="md">
                    <AlertIcon />
                    <Text fontWeight="bold">Error al cargar el curso:</Text>
                    <Text ml={2}>{error}</Text>
                </Alert>
            </Box>
        );
    }
    if (!course) {
        return <Text textAlign="center" mt={10}>No se encontró información para este curso.</Text>;
    }

    const ultimaCohorte = course?.cohortes && course.cohortes.length > 0 ? course.cohortes[0] : null;
    const publicacionesMostrar = (ultimaCohorte as any)?.publicaciones || (course as any)?.publications || [];

    const handleAddPublication = async () => {
        if (!newPubTitle.trim() || !newPubContent.trim()) {
            toast({ title: "Campos vacíos", description: "El título y contenido son requeridos.", status: "warning", duration: 3000 });
            return;
        }

        setIsSubmittingPub(true);
        try {
            const newPublication: Publication = {
                id: `pub-${Date.now()}`,
                course_id: courseId,
                cohort_id: ultimaCohorte?.id || 'default-cohorte',
                titulo: newPubTitle,
                contenido: newPubContent,
                fecha: new Date().toISOString()
            };

            const savedPub = await courseService.addPublication(newPublication);

            setCourse(prev => {
                if (!prev) return prev;
                const updatedCohortes = [...(prev.cohortes || [])];
                const pubToRender = savedPub || newPublication; 

                if (updatedCohortes.length > 0) {
                    updatedCohortes[0] = {
                        ...updatedCohortes[0],
                        publicaciones: [pubToRender, ...(updatedCohortes[0].publicaciones || [])]
                    };
                } else {
                    return {
                        ...prev,
                        publications: [pubToRender, ...(prev.publications || [])]
                    } as any;
                }
                return {
                    ...prev,
                    cohortes: updatedCohortes
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

    const loggedInUserId = String(loggedInUser?.id || (loggedInUser as any)?.sub || (loggedInUser as any)?.userID || '');
    const courseOwnerId = String(course.user_id || (course as any).userId || '');
    
    const isProveedorRole = (loggedInUser?.rol as string) === 'proveedor' || (loggedInUser?.roles as string[])?.includes('proveedor');
    const isOwner = isProveedorRole && loggedInUserId === courseOwnerId;
    
    const isAdminOrCoordinator = (loggedInUser?.rol as string) === 'admin' || (loggedInUser?.rol as string) === 'coordinador' || (loggedInUser?.roles as string[])?.includes('coordinador');
    const canSeePrivateDetails = isOwner || isAdminOrCoordinator;
    
    const canManageCohort = isOwner; 
    const canCreatePublication = isOwner;

    let displayStatus: CourseStatus | undefined = undefined;
    if (canSeePrivateDetails) {
        displayStatus = course.estado_gestion;
    } else if (course.estado_gestion === 'abierto' || course.estado_gestion === 'cerrado') {
        displayStatus = course.estado_gestion;
    }

    // ✨ VARIABLES BLINDADAS PARA EL PROVEEDOR
    const displayName = provider 
        ? provider.nombre_proveedor || `${(provider as any).first_name || (provider as any).nombres || ''} ${(provider as any).last_name || (provider as any).apellidos || ''}`.trim() || "Proveedor sin nombre"
        : "Proveedor sin nombre";

    const rawLogo = (provider as any)?.archivos?.logo || (provider as any)?.provider_avatar_url || (provider as any)?.avatar_url;
    const providerAvatarUrl = rawLogo 
        ? (rawLogo.startsWith('/') ? `http://localhost:8080${rawLogo}` : rawLogo)
        : `https://i.pravatar.cc/150?u=${provider?.id || 'default'}`;

    // 👇 DEBUG: ESTOS CONSOLE.LOGS NOS DIRÁN QUÉ ESTÁ PASANDO EXACTAMENTE 👇
    console.log("🚀 DATA DEL PROVEEDOR COMPLETA:", provider);
    console.log("🔍 VALOR EXACTO QUE SE PASA AL BADGE:", (provider as any)?.tipo_lucro || provider?.tipo_proveedor);
    console.log('chao')

    return (
        <Box maxW="5xl" mx="auto" p={{ base: 4, md: 8 }} my={8}>
            <VStack spacing={8} align="stretch">

                {provider && (
                    <Card direction={{ base: 'column', sm: 'row' }} overflow='hidden' variant='outline' bg={cardBg} mb={6} borderColor={dividerColor} shadow="sm">
                        <Flex align="center" p={4}>
                            <Avatar size='xl' name={displayName} src={providerAvatarUrl} mr={4} />
                        </Flex>
                        <Stack flex={1}>
                            <CardBody>
                                <Text fontSize="sm" color={mutedTextColor} mb={1}>Ofrecido por:</Text>
                                
                                {/* ✨ AQUÍ ESTABA EL ERROR: AHORA SÍ USAMOS DISPLAYNAME ✨ */}
                                <Heading size='lg' color={subHeadingColor} mb={1}>{displayName}</Heading>
                                
                                {/* ✨ FIX: Leemos tipo_lucro que es la llave real en la BD */}
                                {((provider as any).tipo_lucro || provider.tipo_proveedor) && (
                                    <Badge 
                                        colorScheme={((provider as any).tipo_lucro === 'lucrativo' || provider.tipo_proveedor === 'con-fines-de-lucro') ? 'blue' : 'green'}
                                        variant="solid" fontSize="xs" px={2} py={0.5} rounded="md" mb={2}
                                    >
                                        {formatProviderType((provider as any).tipo_lucro || provider.tipo_proveedor)}
                                    </Badge>
                                )}

                                <Text py='1' fontSize="sm" color={mutedTextColor}>
                                    {provider.biografia || 'Proveedor de contenido educativo.'}
                                </Text>
                                <ChakraLink as={NextLink} href={`/profile/${provider.id}`} color={linkColor} fontWeight="medium" fontSize="sm">
                                    Ver perfil completo
                                </ChakraLink>
                            </CardBody>
                        </Stack>
                    </Card>
                )}

                <Box textAlign="center">
                    <Heading as="h1" size={{ base: "xl", md: "2xl" }} color={headingColor} mb={3}>
                        {course.titulo}
                    </Heading>
                    {displayStatus && (
                        <Badge colorScheme={getStatusColorScheme(displayStatus)} variant="solid" fontSize="xs" px={3} py={1} borderRadius="full" textTransform="uppercase">
                            {formatStatusText(displayStatus)}
                        </Badge>
                    )}
                    {canSeePrivateDetails && course.codigo_proveedor && (
                        <Text fontSize="xs" color={mutedTextColor} mt={2}>
                            (Código: {course.codigo_proveedor})
                        </Text>
                    )}

                    {(course as any).link_certificados && (
                        <Box mt={4}>
                            <Button 
                                as="a" 
                                href={(course as any).link_certificados} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                colorScheme="teal" 
                                size="sm" 
                                leftIcon={<span aria-hidden="true">📥</span>}
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
                                    Descripción General
                                </Heading>
                            </GridItem>
                            <GridItem><KeyDetail label="Propósito" value={course.proposito} /></GridItem>
                            <GridItem><KeyDetail label="Fundamentación" value={course.fundamentacion} /></GridItem>
                            <GridItem><KeyDetail label="Duración" value={course.duracion} /></GridItem>
                            <GridItem><KeyDetail label="Estructura de Costos" value={course.estructura_costos} /></GridItem>

                            <GridItem colSpan={{ base: 1, md: 2 }} pt={6}>
                                <Heading as="h2" size="md" mb={4} borderBottomWidth="1px" pb={2} borderColor={dividerColor} color={subHeadingColor}>
                                    Perfiles y Exigencias
                                </Heading>
                            </GridItem>
                            <GridItem><KeyDetail label="Perfil del Docente" value={course.perfil_docente} /></GridItem>
                            <GridItem><KeyDetail label="Perfiles de Ingreso/Egreso" value={course.perfiles} /></GridItem>
                            <GridItem colSpan={{ base: 1, md: 2 }}><KeyDetail label="Exigencias" value={course.exigencias} /></GridItem>

                            <GridItem colSpan={{ base: 1, md: 2 }} pt={6}>
                                <Heading as="h2" size="md" mb={4} borderBottomWidth="1px" pb={2} borderColor={dividerColor} color={subHeadingColor}>
                                    Aspectos Curriculares y Logísticos
                                </Heading>
                            </GridItem>
                            <GridItem><KeyDetail label="Estructura Curricular" value={course.estructura_curricular} /></GridItem>
                            <GridItem><KeyDetail label="Estrategias de Evaluación" value={course.evaluacion} /></GridItem>
                            <GridItem colSpan={{ base: 1, md: 2 }}><KeyDetail label="Cronograma Anual" value={course.cronograma} /></GridItem>
                        </Grid>
                    </CardBody>
                </Card>

                {/* Panel de Gestión de Cohorte */}
                {canManageCohort && <CohortManagementPanel course={course} />}

                {/* Muro de Publicaciones por Cohorte */}
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
                                size="sm" 
                                colorScheme="teal" 
                                variant={isAddingPub ? "outline" : "solid"}
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
                                            bg={inputBg}
                                            borderColor={inputBorder}
                                            color={inputColor}
                                            _placeholder={{ color: 'gray.500' }}
                                            value={newPubTitle} 
                                            onChange={(e) => setNewPubTitle(e.target.value)}
                                            placeholder="Ej: Nuevo material disponible para la Semana 2" 
                                        />
                                    </FormControl>
                                    <FormControl isRequired>
                                        <FormLabel fontSize="sm" fontWeight="semibold">Mensaje o contenido</FormLabel>
                                        <Textarea 
                                            bg={inputBg}
                                            borderColor={inputBorder}
                                            color={inputColor}
                                            _placeholder={{ color: 'gray.500' }}
                                            value={newPubContent}
                                            onChange={(e) => setNewPubContent(e.target.value)}
                                            placeholder="Escribe aquí las novedades para los estudiantes..." 
                                            rows={4}
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
                                .sort((a, b) => new Date(b.fecha || 0).getTime() - new Date(a.fecha || 0).getTime())
                                .map(pub => (
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
                    <Text textAlign="center" color={mutedTextColor} fontSize="xs">
                        ID del Curso: {course.id}
                    </Text>
                </VStack>

            </VStack>
        </Box>
    );
}