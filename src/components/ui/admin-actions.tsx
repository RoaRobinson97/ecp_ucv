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
  Spinner, // Para el loading de facultades
} from '@chakra-ui/react';
import { CourseEvaluationForm } from '@/components/formularios/course-evaluation-form'; 

import { solicitudesService } from '@/servicios/solicitudes-service';
import { userService } from '@/servicios/users-service'; // ✨ Importado

interface AdminActionsProps {
  solicitudId: string;
  solicitudTipo: string;
  adminOrganismo: string; 
}

const CLASIFICACION_REQUIERE_REMISION = 'Formación para el mejoramiento técnico/profesional';

const CLASSIFICATION_OPTIONS = [
  { value: 'Formación para todo público', description: 'Dirigido a explorar áreas de conocimiento general.' },
  { value: 'Formación para el trabajo', description: 'Profesionalización de oficios mediante el desarrollo de competencias específicas.' },
  { value: 'Formación para toda la vida', description: 'Brinda competencias y herramientas personales útiles en diversos contextos.' },
  { value: CLASIFICACION_REQUIERE_REMISION, description: 'Profundiza en áreas técnicas/profesionales y requiere competencias específicas de ingreso.' },
];


export function AdminActions({ solicitudId, solicitudTipo, adminOrganismo }: AdminActionsProps) {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentClassification, setCurrentClassification] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState('');

  // ESTADOS DE FACULTADES
  const [facultadesList, setFacultadesList] = useState<{id: string, name: string}[]>([]);
  const [isLoadingFacultades, setIsLoadingFacultades] = useState(false);

  const [calificacion, setCalificacion] = useState('');
  const [observacionesEvaluacion, setObservacionesEvaluacion] = useState('');
  const [evaluationFile, setEvaluationFile] = useState<File | null>(null);

  const RUBRICA_EVALUACION_URL = '/sample-local.pdf'; 

  const toast = useToast();
  const router = useRouter(); 
  
  const normalizedTipo = solicitudTipo.toLowerCase();
  const isIndirecta = normalizedTipo.includes('indirecta');
  const isDirecta = normalizedTipo.includes('directa') || (normalizedTipo.includes('curso') && !isIndirecta);
  const isCourseRequest = normalizedTipo.includes('curso');
  
  // EFECTO DE CARGA DE FACULTADES
  useEffect(() => {
    async function loadFacultades() {
      setIsLoadingFacultades(true);
      try {
        const coordinadores = await userService.getCoordinadores();
        const facultadesMapeadas = coordinadores.map((coord: any) => ({
          id: coord.id,
          name: coord.nombres
        }));
        setFacultadesList(facultadesMapeadas);
      } catch (error) {
        console.error("Error al cargar lista de facultades:", error);
      } finally {
        setIsLoadingFacultades(false);
      }
    }
    
    if (isCourseRequest) loadFacultades();
  }, [isCourseRequest]);


  useEffect(() => {
    if (isIndirecta) {
      setCurrentClassification(CLASIFICACION_REQUIERE_REMISION);
    }
    if (!isIndirecta && currentClassification === CLASIFICACION_REQUIERE_REMISION) {
      setCurrentClassification('');
    }
  }, [isIndirecta, solicitudTipo, currentClassification]); 
  
  const isClassifiedForRemission = isCourseRequest && currentClassification === CLASIFICACION_REQUIERE_REMISION;
  const isRemissionSelfHandled = isClassifiedForRemission && selectedFaculty === adminOrganismo;
  const requiresRemision = isDirecta && isClassifiedForRemission && !isRemissionSelfHandled; 
  
  const handleClassificationChange = (value: string) => {
    setCurrentClassification(value);
    if (value !== CLASIFICACION_REQUIERE_REMISION) {
      setSelectedFaculty('');
    }
  };

  const handleAction = async (action: 'Aprobar' | 'Rechazar') => {
    setIsLoading(true);
    let success = false;
    
    // 1. Validación de seguridad (Early return)
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
      // ✨ 2. AQUÍ SE DECLARAN LAS VARIABLES (Para que no te dé error de Cannot find name)
      const nuevoEstado = action === 'Aprobar' ? 'aprobada' : 'rechazada';
      const motivo_rechazo = action === 'Rechazar' ? message : null;

      // ✨ 3. BIFURCACIÓN DE LÓGICA (Con o sin archivo)
      if (action === 'Aprobar' && isCourseRequest) {
          // Flujo CON archivo (FormData)
          const formData = new FormData();
          formData.append('estado', 'aprobada');
          formData.append('calificacion', calificacion);
          
          // Le decimos 'as Blob' para que TypeScript no pelee si el archivo es null
          // (ya validamos arriba que no lo es)
          formData.append('archivo_evaluacion', evaluationFile as Blob); 

          await solicitudesService.updateStatusWithFile(solicitudId, formData);
      } else {
          // Flujo SIN archivo (Cierres, Rechazos, Proveedores)
          await solicitudesService.updateStatus(solicitudId, nuevoEstado, motivo_rechazo);
      }

      toast({
        title: `Solicitud ${action.toLowerCase()} exitosamente.`,
        description: `El estado del expediente ha sido actualizado en el sistema.`,
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

  const handleRemitir = async () => {
    setIsLoading(true);
    try {
      if (!selectedFaculty) throw new Error("Debe seleccionar una facultad.");

      const nombreFacultad = facultadesList.find(f => f.id === selectedFaculty)?.name || selectedFaculty;

      // LLAMADA REAL A LA BASE DE DATOS (Remitir)
      await solicitudesService.updateStatus(solicitudId, 'remitida', `Remitido a: ${nombreFacultad}`);
      
      toast({
        title: `Solicitud remitida exitosamente.`,
        description: `Enviada a ${nombreFacultad}.`,
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

          {isClassifiedForRemission && (
            <FormControl mt={4} isRequired>
              <FormLabel fontWeight="bold">Seleccionar Facultad para Remisión</FormLabel>
              {isLoadingFacultades ? (
                <Spinner size="sm" color="teal.500" />
              ) : (
                <Select 
                  placeholder="Selecciona la facultad de revisión"
                  value={selectedFaculty}
                  sx={{ cursor: 'pointer' }} 
                  onChange={(e) => setSelectedFaculty(e.target.value)}
                >
                  {facultadesList.map((f) => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </Select>
              )}
              {isRemissionSelfHandled && (
              <Text mt={2} color="teal.600" fontWeight="semibold" fontSize="sm">
                ℹ️ Esta solicitud es manejada **internamente** por su organismo. Proceda a Aprobar/Rechazar.
              </Text>
            )}
            </FormControl>
          )}
        </VStack>
      )}
      
      {isIndirecta && (
        <Box mb={8} p={4} rounded="md" border="1px" borderColor={useColorModeValue('teal.300', 'teal.600')} bg={useColorModeValue('teal.50', 'gray.800')}>
            <Heading as="h4" size="sm" mb={1} color="teal.500">Clasificación Administrativa (Fija)</Heading>
            <Text fontWeight="bold">{CLASIFICACION_REQUIERE_REMISION}</Text>
            <Text fontSize="sm" color={useColorModeValue("gray.600", "gray.400")}>
                Las solicitudes indirectas asumen esta clasificación por defecto. No pueden ser remitidas.
            </Text>
        </Box>
      )}

      {isDirecta && !currentClassification && (
        <Text color="red.500" fontWeight="bold" mb={6}>
          ⚠ Es obligatorio seleccionar una clasificación para proceder con cualquier acción.
        </Text>
      )}
      
      <Divider my={6} />

      {requiresRemision ? (
        <Box>
          <Text mb={4} fontWeight="bold">
            Acción Requerida: El curso debe ser remitido para revisión.
          </Text>
          <Button
            colorScheme="blue"
            isLoading={isLoading}
            onClick={handleRemitir}
            isDisabled={!selectedFaculty} 
          >
            Remitir Solicitud a Facultad
          </Button>
        </Box>

      ) : (
        <Box>
            {isCourseRequest && (
                <Box mb={8}>
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
                    isDisabled={!message || (isDirecta && !currentClassification)} 
                >
                    Rechazar
                </Button>
            </VStack>
            
            <Divider my={6} />

            <Box>
                <Button
                    colorScheme="green"
                    isLoading={isLoading}
                    onClick={() => handleAction('Aprobar')}
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