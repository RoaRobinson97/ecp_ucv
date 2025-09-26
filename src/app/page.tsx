// Este es un Server Component por defecto
import React from 'react';
import { Box } from "@chakra-ui/react";
import NextLink from 'next/link';
import { Heading, Paragraph } from "@/components/ui/tipografia";
import { PrimaryButton } from "@/components/ui/buttons";
import { ClientContent } from '../components/ui/client-components';



// Datos de ejemplo para simular la respuesta de una API en el servidor
const MOCK_COURSES = [
    {
        id: "1",
        title: "Introducción a la Programación",
        description: "Aprende los fundamentos de la programación con Python, desde variables hasta estructuras de datos.",
        image: 'image-1.png'
    },
    {
        id: "2",
        title: "Marketing Digital Avanzado",
        description: "Domina estrategias de SEO, SEM y redes sociales para impulsar cualquier negocio.",
        image: null
    },
    {
        id: "3",
        title: "Bases de Datos con SQL",
        description: "Diseña y gestiona bases de datos relacionales con los principales comandos de SQL.",
        image: null
    },
];

// Esta función simula una llamada a la API en el servidor
async function getCourses() {
    // Aquí es donde harías tu llamada a la API real, por ejemplo:
    // const res = await fetch('https://tu-api.com/courses');
    // const courses = await res.json();
    return MOCK_COURSES;
}

export default async function HomePage() {
    // 1. Llama a la función del servidor para obtener los datos.
    const courses = await getCourses();

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

            {/* Este Box ahora maneja la imagen de fondo de pantalla completa */}
            <ClientContent courses={courses} />
        </Box>
    );
}