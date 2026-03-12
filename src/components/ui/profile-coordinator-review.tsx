"use client";

import React, { useState, useEffect } from "react";
import { 
    Box, Heading, Text, Avatar, VStack, useColorModeValue, Divider, 
    Table, Thead, Tbody, Tr, Th, Td, TableContainer, Badge,
    HStack, Icon, Spinner, Center, Button, useDisclosure,
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, 
    ModalBody, ModalCloseButton, FormControl, FormLabel, Input,
    List, ListItem, ListIcon, Skeleton
} from '@chakra-ui/react';
import { Course, User, FullProvider } from "@/data/types"; 
import { MdVerifiedUser, MdCloudUpload, MdCheckCircle, MdInfo } from 'react-icons/md'; 
import { courseService } from "@/servicios/cursos-service";
import { userService } from "@/servicios/users-service"; 

export function ProfileCoordinatorReview({ user, mode }: { user: User | FullProvider, mode: string }) {
    const [courses, setCourses] = useState<Course[]>([]);
    const [isLoadingCourses, setIsLoadingCourses] = useState(false);
    
    // --- ESTADOS PARA LA VALIDACIÓN LEGAL ---
    const [hasInitialContract, setHasInitialContract] = useState<boolean | null>(null);
    const [isValidatingLegal, setIsValidatingLegal] = useState(true);

    const { isOpen, onOpen, onClose } = useDisclosure();

    const cardBg = useColorModeValue("white", "gray.700");
    const textColor = useColorModeValue("gray.600", "gray.400");
    const headerBg = useColorModeValue("gray.50", "gray.800");
    const tableBorder = useColorModeValue("gray.100", "gray.600");
    const brandColor = "orange.400"; 

    const isProvider = user.rol === 'proveedor';

    // 1️⃣ EFECTO PARA VALIDAR ESTADO LEGAL (CARTA VS ADENDA)
    useEffect(() => {
        async function checkLegalStatus() {
            setIsValidatingLegal(true);
            try {
                const hasContract = await userService.hasInitialContract(user.id);
                setHasInitialContract(hasContract);
            } catch (error) {
                console.error("Error validando contrato:", error);
                setHasInitialContract(false);
            } finally {
                setIsValidatingLegal(false);
            }
        }
        
        if (isProvider) checkLegalStatus();
    }, [user.id, isProvider]);

    // 2️⃣ EFECTO PARA CARGAR CURSOS
    useEffect(() => {
        async function loadAllCourses() {
            setIsLoadingCourses(true);
            try {
                const result = await courseService.getCoursesByUserId(user.id);
                setCourses(result.courses);
            } catch (error) {
                console.error("Error cargando cursos para revisión:", error);
            } finally {
                setIsLoadingCourses(false);
            }
        }
        loadAllCourses();
    }, [user.id]);

    const pendingLegalCourses = courses.filter(c => 
        c.estado_gestion === 'aprobado' && !c.documento_legal_id
    );

    const getStatusBadge = (status: string | undefined) => {
        switch (status) {
            case 'aprobado': return { color: "green", label: "Aprobado" };
            case 'abierto': return { color: "teal", label: "Abierto" };
            case 'rechazado': return { color: "red", label: "Rechazado" };
            case 'revision': return { color: "orange", label: "En Revisión" };
            default: return { color: "gray", label: status || "Pendiente" };
        }
    };

    // ✨ LÓGICA DE NOMBRES Y AVATAR APLICADA AQUÍ:
    const displayName = (isProvider && 'nombre_proveedor' in user)
        ? (user as FullProvider).nombre_proveedor 
        : `${user.nombres} ${user.apellidos}`;

    const avatarUrl = (user as any).provider_avatar_url 
        ?? (user as FullProvider).avatar_url 
        ?? `https://i.pravatar.cc/150?u=${user.id}`;

    return (
        <Box p={8} bg={cardBg} shadow="2xl" rounded="lg" maxW="3xl" mx="auto" borderTop="6px solid" borderColor={brandColor}>
            
            <HStack mb={4} justify="center">
                <Icon as={MdVerifiedUser} color={brandColor} />
                <Text fontSize="xs" fontWeight="bold" color={brandColor} textTransform="uppercase" letterSpacing="widest">
                    {mode}
                </Text>
            </HStack>

            <VStack spacing={4} align="center" mb={6}>
                {/* ✨ USAMOS LA VARIABLE avatarUrl AQUÍ */}
                <Avatar size="2xl" name={displayName as string} src={avatarUrl} border="4px solid" borderColor={brandColor} />
                
                <VStack spacing={1}>
                    <Heading size="lg" textAlign="center">{displayName as string}</Heading>
                    <Badge colorScheme="purple" variant="solid" px={3} rounded="full">
                        {isProvider ? 'PROVEEDOR' : 'USUARIO'}
                    </Badge>
                </VStack>

                {/* BOTÓN CON SKELETON MIENTRAS EL SERVICIO RESPONDE */}
                <Skeleton isLoaded={!isValidatingLegal} rounded="md">
                    <Button 
                        mt={4}
                        leftIcon={<MdCloudUpload />} 
                        colorScheme="orange" 
                        variant="solid"
                        onClick={onOpen}
                        isDisabled={pendingLegalCourses.length === 0}
                    >
                        Subir Documentación Legal
                    </Button>
                </Skeleton>

                {!isValidatingLegal && (
                    <HStack spacing={1} color="gray.400" fontSize="xs">
                        <Icon as={MdInfo} />
                        <Text>Trámite detectado: {hasInitialContract ? "Adenda" : "Registro Inicial"}</Text>
                    </HStack>
                )}
            </VStack>

            <Divider my={6} />

            <Box>
                <Heading size="sm" mb={4} color="gray.500" textAlign="left" letterSpacing="wider">
                    PROGRAMAS BAJO SUPERVISIÓN
                </Heading>
                
                {isLoadingCourses ? (
                    <Center py={10}><Spinner color={brandColor} size="xl" /></Center>
                ) : courses.length > 0 ? (
                    <TableContainer border="1px" borderColor={tableBorder} rounded="md">
                        <Table variant="simple" size="sm">
                            <Thead bg={headerBg}>
                                <Tr>
                                    <Th>ID</Th>
                                    <Th>Título del Programa</Th>
                                    <Th textAlign="center">Estado de Gestión</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {courses.map((course: Course) => {
                                    const statusInfo = getStatusBadge(course.estado_gestion);
                                    return (
                                        <Tr key={course.id}>
                                            <Td fontSize="xs" fontFamily="mono" color="gray.400">{course.id}</Td>
                                            <Td fontWeight="medium">
                                                <Text noOfLines={1}>{course.titulo}</Text>
                                            </Td>
                                            <Td textAlign="center">
                                                <Badge colorScheme={statusInfo.color} variant="subtle" px={2} rounded="md" fontSize="xs">
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
                    <Center py={4}><Text color={textColor} fontStyle="italic">No hay programas registrados.</Text></Center>
                )}
            </Box>

            {/* --- MODAL DE GESTIÓN LEGAL --- */}
            <Modal isOpen={isOpen} onClose={onClose} size="lg">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader fontSize="md">
                        {hasInitialContract ? "Gestión de Adenda Legal" : "Formalización: Carta de Intención"}
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={4} align="start">
                            <Box w="full" p={3} bg="orange.50" rounded="md" borderLeft="4px solid" borderColor="orange.400">
                                <Text fontSize="xs" fontWeight="bold" color="orange.800" mb={2} textTransform="uppercase">
                                    Cursos a amparar legalmente:
                                </Text>
                                <List spacing={1}>
                                    {pendingLegalCourses.map(c => (
                                        <ListItem key={c.id} fontSize="xs" color="orange.900">
                                            <ListIcon as={MdCheckCircle} color="orange.500" />
                                            {c.titulo}
                                        </ListItem>
                                    ))}
                                </List>
                            </Box>

                            <FormControl isRequired>
                                <FormLabel fontSize="sm" fontWeight="bold">
                                    {hasInitialContract ? "Archivo de Adenda (.pdf)" : "Carta de Intención (.pdf)"}
                                </FormLabel>
                                <Input type="file" p={1} accept=".pdf" />
                            </FormControl>

                            <FormControl isRequired={!hasInitialContract}>
                                <FormLabel fontSize="sm" fontWeight="bold">
                                    Carta de Compromiso {hasInitialContract && "(Opcional)"}
                                </FormLabel>
                                <Input type="file" p={1} accept=".pdf" />
                            </FormControl>
                            
                            <Text fontSize="xx-small" color="gray.500">
                                Nota: Al procesar esta carga, el sistema vinculará legalmente los cursos listados al expediente del proveedor.
                            </Text>
                        </VStack>
                    </ModalBody>

                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onClose} size="sm">Cancelar</Button>
                        <Button colorScheme="orange" size="sm">Procesar Documentación</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <Box mt={10} pt={4} borderTop="1px" borderColor={tableBorder}>
                <Text fontSize="xx-small" color="gray.400" textAlign="center" textTransform="uppercase">
                    Vista de Auditoría Académica - Sistema Central de Postgrado UCV
                </Text>
            </Box>
        </Box>
    );
}