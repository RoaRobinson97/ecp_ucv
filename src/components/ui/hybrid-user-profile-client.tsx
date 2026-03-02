"use client";

import React from "react";
import { useAuth } from "@/app/context/auth-context"; 
import { User, FullProvider } from "@/data/types";
import { ProfileOwnerView } from "@/components/ui/profile-owner-view";
import { ProfileCoordinatorReview } from "@/components/ui/profile-coordinator-review";
import { UserProfileClient } from "@/components/ui/user-profile";
import { Flex, Spinner, Text } from "@chakra-ui/react";

export function HybridUserProfileClient({ targetUser }: { targetUser: User | FullProvider }) {
    const { user, isHydrated } = useAuth();

    if (!isHydrated) {
        return (
            <Flex justify="center" align="center" py={20}>
                <Spinner color="teal.500" />
                <Text ml={4}>Cargando entorno...</Text>
            </Flex>
        );
    }

    const isViewingOwnProfile = user?.id === targetUser.id;
    const isTargetProveedor = targetUser.rol === "proveedor";
    const isViewerAdminOrCoord = user?.rol === "admin" || user?.rol === "coordinador";

    // Lógica de visualización dinámica (Fallbacks)
    const avatarUrl = (targetUser as FullProvider).avatarUrl ?? `https://i.pravatar.cc/150?u=${targetUser.id}`;
    const bio = (targetUser as FullProvider).biografia ?? "Este usuario no tiene biografía.";
    const displayName = (targetUser as FullProvider).nombre_proveedor ?? `${targetUser.nombres} ${targetUser.apellidos}`;

    // --- ESCENARIO 1: EL DUEÑO (Vista Privada) ---
    if (isViewingOwnProfile) {
        return (
            <ProfileOwnerView 
                user={targetUser} 
                mode={isTargetProveedor ? "Panel de Proveedor" : "Mi Cuenta"} 
            />
        );
    }

    // --- ESCENARIO 2: ADMIN/COORD REVISANDO A UN PROVEEDOR ---
    if (isViewerAdminOrCoord && isTargetProveedor) {
        return (
            <ProfileCoordinatorReview 
                user={targetUser} 
                mode={`Gestión: ${user?.rol?.toUpperCase()}`} 
            />
        );
    }

    // --- ESCENARIO 3: VISTA PÚBLICA (Cualquier otro caso) ---
    return (
        <UserProfileClient 
          user={targetUser}
        />
    );
}