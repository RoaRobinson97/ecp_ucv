import React from 'react';
import { Box, Text, Heading } from '@chakra-ui/react';
import { ClientCourses } from '@/components/ui/client-cursos';
import { courseService } from '@/servicios/cursos-service';
import { Course } from '@/data/types';

export default async function CursosPage({ searchParams }: { searchParams: { page?: string } }) {
    const page = Number(searchParams.page) || 1;
    const limit = 9;

    let courses: Course[] = [];
    let totalPages = 1;
    let hasError = false;

    try {
        const result = await courseService.getAllCourses({ page, limit }) as { courses: Course[], totalPages: number };
        courses = result.courses || [];
        totalPages = result.totalPages || 1;
    } catch (error) {
        console.error("Error cargando la página de cursos:", error);
        hasError = true;
    }

    // ✨ Manejo de error de red (Backend caído)
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
                <Text fontSize="xl">No se encontraron cursos publicados en esta página.</Text>
            </Box>
        );
    }

    return (
        <ClientCourses courses={courses} currentPage={page} totalPages={totalPages} />
    );
}