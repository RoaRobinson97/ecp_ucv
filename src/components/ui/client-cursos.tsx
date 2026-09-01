// src/components/ui/client-cursos.tsx
"use client";

import React, { useState, useMemo } from 'react';
import {
    Box, VStack, SimpleGrid, Input, InputGroup, InputLeftElement,
    Button, HStack, Text, Card, CardBody, Stack, Image, Heading, Flex, IconButton
} from '@chakra-ui/react';
import { MdSearch, MdChevronLeft, MdChevronRight } from 'react-icons/md';
import NextLink from 'next/link';
import { Course } from '@/data/types';

// ✨ Tarjetita del curso
const CourseCard = ({ titulo, descripcion, image }: any) => {
    const placeholderImage = "https://placehold.co/400x200/cccccc/ffffff/png?text=Curso";
    
    // 1. Tomamos el dominio real (Asegúrate de tener esto en tu servidor y HACER REBUILD)
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    
    // 2. Lógica de limpieza extrema:
    let finalImage = image || '';
    
    // Si la BD viene "sucia" con el localhost quemado, lo extirpamos y ponemos el baseUrl
    if (finalImage.includes('localhost:8080')) {
        finalImage = finalImage.replace('http://localhost:8080', baseUrl);
        finalImage = finalImage.replace('http://127.0.0.1:8080', baseUrl); // Por si acaso
    } 
    // Si la BD viene limpia (ruta relativa), la concatenamos normalmente
    else if (finalImage.startsWith('/')) {
        finalImage = `${baseUrl}${finalImage}`;
    }

    return (
        <Card 
            _hover={{ transform: 'translateY(-5px)', shadow: 'lg' }} 
            transition="all 0.2s" 
            height="100%" 
            overflow="hidden" 
            variant="outline"
            bg="surface"
            borderColor="border"
        >
            <Image src={finalImage} alt={titulo} objectFit="cover" w="100%" h="200px" fallbackSrc={placeholderImage} />
            <CardBody>
                <Stack mt="4" spacing="3">
                    <Heading size="md" noOfLines={2} color="text.primary">{titulo}</Heading>
                    <Text color="text.muted" noOfLines={3} fontSize="sm" fontWeight="medium">
                        {descripcion || "Sin descripción disponible."}
                    </Text>
                </Stack>
            </CardBody>
        </Card>
    );
};

export function ClientCourses({ initialCourses }: { initialCourses: Course[] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 9;

    // 1. EL BUSCADOR INTELIGENTE
    const filteredCourses = useMemo(() => {
        if (!searchTerm.trim()) return initialCourses;
        const lowerSearch = searchTerm.toLowerCase();
        
        return initialCourses.filter(c => 
            (c.titulo && c.titulo.toLowerCase().includes(lowerSearch)) ||
            (c.descripcion && c.descripcion.toLowerCase().includes(lowerSearch))
        );
    }, [initialCourses, searchTerm]);

    // 2. LA PAGINACIÓN MATEMÁTICA
    const totalPages = Math.ceil(filteredCourses.length / ITEMS_PER_PAGE) || 1;
    
    const paginatedCourses = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredCourses.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredCourses, currentPage, ITEMS_PER_PAGE]);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); 
    };

    // 3. ALGORITMO DE TRUNCAMIENTO PARA PAGINACIÓN
    const getPageNumbers = () => {
        const pages = [];
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (currentPage <= 4) {
                pages.push(1, 2, 3, 4, 5, '...', totalPages);
            } else if (currentPage >= totalPages - 3) {
                pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
            } else {
                pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
            }
        }
        return pages;
    };

    return (
        <Box maxW="container.xl" mx="auto" py={10} px={6} minH="70vh" display="flex" flexDirection="column">
            
            <VStack spacing={6} mb={10}>
                <Heading size="xl" textAlign="center" color="primary">Catálogo de Cursos</Heading>
                
                <Box w="full" maxW="lg">
                    <InputGroup size="lg">
                        <InputLeftElement pointerEvents="none">
                            <MdSearch color="gray.300" size={24} />
                        </InputLeftElement>
                        <Input 
                            type="text" 
                            placeholder="Buscar por nombre o tema del curso..." 
                            value={searchTerm}
                            onChange={handleSearch}
                            bg="surface"
                            color="text.primary"
                            borderColor="border"
                            shadow="sm"
                            focusBorderColor="primary"
                        />
                    </InputGroup>
                </Box>
            </VStack>

            <Box flex="1">
                {paginatedCourses.length === 0 ? (
                    <Box textAlign="center" py={20} bg="surface" rounded="xl" border="1px dashed" borderColor="border" shadow="sm">
                        <Text fontSize="lg" color="text.muted" fontWeight="medium">No se encontraron cursos que coincidan con tu búsqueda.</Text>
                    </Box>
                ) : (
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={10}>
                        {paginatedCourses.map(course => (
                            <NextLink href={`/curso/${course.id}`} passHref key={course.id}>
                                <CourseCard
                                    titulo={course.titulo}
                                    descripcion={course.descripcion}
                                    image={course.image}
                                />
                            </NextLink>
                        ))}
                    </SimpleGrid>
                )}
            </Box>

            {/* CONTROLES DE PAGINACIÓN MODERNOS */}
            <Flex justify="center" align="center" mt={12}>
                <HStack spacing={2}>
                    <IconButton 
                        icon={<MdChevronLeft size={20} />}
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                        isDisabled={currentPage === 1}
                        aria-label="Página anterior"
                        variant="outline"
                        colorScheme="gray"
                    />
                    
                    {getPageNumbers().map((p, index) => (
                        p === '...' ? (
                            <Text key={`ellipsis-${index}`} px={2} color="text.muted" fontWeight="bold">...</Text>
                        ) : (
                            <Button
                                key={index}
                                onClick={() => setCurrentPage(p as number)}
                                variant={currentPage === p ? "solid" : "outline"}
                                colorScheme={currentPage === p ? "teal" : "gray"}
                                minW="40px"
                            >
                                {p}
                            </Button>
                        )
                    ))}
                    
                    <IconButton 
                        icon={<MdChevronRight size={20} />}
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                        isDisabled={currentPage === totalPages}
                        aria-label="Página siguiente"
                        variant="outline"
                        colorScheme="gray"
                    />
                </HStack>
            </Flex>
            
        </Box>
    );
}