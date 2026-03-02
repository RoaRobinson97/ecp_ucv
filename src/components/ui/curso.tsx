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
import { ApiService } from '@/servicios/BaseApiService'; 

// --- Helper Functions for Status Display ---
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
    switch (type) {
        case 'con-fines-de-lucro': return 'Organización con Fines de Lucro';
        case 'sin-fines-de-lucro': return 'Organización Sin Fines de Lucro';
        default: return 'Tipo no especificado';
    }
};

// --- KeyDetail Component ---
const KeyDetail = ({ label, value }: { label: string; value?: string | null }) => {
    const labelColor = useColorModeValue("gray.600", "gray.400");
    const valueColor = useColorModeValue("gray.800", "white");
    const boxBg = useColorModeValue("gray.100", "gray.700");
    const boxBorder = useColorModeValue("gray.200", "gray.600");

    return (
        <Box>
            <Text fontWeight="semibold" fontSize="sm" color={labelColor} mb={1}>{label}</Text>
            <Box p={2} bg={boxBg} borderWidth="1px" borderColor={boxBorder} borderRadius="md">
                <Text whiteSpace="pre-wrap" color={valueColor}>
                    {value || <Text as="i" color="gray.500">No especificado</Text>}
                </Text>
            </Box>
        </Box>
    );
};

// --- Publication Card Component ---
const PublicationCard = ({ publication }: { publication: Publication }) => {
    const cardBg = useColorModeValue("white", "gray.700");
    const dividerColor = useColorModeValue("gray.200", "gray.600");
    const dateColor = useColorModeValue("gray.500", "gray.400");
    const titleColor = useColorModeValue("gray.800", "white");
    const contentColor = useColorModeValue("gray.700", "gray.300");

    const formattedDate = new Date(publication.fecha).toLocaleDateString('es-VE', {
        year: 'numeric', month: 'long', day: 'numeric'
    });

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
    const [course, setCourse] = useState<Course | null>(null);
    const [provider, setProvider] = useState<FullProvider | null>(null);    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user: loggedInUser, isHydrated } = useAuth();
    const toast = useToast(); 

    // ✨ Estados para el formulario de publicación
    const [isAddingPub, setIsAddingPub] = useState(false);
    const [newPubTitle, setNewPubTitle] = useState('');
    const [newPubContent, setNewPubContent] = useState('');
    const [isSubmittingPub, setIsSubmittingPub] = useState(false);
    
    // ✨ HOOKS DE COLOR AL NIVEL SUPERIOR (CORRECCIÓN AQUÍ)
    const cardBg = useColorModeValue("white", "gray.800");
    const headingColor = useColorModeValue("teal.600", "teal.300");
    const subHeadingColor = useColorModeValue("gray.700", "gray.200");
    const dividerColor = useColorModeValue("gray.200", "gray.600");
    const mutedTextColor = useColorModeValue("gray.500", "gray.400");
    const linkColor = "teal.500";
    const formCardBg = useColorModeValue("gray.50", "gray.700"); // Hook subido

    useEffect(() => {
        if (!isHydrated) return;

        const fetchCourseAndProviderData = async () => {
            try {
                setLoading(true); setError(null); setCourse(null); setProvider(null);

                const courseData = await courseService.getCourseById(courseId) as Course;
                if (!courseData) throw new Error('Curso no encontrado.');

                try {
                    const allPublications = await ApiService.get('publications') as Publication[];
                    if (allPublications) {
                        courseData.publications = allPublications.filter(pub => pub.courseId === String(courseId));
                    }
                } catch (pubError) {
                    console.warn("No se pudieron cargar las publicaciones:", pubError);
                    courseData.publications = [];
                }

                setCourse(courseData);

                const providerUserId = courseData.userId;
                if (providerUserId && typeof providerUserId === 'string') {
                    try {
                        const providerData = await userService.getProviderDetails(providerUserId) as FullProvider;
                        setProvider(providerData);
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

    const handleAddPublication = async () => {
        if (!newPubTitle.trim() || !newPubContent.trim()) {
            toast({ title: "Campos vacíos", description: "El título y contenido son requeridos.", status: "warning", duration: 3000 });
            return;
        }

        setIsSubmittingPub(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 800));

            const newPublication: Publication = {
                id: `pub-new-${Date.now()}`,
                courseId: courseId,
                titulo: newPubTitle,
                contenido: newPubContent,
                fecha: new Date().toISOString()
            };

            setCourse(prev => {
                if (!prev) return prev;
                return {
                    ...prev,
                    publications: [newPublication, ...(prev.publications || [])]
                };
            });

            setNewPubTitle('');
            setNewPubContent('');
            setIsAddingPub(false);
            toast({ title: "Publicación creada", status: "success", duration: 3000 });
        } catch (error) {
            toast({ title: "Error al publicar", status: "error", duration: 3000 });
        } finally {
            setIsSubmittingPub(false);
        }
    };

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

    const isOwner = loggedInUser?.rol === 'proveedor' && loggedInUser?.id === course.userId;
    const isAdminOrCoordinator = loggedInUser?.rol === 'admin' || loggedInUser?.rol === 'coordinador';
    const canSeePrivateDetails = isOwner || isAdminOrCoordinator;
    const canManageCohort = isOwner && course.estado_gestion !== 'cerrado';
    
    const canCreatePublication = isOwner && course.estado_gestion === 'abierto';

    let displayStatus: CourseStatus | undefined = undefined;
    if (canSeePrivateDetails) {
        displayStatus = course.estado_gestion;
    } else if (course.estado_gestion === 'abierto' || course.estado_gestion === 'cerrado') {
        displayStatus = course.estado_gestion;
    }

    return (
        <Box maxW="5xl" mx="auto" p={{ base: 4, md: 8 }} my={8}>
            <VStack spacing={8} align="stretch">

                {provider && (
                    <Card direction={{ base: 'column', sm: 'row' }} overflow='hidden' variant='outline' bg={cardBg} mb={6} borderColor={dividerColor} shadow="sm">
                        <Flex align="center" p={4}>
                            <Avatar size='xl' name={provider.nombre_proveedor} src={provider.avatarUrl} mr={4} />
                        </Flex>
                        <Stack flex={1}>
                            <CardBody>
                                <Text fontSize="sm" color={mutedTextColor} mb={1}>Ofrecido por:</Text>
                                <Heading size='lg' color={subHeadingColor} mb={1}>{provider.nombre_proveedor}</Heading>
                                
                                {provider.tipo_proveedor && (
                                    <Badge 
                                        colorScheme={provider.tipo_proveedor === 'con-fines-de-lucro' ? 'blue' : 'green'}
                                        variant="solid" fontSize="xs" px={2} py={0.5} rounded="md" mb={2}
                                    >
                                        {formatProviderType(provider.tipo_proveedor)}
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
                            <GridItem><KeyDetail label="Estructura de Costos" value={course.estructuraCostos} /></GridItem>

                            <GridItem colSpan={{ base: 1, md: 2 }} pt={6}>
                                <Heading as="h2" size="md" mb={4} borderBottomWidth="1px" pb={2} borderColor={dividerColor} color={subHeadingColor}>
                                    Perfiles y Exigencias
                                </Heading>
                            </GridItem>
                            <GridItem><KeyDetail label="Perfil del Docente" value={course.perfilDocente} /></GridItem>
                            <GridItem><KeyDetail label="Perfiles de Ingreso/Egreso" value={course.perfiles} /></GridItem>
                            <GridItem colSpan={{ base: 1, md: 2 }}><KeyDetail label="Exigencias" value={course.exigencias} /></GridItem>

                            <GridItem colSpan={{ base: 1, md: 2 }} pt={6}>
                                <Heading as="h2" size="md" mb={4} borderBottomWidth="1px" pb={2} borderColor={dividerColor} color={subHeadingColor}>
                                    Aspectos Curriculares y Logísticos
                                </Heading>
                            </GridItem>
                            <GridItem><KeyDetail label="Estructura Curricular" value={course.estructuraCurricular} /></GridItem>
                            <GridItem><KeyDetail label="Estrategias de Evaluación" value={course.evaluacion} /></GridItem>
                            <GridItem colSpan={{ base: 1, md: 2 }}><KeyDetail label="Cronograma Anual" value={course.cronograma} /></GridItem>
                        </Grid>
                    </CardBody>
                </Card>

                {canManageCohort && <CohortManagementPanel course={course} />}

                {((course.publications && course.publications.length > 0) || canCreatePublication) && (
                    <Box mt={8}>
                        <Flex justify="space-between" align="center" mb={6} borderBottomWidth="1px" pb={2} borderColor={dividerColor}>
                            <Heading as="h2" size="lg" color={headingColor}>
                                Publicaciones
                            </Heading>
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
                                                bg="white"
                                                value={newPubTitle} 
                                                onChange={(e) => setNewPubTitle(e.target.value)}
                                                placeholder="Ej: Nuevo material disponible para la Semana 2" 
                                            />
                                        </FormControl>
                                        <FormControl isRequired>
                                            <FormLabel fontSize="sm" fontWeight="semibold">Mensaje o contenido</FormLabel>
                                            <Textarea 
                                                bg="white"
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

                        {course.publications && course.publications.length > 0 ? (
                            <VStack spacing={4} align="stretch">
                                {course.publications
                                    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
                                    .map(pub => (
                                        <PublicationCard key={pub.id} publication={pub} />
                                    ))}
                            </VStack>
                        ) : (
                            <Text color={mutedTextColor} fontSize="sm" textAlign="center" py={4}>
                                Aún no hay publicaciones en este curso.
                            </Text>
                        )}
                    </Box>
                )}

                <VStack spacing={1} mt={4}>
                    <Text textAlign="center" color={mutedTextColor} fontSize="xs">
                        ID del Curso: {course.id}
                    </Text>
                </VStack>

            </VStack>
        </Box>
    );
}