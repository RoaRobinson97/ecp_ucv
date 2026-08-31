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
    GhostButton, 
} from "../ui/buttons";

export const Navbar = () => {
    const { isAuthenticated, logout, user, isHydrated } = useAuth();
    const { courses, isCohortOpen } = useGlobalData();

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
                        {/* ✨ CORRECCIÓN VISUAL: Jerarquía institucional, ajuste de espaciado y grosor */}
                        <Heading 
                            as="h1" 
                            size={{ base: "sm", md: "md" }} 
                            color="whiteAlpha.900"
                            fontWeight="extrabold"
                            letterSpacing="tight"
                            lineHeight="1.2"
                            textTransform="uppercase"
                            fontSize={{ base: "14px", md: "18px" }} // Forzamos un tamaño exacto y elegante
                        >
                            Educación Continua <br /> y Permanente
                        </Heading>
                    </Flex>
                </NextLink>
                <Spacer />
                <HStack spacing={{ base: 2, md: 4 }}>
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
                                {/* ✨ CORRECCIÓN VISUAL: Ícono blanco fijo */}
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
        </Box>
    );
};