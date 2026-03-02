// /app/mis-cursos/page.tsx
import React from 'react';
import { Box, Text } from '@chakra-ui/react';
// Asegúrate que la ruta al componente cliente sea correcta
import MyCoursesClientPage from '@/components/ui/mis-cursos-client-component';
import { courseService } from '@/servicios/cursos-service';
import { Course } from '@/data/types'; // Asegúrate de tener este tipo

// Interfaz para los searchParams esperados
interface MisCursosSearchParams {
    page?: string;
    codigo_proveedor?: string; // Esperamos el userId como parámetro
}

export default async function MisCursosPage({ searchParams }: { searchParams: MisCursosSearchParams }) {
    
    // Obtenemos el userId de los parámetros de búsqueda
    const codigo_proveedor = searchParams.codigo_proveedor;

    // Si no se proporciona un userId, mostramos un error o redirigimos (aquí solo mostramos error)
    // En una app real, la protección de ruta (middleware) manejaría esto antes.
    if (!codigo_proveedor) {
        return (
            <Box maxW="container.lg" mx="auto" py={10} px={6} textAlign="center">
                <Text fontSize="xl" color="red.500">Error: Falta el identificador del usuario.</Text>
            </Box>
        );
    }
    
    const page = Number(searchParams.page) || 1;
    const limit = 9; // Cursos por página

    let courses: Course[] = [];
    let totalPages = 1;

    try {
        // Llamamos al servicio para obtener los cursos DE ESE USUARIO específico
        const result = await courseService.getCoursesBycodigo_proveedor(codigo_proveedor, { page, limit }) as { courses: Course[], totalPages: number };
        courses = result.courses;
        totalPages = result.totalPages;
    } catch (error) {
        console.error("Error fetching provider courses:", error);
        // Manejo de error similar al template
        return (
             <Box maxW="container.lg" mx="auto" py={10} px={6} textAlign="center">
                 <Text fontSize="xl" color="red.500">Error al cargar tus cursos.</Text>
             </Box>
        );
    }
    
    // Manejo si no se encuentran cursos para este usuario
    if (!courses || courses.length === 0) {
        return (
            <Box maxW="container.lg" mx="auto" py={10} px={6} textAlign="center">
                <Text fontSize="xl">Aún no has propuesto ningún curso.</Text>
            </Box>
        );
    }
    
    // (Opcional) Redirección si la página solicitada no existe
    if (page > totalPages && totalPages > 0) {
       // Podrías redirigir aquí si quieres, o simplemente mostrar la última página.
       // Por ahora, lo dejamos pasar para mantenerlo simple.
     }

    // Pasamos los datos al componente cliente
    return (
        <MyCoursesClientPage 
            courses={courses} 
            currentPage={page} 
            totalPages={totalPages} 
        />
    );
}