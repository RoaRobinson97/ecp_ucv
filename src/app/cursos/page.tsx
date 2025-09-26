// /app/cursos/page.tsx
import React from 'react';
import { Box, Text } from '@chakra-ui/react';
import { ClientCourses } from '@/components/ui/client-cursos';

// Simulamos una base de datos completa de cursos (con más datos)
const ALL_COURSES = Array.from({ length: 30 }, (_, i) => ({
    id: String(i + 1),
    title: `Curso de Prueba ${i + 1}`,
    description: `Descripción del curso ${i + 1}. Aprende habilidades clave en esta área.`,
    image: null,
}));

// Esta función ahora acepta los parámetros de paginación
async function getCourses({ page, limit }: { page: number; limit: number }) {
    const start = (page - 1) * limit;
    const end = start + limit;
    const courses = ALL_COURSES.slice(start, end);
    const totalCourses = ALL_COURSES.length;
    const totalPages = Math.ceil(totalCourses / limit);

    return { courses, totalPages };
}

interface CursosPageProps {
    searchParams: { page: string };
}

export default async function CursosPage({ searchParams }: CursosPageProps) {
    const page = Number(searchParams.page) || 1;
    const limit = 9; // 9 cursos por página

    const { courses, totalPages } = await getCourses({ page, limit });

    if (courses.length === 0) {
        return (
            <Box maxW="container.xl" mx="auto" py={10} px={6} textAlign="center">
                <Text fontSize="xl">No se encontraron cursos.</Text>
            </Box>
        );
    }

    return (
        <ClientCourses courses={courses} currentPage={page} totalPages={totalPages} />
    );
}