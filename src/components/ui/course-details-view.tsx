"use client";

import { 
  Box, Heading, Text, VStack, SimpleGrid, useColorModeValue, HStack, Button, Badge
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
  const textColor = useColorModeValue("gray.800", "white");

  return (
    <VStack align="start" spacing={1} w="100%">
      <Text fontWeight="bold" fontSize="sm" color={labelColor} textTransform="uppercase">{label}</Text>
      <Box w="100%" p={3} bg={boxBg} border="1px" borderColor={boxBorder} rounded="md">
        <Text whiteSpace="pre-wrap" color={textColor}>
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
  const containerBg = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.700");
  const cardBorder = useColorModeValue("gray.200", "gray.600");
  const labelColor = useColorModeValue("gray.700", "gray.300");
  const textColor = useColorModeValue("gray.800", "white");
  const mutedText = useColorModeValue("gray.500", "gray.400");

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
      .replace('Formulacion', 'Detalles de Formulación')
      .replace('curso directa', 'Directa');
  };

  // ✨ Limpiamos la URL del PDF del facilitador por si viene con localhost o sin slash inicial
  const getCleanFileUrl = (url?: string | null) => {
    if (!url || typeof url !== 'string') return null;
    let clean = url;
    if (clean.includes('localhost:8080') || clean.includes('127.0.0.1:8080')) {
      try {
        clean = new URL(clean).pathname;
      } catch (e) {
        clean = clean.replace(/http:\/\/(localhost|127\.0\.0\.1):8080/g, '');
      }
    }
    if (clean.startsWith('uploads/')) clean = `/${clean}`;
    return clean;
  };

  const cvFacilitadorUrl = getCleanFileUrl(payload.cv_facilitador_url);

  // ✨ Parseamos el texto de los módulos para mostrarlos en tarjetas estructuradas
  const parseModulos = (rawText?: string) => {
    if (!rawText || typeof rawText !== 'string') return [];
    const blocks = rawText.split(/\n\s*\n/).map(b => b.trim()).filter(Boolean);
    
    return blocks.map((block, idx) => {
      const lines = block.split('\n').map(l => l.trim());
      const headerLine = lines.find(l => /^m[oó]dulo/i.test(l)) || `Módulo ${idx + 1}`;
      const contenidoLine = lines.find(l => /^contenido:/i.test(l));
      const competenciaLine = lines.find(l => /^competencia:/i.test(l));

      if (contenidoLine || competenciaLine) {
        return {
          isStructured: true,
          header: headerLine,
          contenido: contenidoLine ? contenidoLine.replace(/^contenido:\s*/i, '') : 'No especificado',
          competencia: competenciaLine ? competenciaLine.replace(/^competencia:\s*/i, '') : 'No especificado'
        };
      }
      return { isStructured: false, raw: block };
    });
  };

  const modulosParsed = parseModulos(payload.contenido_competencias);

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

        {/* ✨ NUEVO: SÍNTESIS CURRICULAR DEL FACILITADOR (PDF) */}
        <VStack align="start" spacing={1} w="100%">
          <Text fontWeight="bold" fontSize="sm" color={labelColor} textTransform="uppercase">
            Síntesis Curricular del Facilitador(es) (PDF)
          </Text>
          <Box w="100%" p={3} bg={cardBg} border="1px" borderColor={cardBorder} rounded="md">
            {cvFacilitadorUrl ? (
              <HStack justify="space-between" align="center" flexWrap="wrap" gap={2}>
                <Text fontSize="sm" color={textColor}>
                  Documento PDF adjunto con el resumen curricular del facilitador.
                </Text>
                <Button
                  as="a"
                  href={cvFacilitadorUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  size="sm"
                  colorScheme="teal"
                >
                  Ver / Descargar CV (PDF)
                </Button>
              </HStack>
            ) : (
              <Text fontSize="sm" color={mutedText} fontStyle="italic">
                No se adjuntó archivo PDF en esta formulación.
              </Text>
            )}
          </Box>
        </VStack>
        
        <DividerWithLabel label="Plan de Estudios" />

        {/* ✨ NUEVO: DESGLOSE DE MÓDULOS EN TARJETAS */}
        <VStack align="start" spacing={2} w="100%">
          <Text fontWeight="bold" fontSize="sm" color={labelColor} textTransform="uppercase">
            Contenido por Módulos y Competencias
          </Text>
          
          {modulosParsed.length > 0 ? (
            <VStack spacing={3} align="stretch" w="100%">
              {modulosParsed.map((mod, idx) => (
                <Box key={idx} p={4} bg={cardBg} border="1px" borderColor={cardBorder} rounded="md">
                  {mod.isStructured ? (
                    <VStack align="start" spacing={2}>
                      <Badge colorScheme="teal" variant="subtle" px={2} py={0.5} rounded="md" fontSize="xs">
                        {mod.header}
                      </Badge>
                      <Box>
                        <Text fontSize="xs" fontWeight="bold" color="teal.500" textTransform="uppercase">
                          Contenido Programático:
                        </Text>
                        <Text fontSize="sm" color={textColor} whiteSpace="pre-wrap">
                          {mod.contenido}
                        </Text>
                      </Box>
                      <Box>
                        <Text fontSize="xs" fontWeight="bold" color="teal.500" textTransform="uppercase">
                          Competencia a Desarrollar:
                        </Text>
                        <Text fontSize="sm" color={textColor} whiteSpace="pre-wrap">
                          {mod.competencia}
                        </Text>
                      </Box>
                    </VStack>
                  ) : (
                    <Text fontSize="sm" color={textColor} whiteSpace="pre-wrap">
                      {mod.raw}
                    </Text>
                  )}
                </Box>
              ))}
            </VStack>
          ) : (
            <Box w="100%" p={3} bg={cardBg} border="1px" borderColor={cardBorder} rounded="md">
              <Text color={mutedText}>No especificado</Text>
            </Box>
          )}
        </VStack>

        <KeyDetail label="Estructura Curricular General" value={payload.estructura_curricular || payload.contenido} />
        <KeyDetail label="Evaluación" value={payload.evaluacion} />
        <KeyDetail label="Cronograma Tentativo" value={payload.cronograma} />

        <DividerWithLabel label="Referencias" />
        <KeyDetail label="Bibliografía" value={payload.bibliografia} />
        
      </VStack>
    </Box>
  );
}