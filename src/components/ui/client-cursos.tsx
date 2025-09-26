// src/components/ui/client-cursos.tsx
"use client";

import { Box, SimpleGrid, Card, CardBody, Stack, Image } from "@chakra-ui/react";
import NextLink from 'next/link';
import React from 'react';
import { Heading, Paragraph } from "@/components/ui/tipografia";
import { Pagination } from "@/components/ui/pagination"; // Importa el nuevo componente

interface CourseProps {
    id: string;
    title: string;
    description: string;
    image: string | null;
}

interface ClientCoursesProps {
    courses: CourseProps[];
    currentPage: number;
    totalPages: number;
}

const CourseCard = ({ title, description, image }: Omit<CourseProps, 'id'>) => {
    const placeholderImage = "https://placehold.co/400x200/cccccc/ffffff/png?text=Imagen+no+encontrada";
    return (
        <Card overflow="hidden" variant="outline">
            <Image
                src={image as string}
                alt={title}
                objectFit="cover"
                w="100%"
                h="200px"
                fallbackSrc={placeholderImage}
            />
            <CardBody>
                <Stack mt="6" spacing="3">
                    <Heading size="md">{title}</Heading>
                    <Paragraph>{description}</Paragraph>
                </Stack>
            </CardBody>
        </Card>
    );
};

export function ClientCourses({ courses, currentPage, totalPages }: ClientCoursesProps) {
    return (
        <Box maxW="container.xl" mx="auto" py={10} px={6}>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10}>
                {courses.map(course => (
                    <NextLink href={`/curso/${course.id}`} passHref key={course.id}>
                        <CourseCard
                            title={course.title}
                            description={course.description}
                            image={course.image}
                        />
                    </NextLink>
                ))}
            </SimpleGrid>
            
            {/* Agrega el componente de paginación aquí */}
            <Pagination currentPage={currentPage} totalPages={totalPages} />
        </Box>
    );
}