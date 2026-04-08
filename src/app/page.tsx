// /app/page.tsx (HomePage)

import React from 'react';
import { Box } from "@chakra-ui/react";
import NextLink from 'next/link';
import { Heading, Paragraph } from "@/components/ui/tipografia";
import { PrimaryButton } from "@/components/ui/buttons";
import { ClientContent } from '../components/ui/client-components';
import { courseService } from '../servicios/cursos-service'; 

// ✨ IMPORTA TU INTERFAZ GLOBAL EN LUGAR DE REESCRIBIRLA
import { Course } from '@/data/types';

// ✨ REVALIDACIÓN DE CACHÉ (ISR)
// Esto le dice a Next.js: "Vuelve a consultar la base de datos en el fondo cada 60 segundos"
// Así tu página es ultra rápida, pero siempre se mantiene actualizada.
export const revalidate = 60; 

export default async function HomePage() {
    
    let coursesForClient: Course[] = []; 
    let hasError = false; 
    
    try {
        const { courses } = await courseService.getAllCourses({ page: 1, limit: 3 }) as { courses: Course[] };
        coursesForClient = courses;

    } catch (error) {
        console.error("Fallo al cargar cursos en HomePage:", error);
        hasError = true; 
    }

    return (
        <Box minH="100vh">
            <Box 
                textAlign="center" 
                backgroundImage="url('/background-1.jpg')"
                backgroundSize="cover"
                backgroundPosition="center"
                backgroundRepeat="no-repeat"
                color="white"
            >
                <Box 
                    bgColor={'#33333399'} 
                    py={10} 
                    px={6} 
                >
                    <Heading as="h1" size="2xl" mb={4}>
                        Cursos Certificados por la UCV
                    </Heading>
                    <Paragraph fontSize="lg" maxW="600px" mx="auto" mb={6}>
                        Valida y eleva tu formación académica. Nuestra plataforma te permite certificar tus cursos online a través de la Universidad Central de Venezuela, o si eres un educador, solicitar la validación de tu contenido.
                    </Paragraph>
                    <NextLink href="/cursos" passHref>
                        <PrimaryButton size="md">Ver Cursos</PrimaryButton>
                    </NextLink>
                </Box>
            </Box>

            <ClientContent courses={coursesForClient} hasError={hasError} />
        </Box>
    );
}