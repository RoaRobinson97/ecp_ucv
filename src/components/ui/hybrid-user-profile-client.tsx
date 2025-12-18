"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/app/context/auth-context"; 
import { User, Course } from "@/data/types"
import { UserProfileClient } from "@/components/ui/user-profile";
import { ProfileOwnerView } from "@/components/ui/profile-owner-view";
import { ProfileCoordinatorReview } from "@/components/ui/profile-coordinator-review";
import { courseService } from "@/servicios/cursos-service";
// ❌ import { umask } from "process"; // Eliminado: Esto no se usa en el cliente (navegador)

// Ajustamos el tipo de 'targetUser' para que sea el objeto User completo
export function HybridUserProfileClient({ targetUser }: { targetUser: User }) {
  const { user, isHydrated } = useAuth();

  const [courses, setCourses] = useState<Course[] | null>(null);

  const isViewingOwnProfile = user?.id === targetUser.id;
  const isTargetProveedor = targetUser.role === "proveedor";
  const isViewerAdminOrCoord = user?.role === "admin" || user?.role === "coordinador";

  const avatarUrl = targetUser.avatarUrl ?? `https://i.pravatar.cc/150?u=${targetUser.id}`;
  const bio = targetUser.bio ?? "Este usuario aún no ha definido su biografía.";

  useEffect(() => {
    async function fetchCourses() {
      if (!isTargetProveedor) {
        setCourses([]);
        return;
      }
      try {
        const paginatedResult = await courseService.getCoursesByUserId(targetUser.id);
        // Guardamos solo el arreglo de cursos en el estado
        setCourses(paginatedResult.courses); 
      } catch (error) {
        console.error("Error fetching user courses:", error);
        setCourses([]);
      }
    }

    fetchCourses();
  }, [isTargetProveedor, targetUser.id]);

  if (!isHydrated || courses === null) {
    // Puedes reemplazar esto por un componente <Spinner /> de Chakra
    return <p>Cargando perfil y cursos...</p>;
  }

  // Pasamos el 'targetUser' completo (que ya incluye emails/teléfonos) 
  // a los componentes de vista privada/dueño.
  if (isViewingOwnProfile) {
    return <ProfileOwnerView user={{ ...targetUser, avatarUrl, bio, courses }} mode="Carga de Documentación" />;
  }

  if (!isViewingOwnProfile && isViewerAdminOrCoord && isTargetProveedor) {
    return <ProfileCoordinatorReview user={{ ...targetUser, avatarUrl, bio, courses }} mode={`Revisión para ${(user?.role ?? "").toUpperCase()}`} />;
  }

  // Vista Pública
  return (
    <UserProfileClient 
      name={targetUser.name} 
      bio={bio} 
      avatarUrl={avatarUrl} 
      courses={courses}
      providerType={targetUser.providerType}
      
      // ✨ CORRECCIÓN: Añadimos las props que faltaban
      contactEmails={targetUser.contactEmails}
      contactPhones={targetUser.contactPhones}
    />
  );
}