"use client";

import React, { useState, useEffect } from 'react';
import {
    Box,
    Heading,
    Text,
    Flex,
    VStack,
    Divider,
    Link as ChakraLink,
    Spinner,
    Alert,
    AlertIcon,
    useColorModeValue,
    Card,
    CardHeader,
    CardBody,
    Grid,
    GridItem,
    Badge,
    Avatar,
    Stack,
    // IconButton, // Descomentar si añades botones de acción a publicaciones
} from "@chakra-ui/react";
import NextLink from 'next/link';
// import { EditIcon, DeleteIcon } from '@chakra-ui/icons'; // Descomentar para acciones
import { courseService } from '@/servicios/cursos-service';
import { userService } from '@/servicios/users-service'; // Importamos userService
import { useAuth } from '@/app/context/auth-context';
import CohortManagementPanel from '@/components/formularios/gestion-cohorte-form';
import { Course, User, Publication } from '@/data/types'; // Importamos Publication

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

// ✨ ADICIÓN: Helper para formatear el tipo de proveedor
const formatProviderType = (type?: User['providerType']): string => {
    switch (type) {
        case 'con-fines-de-lucro': return 'Organización con Fines de Lucro';
        case 'sin-fines-de-lucro': return 'Organización Sin Fines de Lucro';
        default: return 'Tipo no especificado';
    }
};
// --- End Helper Functions ---


// --- KeyDetail Component ---
const KeyDetail = ({ label, value }: { label: string; value?: string | null }) => {
// ... (Componente KeyDetail sin cambios)
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
// --- End KeyDetail Component ---

// --- Publication Card Component ---
const PublicationCard = ({ publication }: { publication: Publication }) => {
// ... (Componente PublicationCard sin cambios)
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
// --- End Publication Card Component ---


export default function CourseClientPage({ courseId }: { courseId: string }) {
    // --- Hooks ---
    const [course, setCourse] = useState<Course | null>(null);
    const [provider, setProvider] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user: loggedInUser, isHydrated } = useAuth();
    const cardBg = useColorModeValue("white", "gray.800");
    const headingColor = useColorModeValue("teal.600", "teal.300");
    const subHeadingColor = useColorModeValue("gray.700", "gray.200");
    const dividerColor = useColorModeValue("gray.200", "gray.600");
    const linkColor = "teal.500";
    const mutedTextColor = useColorModeValue("gray.500", "gray.400");
    // --- End Hooks ---

    useEffect(() => {
        // ... (useEffect sin cambios)
        if (!isHydrated) return;

        const fetchCourseAndProviderData = async () => {
            try {
                setLoading(true); setError(null); setCourse(null); setProvider(null);

                const courseData = await courseService.getCourseById(courseId) as Course;
                if (!courseData) throw new Error('Curso no encontrado.');
                setCourse(courseData);

                const providerUserId = courseData.userId;
                if (providerUserId && typeof providerUserId === 'string') {
                    try {
                        const providerData = await userService.getUserById(providerUserId) as User;
                        setProvider(providerData);
                    } catch (providerError: any) {
                        console.warn("Could not fetch provider details:", providerError.message);
                    }
                } else {
                    console.warn("Course does not have a valid associated userId.");
                }

            } catch (err: any) {
                setError(err.message || 'Ocurrió un error inesperado al cargar los datos.');
            } finally {
                setLoading(false);
            }
        };
        fetchCourseAndProviderData();
    }, [courseId, isHydrated]);

    // --- Loading, Error, Not Found States ---
    if (!isHydrated || loading) {
    // ... (Estado de carga sin cambios)
        return (
            <Flex justify="center" align="center" minH="80vh">
                <Spinner thickness="4px" speed="0.65s" emptyColor="gray.200" color="teal.500" size="xl" />
            </Flex>
        );
    }
    if (error) {
    // ... (Estado de error sin cambios)
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
    // ... (Estado 'no encontrado' sin cambios)
        return <Text textAlign="center" mt={10}>No se encontró información para este curso.</Text>;
    }
    // --- End States ---

    // --- Authorization Logic ---
    // ... (Lógica de autorización sin cambios)
    const isOwner = loggedInUser?.role === 'proveedor' && loggedInUser?.id === course.userId;
    const isAdminOrCoordinator = loggedInUser?.role === 'admin' || loggedInUser?.role === 'coordinador';
    const canSeePrivateDetails = isOwner || isAdminOrCoordinator;
    const canManageCohort = isOwner && course.estado_gestion !== 'cerrado';
    let displayStatus: CourseStatus | undefined = undefined;
    if (canSeePrivateDetails) {
        displayStatus = course.estado_gestion;
    } else if (course.estado_gestion === 'abierto' || course.estado_gestion === 'cerrado') {
        displayStatus = course.estado_gestion;
    }
    // --- End Authorization Logic ---


    // --- Main Render ---
    return (
        <Box maxW="5xl" mx="auto" p={{ base: 4, md: 8 }} my={8}>
            <VStack spacing={8} align="stretch">

                {/* --- Provider Info Card --- */}
                {provider && (
                    <Card
                        direction={{ base: 'column', sm: 'row' }}
                        overflow='hidden'
                        variant='outline'
                        bg={cardBg}
                        mb={6}
                        borderColor={dividerColor}
                        shadow="sm"
                    >
                        <Flex align="center" p={4}>
                            <Avatar size='xl' name={provider.name} src={provider.avatarUrl} mr={4} />
                        </Flex>
                        <Stack flex={1}>
                            <CardBody>
                                <Text fontSize="sm" color={mutedTextColor} mb={1}>Ofrecido por:</Text>
                                <Heading size='lg' color={subHeadingColor} mb={1}>{provider.name}</Heading>
                                
                                {/* ✨ ADICIÓN: Badge para el tipo de proveedor */}
                                {provider.providerType && (
                                    <Badge 
                                        colorScheme={provider.providerType === 'con-fines-de-lucro' ? 'blue' : 'green'}
                                        variant="solid"
                                        fontSize="xs"
                                        px={2}
                                        py={0.5}
                                        rounded="md"
                                        mb={2}
                                    >
                                        {formatProviderType(provider.providerType)}
                                    </Badge>
                                )}
                                {/* --- FIN DE LA ADICIÓN --- */}

                                <Text py='1' fontSize="sm" color={mutedTextColor}>
                                    {provider.bio || 'Proveedor de contenido educativo.'}
                                </Text>
                                <ChakraLink as={NextLink} href={`/profile/${provider.id}`} color={linkColor} fontWeight="medium" fontSize="sm">
                                    Ver perfil completo
                                </ChakraLink>
                            </CardBody>
                        </Stack>
                    </Card>
                )}
                {/* --- End Provider Info Card --- */}


                {/* --- Course Header --- */}
                <Box textAlign="center">
                {/* ... (Header del curso sin cambios) */}
                    <Heading as="h1" size={{ base: "xl", md: "2xl" }} color={headingColor} mb={3}>
                        {course.titulo}
                    </Heading>
                    {displayStatus && (
                        <Badge
                            colorScheme={getStatusColorScheme(displayStatus)}
                            variant="solid"
                            fontSize="xs"
                            px={3} py={1} borderRadius="full" textTransform="uppercase"
                        >
                            {formatStatusText(displayStatus)}
                        </Badge>
                    )}
                    {canSeePrivateDetails && course.providerCode && (
                        <Text fontSize="xs" color={mutedTextColor} mt={2}>
                            (Código: {course.providerCode})
                        </Text>
                    )}
                </Box>
                {/* --- End Course Header --- */}


                {/* --- Course Details Grid in a Card --- */}
                <Card bg={cardBg} variant="outline" borderColor={dividerColor} shadow="sm">
                    <CardBody>
                        <Grid
                            templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
                            gap={{ base: 6, md: 8 }}
                        >
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
                {/* --- End Course Details Grid --- */}


                {/* --- Cohort Management Panel (Conditional) --- */}
                {canManageCohort && <CohortManagementPanel course={course} />}
                {/* --- End Cohort Panel --- */}

                {/* --- Publications Section --- */}
                {course.publications && course.publications.length > 0 && (
                    <Box mt={8}>
                        <Heading as="h2" size="lg" mb={6} borderBottomWidth="1px" pb={2} borderColor={dividerColor} color={headingColor}>
                            Publicaciones Recientes
                        </Heading>
                        <VStack spacing={4} align="stretch">
                            {course.publications
                                .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
                                .map(pub => (
                                    <PublicationCard key={pub.id} publication={pub} />
                                ))}
                        </VStack>
                    </Box>
                )}
                {/* --- End Publications Section --- */}


                {/* --- Footer Info --- */}
                <VStack spacing={1} mt={4}>
                    <Text textAlign="center" color={mutedTextColor} fontSize="xs">
                        ID del Curso: {course.id}
                    </Text>
                </VStack>
                {/* --- End Footer Info --- */}

            </VStack>
        </Box>
    );
}