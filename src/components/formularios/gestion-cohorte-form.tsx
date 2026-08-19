"use client";

import React, { useState } from 'react';
import {
  Box,
  Heading,
  Flex,
  VStack,
  Button,
  FormControl,
  FormLabel,
  Input,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  useToast,
  useDisclosure,
  Text,
  useColorModeValue
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import CloseCohortModal from "@/components/modals/cerrar-cohorte-modal";
import { Course } from '@/data/types'; 
import { courseService } from '@/servicios/cursos-service';

// ✨ 1. ACTUALIZAMOS LA INTERFAZ PARA RECIBIR EL CONTRATO
interface CourseInfo {
  id: string;
  titulo: string;
  estado_gestion?: string; 
  estado?: string;
  contrato_id?: string;
  documento_legal_id?: string;
}

interface CohortPanelProps {
  course: CourseInfo;
}

export default function CohortManagementPanel({ course }: CohortPanelProps) {
  const toast = useToast();
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [cohortName, setCohortName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [capacity, setCapacity] = useState(20);

  // ✨ COLORES DINÁMICOS PARA MODO CLARO Y OSCURO
  const panelBg = useColorModeValue("gray.50", "gray.800"); 
  const panelBorder = useColorModeValue("teal.500", "teal.300");
  const headingColor = useColorModeValue("teal.700", "teal.300");
  const labelColor = useColorModeValue("gray.800", "gray.200");
  const textColor = useColorModeValue("black", "white");
  const inputBg = useColorModeValue("white", "gray.900");
  const inputBorder = useColorModeValue("gray.300", "gray.600");
  const mutedColor = useColorModeValue("gray.500", "gray.400");
  const readOnlyBg = useColorModeValue("gray.100", "gray.700");

  // ✨ 2. LÓGICA BLINDADA: Determinamos si de verdad puede abrir cohorte
  const estadoReal = String(course.estado_gestion || course.estado).toLowerCase();
  const hasContract = !!(course.contrato_id || course.documento_legal_id);
  
  const isAbierto = estadoReal === 'abierto';
  // Es amparado si dice "cerrado", O si dice "aprobado/a" pero YA TIENE CONTRATO
  const isAmparado = estadoReal === 'cerrado' || ((estadoReal === 'aprobada' || estadoReal === 'aprobado') && hasContract);

  const handleOpenCohort = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmittingForm(true);

    if (!cohortName || !startDate || !endDate || capacity <= 0) {
       toast({
        title: "Error de validación.",
        description: "Por favor, completa todos los campos requeridos.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setIsSubmittingForm(false);
      return;
    }

    try {
      // LLAMADA REAL A LA API
      await courseService.openCohort(course.id, { 
          cohortName, 
          startDate, 
          endDate, 
          capacity 
      });

      toast({
        title: "Cohorte Abierta.",
        description: `La cohorte "${cohortName}" ha sido iniciada. Los alumnos ya pueden verla.`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      
      // Refrescamos la página para que el componente cambie a la vista de "Cohorte Activa"
      window.location.reload();

    } catch (error: any) {
       toast({
        title: "Error al abrir cohorte.",
        description: error.message || "Por favor, inténtalo de nuevo más tarde.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmittingForm(false);
    }
  };

  const activeCohortData = { name: 'Cohorte Primavera 2024', start: '2024-09-01', end: '2024-11-01', cap: 25 };

  return (
    <>
      <Box p={6} borderTop="4px solid" borderColor={panelBorder} rounded="lg" bg={panelBg} shadow="md">
        
        {/* ✨ 3. REEMPLAZAMOS LAS CONDICIONES DE RENDERIZADO */}
        {isAbierto ? (
          // --- Si el curso está 'abierto', mostramos la gestión ---
          <VStack spacing={4}>
            <Heading as="h2" size="xl" mb={4} textAlign="center" color={headingColor}>
              Gestión de Cohorte Abierta
            </Heading>
            
            <FormControl id="cohortName-active">
              <FormLabel fontWeight="bold" color={labelColor}>Nombre de la Cohorte</FormLabel>
              <Input type="text" value={activeCohortData.name} bg={readOnlyBg} color={textColor} borderColor={inputBorder} isReadOnly disabled _disabled={{ opacity: 0.8, cursor: 'not-allowed' }} />
            </FormControl>
            <Flex width="full" gap={4}>
              <FormControl id="startDate-active">
                <FormLabel fontWeight="bold" color={labelColor}>Fecha de Inicio</FormLabel>
                <Input type="date" value={activeCohortData.start} bg={readOnlyBg} color={textColor} borderColor={inputBorder} isReadOnly disabled _disabled={{ opacity: 0.8, cursor: 'not-allowed' }} css={{ colorScheme: 'dark' }} />
              </FormControl>
              <FormControl id="endDate-active">
                <FormLabel fontWeight="bold" color={labelColor}>Fecha de Fin</FormLabel>
                <Input type="date" value={activeCohortData.end} bg={readOnlyBg} color={textColor} borderColor={inputBorder} isReadOnly disabled _disabled={{ opacity: 0.8, cursor: 'not-allowed' }} css={{ colorScheme: 'dark' }} />
              </FormControl>
            </Flex>
            <FormControl id="capacity-active">
              <FormLabel fontWeight="bold" color={labelColor}>Capacidad</FormLabel>
              <NumberInput value={activeCohortData.cap} bg={readOnlyBg} color={textColor} borderColor={inputBorder} isReadOnly isDisabled _disabled={{ opacity: 0.8, cursor: 'not-allowed' }}>
                <NumberInputField />
              </NumberInput>
            </FormControl>
            <Button onClick={onOpen} colorScheme="red" size="lg" width="full" mt={4}>
              Cerrar Cohorte
            </Button>
          </VStack>
          
        ) : isAmparado ? (
          
          // --- Si el curso está amparado legalmente, mostramos el formulario para abrir ---
          <form onSubmit={handleOpenCohort}>
            <Heading as="h2" size="xl" mb={6} textAlign="center" color={headingColor}>
              Abrir Nueva Cohorte
            </Heading>
            <VStack spacing={4}>
              <FormControl id="cohortName" isRequired>
                 <FormLabel color={labelColor} fontWeight="medium">Nombre de la Cohorte</FormLabel>
                 <Input 
                    type="text" 
                    placeholder="Ej: Cohorte Invierno 2024" 
                    value={cohortName} 
                    onChange={(e) => setCohortName(e.target.value)} 
                    bg={inputBg}
                    color={textColor}
                    borderColor={inputBorder}
                    _placeholder={{ color: mutedColor }}
                 />
              </FormControl>
              <Flex width="full" gap={4}>
                 <FormControl id="startDate" isRequired>
                   <FormLabel color={labelColor} fontWeight="medium">Fecha de Inicio</FormLabel>
                   <Input 
                      type="date" 
                      value={startDate} 
                      onChange={(e) => setStartDate(e.target.value)} 
                      bg={inputBg}
                      color={textColor}
                      borderColor={inputBorder}
                   />
                 </FormControl>
                 <FormControl id="endDate" isRequired>
                   <FormLabel color={labelColor} fontWeight="medium">Fecha de Fin</FormLabel>
                   <Input 
                      type="date" 
                      value={endDate} 
                      onChange={(e) => setEndDate(e.target.value)} 
                      bg={inputBg}
                      color={textColor}
                      borderColor={inputBorder}
                   />
                 </FormControl>
              </Flex>
              <FormControl id="capacity" isRequired>
                 <FormLabel color={labelColor} fontWeight="medium">Capacidad de Estudiantes</FormLabel>
                 <NumberInput 
                    min={1} max={100} 
                    value={capacity} 
                    onChange={(_, valueAsNumber) => setCapacity(valueAsNumber)}
                 >
                   <NumberInputField bg={inputBg} color={textColor} borderColor={inputBorder} />
                   <NumberInputStepper>
                     <NumberIncrementStepper color={textColor} borderColor={inputBorder} />
                     <NumberDecrementStepper color={textColor} borderColor={inputBorder} />
                   </NumberInputStepper>
                 </NumberInput>
              </FormControl>
              <Button type="submit" colorScheme="teal" size="lg" width="full" mt={6} isLoading={isSubmittingForm} loadingText="Abriendo Cohorte...">
                Confirmar y Abrir Cohorte
              </Button>
            </VStack>
          </form>
          
        ) : (
           // --- Si el estado es otro (pendiente, aprobado sin contrato, rechazado) ---
           <Box textAlign="center" py={4}>
                <Heading as="h3" size="md" mb={4} color={headingColor}>Gestión de Cohorte</Heading>
                <Text color={mutedColor} fontSize="sm">
                    Este programa académico se encuentra en estado <strong>"{estadoReal || 'desconocido'}"</strong>.
                    La apertura de cohortes requiere que el curso esté amparado legalmente.
                </Text>
           </Box>
        )}
      </Box>
      <CloseCohortModal 
          isOpen={isOpen} 
          onClose={onClose} 
          courseId={course.id} 
          courseTitle={course.titulo} 
          cohortName={activeCohortData.name} 
      />
    </>
  );
}