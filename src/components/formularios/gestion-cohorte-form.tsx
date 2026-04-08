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
  Text // Import Text for the message
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
// ✨ Quitamos useGlobalData si solo usamos el estado del curso
// import { useGlobalData } from "@/app/context/global-data-context";
import CloseCohortModal from "@/components/modals/cerrar-cohorte-modal";
// ✨ Importamos el tipo CourseEstadoGestion si lo tienes definido, o lo definimos aquí
import { Course } from '@/data/types'; // Asumiendo que Course tiene estado_gestion

// ✨ 1. Actualizamos CourseInfo para incluir el estado
interface CourseInfo {
  id: string;
  titulo: string;
  estado_gestion?: Course['estado_gestion']; // Usamos el tipo de Course
}

// Props se mantiene igual
interface CohortPanelProps {
  course: CourseInfo;
}

export default function CohortManagementPanel({ course }: CohortPanelProps) {
  const toast = useToast();
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();
  // ✨ Mantenemos setCohortOpen si la acción de abrir/cerrar debe actualizar un estado global/API
  // const { setCohortOpen } = useGlobalData(); // Descomentar si es necesario

  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [cohortName, setCohortName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [capacity, setCapacity] = useState(20);

  // La lógica para abrir la cohorte sigue siendo relevante
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
      await new Promise(resolve => setTimeout(resolve, 1500));
      // Aquí podrías llamar a una función para actualizar el estado del curso en tu "DB" mock o API real
      // Por ahora, simulamos el éxito y actualizamos el estado global si es necesario
      // setCohortOpen(true); // Descomentar si se usa estado global
      toast({
        title: "Cohorte Abierta.",
        description: `La cohorte "${cohortName}" para "${course.titulo}" ha sido creada con éxito.`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      // Probablemente no quieras redirigir aquí, sino refrescar la data de la página actual
      // router.push(`/`);
      // router.refresh(); // O usar router.refresh() si aplica en tu versión de Next.js
    } catch (error) {
       toast({
        title: "Error al abrir cohorte.",
        description: "Por favor, inténtalo de nuevo más tarde.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmittingForm(false);
    }
  };

  // La lógica para cerrar cohorte (probablemente dentro del Modal) también puede necesitar
  // actualizar el estado_gestion del curso.

  // Datos simulados para una cohorte activa (esto debería venir de la API/estado global eventualmente)
  const activeCohortData = { name: 'Cohorte Primavera 2024', start: '2024-09-01', end: '2024-11-01', cap: 25 };

  return (
    <>
      <Box p={6} border="2px" borderColor="teal.100" rounded="lg" bg="teal.50">
        {/* ✨ 2. CAMBIAMOS LA CONDICIÓN PRINCIPAL */}
        {course.estado_gestion === 'abierto' ? (
          // --- Si el curso está 'abierto', mostramos la gestión ---
          <VStack spacing={4}>
            <Heading as="h2" size="xl" mb={4} textAlign="center" color="teal.800">
              Gestión de Cohorte Abierta
            </Heading>
            {/* Formulario de solo lectura con datos de la cohorte activa */}
            <FormControl id="cohortName-active">
              <FormLabel fontWeight="bold">Nombre de la Cohorte</FormLabel>
              <Input type="text" value={activeCohortData.name} isReadOnly disabled />
            </FormControl>
            <Flex width="full" gap={4}>
              <FormControl id="startDate-active">
                <FormLabel fontWeight="bold">Fecha de Inicio</FormLabel>
                <Input type="date" value={activeCohortData.start} isReadOnly disabled />
              </FormControl>
              <FormControl id="endDate-active">
                <FormLabel fontWeight="bold">Fecha de Fin</FormLabel>
                <Input type="date" value={activeCohortData.end} isReadOnly disabled />
              </FormControl>
            </Flex>
            <FormControl id="capacity-active">
              <FormLabel fontWeight="bold">Capacidad</FormLabel>
              <NumberInput value={activeCohortData.cap} isReadOnly isDisabled>
                <NumberInputField />
              </NumberInput>
            </FormControl>
            <Button onClick={onOpen} colorScheme="red" size="lg" width="full" mt={4}>
              Cerrar Cohorte
            </Button>
          </VStack>
        ) : course.estado_gestion === 'cerrado' ? (
          // --- Si el curso está 'cerrado', mostramos el formulario para abrir ---
          <form onSubmit={handleOpenCohort}>
            <Heading as="h2" size="xl" mb={6} textAlign="center" color="teal.800">
              Abrir Nueva Cohorte
            </Heading>
            <VStack spacing={4}>
             {/* Formulario para abrir cohorte completo */}
              <FormControl id="cohortName" isRequired>
                 <FormLabel>Nombre de la Cohorte</FormLabel>
                 <Input type="text" placeholder="Ej: Cohorte Invierno 2024" value={cohortName} onChange={(e) => setCohortName(e.target.value)} />
              </FormControl>
              <Flex width="full" gap={4}>
                 <FormControl id="startDate" isRequired>
                   <FormLabel>Fecha de Inicio</FormLabel>
                   <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                 </FormControl>
                 <FormControl id="endDate" isRequired>
                   <FormLabel>Fecha de Fin</FormLabel>
                   <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                 </FormControl>
              </Flex>
              <FormControl id="capacity" isRequired>
                 <FormLabel>Capacidad de Estudiantes</FormLabel>
                 <NumberInput min={1} max={100} value={capacity} onChange={(_, valueAsNumber) => setCapacity(valueAsNumber)}>
                   <NumberInputField />
                   <NumberInputStepper>
                     <NumberIncrementStepper />
                     <NumberDecrementStepper />
                   </NumberInputStepper>
                 </NumberInput>
              </FormControl>
              <Button type="submit" colorScheme="teal" size="lg" width="full" mt={4} isLoading={isSubmittingForm} loadingText="Abriendo Cohorte...">
                Abrir Cohorte
              </Button>
            </VStack>
          </form>
        ) : (
           // --- Si el estado es otro (pendiente, aprobado, rechazado) ---
           <Box textAlign="center">
                <Heading as="h3" size="lg" mb={4} color="gray.600">Gestión de Cohorte</Heading>
                <Text color="gray.500">
                    Este curso se encuentra en estado "{course.estado_gestion || 'desconocido'}".
                    La gestión de cohortes solo está disponible para cursos cerrados o abiertos.
                </Text>
           </Box>
        )}
      </Box>
      {/* El Modal para cerrar la cohorte se mantiene */}
      <CloseCohortModal isOpen={isOpen} onClose={onClose} />
    </>
  );
}

