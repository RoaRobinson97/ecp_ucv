// components/layout/Navbar.tsx
"use client";

import {
    Box,
    Flex,
    Heading,
    Spacer,
    HStack,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    IconButton,
    Image,
    Tooltip,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button,
    useDisclosure,
    Text,
    VStack,
    Badge,
    useColorModeValue,
} from "@chakra-ui/react";
import React, { useState, useEffect } from "react";
import NextLink from 'next/link';
import { FaUserCircle } from "react-icons/fa";
import { useAuth } from "../../app/context/auth-context";
import { useGlobalData } from "../../app/context/global-data-context";
import { ColorModeSwitcher } from "../ui/color-mode-switcher";
import {
    PrimaryButton,
    SecondaryButton,
} from "../ui/buttons";

export const Navbar = () => {
    const { isAuthenticated, logout, user, isHydrated } = useAuth();
    const { courses, isCohortOpen } = useGlobalData();
    const { isOpen, onOpen, onClose } = useDisclosure();

    const [hasPendingRequest, setHasPendingRequest] = useState(false);

    const codigo_proveedor = user?.codigo_proveedor;
    const safeUserId = user?.id || (user as any)?.userID || (user as any)?.sub;

    const userRoles = user?.roles || user?.Roles || [];

    const isAdmin = isAuthenticated && (
        (userRoles as string[]).includes('deu_admin') || 
        (userRoles as string[]).includes('admin') || 
        (userRoles as string[]).includes('course_admin') || 
        (userRoles as string[]).includes('coordinador')
    );

    const showFormulateButton = isAuthenticated && !!codigo_proveedor && courses.length === 0 && !isAdmin;
    const showCohortButton = !isCohortOpen && isAuthenticated && !!codigo_proveedor && courses.length > 0 && !isAdmin;
    
    const showLoginRegisterButtons = !isAuthenticated;
    const showSolicitudButton = isAuthenticated && !codigo_proveedor && (userRoles as string[]).includes('visitante');
    const showAdminPanelLink = isAdmin;

    const courseId = courses.length > 0 ? courses[0].id : null;

    // ✨ COLORES DINÁMICOS PARA EL MODAL (MODO CLARO / OSCURO)
    const modalBg = useColorModeValue("white", "gray.800");
    const modalBoxBg = useColorModeValue("gray.50", "whiteAlpha.100");
    const modalBoxBorder = useColorModeValue("gray.200", "whiteAlpha.200");
    const modalTextColor = useColorModeValue("gray.700", "gray.200");
    const warningColor = useColorModeValue("red.600", "red.300");

    useEffect(() => {
        if (showSolicitudButton && safeUserId) {
            fetch(`http://127.0.0.1:8080/providers?usuario_id=${safeUserId}`)
                .then(res => res.json())
                .then(data => {
                    if (data && data.length > 0) {
                        const isPending = data.some((req: any) => 
                            req.estado === 'under_review' || req.estado === 'pendiente'
                        );
                        setHasPendingRequest(isPending);
                    }
                })
                .catch(e => console.error("Error al verificar solicitud pendiente:", e));
        }
    }, [showSolicitudButton, safeUserId]);

    return (
        <Box bg="navbar" px={{ base: 4, md: 8 }} py={3} shadow="md">
            <Flex alignItems="center" maxW="container.xl" mx="auto">
                <NextLink href="/" passHref>
                    <Flex alignItems="center" gap={{base: 2, md: 4}} cursor="pointer">
                        <Image
                            src="/logo.png"
                            alt="Logo de la aplicación"
                            width={{ base: "40px", md: "50px" }}
                            height="auto"
                        />
                        <Heading 
                            as="h1" 
                            size={{ base: "sm", md: "md" }} 
                            color="whiteAlpha.900"
                            fontWeight="extrabold"
                            letterSpacing="tight"
                            lineHeight="1.2"
                            textTransform="uppercase"
                            fontSize={{ base: "14px", md: "18px" }}
                        >
                            Educación Continua <br /> y Permanente
                        </Heading>
                    </Flex>
                </NextLink>
                <Spacer />
                <HStack spacing={{ base: 2, md: 4 }}>
                    
                    {/* Botón Informativo siempre visible para Visitantes */}
                    {isHydrated && (!isAuthenticated || showSolicitudButton) && (
                        <Button 
                            variant="ghost" 
                            color="whiteAlpha.900" 
                            size="sm" 
                            onClick={onOpen}
                            fontWeight="medium"
                            _hover={{ bg: 'whiteAlpha.200' }}
                        >
                            ¿Cómo ser Aliado?
                        </Button>
                    )}

                    {isHydrated && isAuthenticated ? (
                        <>
                            {codigo_proveedor && (
                                <HStack spacing={{ base: 2, md: 4 }}>
                                    {showFormulateButton && (
                                        <NextLink href="/formulacion-de-curso" passHref>
                                            <PrimaryButton size={"sm"}>Formular Curso</PrimaryButton>
                                        </NextLink>
                                    )}
                                    {showCohortButton && (
                                        <NextLink href={`/curso/${courseId}`} passHref>
                                            <PrimaryButton size={"sm"}>Abrir Cohorte</PrimaryButton>
                                        </NextLink>
                                    )}
                                    {isCohortOpen && (
                                        <NextLink href={`/curso/${courseId}`} passHref>
                                            <PrimaryButton size={"sm"}>Cerrar Cohorte</PrimaryButton>
                                        </NextLink>
                                    )}
                                </HStack>
                            )}

                            {showSolicitudButton && (
                                hasPendingRequest ? (
                                    <Tooltip label="Solicitud en revisión" hasArrow placement="bottom">
                                        <Box display="inline-block" cursor="not-allowed">
                                            <PrimaryButton size={"sm"} isDisabled style={{ pointerEvents: 'none' }}>
                                                Solicitar Alianza
                                            </PrimaryButton>
                                        </Box>
                                    </Tooltip>
                                ) : (
                                    <NextLink href="/solicitar-organizacion" passHref>
                                        <PrimaryButton size={"sm"}>Solicitar Alianza</PrimaryButton>
                                    </NextLink>
                                )
                            )}

                            <Menu>
                                <MenuButton as={IconButton} aria-label="Opciones de usuario" icon={<FaUserCircle size="24px" />} variant="ghost" color="whiteAlpha.900" _hover={{ bg: 'whiteAlpha.200' }} />
                                <MenuList>
                                    <MenuItem as={NextLink} href={`/profile/${user?.id}`}>Mi Perfil</MenuItem>
                                    {showAdminPanelLink && (
                                        <MenuItem as={NextLink} href="/admin">Panel de Administración</MenuItem>
                                    )}
                                    <MenuItem onClick={logout}>Cerrar Sesión</MenuItem>
                                </MenuList>
                            </Menu>
                        </>
                    ) : (
                        isHydrated && showLoginRegisterButtons && (
                            <>
                                <NextLink href="/login" passHref>
                                    <PrimaryButton size={"md"}>Iniciar Sesión</PrimaryButton>
                                </NextLink>
                                <NextLink href="/registro" passHref>
                                    <SecondaryButton size={"md"}>Crear Cuenta</SecondaryButton>
                                </NextLink>
                            </>
                        )
                    )}
                    <ColorModeSwitcher />
                </HStack>
            </Flex>

            {/* MODAL INCRUSTADO */}
            <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
                <ModalOverlay backdropFilter="blur(3px)" />
                <ModalContent bg={modalBg}>
                    <ModalHeader color={useColorModeValue("teal.600", "teal.300")}>Requisitos para Alianzas Académicas</ModalHeader>
                    <ModalCloseButton />
                    
                    <ModalBody>
                        <VStack align="stretch" spacing={4}>
                            <Text fontSize="sm" color={modalTextColor}>
                                Para postularte como aliado académico de la Dirección de Extensión Universitaria (DEU), debes tener preparados los siguientes documentos. 
                                <br/><br/>
                                <b>Importante:</b> Todos los archivos deben estar estrictamente en formato <b>PDF</b>.
                            </Text>

                            <Box p={4} bg={modalBoxBg} rounded="md" borderWidth="1px" borderColor={modalBoxBorder}>
                                <Badge colorScheme="teal" variant="solid" mb={3} px={2} py={1} rounded="md">Persona Natural</Badge>
                                <VStack align="start" spacing={2} fontSize="sm" color={modalTextColor}>
                                    <HStack><Text opacity={0.8}>📄</Text><Text>Cédula de Identidad</Text></HStack>
                                    <HStack><Text opacity={0.8}>📄</Text><Text>Registro de Información Fiscal (RIF)</Text></HStack>
                                    <HStack><Text opacity={0.8}>📄</Text><Text>Última Declaración de ISLR</Text></HStack>
                                    <HStack><Text opacity={0.8}>📄</Text><Text>Resumen Curricular (Actualizado)</Text></HStack>
                                    <HStack><Text opacity={0.8}>📄</Text><Text>Fondo Negro del Título Universitario</Text></HStack>
                                </VStack>
                            </Box>

                            <Box p={4} bg={modalBoxBg} rounded="md" borderWidth="1px" borderColor={modalBoxBorder}>
                                <Badge colorScheme="gray" variant="solid" mb={2} px={2} py={1} rounded="md">Persona Jurídica (Empresas)</Badge>
                                <Text fontSize="xs" color={useColorModeValue("gray.500", "gray.400")} mb={3}>
                                    Adicional a los documentos del representante legal, se requiere:
                                </Text>
                                <VStack align="start" spacing={2} fontSize="sm" color={modalTextColor}>
                                    <HStack><Text opacity={0.8}>📄</Text><Text>Registro Mercantil o Acta Constitutiva</Text></HStack>
                                </VStack>
                            </Box>

                            {!isAuthenticated && (
                                <Text fontSize="sm" color={warningColor} textAlign="center" mt={2} fontWeight="semibold">
                                    * Debes iniciar sesión o registrarte primero para poder postularte.
                                </Text>
                            )}

                        </VStack>
                    </ModalBody>

                    <ModalFooter display="flex" justifyContent="space-between">
                        <Button variant="ghost" onClick={onClose}>
                            Cerrar
                        </Button>
                        
                        {isAuthenticated ? (
                            <NextLink href="/solicitar-organizacion" passHref>
                                <Button colorScheme="teal" onClick={onClose}>
                                    Ir al formulario de solicitud
                                </Button>
                            </NextLink>
                        ) : (
                            <NextLink href="/login" passHref>
                                <Button colorScheme="teal" onClick={onClose}>
                                    Iniciar sesión para postularse
                                </Button>
                            </NextLink>
                        )}
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
};