// components/layout/Navbar.tsx
"use client";

import {
    Box,
    Flex,
    Heading,
    Spacer,
    useColorModeValue,
    HStack,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    IconButton,
    Image,
} from "@chakra-ui/react";
import React from "react";
import NextLink from 'next/link';
import { FaUserCircle } from "react-icons/fa";
// Import User type if needed, AuthUser likely covers it if User is exported from auth-context
import { useAuth, AuthUser } from "../../app/context/auth-context";
import { useGlobalData } from "../../app/context/global-data-context";
import { ColorModeSwitcher } from "../ui/color-mode-switcher";
import {
    PrimaryButton,
    SecondaryButton,
    GhostButton, // Added GhostButton for "Mis Cursos" example
} from "../ui/buttons";

export const Navbar = () => {
    const { isAuthenticated, logout, user, isHydrated } = useAuth();
    console.log(user)
    // Assuming providerCode is now primarily derived from 'user' object in authContext
    const { courses, isCohortOpen } = useGlobalData();

    const menuButtonColor = useColorModeValue("primary.500", "whiteAlpha.900");

    // Get providerCode directly from the authenticated user object
    const providerCode = user?.codigo_proveedor;

    // Visibility conditions for buttons
    const showFormulateButton = isAuthenticated && providerCode && courses.length === 0;
    const showCohortButton = !isCohortOpen && isAuthenticated && providerCode && courses.length > 0;
    const showLoginRegisterButtons = !isAuthenticated;
    const showSolicitudButton = isAuthenticated && !providerCode && user?.rol === 'visitante';
    console.log(isAuthenticated, providerCode, user?.rol)
    const showAdminPanelLink = isAuthenticated && (user?.rol === 'admin' || user?.rol === 'coordinador');
    (console.log(user))
    // Condition for the "Mis Cursos" button
    const showMisCursosButton = isAuthenticated && !!providerCode;

    const courseId = courses.length > 0 ? courses[0].id : null;

    return (
        <Box bg={"navbar"} px={{ base: 4, md: 8 }} py={3} shadow="md">
            <Flex alignItems="center" maxW="container.xl" mx="auto">
                <NextLink href="/" passHref>
                    <Flex alignItems="center" gap={{base: 2, md: 4}} cursor="pointer">
                        <Image
                            src="/logo.png"
                            alt="Logo de la aplicación"
                            width={{ base: "40px", md: "50px" }}
                            height="auto"
                        />
                        <Heading size={{ base: "md", md: "lg" }} color={useColorModeValue("primary.500", "primary.300")}>
                            Educación Continua y Permanente
                        </Heading>
                    </Flex>
                </NextLink>
                <Spacer />
                <HStack spacing={{ base: 2, md: 4 }}>
                    {/* === Authenticated User View === */}
                    {isHydrated && isAuthenticated ? (
                        <>
                            {/* --- Provider Specific Buttons --- */}
                            {providerCode && (
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
                            {/* --- Visitor Specific Button --- */}
                            {showSolicitudButton && (
                                <NextLink href="/solicitar-organizacion" passHref>
                                    <PrimaryButton size={"sm"}>Solicitar Inscripción</PrimaryButton>
                                </NextLink>
                            )}

                            {/* --- NEW "Mis Cursos" Button for Providers --- */}
                            {showMisCursosButton && user?.id && ( // Aseguramos que user.id exista
                                <NextLink href={`/mis-cursos?providerCode=${user.codigo_proveedor}`} passHref> 
                                    <GhostButton size={"md"}>Mis Cursos</GhostButton> 
                                </NextLink>
                            )}

                            {/* --- User Menu --- */}
                            <Menu>
                                <MenuButton as={IconButton} aria-label="Opciones de usuario" icon={<FaUserCircle size="24px" />} variant="ghost" color={menuButtonColor} />
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
                        /* === Unauthenticated User View === */
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
                    {/* --- Always Visible --- */}
                    <ColorModeSwitcher />
                </HStack>
            </Flex>
        </Box>
    );
};