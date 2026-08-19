// components/ui/course-evaluation-form.tsx

"use client";

import React from 'react';
import { 
  // ✅ Importaciones solo de utilidades y contenedores no personalizados
  VStack, 
  Box, 
  Link,
  useColorModeValue,
  Text,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { DownloadIcon } from '@chakra-ui/icons';
import {
  Heading,
  Paragraph,
  Label,
} from "@/components/ui/tipografia";

// ✅ Importamos TODOS los componentes de formulario desde tu librería
import { 
    FormControl, 
    FormLabel, 
    Input, 
    Textarea,
    FileInput,
} from "@/components/ui/form-controls"; 
import { InfoButton } from "@/components/ui/buttons"; 

// Define las props que CourseEvaluationForm necesita
interface CourseEvaluationFormProps {
  // Estado que capturaremos en AdminActions
  calificacion: string;
  setCalificacion: (value: string) => void;
  observacionesEvaluacion: string;
  setObservacionesEvaluacion: (value: string) => void;
  
  // URL del archivo de rúbrica pública
  rubricaUrl: string; 
  
  // Manejo del archivo de prueba
  onFileChange: (file: File | null) => void;
}

export function CourseEvaluationForm({ 
  calificacion,
  setCalificacion,
  observacionesEvaluacion,
  setObservacionesEvaluacion,
  rubricaUrl,
  onFileChange,
}: CourseEvaluationFormProps) {
  
  // 🎨 ESTILOS ARMONIZADOS
  const containerBg = useColorModeValue("white", "gray.700");
  const headingColor = useColorModeValue("teal.600", "teal.300");
  const inputBg = useColorModeValue('white', 'gray.800');
  const inputBorder = useColorModeValue('gray.200', 'gray.600');

  return (
    <VStack 
      spacing={6} 
      align="stretch"
      p={6} 
      rounded="lg" 
      borderWidth="1px" 
      borderColor={useColorModeValue('gray.200', 'gray.600')} 
      shadow="md" 
      bg={containerBg} 
      alignItems={'start'}
    >
      <Heading 
        size="lg" 
        mb={2} 
        marginLeft={0}
        padding={0}
        textAlign="left" 
      >Formulario de Evaluación Final de Curso
      </Heading>

    <Text fontSize="sm" color={useColorModeValue("gray.600", "gray.400")} mb={4}>Complete los campos requeridos para finalizar la revisión y **Aprobar** el curso.
    </Text><Box pb={4} borderBottom="1px" borderColor={useColorModeValue('gray.100', 'gray.700')} w="full">
        <Text mb={3} fontWeight="bold" fontSize="lg" textAlign="left">Documento de Referencia:</Text>
        <NextLink  
            href={rubricaUrl} 
            passHref 
            target="_blank" // Abrir en nueva pestaña
            rel="noopener noreferrer"
        ><InfoButton 
              leftIcon={<DownloadIcon />}
              size="lg" 
            >Descargar Rúbrica de Evaluación</InfoButton>
        </NextLink>

      </Box>

      {/* 2. INPUT DE CALIFICACIÓN OBLIGATORIO */}
      <FormControl isRequired pt={2}>
        <FormLabel fontWeight="bold">Calificación Obtenida (Ej: Aprobado / 85%)</FormLabel>
        <Input
          value={calificacion}
          onChange={(e) => setCalificacion(e.target.value)}
          placeholder="Ingrese la calificación final"
          bg={inputBg}
          borderColor={inputBorder}
          size="lg" // Aseguramos que se mantenga el tamaño
        />
      </FormControl><FileInput
        isRequired
        label="Subir Archivo de Prueba/EvonClick={() => handleAction('Aprobar')}idencia"
        description="Documento (PDF o ZIP) que justifique la calificación otorgada."
        onFileChange={onFileChange} 
      />

      {/* 4. OBSERVACIONES OPCIONALES */}
      <FormControl>
        <FormLabel fontWeight="bold">Observaciones de la Evaluación (Opcional)</FormLabel>
        <Textarea
          value={observacionesEvaluacion}
          onChange={(e) => setObservacionesEvaluacion(e.target.value)}
          placeholder="Observaciones adicionales sobre la evaluación."
          bg={inputBg}
          borderColor={inputBorder}
          rows={4}
        />
      </FormControl>
    </VStack>
  );
}