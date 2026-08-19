// /app/mis-cursos/page.tsx
import React from 'react';
import { Box, Text } from '@chakra-ui/react';
import { cookies } from 'next/headers'; 
import MyCoursesClientPage from '@/components/ui/mis-cursos-client-component';
import { courseService } from '@/servicios/cursos-service';
import { userService } from '@/servicios/users-service';
import { Course } from '@/data/types'; 

export default async function MisCursosPage({ searchParams }: { searchParams: Promise<{ page?: string, usuario_id?: string }> }) {
    
    // 1. OBTENEMOS EL USUARIO DESDE LAS COOKIES
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    
    const userPayload = userService.getUserFromToken(token) as { 
        id?: string; 
        sub?: string; // 👈 ¡ESTO FUE LO QUE SE TE OLVIDÓ COPIAR ANTES!
        userID?: string; 
    } | null;
    
    // Sacamos el ID del token asegurándonos de leer "sub"
    let usuario_id = userPayload?.sub || userPayload?.id || userPayload?.userID;

    // 2. BUSCAMOS EN LA URL (PLAN B)
    const params = await searchParams;
    if (!usuario_id) {
        usuario_id = params.usuario_id;
    }

    // 3. SI AÚN ASÍ NO HAY NADA, LO REBOTAMOS
    if (!usuario_id) {
        return (
            <Box maxW="container.lg" mx="auto" py={10} px={6} textAlign="center">
                <Text fontSize="xl" color="red.500">
                    Acceso Denegado: Inicia sesión o añade ?usuario_id= a la URL.
                </Text>
            </Box>
        );
    }
    
    // 4. PARÁMETROS DE PAGINACIÓN
    const page = Number(params.page) || 1;
    const limit = 9; 

    let courses: Course[] = [];
    let totalPages = 1;

    try {
        // 5. BUSCAMOS POR EL ID DEL USUARIO 
        const result = await courseService.getCoursesByUserId(usuario_id, { page, limit });
        courses = result.courses;
        totalPages = result.totalPages;
    } catch (error) {
        console.error("Error fetching provider courses:", error);
        return (
             <Box maxW="container.lg" mx="auto" py={10} px={6} textAlign="center">
                 <Text fontSize="xl" color="red.500">Error al cargar tus cursos.</Text>
             </Box>
        );
    }
    
    if (!courses || courses.length === 0) {
        return (
            <Box maxW="container.lg" mx="auto" py={10} px={6} textAlign="center">
                <Text fontSize="xl">Aún no has propuesto ningún curso.</Text>
            </Box>
        );
    }
    
    return (
        <MyCoursesClientPage 
            courses={courses} 
            currentPage={page} 
            totalPages={totalPages} 
        />
    );
}