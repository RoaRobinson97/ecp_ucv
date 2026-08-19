"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/app/context/auth-context"; 
import { User, FullProvider } from "@/data/types";
import { ProfileOwnerView } from "@/components/ui/profile-owner-view";
import { ProfileCoordinatorReview } from "@/components/ui/profile-coordinator-review";
import { UserProfileClient } from "@/components/ui/user-profile";
import { Flex, Spinner, Text } from "@chakra-ui/react";

export function HybridUserProfileClient({ targetUser }: { targetUser: User | FullProvider }) {
    const { user, isHydrated } = useAuth();
    
    // ✨ Estado para atrapar el ID del coordinador cruzando tablas si es necesario
    const [realCoordinadorId, setRealCoordinadorId] = useState<string>(
        String((targetUser as any).coordinador_id || "")
    );
    const [isCheckingAccess, setIsCheckingAccess] = useState(true);

    const currentUserId = String(user?.id || ""); 
    const targetUserId = String(targetUser.id || "");
    const userRole = user?.rol || '';
    const userRolesList = user?.roles || [];
    
    const isAdmin = ['admin'].includes(userRole) || userRolesList.some((r: string) => ['deu_admin', 'admin'].includes(r));
    const isCoordinador = ['coordinador'].includes(userRole) || userRolesList.some((r: string) => ['coordinador'].includes(r));

    const isViewingOwnProfile = currentUserId === targetUserId;
    const isTargetProveedor = targetUser.rol === "proveedor" || targetUser.roles?.includes("proveedor");

    // ✨ EFECTO DE BÚSQUEDA CRUZADA (Caza el ID del coordinador si no vino en el perfil)
    useEffect(() => {
        async function fetchCoordinadorId() {
            if (isCoordinador && isTargetProveedor && !realCoordinadorId) {
                try {
                    const res = await fetch(`http://localhost:8080/providers?usuario_id=${targetUserId}`);
                    const data = await res.json();
                    if (data && data.length > 0) {
                        setRealCoordinadorId(String(data[0].coordinador_id));
                    }
                } catch (e) {
                    console.error("Fallo al buscar el coordinador_id en providers", e);
                }
            }
            setIsCheckingAccess(false);
        }
        
        if (!isViewingOwnProfile) {
            fetchCoordinadorId();
        } else {
            setIsCheckingAccess(false);
        }
    }, [isCoordinador, isTargetProveedor, targetUserId, realCoordinadorId, isViewingOwnProfile]);

    if (!isHydrated || isCheckingAccess) {
        return (
            <Flex justify="center" align="center" py={20}>
                <Spinner color="teal.500" />
                <Text ml={4}>Verificando credenciales de acceso...</Text>
            </Flex>
        );
    }

    const isMyProvider = isCoordinador && realCoordinadorId === currentUserId;
    const isViewerAuthorizedAdminOrCoord = isAdmin || isMyProvider;

    // ✨ EL CONSOLA DE RASTREO QUE PEDISTE
    console.log("=== 🕵️‍♂️ DEBUG DE RUTEO DE PERFIL ===");
    console.log("Usuario Logueado (Tú):", currentUserId, "| Rol:", userRole);
    console.log("Usuario Destino:", targetUserId, "| Es Proveedor?", isTargetProveedor);
    console.log("Coordinador del Destino es:", realCoordinadorId);
    console.log("¿Soy su Coordinador?", isMyProvider);
    
    // ✨ LÓGICA DE RENDERIZADO ESTRICTA ✨

    // Caso A: Eres el dueño del perfil
    if (isViewingOwnProfile) {
        console.log("👉 DECISIÓN: Dirigiendo al Caso A (ProfileOwnerView)");
        return (
            <ProfileOwnerView 
                user={targetUser} 
                mode={isTargetProveedor ? "Panel de Proveedor" : "Mi Cuenta"} 
            />
        );
    }

    // Caso B: Eres un Coordinador/Admin revisando a un Proveedor
    if (isViewerAuthorizedAdminOrCoord && isTargetProveedor) {
        console.log("👉 DECISIÓN: Dirigiendo al Caso B (ProfileCoordinatorReview)");
        return (
            <ProfileCoordinatorReview 
                user={targetUser} 
                mode={isAdmin ? "Gestión: ADMIN" : "Gestión: COORDINACIÓN ORIGEN"} 
            />
        );
    }

    // Caso C: Cualquier otro escenario (Visitantes)
    console.log("👉 DECISIÓN: Dirigiendo al Caso C (UserProfileClient - Público)");
    return (
        <UserProfileClient 
          user={targetUser}
        />
    );
}