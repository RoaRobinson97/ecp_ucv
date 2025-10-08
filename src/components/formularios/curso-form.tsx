// components/formularios/CourseForm.tsx (Con mejoras estéticas)
"use client";

import React from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
  Heading,
  Text,
  useToast,
  useColorModeValue, // Para que se vea bien en modo claro y oscuro
} from "@chakra-ui/react";
import { useAuth } from "@/app/context/auth-context";
import { useGlobalData } from "@/app/context/global-data-context";
import { useRouter } from "next/navigation";

// 1. ✨ CREAMOS UN COMPONENTE PARA LAS SECCIONES DEL FORMULARIO
// Esto nos ayuda a agrupar los campos de forma visualmente atractiva y reutilizable.
const FormSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <VStack spacing={4} align="stretch" w="full">
    <Heading 
      as="h3" 
      size="md" 
      color={useColorModeValue("gray.600", "gray.300")}
      borderBottomWidth="1px" 
      borderColor={useColorModeValue("gray.200", "gray.600")}
      pb={2} 
      mb={2}
    >
      {title}
    </Heading>
    {children}
  </VStack>
);

// Tu componente original para los campos no necesita cambios, funciona perfecto.
const CourseFormControl = ({ id, label, isRequired = true, isTextArea = false }: { 
  id: string; 
  label: string; 
  isRequired?: boolean; 
  isTextArea?: boolean; 
}) => {
  return (
    <FormControl id={id} isRequired={isRequired}>
      <FormLabel fontWeight="medium">{label}</FormLabel>
      {isTextArea ? (
        <Textarea name={id} placeholder={`Describe ${label.toLowerCase()} aquí...`} rows={4}/>
      ) : (
        <Input type="text" name={id} placeholder={`Escribe ${label.toLowerCase()} aquí...`} />
      )}
    </FormControl>
  );
};

export const CourseForm = () => {
  const { userId } = useAuth();
  const { providerCode, addCourse } = useGlobalData();
  const router = useRouter();
  const toast = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [isTesting, setIsTesting] = React.useState(true);

  // Tu lógica de handleSubmit se mantiene exactamente igual.
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const newCourseId = Date.now().toString();

    const courseData = {
      id: newCourseId,
      denominacion: formData.get('denominacion') as string,
      proposito: formData.get('proposito') as string,
      fundamentacion: formData.get('fundamentacion') as string,
      duracion: formData.get('duracion') as string,
      estructuraCostos: formData.get('estructura-costos') as string,
      perfilDocente: formData.get('perfil-docente') as string,
      perfiles: formData.get('perfiles') as string,
      exigencias: formData.get('exigencias') as string,
      estructuraCurricular: formData.get('estructura-curricular') as string,
      evaluacion: formData.get('evaluacion') as string,
      cronograma: formData.get('cronograma') as string,
      providerCode,
      userId,
    };

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      addCourse(courseData);

      toast({
        title: "Curso formulado.",
        description: "Tu propuesta de curso ha sido enviada con éxito.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      router.push(`/`);
    } catch (error) {
      toast({
        title: "Error al formular el curso.",
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
    <Box
      maxW="3xl" // Un poco más ancho para que respire mejor
      mx="auto"
      p={{ base: 5, md: 8 }} // Padding responsivo
      my={8}
      bg={useColorModeValue("white", "gray.700")} // Fondo adaptable
      rounded="lg"
      shadow="xl" // Sombra más pronunciada
    >
      <VStack spacing={4} align="stretch" mb={8}>
        <Heading as="h1" size="xl" textAlign="center" color="teal.500">
          Formulación de Nuevo Curso
        </Heading>
        <Text fontSize="lg" textAlign="center" color="gray.500">
          Completa la siguiente información para proponer un nuevo programa de formación.
        </Text>
      </VStack>
      
      <form onSubmit={handleSubmit}>
        {/* 2. ✨ ORGANIZAMOS EL FORMULARIO USANDO LAS SECCIONES */}
        <VStack spacing={8}> {/* Aumentamos el espacio ENTRE secciones */}
          
          <FormSection title="1. Identificación del Curso">
            <CourseFormControl id="denominacion" label="Denominación del Curso" isRequired={!isTesting} />
            <CourseFormControl id="proposito" label="Propósito" isTextArea isRequired={!isTesting} />
            <CourseFormControl id="fundamentacion" label="Fundamentación" isTextArea isRequired={!isTesting} />
          </FormSection>

          <FormSection title="2. Detalles Operativos">
            <CourseFormControl id="duracion" label="Duración (en horas)" isRequired={!isTesting} />
            <CourseFormControl id="estructura-costos" label="Estructura de Costos" isTextArea isRequired={!isTesting} />
            <CourseFormControl id="perfil-docente" label="Perfil del Docente o Facilitador" isTextArea isRequired={!isTesting} />
          </FormSection>

          <FormSection title="3. Requisitos de los Participantes">
            <CourseFormControl id="perfiles" label="Perfiles de Ingreso y Egreso" isTextArea isRequired={!isTesting} />
            <CourseFormControl id="exigencias" label="Exigencias en Materiales y Servicios" isTextArea isRequired={!isTesting} />
          </FormSection>

          <FormSection title="4. Contenido y Evaluación">
            <CourseFormControl id="estructura-curricular" label="Estructura Curricular" isTextArea isRequired={!isTesting} />
            <CourseFormControl id="evaluacion" label="Estrategias de Evaluación" isTextArea isRequired={!isTesting} />
            <CourseFormControl id="cronograma" label="Cronograma de Ejecución Anual" isTextArea isRequired={!isTesting} />
          </FormSection>

          <Button
            type="submit"
            colorScheme="teal"
            size="lg" // Botón más grande y llamativo
            width="full"
            mt={6}
            isLoading={isLoading}
            loadingText="Enviando Formulación..."
          >
            Enviar Formulación
          </Button>
        </VStack>
      </form>
    </Box>
  );
};

export default CourseForm;