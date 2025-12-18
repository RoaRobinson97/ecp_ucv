// /app/page.tsx (HomePage)

import React from 'react';
import { Box } from "@chakra-ui/react";
import NextLink from 'next/link';
import { Heading, Paragraph } from "@/components/ui/tipografia";
import { PrimaryButton } from "@/components/ui/buttons";
import { ClientContent } from '../components/ui/client-components';
import { courseService } from '../servicios/cursos-service'; 

interface Course {
  id: string;
  slug: string;
  titulo: string;
  descripcion: string;
  image: string | null;
}

export default async function HomePage() {
    
    let coursesForClient: Course[] = []; 
    
    try {
        // 👇 AQUÍ ESTÁ EL ÚNICO CAMBIO: limit: 6 se convierte en limit: 3
        const { courses } = await courseService.getAllCourses({ page: 1, limit: 3 }) as { courses: Course[] };
        
        coursesForClient = courses;

    } catch (error) {
        console.error("Fallo al cargar cursos en HomePage:", error);
    }

    return (
        <Box minH="100vh">
            {/* Encabezado del contenido principal */}
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

            {/* Renderiza el contenido que depende de los datos */}
            <ClientContent courses={coursesForClient} />
        </Box>
    );
}