// src/app/cursos/page.tsx
import React from 'react';
import { Box, Text, Heading } from '@chakra-ui/react';
import { ClientCourses } from '@/components/ui/client-cursos';
import { courseService } from '@/servicios/cursos-service';
import { Course } from '@/data/types';

export const revalidate = 60; // Refresca la caché cada 60 segs

export default async function CursosPage() {
    let courses: Course[] = [];
    let hasError = false;

    try {
        // ✨ Le pedimos TODOS los cursos legales al servicio público
        const result = await courseService.getPublicCourses(1000);
        courses = result.courses || [];
    } catch (error) {
        console.error("Error cargando la página de cursos:", error);
        hasError = true;
    }

    // ✨ Manejo de error de red
    if (hasError) {
        return (
            <Box maxW="container.xl" mx="auto" py={20} px={6} textAlign="center">
                <Heading size="lg" color="red.500" mb={4}>Ups, algo salió mal</Heading>
                <Text fontSize="xl">No pudimos conectar con el servidor para cargar los cursos. Intenta de nuevo en unos minutos.</Text>
            </Box>
        );
    }

    // Manejo de "No hay cursos en esta página"
    if (courses.length === 0) {
        return (
            <Box maxW="container.xl" mx="auto" py={20} px={6} textAlign="center">
                <Text fontSize="xl">No se encontraron cursos publicados en este momento.</Text>
            </Box>
        );
    }

    // ✨ CORRECCIÓN AQUÍ: Pasamos "initialCourses" en lugar de las props viejas
    return (
        <ClientCourses initialCourses={courses} />
    );
}