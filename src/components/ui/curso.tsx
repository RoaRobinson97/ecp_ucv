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
                {value ? (
                    <Text whiteSpace="pre-wrap" color={valueColor}>{value}</Text>
                ) : (
                    <Text as="i" color="gray.500">No especificado</Text>
                )}
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

    const formattedDate = publication.fecha 
        ? new Date(publication.fecha).toLocaleDateString('es-VE', { year: 'numeric', month: 'long', day: 'numeric' })
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
    const formCardBg = useColorModeValue("gray.50", "gray.700"); 

    useEffect(() => {
        if (!isHydrated) return;

        const fetchCourseAndProviderData = async () => {
            try {
                setLoading(true); setError(null); setCourse(null); setProvider(null);

                const courseData = await courseService.getCourseById(courseId) as Course;
                if (!courseData) throw new Error('Curso no encontrado.');

                // ✨ CORRECCIÓN 1: Aseguramos que publications siempre sea un arreglo (El servicio ya hace el fetch)
                courseData.publications = courseData.publications || [];

                setCourse(courseData);

                // ✨ CORRECCIÓN 2: Extraemos el ID sin importar si es string o number
                const providerUserId = courseData.user_id || (courseData as any).userId;
                if (providerUserId) {
                    try {
                        const providerData = await userService.getProviderDetails(String(providerUserId)) as FullProvider;
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
                course_id: courseId,
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

    // ✨ CORRECCIÓN 3: Castear los IDs a string siempre evita el bug donde 1 !== "1"
    const courseOwnerId = course.user_id || (course as any).userId;
    const isOwner = (loggedInUser?.rol as string) === 'proveedor' && String(loggedInUser?.id) === String(courseOwnerId);
    const isAdminOrCoordinator = (loggedInUser?.rol as string) === 'admin' || (loggedInUser?.rol as string) === 'coordinador';
    const canSeePrivateDetails = isOwner || isAdminOrCoordinator;
    const canManageCohort = isOwner && course.estado_gestion !== 'cerrado';
    
    const canCreatePublication = isOwner && course.estado_gestion === 'abierto';

    let displayStatus: CourseStatus | undefined = undefined;
    if (canSeePrivateDetails) {
        displayStatus = course.estado_gestion;
    } else if (course.estado_gestion === 'abierto' || course.estado_gestion === 'cerrado') {
        displayStatus = course.estado_gestion;
    }

    // ✨ LÓGICA DE AVATAR APLICADA AQUÍ (Para la tarjeta del proveedor):
    const providerAvatarUrl = provider 
        ? ((provider as any).provider_avatar_url ?? (provider as any).avatar_url ?? `https://i.pravatar.cc/150?u=${provider.id}`) 
        : undefined;

    return (
        <Box maxW="5xl" mx="auto" p={{ base: 4, md: 8 }} my={8}>
            <VStack spacing={8} align="stretch">

                {provider && (
                    <Card direction={{ base: 'column', sm: 'row' }} overflow='hidden' variant='outline' bg={cardBg} mb={6} borderColor={dividerColor} shadow="sm">
                        <Flex align="center" p={4}>
                            {/* ✨ CORRECCIÓN 4: Fallback seguro para el nombre del Avatar */}
                            <Avatar size='xl' name={provider.nombre_proveedor || provider.nombres || 'Proveedor'} src={providerAvatarUrl} mr={4} />
                        </Flex>
                        <Stack flex={1}>
                            <CardBody>
                                <Text fontSize="sm" color={mutedTextColor} mb={1}>Ofrecido por:</Text>
                                <Heading size='lg' color={subHeadingColor} mb={1}>{provider.nombre_proveedor || `${provider.nombres} ${provider.apellidos}`}</Heading>
                                
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

                    {/* ✨ BOTÓN PARA DESCARGAR RESULTADOS (SOLO APARECE SI HAY LINK) ✨ */}
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
                                {/* ✨ CORRECCIÓN 5: Protegemos contra fechas vacías (Invalid Date) en el sort */}
                                {[...(course.publications || [])]
                                    .sort((a, b) => new Date(b.fecha || 0).getTime() - new Date(a.fecha || 0).getTime())
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