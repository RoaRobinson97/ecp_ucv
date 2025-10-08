// components/ui/admin-actions.tsx

"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Box, 
  Heading, 
  Textarea, 
  Button, 
  useToast, 
  useColorModeValue, 
  Text, 
  Divider, 
  VStack,
  Radio,
  RadioGroup,
  Stack,
  Select,
  FormLabel,
  FormControl,
} from '@chakra-ui/react';
import { CourseEvaluationForm } from '@/components/formularios/course-evaluation-form'; 

interface AdminActionsProps {
  solicitudId: string;
  solicitudTipo: string;
  adminOrganismo: string; 
}

// Opciones de clasificación (Mover aquí para que sean internas)
const CLASIFICACION_REQUIERE_REMISION = 'Formación para el mejoramiento técnico/profesional';
const FACULTADES_MOCK = [
  { id: 'ing', name: 'Facultad de Ingeniería' },
  { id: 'cien', name: 'Facultad de Ciencias y Tecnología' },
  { id: 'hum', name: 'Facultad de Humanidades y Artes' },
  { id: 'salud', name: 'Facultad de Ciencias de la Salud' },
];

const CLASSIFICATION_OPTIONS = [
  { value: 'Formación para todo público', description: 'Dirigido a explorar áreas de conocimiento general.' },
  { value: 'Formación para el trabajo', description: 'Profesionalización de oficios mediante el desarrollo de competencias específicas.' },
  { value: 'Formación para toda la vida', description: 'Brinda competencias y herramientas personales útiles en diversos contextos.' },
  { value: CLASIFICACION_REQUIERE_REMISION, description: 'Profundiza en áreas técnicas/profesionales y requiere competencias específicas de ingreso.' },
];


export function AdminActions({ solicitudId, solicitudTipo, adminOrganismo }: AdminActionsProps) {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // Estado interno para la clasificación del curso
  const [currentClassification, setCurrentClassification] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState('');

  // NUEVOS ESTADOS PARA EL FORMULARIO DE EVALUACIÓN
  const [calificacion, setCalificacion] = useState('');
  const [observacionesEvaluacion, setObservacionesEvaluacion] = useState('');
  const [evaluationFile, setEvaluationFile] = useState<File | null>(null);

  const RUBRICA_EVALUACION_URL = '/sample-local.pdf'; 

  const toast = useToast();
  const router = useRouter(); 
  
  // NUEVAS VARIABLES CONDICIONALES
  const isIndirecta = solicitudTipo === 'Formulación de Curso - Indirecta';
  const isDirecta = solicitudTipo === 'Formulación de Curso - Directa';
  const isCourseRequest = solicitudTipo.startsWith('Formulación de Curso')

  // EFECTO para inicializar la clasificación si es Indirecta
  useEffect(() => {
    if (isIndirecta) {
      setCurrentClassification(CLASIFICACION_REQUIERE_REMISION);
    }
    // Resetear la clasificación si el tipo de solicitud cambia a no-indirecta
    if (!isIndirecta && currentClassification === CLASIFICACION_REQUIERE_REMISION) {
      setCurrentClassification('');
    }
  }, [isIndirecta, solicitudTipo]); 
  

  // Determina si la clasificación es la que potencialmente requiere remisión.
  const isClassifiedForRemission = isCourseRequest && currentClassification === CLASIFICACION_REQUIERE_REMISION;

  // Determina si la revisión es "interna" (facultad seleccionada == organismo del admin).
  const isRemissionSelfHandled = isClassifiedForRemission && selectedFaculty === adminOrganismo;

  // Lógica FINAL:
  // Si es INDIRECTA, NO puede requerir remisión externa (isDirecta es false).
  // Si es DIRECTA, requiere remisión externa SÓLO si es clasificado así Y NO es manejo interno.
  const requiresRemision = isDirecta && isClassifiedForRemission && !isRemissionSelfHandled; 
  
  // Handler para la clasificación
  const handleClassificationChange = (value: string) => {
    setCurrentClassification(value);
    // Limpiar facultad si la opción no requiere remisión
    if (value !== CLASIFICACION_REQUIERE_REMISION) {
      setSelectedFaculty('');
    }
  };


  // Handler para Aprobar/Rechazar
  const handleAction = async (action: 'Aprobar' | 'Rechazar') => {
    setIsLoading(true);
    let success = false;
    
    // VALIDACIÓN PARA APROBAR CURSOS
    if (action === 'Aprobar' && isCourseRequest) {
        if (!calificacion || !evaluationFile) {
            toast({
                title: "Faltan datos de evaluación.",
                description: "Debe ingresar la calificación y seleccionar el archivo de prueba para aprobar.",
                status: "warning",
                duration: 5000,
                isClosable: true,
            });
            setIsLoading(false);
            return;
        }
    }
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500)); 

      console.log(`Acción: ${action} en ${solicitudId}. Clasificación: ${currentClassification}`);
      if (action === 'Aprobar') {
        console.log('Datos de Evaluación:', {
          Calificación: calificacion,
          Observaciones: observacionesEvaluacion,
          ArchivoEvidencia: evaluationFile ? evaluationFile.name : 'N/A'
        });
      } else {
        console.log('Motivo de Rechazo:', message);
      }

      toast({
        title: `Solicitud ${action} exitosamente.`,
        description: `Procesada como ${currentClassification || solicitudTipo}.`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      
      success = true;
      
    } catch (error) {
      toast({
        title: "Error al procesar la acción.",
        description: error instanceof Error ? error.message : "Hubo un problema al intentar procesar.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
      setMessage(''); 
      
      if (success) {
        router.push('/admin/solicitudes'); 
      }
    }
  };


  // Handler para Remitir a Facultad
  const handleRemitir = async () => {
    setIsLoading(true);
    try {
      if (!selectedFaculty) throw new Error("Debe seleccionar una facultad.");

      await new Promise(resolve => setTimeout(resolve, 1500)); 
      
      console.log(`Remitir Solicitud ${solicitudId} a Facultad: ${selectedFaculty}`);

      toast({
        title: `Solicitud remitida exitosamente.`,
        description: `Enviada a la Facultad ${FACULTADES_MOCK.find(f => f.id === selectedFaculty)?.name || selectedFaculty}.`,
        status: "info",
        duration: 5000,
        isClosable: true,
      });

      router.push('/admin/solicitudes');
      
    } catch (error) {
      toast({
        title: "Error al remitir.",
        description: error instanceof Error ? error.message : "Hubo un problema al intentar remitir.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
      setMessage('');
    }
  };


  return (
    <Box mt={0} p={6} rounded="lg" bg={useColorModeValue('gray.100', 'gray.700')}>
      <Heading as="h3" size="md" mb={4}>Acciones del Administrador</Heading>
      
      {/* 1. SECCIÓN DE CLASIFICACIÓN (Solo para DIRECTA) */}
      {isDirecta && (
        <VStack spacing={6} align="stretch" mb={8} p={4} rounded="md" border="1px" borderColor={useColorModeValue('gray.300', 'gray.600')}>
          <Heading as="h4" size="sm">Clasificación Administrativa del Curso</Heading>
          
          <RadioGroup onChange={handleClassificationChange} value={currentClassification}>
            <Stack direction="column" spacing={4}>
              {CLASSIFICATION_OPTIONS.map((op) => (
                <Radio key={op.value} value={op.value} size="md">
                  <VStack align="start" spacing={0}>
                    <Text fontWeight="semibold">{op.value}</Text>
                    <Text fontSize="sm" color={useColorModeValue("gray.600", "gray.400")}>{op.description}</Text>
                  </VStack>
                </Radio>
              ))}
            </Stack>
          </RadioGroup>

          {/* Selector de Facultad Condicional (Solo si clasificado para remisión) */}
          {isClassifiedForRemission && (
            <FormControl mt={4} isRequired>
              <FormLabel fontWeight="bold">Seleccionar Facultad para Remisión</FormLabel>
              <Select 
                placeholder="Selecciona la facultad de revisión"
                value={selectedFaculty}
                sx={{ cursor: 'pointer' }} 
                onChange={(e) => setSelectedFaculty(e.target.value)}
              >
                {FACULTADES_MOCK.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </Select>
              {isRemissionSelfHandled && (
              <Text mt={2} color="teal.600" fontWeight="semibold" fontSize="sm">
                ℹ️ Esta solicitud es manejada **internamente** por su organismo. Proceda a Aprobar/Rechazar.
              </Text>
            )}
            </FormControl>
          )}
        </VStack>
      )}
      
      {/* Aviso de Clasificación Fija para INDIRECTA */}
      {isIndirecta && (
        <Box mb={8} p={4} rounded="md" border="1px" borderColor={useColorModeValue('teal.300', 'teal.600')} bg={useColorModeValue('teal.50', 'gray.800')}>
            <Heading as="h4" size="sm" mb={1} color="teal.500">Clasificación Administrativa (Fija)</Heading>
            <Text fontWeight="bold">{CLASIFICACION_REQUIERE_REMISION}</Text>
            <Text fontSize="sm" color={useColorModeValue("gray.600", "gray.400")}>
                Las solicitudes indirectas asumen esta clasificación por defecto. No pueden ser remitidas.
            </Text>
        </Box>
      )}

      {/* Mensaje de advertencia si es de curso pero no clasificado (Solo para DIRECTA) */}
      {isDirecta && !currentClassification && (
        <Text color="red.500" fontWeight="bold" mb={6}>
          ⚠ Es obligatorio seleccionar una clasificación para proceder con cualquier acción.
        </Text>
      )}
      
      <Divider my={6} />

      {/* 2. BOTONES DE ACCIÓN CONDICIONAL */}

      {/* Caso: Requiere Remisión (Opción 4 en solicitud DIRECTA) */}
      {requiresRemision ? (
        <Box>
          <Text mb={4} fontWeight="bold">
            Acción Requerida: El curso debe ser remitido para revisión.
          </Text>
          <Button
            colorScheme="blue"
            isLoading={isLoading}
            onClick={handleRemitir}
            isDisabled={!selectedFaculty} // Deshabilitado si no hay facultad seleccionada
          >
            Remitir Solicitud a Facultad
          </Button>
        </Box>

      ) : (
        // Casos: Aprobar/Rechazar (Opciones 1, 2, 3, INDIRECTA, o si NO es solicitud de curso)
        
        <Box>
            {isCourseRequest && (
                <Box mb={8}>
                    {/* El formulario de evaluación se muestra siempre que sea de curso y no requiera remisión */}
                    <CourseEvaluationForm 
                        calificacion={calificacion}
                        setCalificacion={setCalificacion}
                        observacionesEvaluacion={observacionesEvaluacion}
                        setObservacionesEvaluacion={setObservacionesEvaluacion}
                        rubricaUrl={RUBRICA_EVALUACION_URL}
                        onFileChange={setEvaluationFile}
                    />
                </Box>
            )}
            <VStack spacing={4} align="stretch" mb={4}>
                {/* Botón de Rechazar */}
                <Heading as="h4" size="sm">Rechazar Solicitud</Heading>
                <Text fontSize="sm" color="gray.500" fontStyle="italic">
                    * Para rechazar la solicitud, debes incluir una razón o las observaciones.
                </Text>
                <Textarea
                    placeholder="Escribe aquí las observaciones o el motivo del rechazo."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    bg={useColorModeValue('white', 'gray.800')}
                    borderColor={useColorModeValue('gray.200', 'gray.600')}
                    _hover={{ borderColor: useColorModeValue('gray.300', 'gray.500') }}
                />
                <Button
                    colorScheme="red"
                    isLoading={isLoading}
                    onClick={() => handleAction('Rechazar')}
                    // Deshabilitado si: 1) no hay mensaje, O 2) es un curso DIRECTA y no está clasificado
                    isDisabled={!message || (isDirecta && !currentClassification)} 
                >
                    Rechazar
                </Button>
            </VStack>
            
            <Divider my={6} />

            {/* Botón de Aprobar */}
            <Box>
                <Button
                    colorScheme="green"
                    isLoading={isLoading}
                    onClick={() => handleAction('Aprobar')}
                    // Deshabilitado si: 1) es un curso DIRECTA y no está clasificado, O 2) faltan datos de evaluación obligatorios
                    isDisabled={(isDirecta && !currentClassification) || (isCourseRequest && (!calificacion || !evaluationFile))} 
                >
                    Aprobar
                </Button>
            </Box>
        </Box>
      )}
    </Box>
  );
}