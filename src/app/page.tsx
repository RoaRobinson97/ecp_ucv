// Este es un Server Component por defecto
import React from 'react';
import { Box } from "@chakra-ui/react";
import NextLink from 'next/link';
import { Heading, Paragraph } from "@/components/ui/tipografia";
import { PrimaryButton } from "@/components/ui/buttons";
import { ClientContent } from '../components/ui/client-components';

// 🚀 IMPORTAMOS EL SERVICIO DE NEGOCIO EN LUGAR DE LA LÓGICA LOCAL
import { courseService } from '../servicios/cursos-service'; 

export default async function HomePage() {
    
    let courses = [];
    try {
        // 1. Llama a la función del SERVICIO para obtener los datos.
        //    Esta llamada usa el ApiService, que decide si usar MOCK o API REAL.
        courses = await courseService.getAllCourses();
    } catch (error) {
        // Manejo básico de errores de carga en el servidor
        console.error("Fallo al cargar cursos en HomePage:", error);
        // courses ya está inicializado a [] para evitar errores en la UI
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
            <ClientContent courses={courses} />
        </Box>
    );
}