// pages/profile-hybrid/[userId]/page.tsx (CORREGIDO)
import React from 'react';
import { notFound } from 'next/navigation';

// Importar los componentes de vista (asegúrate de que estos archivos existen en components/ui)
import { UserProfileClient } from '@/components/ui/user-profile'; 
import { ProfileOwnerView } from '@/components/ui/profile-owner-view'; 
// 🚨 Importamos las interfaces desde el componente Cliente que las define
import { ProfileCoordinatorReview, type UserData, type Course } from '@/components/ui/profile-coordinator-review'; 

// =======================================================
// DEFINICIÓN DE TIPOS Y DATOS MOCK
// =======================================================

const mockCourses: Course[] = [
    { id: 'C001', nombre: 'Introducción a React Hooks', estado_gestion: 'En Revisión' },
    { id: 'C002', nombre: 'Arquitectura de Microservicios', estado_gestion: 'Pendiente' },
    { id: 'C003', nombre: 'Diseño UX Avanzado', estado_gestion: 'Aprobado' },
];

interface UserSession {
    id: string | null;
    // Roles válidos para la simulación
    role: 'admin' | 'coordinador' | 'proveedor' | 'visitante';
    isLoggedIn: boolean;
}

// 🚨 TargetUser AHORA ES UN ALIAS de UserData del componente Cliente para asegurar compatibilidad
// Añadimos 'role' e 'id' que UserData no tiene.
type TargetUser = UserData & { role: string; id: string; }; 

// =======================================================
// SIMULACIONES DE SERVIDOR (REEMPLAZAR POR LÓGICA REAL DE AUTH/DB)
// =======================================================

// Simula la obtención de la sesión del usuario logueado.
async function getCurrentUserSession(): Promise<UserSession> {
    // 🟢 PRUEBA ACTIVA: Proveedor (ec-user-002) viendo un perfil (ec-user-003).
    return { id: 'ec-user-002', role: 'admin', isLoggedIn: true }; 
    
    // Para probar la vista de DUEÑO PROVEEDOR, descomenta esta línea y navega a /profile-hybrid/ec-user-003
    // return { id: 'ec-user-003', role: 'proveedor', isLoggedIn: true }; 
}

// Simula la obtención de datos del usuario objetivo de la "base de datos".
async function getTargetUserData(userId: string): Promise<TargetUser | null> {
    // Definimos la base de datos con los campos comunes
    const data: Record<string, Omit<TargetUser, 'id' | 'avatarUrl' | 'courses'>> = {
        'ec-user-003': { 
            name: 'María García (Proveedor)', 
            bio: 'Experta en Ciencias Económicas. Necesita documentación legal.', 
            role: 'proveedor', 
            documentStatus: 'Pendiente de Revisión',
        },
        'ec-user-002': { 
            name: 'Ana Pérez (Coordinador)', 
            bio: 'Administradora del sistema DEU.', 
            role: 'coordinador', 
            documentStatus: 'Documentos Aprobados',
        },
        'ec-user-005': { 
            name: 'Sofía Martínez (Visitante)', 
            bio: 'Usuario estándar sin roles especiales.', 
            role: 'visitante', 
            documentStatus: 'N/A',
        },
    };

    // Acceso directo a la simulación de datos
    const user = data[userId]; 

    if (!user) {
        return null; 
    }

    // Determinar la data de cursos, solo el proveedor tiene cursos mock.
    const courses = user.role === 'proveedor' ? mockCourses : [];

    return {
        ...user,
        id: userId,
        avatarUrl: `https://i.pravatar.cc/150?u=${userId}`,
        courses: courses, // Añadir la propiedad courses
    };
}

// =======================================================

export default async function HybridUserProfilePage({ params }: { params: { userId: string } }) {
    const { userId: targetUserId } = params;
    
    // 1. Obtener datos de la sesión y del perfil objetivo (Server Side)
    const session = await getCurrentUserSession();
    const targetUser = await getTargetUserData(targetUserId);

    if (!targetUser) {
        notFound(); 
    }
    
    // 2. Determinar el contexto
    const isViewingOwnProfile = session.id === targetUserId;
    const isTargetAProveedor = targetUser.role === 'proveedor';
    const isViewerAdminOrCoordinator = session.role === 'coordinador' || session.role === 'admin';

    // 3. 🛑 LÓGICA DE VISTA CONDICIONAL 🛑

    // Caso A: DUEÑO (PROVEEDOR) viendo su propio perfil (Necesita cargar documentos)
    if (isViewingOwnProfile && session.role === 'proveedor') {
        return (
            // Utilizamos ProfileOwnerView para el dueño y le pasamos la data completa
            <ProfileOwnerView 
                user={targetUser} 
                mode="Carga de Documentación"
            />
        );
    }

    // Caso B: ADMIN/COORDINADOR viendo el perfil de un PROVEEDOR ajeno (Necesita revisar)
    if (!isViewingOwnProfile && isViewerAdminOrCoordinator && isTargetAProveedor) {
        return (
            // Utilizamos ProfileCoordinatorReview para la revisión y le pasamos la data completa
            <ProfileCoordinatorReview 
                user={targetUser} 
                mode={`Revisión para ${session.role.toUpperCase()}`}
            />
        );
    }
    
    // Caso C: VISTA ESTÁNDAR/PÚBLICA (Default)
    return (
        <UserProfileClient 
            name={targetUser.name} 
            bio={targetUser.bio} 
            avatarUrl={targetUser.avatarUrl} 
            // ✅ CORRECCIÓN: Pasamos la nueva propiedad 'courses'
            courses={targetUser.courses}
        />
    );
}