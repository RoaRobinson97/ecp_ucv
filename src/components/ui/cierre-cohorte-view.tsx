"use client";

import { 
  Box, 
  Heading, 
  Text, 
  VStack, 
  SimpleGrid, 
  useColorModeValue, 
  Flex 
} from '@chakra-ui/react';

// Componente para los datos de texto
const DataBox = ({ label, value }: { label: string; value: string | number | undefined }) => {
  const bgColor = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const labelColor = useColorModeValue('gray.500', 'gray.400');

  return (
    <Box p={4} rounded="md" bg={bgColor} border="1px solid" borderColor={borderColor}>
      <Text fontSize="sm" color={labelColor} fontWeight="bold" mb={1}>{label}</Text>
      <Text fontSize="md" fontWeight="medium">
        {value !== undefined && value !== null && value !== '' ? value : 'N/A'}
      </Text>
    </Box>
  );
};

// COMPONENTE INTELIGENTE: Decide si incrustar o mostrar botón de descarga
const EmbeddedViewer = ({ title, url }: { title: string, url: string }) => {
  const bgColor = useColorModeValue('gray.100', 'gray.800');
  const borderColor = useColorModeValue('gray.300', 'gray.600');

  if (!url) return null;

  // Extraemos la extensión de la URL para saber qué hacer
  const extension = url.split('.').pop()?.toLowerCase() || '';
  const isExcel = ['xlsx', 'xls', 'csv'].includes(extension);

  // SI ES EXCEL: Devolvemos la vista clásica de "solo descarga"
  if (isExcel) {
    return (
      <Box p={4} rounded="md" bg={useColorModeValue('gray.50', 'gray.800')} border="1px solid" borderColor={borderColor}>
         <Text 
           as="a" 
           href={url} 
           target="_blank" 
           rel="noopener noreferrer" 
           color="teal.600" 
           fontWeight="bold" 
           _hover={{ textDecoration: "underline" }}
         >
           📊 {title} (Descargar .{extension})
         </Text>
         <Text fontSize="xs" color="gray.500" mt={1}>
           * Los archivos de cálculo no se pueden previsualizar en el navegador.
         </Text>
      </Box>
    );
  }

  // SI ES PDF U OTRO FORMATO: Lo incrustamos con el iframe
  return (
    <Box border="1px solid" borderColor={borderColor} rounded="md" overflow="hidden">
      <Flex bg={bgColor} p={3} borderBottom="1px solid" borderColor={borderColor} justify="space-between" align="center">
        <Text fontWeight="bold" fontSize="sm" color="teal.700">{title}</Text>
        <Text as="a" href={url} target="_blank" rel="noopener noreferrer" fontSize="xs" color="teal.500" fontWeight="bold" _hover={{ textDecoration: 'underline' }}>
          Abrir en pestaña nueva / Descargar
        </Text>
      </Flex>
      <Box w="full" h="400px" bg="gray.50">
        <iframe 
          src={url} 
          width="100%" 
          height="100%" 
          style={{ border: 'none' }}
          title={title}
        />
      </Box>
    </Box>
  );
};

export function CierreCohorteView({ payload }: { payload: any }) { 
  if (!payload) {
    return <Text color="red.500" fontWeight="bold">Error: El payload está vacío.</Text>;
  }

  // ✨ FIX MAESTRO: Si el componente padre pasó el objeto de DB completo, extraemos el 'payload' interno
  const dataReal = payload.payload ? payload.payload : payload;

  const archivos = dataReal.archivos || {};

  return (
    <VStack align="stretch" spacing={6}>
      <Heading as="h3" size="md" borderBottom="1px solid" borderColor="gray.200" pb={2} color="teal.600">
        Reporte de Cierre de Cohorte
      </Heading>
      
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
        {/* Ahora leemos desde dataReal */}
        <DataBox label="Programa / Curso" value={dataReal.titulo_curso} />
        <DataBox label="Identificador de la Cohorte" value={dataReal.nombre_cohorte} />
      </SimpleGrid>

      {dataReal.observaciones && (
        <Box p={4} rounded="md" bg="blue.50" border="1px solid" borderColor="blue.200">
          <Text fontSize="sm" color="blue.600" fontWeight="bold" mb={1}>Observaciones del Proveedor</Text>
          <Text fontSize="md">{dataReal.observaciones}</Text>
        </Box>
      )}

      <Box>
         <Text fontSize="md" color="gray.600" fontWeight="bold" mb={4}>Documentos Respaldatorios</Text>
         <VStack align="stretch" spacing={6}>
            
            <EmbeddedViewer 
              title="1. Listado de Participantes" 
              url={archivos.participantes_url || dataReal.archivo_participantes_url} 
            />
            
            <EmbeddedViewer 
              title="2. Vouchers de Pago" 
              url={archivos.vouchers_url || dataReal.archivo_vouchers_url} 
            />

            <EmbeddedViewer 
              title="3. Encuestas de Satisfacción" 
              url={archivos.encuesta_url || dataReal.archivo_encuesta_url} 
            />

         </VStack>
      </Box>
    </VStack>
  );
}