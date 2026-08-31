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
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import CloseCohortModal from "@/components/modals/cerrar-cohorte-modal";
import { Course } from '@/data/types';
import { courseService } from '@/servicios/cursos-service';

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

  const estadoReal = String(course.estado_gestion || course.estado).toLowerCase();
  const hasContract = !!(course.contrato_id || course.documento_legal_id);

  const isAbierto = estadoReal === 'abierto';
  const isAmparado = estadoReal === 'cerrado' || ((estadoReal === 'aprobada' || estadoReal === 'aprobado') && hasContract);

  const handleOpenCohort = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmittingForm(true);

    if (!cohortName || !startDate || !endDate || capacity <= 0) {
      toast({ title: "Error de validación.", description: "Por favor, completa todos los campos requeridos.", status: "error", duration: 3000, isClosable: true });
      setIsSubmittingForm(false);
      return;
    }

    try {
      await courseService.openCohort(course.id, { cohortName, startDate, endDate, capacity });
      toast({ title: "Cohorte Abierta.", description: `La cohorte "${cohortName}" ha sido iniciada. Los alumnos ya pueden verla.`, status: "success", duration: 5000, isClosable: true });
      window.location.reload();
    } catch (error: any) {
      toast({ title: "Error al abrir cohorte.", description: error.message || "Por favor, inténtalo de nuevo más tarde.", status: "error", duration: 5000, isClosable: true });
    } finally {
      setIsSubmittingForm(false);
    }
  };

  const activeCohortData = { name: 'Cohorte Primavera 2024', start: '2024-09-01', end: '2024-11-01', cap: 25 };

  return (
    <>
      <Box p={6} borderTop="4px solid" borderColor="primary" rounded="lg" bg="surface" shadow="md">
        {isAbierto ? (
          <VStack spacing={4}>
            <Heading as="h2" size="lg" mb={4} textAlign="center" color="primary">
              Gestión de Cohorte Abierta
            </Heading>
            
            <FormControl id="cohortName-active">
              <FormLabel fontWeight="bold" color="text.primary">Nombre de la Cohorte</FormLabel>
              <Input type="text" value={activeCohortData.name} bg="neutral" color="text.primary" borderColor="border" isReadOnly isDisabled _disabled={{ opacity: 0.8, cursor: 'not-allowed' }} />
            </FormControl>
            
            <Flex width="full" gap={4}>
              <FormControl id="startDate-active">
                <FormLabel fontWeight="bold" color="text.primary">Fecha de Inicio</FormLabel>
                <Input type="date" value={activeCohortData.start} bg="neutral" color="text.primary" borderColor="border" isReadOnly isDisabled _disabled={{ opacity: 0.8, cursor: 'not-allowed' }} />
              </FormControl>
              <FormControl id="endDate-active">
                <FormLabel fontWeight="bold" color="text.primary">Fecha de Fin</FormLabel>
                <Input type="date" value={activeCohortData.end} bg="neutral" color="text.primary" borderColor="border" isReadOnly isDisabled _disabled={{ opacity: 0.8, cursor: 'not-allowed' }} />
              </FormControl>
            </Flex>
            
            <FormControl id="capacity-active">
              <FormLabel fontWeight="bold" color="text.primary">Capacidad</FormLabel>
              <NumberInput value={activeCohortData.cap} bg="neutral" color="text.primary" borderColor="border" isReadOnly isDisabled _disabled={{ opacity: 0.8, cursor: 'not-allowed' }}>
                <NumberInputField />
              </NumberInput>
            </FormControl>
            
            <Button onClick={onOpen} colorScheme="red" size="lg" width="full" mt={4}>
              Cerrar Cohorte
            </Button>
          </VStack>
        ) : isAmparado ? (
          <form onSubmit={handleOpenCohort}>
            <Heading as="h2" size="lg" mb={6} textAlign="center" color="primary">
              Abrir Nueva Cohorte
            </Heading>
            
            <VStack spacing={4}>
              <FormControl id="cohortName" isRequired>
                <FormLabel color="text.primary" fontWeight="bold">Nombre de la Cohorte</FormLabel>
                <Input 
                  type="text" 
                  placeholder="Ej: Cohorte Invierno 2024" 
                  value={cohortName} 
                  onChange={(e) => setCohortName(e.target.value)} 
                  bg="background"
                  color="text.primary"
                  borderColor="border"
                  focusBorderColor="primary"
                  _placeholder={{ color: "text.muted" }}
                />
              </FormControl>
              
              <Flex width="full" gap={4}>
                <FormControl id="startDate" isRequired>
                  <FormLabel color="text.primary" fontWeight="bold">Fecha de Inicio</FormLabel>
                  <Input 
                    type="date" 
                    value={startDate} 
                    onChange={(e) => setStartDate(e.target.value)} 
                    bg="background"
                    color="text.primary"
                    borderColor="border"
                    focusBorderColor="primary"
                  />
                </FormControl>
                <FormControl id="endDate" isRequired>
                  <FormLabel color="text.primary" fontWeight="bold">Fecha de Fin</FormLabel>
                  <Input 
                    type="date" 
                    value={endDate} 
                    onChange={(e) => setEndDate(e.target.value)} 
                    bg="background"
                    color="text.primary"
                    borderColor="border"
                    focusBorderColor="primary"
                  />
                </FormControl>
              </Flex>
              
              <FormControl id="capacity" isRequired>
                <FormLabel color="text.primary" fontWeight="bold">Capacidad de Estudiantes</FormLabel>
                <NumberInput 
                  min={1} max={100} 
                  value={capacity} 
                  onChange={(_, valueAsNumber) => setCapacity(valueAsNumber)}
                  focusBorderColor="primary" // ✨ MOVIDO AL CONTENEDOR PADRE
                >
                  {/* ✨ REMOVIDO DEL HIJO PARA EVITAR EL ERROR DE TYPESCRIPT */}
                  <NumberInputField bg="background" color="text.primary" borderColor="border" />
                  <NumberInputStepper>
                    <NumberIncrementStepper color="text.primary" borderColor="border" />
                    <NumberDecrementStepper color="text.primary" borderColor="border" />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
              
              <Button type="submit" colorScheme="teal" size="lg" width="full" mt={6} isLoading={isSubmittingForm} loadingText="Abriendo Cohorte...">
                Confirmar y Abrir Cohorte
              </Button>
            </VStack>
          </form>
        ) : (
          <Box textAlign="center" py={4}>
            <Heading as="h3" size="md" mb={4} color="primary">Gestión de Cohorte</Heading>
            <Text color="text.muted" fontSize="sm">
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