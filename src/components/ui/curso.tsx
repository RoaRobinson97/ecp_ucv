// app/curso/[courseId]/CourseClientPage.tsx
"use client";

import React, { useState } from 'react';
import {
  Box,
  Heading,
  Text,
  Flex,
  VStack,
  Divider,
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
  Link as ChakraLink,
  useDisclosure,
} from "@chakra-ui/react";
import NextLink from 'next/link';
import { useGlobalData } from "@/app/context/global-data-context";
import { useRouter } from "next/navigation";
import CloseCohortModal from "@/components/modals/cerrar-cohorte-modal"

// El componente ahora recibe el courseId como una prop
export default function CourseClientPage({ courseId }: { courseId: string }) {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Estados locales para el formulario
  const [cohortName, setCohortName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [capacity, setCapacity] = useState(20);
  
  // Usa el contexto global para leer y actualizar el estado de la cohorte
  const { isCohortOpen, setCohortOpen } = useGlobalData();
  const router = useRouter();

  // Simulated course data
  const currentCourse = {
    id: courseId,
    denominacion: "Marketing Digital para Emprendedores",
    proposito: "Capacitar a emprendedores en estrategias de marketing digital para impulsar sus negocios online, abarcando SEO, SEM, redes sociales, email marketing y analítica web.",
    fundamentacion: "En la era digital, la visibilidad online es crucial para el éxito empresarial. Este curso está diseñado para proporcionar a los emprendedores las herramientas y conocimientos prácticos necesarios para competir eficazmente y alcanzar a su público objetivo.",
    duracion: "40 horas",
    estructuraCostos: "La inversión total por participante es de $350 USD, que incluye acceso a todos los módulos online, materiales didácticos descargables, sesiones de mentoría en vivo y la certificación final de aprobación.",
    perfilDocente: "El docente es un profesional con más de 10 años de experiencia en la industria de la tecnología y el marketing, con certificaciones en Google Ads, Meta Blueprint y un master en analítica digital. Ha impartido clases en diversas universidades y colaborado con startups y grandes corporaciones.",
    perfiles: "Perfil de Ingreso: Emprendedores, dueños de PYMES o profesionales que deseen adquirir o reforzar sus conocimientos en marketing digital. Perfil de Egreso: Participantes capaces de diseñar, implementar y medir una estrategia de marketing digital integral, optimizando campañas y tomando decisiones basadas en datos.",
    exigencias: "Acceso a un ordenador con conexión a internet estable, una cuenta de correo electrónico activa y cuentas en las principales redes sociales. No se requieren conocimientos previos, aunque se recomienda una comprensión básica del uso de navegadores web.",
    estructuraCurricular: "Módulo 1: Fundamentos de Marketing Digital. Módulo 2: SEO y Contenido. Módulo 3: Publicidad en Google Ads y Meta. Módulo 4: Email Marketing y Automatización. Módulo 5: Analítica Web y Estrategias de Crecimiento.",
    evaluacion: "La evaluación se compone de un 40% de participación activa en los foros y sesiones en vivo, un 30% en la entrega de proyectos modulares prácticos y un 30% en un proyecto final integrador, donde cada estudiante deberá presentar un plan de marketing para su negocio.",
    cronograma: "El curso se desarrollará a lo largo de 8 semanas. Las sesiones en vivo se realizarán los martes y jueves de 19:00 a 21:00 (hora de Caracas). Las actividades asíncronas podrán ser completadas en el horario de preferencia del participante.",
    providerCode: "CODE-XYZ-123",
    userId: "AUTH-USER-456",
  };
  
  // Objeto con información simulada para la cohorte activa
  const activeCohortData = {
      name: 'Cohorte Primavera 2024',
      start: '2024-09-01',
      end: '2024-11-01',
      cap: 25,
  };

  const handleOpenCohort = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    if (!cohortName || !startDate || !endDate || capacity <= 0) {
      toast({
        title: "Error de validación.",
        description: "Por favor, completa todos los campos requeridos.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setIsLoading(false);
      return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setCohortOpen(true); // Actualiza el estado global a 'true'
      
      toast({
        title: "Cohorte Abierta.",
        description: `La cohorte "${cohortName}" para "${currentCourse.denominacion}" ha sido creada con éxito.`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      router.push(`/`); // Redirige a la página principal

    } catch (error) {
      toast({
        title: "Error al abrir cohorte.",
        description: "Por favor, inténtalo de nuevo más tarde.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box maxW="4xl" mx="auto" p={8} my={8} bg="white" rounded="lg" shadow="xl">
      <VStack spacing={8} align="stretch">
        <Heading as="h1" size="2xl" textAlign="center" color="teal.700">
          Detalles del Curso: "{currentCourse.denominacion}"
        </Heading>
        <Text fontSize="lg" textAlign="center" color="gray.600">
          Explora la información de este curso y configura una nueva cohorte.
        </Text>

        <Divider borderColor="gray.300" />

        <Box>
          <Heading as="h2" size="lg" mb={4} color="teal.600">
            Descripción General
          </Heading>
          <Text mb={2}><Text as="span" fontWeight="bold">Propósito:</Text> {currentCourse.proposito}</Text>
          <Text mb={2}><Text as="span" fontWeight="bold">Fundamentación:</Text> {currentCourse.fundamentacion}</Text>
          <Text mb={2}><Text as="span" fontWeight="bold">Duración:</Text> {currentCourse.duracion}</Text>
          <Text mb={2}><Text as="span" fontWeight="bold">Estructura de Costos:</Text> {currentCourse.estructuraCostos}</Text>
        </Box>

        <Divider borderColor="gray.300" />

        <Box>
          <Heading as="h2" size="lg" mb={4} color="teal.600">
            Perfiles y Exigencias
          </Heading>
          <Text mb={2}><Text as="span" fontWeight="bold">Perfil del Docente:</Text> {currentCourse.perfilDocente}</Text>
          <Text mb={2}><Text as="span" fontWeight="bold">Perfiles de Ingreso/Egreso:</Text> {currentCourse.perfiles}</Text>
          <Text mb={2}><Text as="span" fontWeight="bold">Exigencias:</Text> {currentCourse.exigencias}</Text>
        </Box>

        <Divider borderColor="gray.300" />

        <Box>
          <Heading as="h2" size="lg" mb={4} color="teal.600">
            Aspectos Curriculares y Logísticos
          </Heading>
          <Text mb={2}><Text as="span" fontWeight="bold">Estructura Curricular:</Text> {currentCourse.estructuraCurricular}</Text>
          <Text mb={2}><Text as="span" fontWeight="bold">Estrategias de Evaluación:</Text> {currentCourse.evaluacion}</Text>
          <Text mb={2}><Text as="span" fontWeight="bold">Cronograma Anual:</Text> {currentCourse.cronograma}</Text>
        </Box>

        <Divider borderColor="gray.300" />

        {/* Renderizado condicional */}
        <Box p={6} border="2px" borderColor="teal.100" rounded="lg" bg="teal.50">
          {isCohortOpen ? (
            <VStack spacing={4}>
              <Heading as="h2" size="xl" mb={4} textAlign="center" color="teal.800">
                Gestión de Cohorte Abierta
              </Heading>

              <FormControl id="cohortName">
                <FormLabel fontWeight="bold">Nombre de la Cohorte</FormLabel>
                <Input type="text" value={activeCohortData.name} isReadOnly disabled />
              </FormControl>

              <Flex width="full" gap={4}>
                <FormControl id="startDate">
                  <FormLabel fontWeight="bold">Fecha de Inicio</FormLabel>
                  <Input type="date" value={activeCohortData.start} isReadOnly disabled />
                </FormControl>
                <FormControl id="endDate">
                  <FormLabel fontWeight="bold">Fecha de Fin</FormLabel>
                  <Input type="date" value={activeCohortData.end} isReadOnly disabled />
                </FormControl>
              </Flex>

              <FormControl id="capacity">
                <FormLabel fontWeight="bold">Capacidad de Estudiantes</FormLabel>
                  <NumberInput value={activeCohortData.cap} isReadOnly isDisabled>
                  <NumberInputField />
                </NumberInput>
              </FormControl>

              <Button
                onClick={onOpen}
                colorScheme="red"
                size="lg"
                width="full"
                mt={4}
              >
                Cerrar Cohorte
              </Button>
            </VStack>
          ) : (
            <form onSubmit={handleOpenCohort}>
              <Heading as="h2" size="xl" mb={6} textAlign="center" color="teal.800">
                Abrir Nueva Cohorte
              </Heading>
              <VStack spacing={4}>
                <FormControl id="cohortName" isRequired>
                  <FormLabel>Nombre de la Cohorte</FormLabel>
                  <Input
                    type="text"
                    placeholder="Ej: Cohorte Invierno 2024"
                    value={cohortName}
                    onChange={(e) => setCohortName(e.target.value)}
                  />
                </FormControl>

                <Flex width="full" gap={4}>
                  <FormControl id="startDate" isRequired>
                    <FormLabel>Fecha de Inicio</FormLabel>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </FormControl>

                  <FormControl id="endDate" isRequired>
                    <FormLabel>Fecha de Fin</FormLabel>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </FormControl>
                </Flex>

                <FormControl id="capacity" isRequired>
                  <FormLabel>Capacidad de Estudiantes</FormLabel>
                  <NumberInput
                    min={1}
                    max={100}
                    value={capacity}
                    onChange={(_, valueAsNumber) => setCapacity(valueAsNumber)}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="teal"
                  size="lg"
                  width="full"
                  mt={4}
                  isLoading={isLoading}
                  loadingText="Abriendo Cohorte..."
                >
                  Abrir Cohorte
                </Button>
              </VStack>
            </form>
          )}
        </Box>

        <Divider borderColor="gray.300" />

        <Text textAlign="center" color="gray.500" fontSize="sm">
          Este es el curso con ID: <Text as="span" fontWeight="bold">{currentCourse.id}</Text>.
        </Text>
        <Text textAlign="center" color="gray.500" fontSize="sm">
          Puedes volver a tu <ChakraLink as={NextLink} href={`/profile/${currentCourse.userId}`} color="teal.500" fontWeight="bold">Perfil</ChakraLink>.
        </Text>
      </VStack>

      {/* Componente del modal ahora en un archivo aparte */}
      <CloseCohortModal isOpen={isOpen} onClose={onClose} />

    </Box>
  );
}