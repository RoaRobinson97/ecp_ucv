"use client";

import { 
  Box, Heading, Text, VStack, SimpleGrid, useColorModeValue, HStack 
} from '@chakra-ui/react';
import { PayloadFormulacionCurso } from '@/data/types';

interface CourseDetailsViewProps {
  payload?: PayloadFormulacionCurso | any; 
  tipo?: string; 
}

const KeyDetail = ({ label, value }: { label: string; value?: string }) => {
  const labelColor = useColorModeValue("gray.700", "gray.300");
  const boxBg = useColorModeValue("white", "gray.700");
  const boxBorder = useColorModeValue("gray.200", "gray.600");

  return (
    <VStack align="start" spacing={1} w="100%">
      <Text fontWeight="bold" fontSize="sm" color={labelColor} textTransform="uppercase">{label}</Text>
      <Box w="100%" p={3} bg={boxBg} border="1px" borderColor={boxBorder} rounded="md">
        <Text whiteSpace="pre-wrap" color={useColorModeValue("gray.800", "white")}>
          {value || 'No especificado'}
        </Text>
      </Box>
    </VStack>
  );
};

const DividerWithLabel = ({ label }: { label: string }) => (
    <HStack w="100%" py={4}>
        <Box h="1px" bg="gray.300" flex={1} />
        <Text fontSize="xs" fontWeight="bold" color="gray.400" textTransform="uppercase" letterSpacing="wider" px={2}>
            {label}
        </Text>
        <Box h="1px" bg="gray.300" flex={1} />
    </HStack>
);

export function CourseDetailsView({ payload, tipo = "Formulación de Curso" }: CourseDetailsViewProps) {
  
  if (!payload) {
    return (
      <Box p={5} textAlign="center">
        <Text color="red.500">Error: No se encontraron datos del curso.</Text>
      </Box>
    );
  }

  const getTitle = () => {
    let tituloLimpio = tipo.replace(/-/g, ' ');
    tituloLimpio = tituloLimpio.charAt(0).toUpperCase() + tituloLimpio.slice(1);
    return tituloLimpio
      .replace('Formulacion', 'Detalles de Formulacion')
      .replace('curso directa', 'Directa');
  };

  const containerBg = useColorModeValue("gray.50", "gray.900");

  return (
    <Box mb={10}>
      <Heading as="h2" size="lg" mb={6} color="teal.600">{getTitle()}</Heading>

      <VStack spacing={6} align="stretch" p={6} bg={containerBg} rounded="xl" shadow="md" borderWidth="1px">
        
        <KeyDetail label="Denominación o Título del Curso" value={payload.titulo || payload.nombre || payload.denominacion} />
        
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            <KeyDetail label="Duración y Modalidad" value={payload.duracion} />
            <KeyDetail label="Propósito General" value={payload.proposito || payload.objetivos} />
        </SimpleGrid>

        <KeyDetail label="Fundamentación y Justificación" value={payload.fundamentacion || payload.descripcion} />
        <KeyDetail label="Estructura de Costos" value={payload.estructura_costos || payload.costo} />
        <KeyDetail label="Materiales y Servicios" value={payload.exigencias || payload.contenido} />
        
        <DividerWithLabel label="Perfiles" />
        
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            <KeyDetail label="Perfil de Ingreso y Egreso" value={payload.perfiles} />
            <KeyDetail label="Perfil del Facilitador" value={payload.perfil_docente} />
        </SimpleGrid>
        
        <DividerWithLabel label="Plan de Estudios" />

        <KeyDetail label="Contenido por Módulos y Competencias" value={payload.contenido_competencias} />

        <KeyDetail label="Estructura Curricular General" value={payload.estructura_curricular || payload.contenido} />
        <KeyDetail label="Evaluación" value={payload.evaluacion} />
        <KeyDetail label="Cronograma Tentativo" value={payload.cronograma} />

        <DividerWithLabel label="Referencias" />
        <KeyDetail label="Bibliografía" value={payload.bibliografia} />
        
      </VStack>
    </Box>
  );
}