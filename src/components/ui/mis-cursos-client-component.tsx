"use client";

import React from 'react';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Card,
  CardBody,
  Stack,
  Image,
  Tag,
  useColorModeValue,
} from "@chakra-ui/react";
import NextLink from 'next/link';
import { Pagination } from '@/components/ui/pagination'; 
import { Course } from '@/data/types'; 

interface MyCoursesClientPageProps {
  courses: Course[]; 
  currentPage: number;
  totalPages: number;
}

const getStatusColorScheme = (status: string | undefined): string => {
  switch (status) {
    case 'aprobado': return 'cyan';
    case 'abierto': return 'green';
    case 'rechazado': return 'red';
    case 'cerrado': return 'orange';
    case 'pendiente': return 'gray';
    case 'under_review': return 'yellow'; // ✨ Añadí este por si acaso
    default: return 'blue'; 
  }
};

const formatStatusText = (status: string | undefined): string => {
  if (!status) return 'Desconocido';
  const textMap: Record<string, string> = {
    pendiente: 'Pendiente Revisión',
    under_review: 'Bajo Revisión', // ✨ Añadí este por si acaso
    aprobado: 'Aprobado',
    rechazado: 'Rechazado',
    abierto: 'Cohorte Abierta',
    cerrado: 'Cohorte Cerrada', 
  };
  return textMap[status] || status.charAt(0).toUpperCase() + status.slice(1);
}

const ProviderCourseCard = ({ course }: { course: Course }) => {
  const placeholderImage = "https://placehold.co/400x200/cccccc/ffffff/png?text=Curso";
  const cardBg = useColorModeValue("white", "gray.700");
  
  const statusColorScheme = getStatusColorScheme(course.estado_gestion);
  const statusText = formatStatusText(course.estado_gestion);

  return (
    <Card  
      as={NextLink} 
      href={`/curso/${course.id}`} 
      bg={cardBg}
      overflow="hidden" 
      variant="outline"
      _hover={{ transform: 'translateY(-4px)', shadow: 'md' }} 
      transition="all 0.2s"
      height="100%"
    >
      <Image
        src={course.image || placeholderImage}
        alt={course.titulo}
        objectFit="cover"
        w="100%"
        h="150px"
      />
      <CardBody>
        <Stack spacing="3">
          <Heading size="sm">{course.titulo}</Heading>
          <Text fontSize="sm" noOfLines={3}>{course.descripcion}</Text>
          {course.estado_gestion && ( 
             <Tag size="sm" colorScheme={statusColorScheme} alignSelf="flex-start">
               {statusText}
             </Tag>
          )}
        </Stack>
      </CardBody>
    </Card>
  );
};

export default function MyCoursesClientPage({ courses, currentPage, totalPages }: MyCoursesClientPageProps) {
  return (
    <Box maxW="container.lg" mx="auto" py={10} px={6}>
      <Heading as="h1" size="xl" mb={8} textAlign="center">
        Mis Cursos
      </Heading>

      <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={6}>
        {courses.map(course => (
          <ProviderCourseCard key={course.id} course={course} />
        ))}
      </SimpleGrid>

      {/* Solo mostramos la paginación si hay más de 1 página */}
      {totalPages > 1 && (
         <Pagination currentPage={currentPage} totalPages={totalPages} />
      )}
    </Box>
  );
}