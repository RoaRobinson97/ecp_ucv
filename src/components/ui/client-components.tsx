// src/components/ui/client-components.tsx
"use client";

import { Box, VStack, SimpleGrid, Card, CardBody, Stack, Image } from "@chakra-ui/react";
import React from 'react';
import NextLink from 'next/link';
import { Heading, Paragraph } from "@/components/ui/tipografia";

interface InfoCardProps {
    title: string;
    description: string;
    image: string;
}

interface CourseProps {
    id: string;
    slug: string; 
    titulo: string;
    descripcion: string;
    image: string | null;
}

const InfoCard = ({ title, description, image }: InfoCardProps) => {
    return (
        <Card overflow="hidden" variant="outline">
            <Image src={image} alt={title} objectFit="cover" w="100%" h="200px" />
            <CardBody>
                <Stack mt="6" spacing="3">
                    <Heading size="md">{title}</Heading>
                    <Paragraph>{description}</Paragraph>
                </Stack>
            </CardBody>
        </Card>
    );
};

const CourseCard = ({ titulo, descripcion, image }: Omit<CourseProps, 'id' | 'slug'>) => {
    const placeholderImage = "https://placehold.co/400x200/cccccc/ffffff/png?text=Curso";
    return (
        // 👇 AQUÍ ESTÁ EL CAMBIO: Se eliminó as="a"
        <Card _hover={{ transform: 'translateY(-5px)', shadow: 'lg' }} transition="all 0.2s" height="100%" overflow="hidden" variant="outline">
            <Image
                src={image || ''}
                alt={titulo}
                objectFit="cover"
                w="100%"
                h="200px"
                fallbackSrc={placeholderImage}
            />
            <CardBody>
                <Stack mt="6" spacing="3">
                    <Heading size="md">{titulo}</Heading>
                    <Paragraph noOfLines={3}>{descripcion}</Paragraph>
                </Stack>
            </CardBody>
        </Card>
    );
};

interface ClientContentProps {
    courses: CourseProps[];
}

export function ClientContent({ courses }: ClientContentProps) {
    return (
        <Box maxW="container.xl" mx="auto" py={10} px={6}>
            {/* Sección "Nuestra Plataforma" */}
            <Box as="section" id="how-it-works">
                <VStack spacing={4} py={8} px={6} textAlign="center">
                    <Heading size="xl">Nuestra Plataforma</Heading>
                    <Paragraph fontSize="lg">Conoce los beneficios tanto si eres un estudiante como si eres un educador.</Paragraph>
                </VStack>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
                    <InfoCard
                        title="Para Estudiantes"
                        description="Encuentra cursos de calidad en diversas áreas y obtén un certificado verificado por la UCV. ¡Impulsa tu carrera profesional!"
                        image="/image-1.png"
                    />
                    <InfoCard
                        title="Para Educadores"
                        description="Valida la calidad de tus cursos online con el respaldo de la UCV y atrae a más estudiantes con una certificación de prestigio."
                        image="/image-2.png"
                    />
                </SimpleGrid>
            </Box>

            {/* Sección de Cursos Certificados */}
            <Box as="section" id="certified-courses" mt={12}>
                <VStack spacing={4} py={8} px={6} textAlign="center">
                    <Heading size="xl">Explora Nuestros Cursos Certificados</Heading>
                    <Paragraph fontSize="lg">Aprende nuevas habilidades con el respaldo de la universidad.</Paragraph>
                </VStack>
                
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
            </Box>
        </Box>
    );
}