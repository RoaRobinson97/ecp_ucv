"use client";

import React, { useState, useEffect } from "react";
import { 
    Box, Heading, Text, Avatar, VStack, useColorModeValue, Divider, 
    Table, Thead, Tbody, Tr, Th, Td, TableContainer, Badge,
    HStack, Icon, Spinner, Center, Button, useDisclosure,
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, 
    ModalBody, ModalCloseButton, FormControl, FormLabel, Input,
    List, ListItem, ListIcon, Skeleton, useToast, Tooltip
} from '@chakra-ui/react';
import { Course, User, FullProvider } from "@/data/types"; 
import { MdVerifiedUser, MdCloudUpload, MdCheckCircle, MdInfo, MdWarning, MdFileDownload, MdEmail, MdPhone } from 'react-icons/md'; 
import { courseService } from "@/servicios/cursos-service";
import { userService } from "@/servicios/users-service"; 

export function ProfileCoordinatorReview({ user, mode }: { user: User | FullProvider, mode: string }) {
    const [courses, setCourses] = useState<Course[]>([]);
    const [isLoadingCourses, setIsLoadingCourses] = useState(false);
    
    // ✨ ESTADO PARA HIDRATAR INFO DEL PROVEEDOR
    const [providerData, setProviderData] = useState<any>(null);

    // --- ESTADOS LEGALES ---
    const [hasInitialContract, setHasInitialContract] = useState<boolean | null>(null);
    const [isValidatingLegal, setIsValidatingLegal] = useState(true);

    const [file1, setFile1] = useState<File | null>(null);
    const [file2, setFile2] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { isOpen, onOpen, onClose } = useDisclosure();
    const toast = useToast();

    const cardBg = useColorModeValue("white", "gray.700");
    const textColor = useColorModeValue("gray.600", "gray.400");
    const headerBg = useColorModeValue("gray.50", "gray.800");
    const tableBorder = useColorModeValue("gray.100", "gray.600");
    const brandColor = "orange.400"; 

    const safeUser = user as any;
    const isProvider = safeUser.rol === 'proveedor' || safeUser.roles?.includes('proveedor') || 'nombre_proveedor' in safeUser;
    const safeUserId = safeUser.usuario_id || safeUser.id || safeUser.ID;

    // ✨ AUTO-HIDRATACIÓN: Buscamos la info completa del proveedor
    useEffect(() => {
        if (isProvider && safeUserId) {
            fetch(`http://localhost:8080/providers?usuario_id=${safeUserId}`)
                .then(r => r.json())
                .then(d => {
                    if (d && d.length > 0) setProviderData(d[0]);
                })
                .catch(e => console.error("Error hidratando proveedor:", e));
        }
    }, [isProvider, safeUserId]);

    // ✨ FUSIONAMOS LA DATA (Base + Proveedor)
    const combinedUser = { ...safeUser, ...providerData };
    const providerLegalStatus = combinedUser.legal_status || null;

    useEffect(() => {
        async function checkLegalStatus() {
            setIsValidatingLegal(true);
            try {
                const hasContract = await userService.hasInitialContract(safeUserId);
                setHasInitialContract(hasContract);
            } catch (error) {
                console.error("Error validando contrato:", error);
                setHasInitialContract(false);
            } finally {
                setIsValidatingLegal(false);
            }
        }
        if (isProvider && safeUserId) checkLegalStatus();
    }, [safeUserId, isProvider]);

    // ✨ AUTO-CARGA DE CURSOS DESDE AMBAS TABLAS
    useEffect(() => {
        async function loadAllCourses() {
            setIsLoadingCourses(true);
            try {
                // 1. Buscamos en ambas tablas del JSON-Server para no perder nada
                const [resCourses, resRequests] = await Promise.all([
                    fetch(`http://localhost:8080/courses?usuario_id=${safeUserId}`).then(r => r.ok ? r.json() : []),
                    fetch(`http://localhost:8080/course-requests?usuario_id=${safeUserId}`).then(r => r.ok ? r.json() : [])
                ]);
                
                let data = [...resCourses, ...resRequests];

                // 2. Filtramos por la facultad/coordinación a la que pertenece el proveedor
                if (providerData && providerData.coordinador_id) {
                    const miCoordId = String(providerData.coordinador_id);
                    data = data.filter((c: any) => 
                        String(c.coordinador_id) === miCoordId || 
                        String(c.coordinador_origen) === miCoordId
                    );
                }

                setCourses(data);
            } catch (error) {
                console.error("Error cargando cursos:", error);
                setCourses([]); 
            } finally {
                setIsLoadingCourses(false);
            }
        }
        
        // Esperamos a tener providerData para poder aplicar el filtro del coordinador
        if (safeUserId && providerData) loadAllCourses();
    }, [safeUserId, providerData]);

    // 3. ✨ FILTRO MAESTRO: Solo dejamos pasar los que ya fueron Aprobados
    const cursosAprobados = courses.filter((c: any) => {
        const estado = String(c.estado_gestion || c.estado).toLowerCase();
        return ['aprobada', 'aprobado', 'abierto', 'cerrado'].includes(estado);
    });

    // 4. ✨ SEPARACIÓN: Aprobados, pero sin documentos legales (Van a la Tabla 1)
    const cursosSinContrato = cursosAprobados.filter((c: any) => {
        const hasContract = !!(c.documento_legal_id || c.contrato_id);
        return !hasContract;
    });

    // 5. ✨ SEPARACIÓN: Aprobados, que ya tienen contrato vigente (Van a la Tabla 2)
    const cursosConContrato = cursosAprobados.filter((c: any) => {
        const hasContract = !!(c.documento_legal_id || c.contrato_id);
        return hasContract;
    });

    const getDownloadLinks = (course: any) => {
        const docId = course.documento_legal_id || course.contrato_id;
        if (!docId || !providerLegalStatus) return { intencion: null, compromiso: null };

        if (docId.startsWith('INTENCION')) {
            return {
                intencion: providerLegalStatus.carta_intencion_url,
                compromiso: providerLegalStatus.carta_compromiso_url
            };
        } else if (docId.startsWith('ADENDA')) {
            const adenda = providerLegalStatus.adendas?.find((a: any) => a.id_adenda === docId);
            return {
                intencion: adenda?.archivo_url,
                compromiso: adenda?.compromiso_url || null 
            };
        }
        return { intencion: null, compromiso: null };
    };

    const getStatusBadge = (status: string | undefined) => {
        switch (status) {
            case 'aprobado':
            case 'aprobada': return { color: "green", label: "Aprobado" };
            case 'abierto': return { color: "teal", label: "Abierto" };
            case 'cerrado': return { color: "blue", label: "Cerrado" };
            case 'rechazado':
            case 'rechazada': return { color: "red", label: "Rechazado" };
            case 'under_review':
            case 'revision': return { color: "orange", label: "En Revisión" };
            default: return { color: "gray", label: status || "Pendiente" };
        }
    };

    // ✨ VARIABLES BLINDADAS PARA RENDER
    const displayName = combinedUser.nombre_proveedor || combinedUser.nombre || 
        `${combinedUser.first_name || combinedUser.nombres || ''} ${combinedUser.last_name || combinedUser.apellidos || ''}`.trim() || 
        "Proveedor sin nombre";

    const rawAvatar = combinedUser.archivos?.logo || combinedUser.provider_avatar_url || combinedUser.avatar_url;
    const avatarUrl = rawAvatar || `https://i.pravatar.cc/150?u=${safeUserId}`;
    
    const bioText = combinedUser.biografia || "No hay biografía disponible.";
    const extraEmails = combinedUser.emails_contacto || [];
    const extraPhones = combinedUser.telefonos_contacto || [];
    const tipoLucro = combinedUser.tipo_lucro || combinedUser.tipo_proveedor;

    const handleProcessLegal = async () => {
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('hasInitialContract', String(hasInitialContract));
            
            const cursosIds = cursosSinContrato.map(c => c.id).join(',');
            formData.append('cursos_amparados', cursosIds);

            if (!hasInitialContract) {
                if (!file1 || !file2) throw new Error("Debes adjuntar la Carta de Intención y la de Compromiso.");
                formData.append('carta_intencion', file1);
                formData.append('carta_compromiso', file2);
            } else {
                if (!file1) throw new Error("Debes adjuntar la Adenda.");
                formData.append('adenda', file1);
                if (file2) formData.append('carta_compromiso_adenda', file2); 
            }

            const res = await fetch(`/api/legal-status/${safeUserId}`, {
                method: 'POST',
                body: formData
            });

            if (!res.ok) throw new Error("Fallo al procesar la documentación en el servidor.");

            toast({ 
                title: "Amparo legal registrado", 
                description: "Los cursos han sido formalizados exitosamente.",
                status: "success", 
                duration: 4000, 
                isClosable: true 
            });
            
            onClose();
            window.location.reload(); 
            
        } catch (error: any) {
            toast({ title: "Error", description: error.message, status: "error", duration: 5000, isClosable: true });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Box p={8} bg={cardBg} shadow="2xl" rounded="lg" maxW="3xl" mx="auto" borderTop="6px solid" borderColor={brandColor}>
            
            <HStack mb={4} justify="center">
                <Icon as={MdVerifiedUser} color={brandColor} />
                <Text fontSize="xs" fontWeight="bold" color={brandColor} textTransform="uppercase" letterSpacing="widest">
                    {mode}
                </Text>
            </HStack>

            <VStack spacing={4} align="center" mb={6}>
                <Avatar size="2xl" name={displayName as string} src={avatarUrl} border="4px solid" borderColor={brandColor} />
                
                <VStack spacing={1}>
                    <Heading size="lg" textAlign="center">{displayName as string}</Heading>
                    
                    <HStack spacing={2}>
                        <Badge colorScheme="purple" variant="solid" px={3} rounded="full">
                            {isProvider ? 'PROVEEDOR' : 'USUARIO'}
                        </Badge>
                        {isProvider && tipoLucro && (
                            <Badge colorScheme="orange" variant="subtle" px={3} rounded="full" textTransform="uppercase">
                                {String(tipoLucro).replace(/_/g, ' ').replace(/-/g, ' ')}
                            </Badge>
                        )}
                    </HStack>
                </VStack>

                {/* ✨ NUEVO: Muestra Biografía y Contactos al Coordinador */}
                <Box textAlign="center" maxW="md" pt={2}>
                    <Text fontSize="sm" color={textColor} fontStyle="italic">
                        {bioText}
                    </Text>
                </Box>

                <VStack spacing={1} pt={2} w="full" align="center">
                    <HStack spacing={2} fontSize="xs" color="orange.500" fontWeight="bold">
                        <Icon as={MdEmail} />
                        <Text>{combinedUser.email}</Text>
                    </HStack>

                    {extraEmails?.map((email: string) => (
                        <HStack key={email} spacing={2} fontSize="xs" color={textColor}>
                            <Icon as={MdEmail} opacity={0.6} />
                            <Text>{email}</Text>
                        </HStack>
                    ))}

                    {extraPhones?.map((phone: string) => (
                        <HStack key={phone} spacing={2} fontSize="xs" color={textColor}>
                            <Icon as={MdPhone} color="green.500" />
                            <Text>{phone}</Text>
                        </HStack>
                    ))}
                </VStack>

                <Skeleton isLoaded={!isValidatingLegal} rounded="md">
                    <Button 
                        mt={4}
                        leftIcon={<MdCloudUpload />} 
                        colorScheme="orange" 
                        variant="solid"
                        onClick={onOpen}
                        isDisabled={cursosSinContrato.length === 0}
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

            {/* TABLA 1: CURSOS SIN CONTRATO */}
            <Box mb={8}>
                <HStack mb={4}>
                    <Icon as={MdWarning} color="orange.500" />
                    <Heading size="sm" color="orange.600" textAlign="left" letterSpacing="wider" textTransform="uppercase">
                        Aprobados sin Amparo Legal
                    </Heading>
                </HStack>
                
                {isLoadingCourses ? (
                    <Center py={4}><Spinner color={brandColor} size="md" /></Center>
                ) : cursosSinContrato.length > 0 ? (
                    <TableContainer border="1px" borderColor="orange.200" rounded="md">
                        <Table variant="simple" size="sm">
                            <Thead bg="orange.50">
                                <Tr>
                                    <Th>ID</Th>
                                    <Th>Título del Programa</Th>
                                    <Th textAlign="center">Estado</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {cursosSinContrato.map((course: any) => {
                                    const statusInfo = getStatusBadge(course.estado_gestion || course.estado);
                                    return (
                                        <Tr key={course.id}>
                                            <Td fontSize="xs" fontFamily="mono" color="gray.500">{course.id}</Td>
                                            <Td fontWeight="medium">
                                                <Text noOfLines={1}>{course.titulo || course.nombre}</Text>
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
                    <Center py={4} bg="gray.50" rounded="md" border="1px dashed" borderColor="gray.200">
                        <Text color={textColor} fontSize="sm">Todos los cursos aprobados tienen su documentación legal al día.</Text>
                    </Center>
                )}
            </Box>

            {/* TABLA 2: CURSOS CON CONTRATO (VIGENTES) */}
            <Box>
                <HStack mb={4}>
                    <Icon as={MdCheckCircle} color="blue.500" />
                    <Heading size="sm" color="blue.600" textAlign="left" letterSpacing="wider" textTransform="uppercase">
                        Programas Amparados en Vigencia
                    </Heading>
                </HStack>
                
                {isLoadingCourses ? (
                    <Center py={4}><Spinner color="blue.400" size="md" /></Center>
                ) : cursosConContrato.length > 0 ? (
                    <TableContainer border="1px" borderColor={tableBorder} rounded="md">
                        <Table variant="simple" size="sm">
                            <Thead bg={headerBg}>
                                <Tr>
                                    <Th>ID</Th>
                                    <Th>Título del Programa</Th>
                                    <Th textAlign="center">Estado</Th>
                                    <Th textAlign="center">Documentos Legales</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {cursosConContrato.map((course: any) => {
                                    const statusInfo = getStatusBadge(course.estado_gestion || course.estado);
                                    const links = getDownloadLinks(course);

                                    return (
                                        <Tr key={course.id}>
                                            <Td fontSize="xs" fontFamily="mono" color="gray.400">{course.id}</Td>
                                            <Td fontWeight="medium">
                                                <Text noOfLines={1}>{course.titulo || course.nombre}</Text>
                                            </Td>
                                            <Td textAlign="center">
                                                <Badge colorScheme={statusInfo.color} variant="solid" px={2} rounded="md" fontSize="xs">
                                                    {statusInfo.label}
                                                </Badge>
                                            </Td>
                                            <Td textAlign="center">
                                                <HStack justify="center" spacing={2}>
                                                    {links.intencion ? (
                                                        <Tooltip label={hasInitialContract ? "Descargar Adenda" : "Descargar Carta de Intención"}>
                                                            <Button as="a" href={links.intencion} target="_blank" size="xs" colorScheme="orange" variant="outline">
                                                                <Icon as={MdFileDownload} mr={1} /> {hasInitialContract && (course.documento_legal_id || course.contrato_id).startsWith('ADENDA') ? 'Adenda' : 'Intención'}
                                                            </Button>
                                                        </Tooltip>
                                                    ) : (
                                                        <Text fontSize="xs" color="gray.400">-</Text>
                                                    )}

                                                    {links.compromiso && (
                                                        <Tooltip label="Descargar Carta de Compromiso">
                                                            <Button as="a" href={links.compromiso} target="_blank" size="xs" colorScheme="blue" variant="outline">
                                                                <Icon as={MdFileDownload} mr={1} /> Compromiso
                                                            </Button>
                                                        </Tooltip>
                                                    )}
                                                </HStack>
                                            </Td>
                                        </Tr>
                                    );
                                })}
                            </Tbody>
                        </Table>
                    </TableContainer>
                ) : (
                    <Center py={4} bg="gray.50" rounded="md" border="1px dashed" borderColor="gray.200">
                        <Text color={textColor} fontSize="sm">No hay programas en vigencia legal todavía.</Text>
                    </Center>
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
                                    {cursosSinContrato.map((c: any) => (
                                        <ListItem key={c.id} fontSize="xs" color="orange.900">
                                            <ListIcon as={MdCheckCircle} color="orange.500" />
                                            {c.titulo || c.nombre}
                                        </ListItem>
                                    ))}
                                </List>
                            </Box>

                            <FormControl isRequired>
                                <FormLabel fontSize="sm" fontWeight="bold">
                                    {hasInitialContract ? "Archivo de Adenda (.pdf)" : "Carta de Intención (.pdf)"}
                                </FormLabel>
                                <Input type="file" p={1} accept=".pdf" onChange={(e) => setFile1(e.target.files?.[0] || null)} />
                            </FormControl>

                            <FormControl isRequired={!hasInitialContract}>
                                <FormLabel fontSize="sm" fontWeight="bold">
                                    Carta de Compromiso {hasInitialContract && "(Opcional para Adenda)"}
                                </FormLabel>
                                <Input type="file" p={1} accept=".pdf" onChange={(e) => setFile2(e.target.files?.[0] || null)} />
                            </FormControl>
                            
                            <Text fontSize="xx-small" color="gray.500">
                                Nota: Al procesar esta carga, el sistema vinculará legalmente los cursos listados al expediente del proveedor.
                            </Text>
                        </VStack>
                    </ModalBody>

                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onClose} size="sm" isDisabled={isSubmitting}>Cancelar</Button>
                        <Button 
                            colorScheme="orange" 
                            size="sm" 
                            onClick={handleProcessLegal} 
                            isLoading={isSubmitting}
                        >
                            Procesar Documentación
                        </Button>
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