// /app/page.tsx
import React from 'react';
import { Box } from "@chakra-ui/react";
import NextLink from 'next/link';
import { Heading, Paragraph } from "@/components/ui/tipografia";
import { PrimaryButton } from "@/components/ui/buttons";
import { ClientContent } from '../components/ui/client-components';
import { courseService } from '../servicios/cursos-service'; 
import { Course } from '@/data/types';

export const revalidate = 60; 

export default async function HomePage() {
    let coursesForClient: Course[] = []; 
    let hasError = false; 
    
    try {
        // ✨ Invocamos el nuevo servicio hiper-específico
        const { courses } = await courseService.getPublicCourses(3);
        coursesForClient = courses;
        console.log(coursesForClient)
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
                <Box bgColor={'#33333399'} py={10} px={6}>
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

            {/* Como el servicio ya limpió la basura, ClientContent solo los dibuja */}
            <ClientContent courses={coursesForClient} hasError={hasError} />
        </Box>
    );
}