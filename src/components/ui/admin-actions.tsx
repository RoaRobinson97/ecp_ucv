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
  Spinner, 
} from '@chakra-ui/react';
import { CourseEvaluationForm } from '@/components/formularios/course-evaluation-form'; 

import { solicitudesService } from '@/servicios/solicitudes-service';
import { userService } from '@/servicios/users-service';

interface AdminActionsProps {
  solicitudId: string;
  solicitudTipo: string;
  currentUserId?: string; // ✨ Ahora recibimos el ID del usuario logueado
}

const CLASIFICACION_REQUIERE_REMISION = 'Formación para el mejoramiento técnico/profesional';

const CLASSIFICATION_OPTIONS = [
  { value: 'Formación para todo público', description: 'Dirigido a explorar áreas de conocimiento general.' },
  { value: 'Formación para el trabajo', description: 'Profesionalización de oficios mediante el desarrollo de competencias específicas.' },
  { value: 'Formación para toda la vida', description: 'Brinda competencias y herramientas personales útiles en diversos contextos.' },
  { value: CLASIFICACION_REQUIERE_REMISION, description: 'Profundiza en áreas técnicas/profesionales y requiere competencias específicas de ingreso.' },
];

export function AdminActions({ solicitudId, solicitudTipo, currentUserId }: AdminActionsProps) {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentClassification, setCurrentClassification] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState('');

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
  
  useEffect(() => {
    async function loadFacultades() {
      setIsLoadingFacultades(true);
      try {
        const coordinadores = await userService.getCoordinadores();
        const facultadesMapeadas = coordinadores.map((coord: any) => ({
          id: coord.id,
          name: coord.facultad || `${coord.first_name || coord.nombres} ${coord.last_name || coord.apellidos}`
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
  }, [isIndirecta]);
  
  const isClassifiedForRemission = isCourseRequest && currentClassification === CLASIFICACION_REQUIERE_REMISION;
  
  // ✨ LA LÓGICA MAGISTRAL BLINDADA: Comparamos como Strings absolutos
  const isRemissionSelfHandled = isClassifiedForRemission && String(selectedFaculty) === String(currentUserId);
  
  // ✨ Si es auto-manejada (se eligió a sí mismo), YA NO requiere remisión.
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
      const nuevoEstado = action === 'Aprobar' ? 'aprobada' : 'rechazada';
      const motivo_rechazo = action === 'Rechazar' ? message : undefined; 

      if (action === 'Aprobar' && isCourseRequest) {
          const formData = new FormData();
          formData.append('estado', 'aprobada');
          formData.append('calificacion', calificacion);
          formData.append('archivo_evaluacion', evaluationFile as Blob); 
          // ✨ NUEVO: Guardamos la clasificación incluso si se auto-aprueba
          formData.append('clasificacion', currentClassification); 

          await solicitudesService.updateStatusWithFile(solicitudId, solicitudTipo, formData);
      } else {
          await solicitudesService.updateStatus(solicitudId, solicitudTipo, nuevoEstado, motivo_rechazo as any, {
              // ✨ NUEVO: También la guardamos si se rechaza
              clasificacion: currentClassification 
          });
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

      await solicitudesService.updateStatus(
          solicitudId, 
          solicitudTipo, 
          'under_review', 
          `Remitido a: ${nombreFacultad}` as any, 
          {
              coordinador_id: selectedFaculty, 
              facultad: nombreFacultad,
              tipo_curso: 'formulacion-curso-indirecta' // 🔥 ¡BINGO! Cambio de naturaleza del curso
          }
      );
      
      toast({
        title: `Solicitud redirigida exitosamente.`,
        description: `El curso ahora pertenece a la coordinación de ${nombreFacultad} como curso indirecto.`,
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
              {/* ✨ AVISO CLARO CUANDO SE ELIGE A SÍ MISMO */}
              {isRemissionSelfHandled && (
              <Box mt={3} p={3} bg="blue.50" borderLeft="4px solid" borderColor="blue.500" rounded="md">
                <Text color="blue.700" fontWeight="semibold" fontSize="sm">
                  ℹ️ Has seleccionado tu propia coordinación. Por lo tanto, no necesitas remitir la solicitud. Procede a evaluarla y aprobarla/rechazarla a continuación.
                </Text>
              </Box>
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

      {/* ✨ RENDERIZADO CONDICIONAL: Si requiere remisión (y NO es a sí mismo), muestra botón de remitir */}
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
        /* ✨ Si NO requiere remisión (porque es curso normal o se eligió a sí mismo), muestra evaluación */
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

            {/* ✨ AVISO VISUAL DE BOTÓN BLOQUEADO */}
            {isCourseRequest && (!calificacion || !evaluationFile) && (
                <Text color="red.500" fontSize="sm" fontWeight="bold" textAlign="center" mb={4}>
                    ⚠ Debes ingresar la calificación y subir el archivo de evidencia para poder Aprobar.
                </Text>
            )}

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