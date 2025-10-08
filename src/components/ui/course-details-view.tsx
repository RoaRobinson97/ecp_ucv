// components/ui/course-details-view.tsx

"use client";

import { Box, Heading, Text, VStack, Divider, SimpleGrid, Tag, Stat, StatLabel, StatNumber, useColorModeValue } from '@chakra-ui/react';

// Interfaz que incluye todos los campos del formulario de curso.
interface CourseDetailsViewProps {
  solicitud: {
    tipo: string;
    descripcion: string; // Descripción general
    // Campos del formulario
    denominacion?: string;
    proposito?: string;
    fundamentacion?: string;
    duracion?: string;
    estructuraCostos?: string;
    perfilDocente?: string;
    perfiles?: string;
    exigencias?: string;
    estructuraCurricular?: string;
    evaluacion?: string;
    cronograma?: string;
    // Campos específicos para los otros tipos de solicitud (mantener por compatibilidad)
    descripcionCurso?: string;
    propuesta?: string;
    cambiosSolicitados?: string;
  };
}

// Componente auxiliar para mostrar un detalle clave
const KeyDetail = ({ label, value }: { label: string; value?: string }) => {
  const labelColor = useColorModeValue("gray.700", "gray.300");
  const boxBg = useColorModeValue("white", "gray.700");
  const boxBorder = useColorModeValue("gray.200", "gray.600");

  return (
    <VStack align="start" spacing={1}>
      <Text fontWeight="bold" fontSize="md" color={labelColor}>{label}</Text>
      <Box w="100%" p={3} bg={boxBg} border="1px" borderColor={boxBorder} rounded="md">
        <Text whiteSpace="pre-wrap" color={useColorModeValue("gray.800", "white")}>
          {value || 'No especificado'}
        </Text>
      </Box>
    </VStack>
  );
};

export function CourseDetailsView({ solicitud }: CourseDetailsViewProps) {
  const getTitle = () => {
    // Reemplaza las partes iniciales para crear un título de vista de detalles.
    return solicitud.tipo.replace('Formulación de ', 'Detalles de ').replace('Actualización de ', 'Detalles de ');
  };

  const containerBg = useColorModeValue("gray.50", "gray.800");

  return (
    <Box mb={10}>
      <Heading as="h2" size="xl" mb={6}>{getTitle()}</Heading>

      <VStack spacing={6} align="stretch" p={4} bg={containerBg} rounded="lg" shadow="sm">
        
        {/* Detalles del curso (aplica a Formulaciones y Actualizaciones) */}
        <KeyDetail label="Denominación o Título del Curso" value={solicitud.denominacion} />
        <KeyDetail label="Propósito General (Objetivo Principal)" value={solicitud.proposito} />
        <KeyDetail label="Fundamentación y Justificación" value={solicitud.fundamentacion} />
        <KeyDetail label="Duración Total (en horas)" value={solicitud.duracion} />
        <KeyDetail label="Estructura de Costos y Recursos" value={solicitud.estructuraCostos} />
        <KeyDetail label="Perfil del Docente o Facilitador Requerido" value={solicitud.perfilDocente} />
        <KeyDetail label="Perfiles de Ingreso y Egreso de Participantes" value={solicitud.perfiles} />
        <KeyDetail label="Exigencias en Materiales y Servicios" value={solicitud.exigencias} />
        <KeyDetail label="Estructura Curricular Detallada por Competencias y Módulos" value={solicitud.estructuraCurricular} />
        <KeyDetail label="Estrategias de Evaluación y Criterios de Aprobación" value={solicitud.evaluacion} />
        <KeyDetail label="Cronograma de Ejecución Anual (Tentativo)" value={solicitud.cronograma} />
        
        {/* // Campos específicos para otros tipos de solicitud (si fueran relevantes)
          // Se pueden añadir aquí si la vista debe ser genérica para otros tipos de solicitud.
          <KeyDetail label="Descripción del Curso Existente" value={solicitud.descripcionCurso} />
          <KeyDetail label="Propuesta de Actualización" value={solicitud.propuesta} />
          <KeyDetail label="Cambios Solicitados" value={solicitud.cambiosSolicitados} /> 
        */}
      </VStack>
    
    </Box>
  );
}