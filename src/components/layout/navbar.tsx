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
import { useAuth } from "../../app/context/auth-context";
import { useGlobalData } from "../../app/context/global-data-context";
import { ColorModeSwitcher } from "../ui/color-mode-switcher";
import { 
    PrimaryButton, 
    GhostButton,
    SecondaryButton, 
} from "../ui/buttons";

export const Navbar = () => {
    const { isAuthenticated, logout, userId, isHydrated, userRole } = useAuth(); // ¡Añade userRole aquí!
    const { providerCode, courses, isCohortOpen } = useGlobalData();

    const navBgColor = useColorModeValue("white", "gray.800");
    const menuButtonColor = useColorModeValue("primary.500", "whiteAlpha.900");

    const showFormulateButton = isAuthenticated && providerCode && courses.length === 0;
    const showCohortButton = !isCohortOpen && isAuthenticated && providerCode && courses.length > 0;
    const showLoginRegisterButtons = !isAuthenticated;
    const showSolicitudButton = isAuthenticated && !providerCode;
    const showAdminButton = isAuthenticated && userRole === 'admin'; // Nueva variable para el botón de admin

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
                    {isHydrated && isAuthenticated ? (
                        <>
                            {providerCode && (
                                <HStack spacing={{ base: 2, md: 4 }}>
                                    {showFormulateButton && (
                                        <NextLink href="/formulacion-de-curso" passHref>
                                            <PrimaryButton>Formular Curso</PrimaryButton>
                                        </NextLink>
                                    )}
                                    {showCohortButton && (
                                        <NextLink href={`/curso/${courseId}`} passHref>
                                            <PrimaryButton>Abrir Cohorte</PrimaryButton>
                                        </NextLink>
                                    )}
                                    {isCohortOpen && (
                                        <NextLink href={`/curso/${courseId}`} passHref>
                                            <PrimaryButton>Cerrar Cohorte</PrimaryButton>
                                        </NextLink>
                                    )}
                                </HStack>
                            )}
                            {showSolicitudButton && (
                                <NextLink href="/solicitar-organizacion" passHref>
                                    <PrimaryButton>Solicitar Inscripción de Organización</PrimaryButton>
                                </NextLink>
                            )}

                            <Menu>
                                <MenuButton as={IconButton} aria-label="Opciones de usuario" icon={<FaUserCircle size="24px" />} variant="ghost" color={menuButtonColor} />
                                <MenuList>
                                    <MenuItem as={NextLink} href={`/profile/${userId}`}>
                                        Mi Perfil
                                    </MenuItem>
                                    {/* También puedes agregar el enlace de admin aquí para más opciones */}
                                    {true && (
                                        <MenuItem as={NextLink} href="/admin">
                                            Panel de Administración
                                        </MenuItem>
                                    )}
                                    <MenuItem onClick={logout}>
                                        Cerrar Sesión
                                    </MenuItem>
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