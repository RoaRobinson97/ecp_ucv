import React from 'react';
import { Box, Text } from '@chakra-ui/react';
import { ClientCourses } from '@/components/ui/client-cursos';
import { courseService } from '@/servicios/cursos-service';
import { Course } from '@/data/types';

export default async function CursosPage({ searchParams }: { searchParams: { page?: string } }) {
    const page = Number(searchParams.page) || 1;
    const limit = 9;

    const { courses, totalPages } = await courseService.getAllCourses({ page, limit }) as { courses: Course[], totalPages: number };

    if (!courses || courses.length === 0) {
        return (
            <Box maxW="container.xl" mx="auto" py={10} px={6} textAlign="center">
                <Text fontSize="xl">No se encontraron cursos en esta página.</Text>
            </Box>
        );
    }

    return (
        <ClientCourses courses={courses} currentPage={page} totalPages={totalPages} />
    );
}
