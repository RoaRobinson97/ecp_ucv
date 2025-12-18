"use client";

import { Box, SimpleGrid, Card, CardBody, Stack, Image } from "@chakra-ui/react";
import NextLink from 'next/link';
import React from 'react';
import { Heading, Paragraph } from "@/components/ui/tipografia";
import { Pagination } from "@/components/ui/pagination";
import { Course } from '@/data/types';

interface ClientCoursesProps {
    courses: Course[];
    currentPage: number;
    totalPages: number;
}

const CourseCard = ({ titulo, descripcion, image }: Pick<Course, 'titulo' | 'descripcion' | 'image'>) => {
    const placeholderImage = "https://placehold.co/400x200/cccccc/ffffff/png?text=Imagen+no+encontrada";

    return (
        <Card overflow="hidden" variant="outline">
            <Image
                src={image ?? placeholderImage}
                alt={titulo}
                objectFit="cover"
                w="100%"
                h="200px"
                fallbackSrc={placeholderImage}
            />
            <CardBody>
                <Stack mt="6" spacing="3">
                    <Heading size="md">{titulo}</Heading>
                    <Paragraph>{descripcion}</Paragraph>
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
                            titulo={course.titulo}
                            descripcion={course.descripcion}
                            image={course.image}
                        />
                    </NextLink>
                ))}
            </SimpleGrid>

            <Pagination currentPage={currentPage} totalPages={totalPages} />
        </Box>
    );
}
