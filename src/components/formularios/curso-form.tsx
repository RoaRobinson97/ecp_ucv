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
  useColorModeValue, 
} from "@chakra-ui/react";
import { useAuth } from "@/app/context/auth-context";
import { useRouter } from "next/navigation";

import { solicitudesService } from '@/servicios/solicitudes-service';
import { PayloadFormulacionCurso } from '@/data/types';

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

const CourseFormControl = ({ id, label, isTextArea = false }: { 
  id: string; 
  label: string; 
  isTextArea?: boolean; 
}) => {
  return (
    // ✨ Todos los campos son requeridos en Producción
    <FormControl id={id} isRequired={true}>
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
  const { user } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    // ✨ Prevención de doble clic
    if (isLoading) return;
    
    if (!user || user.rol !== 'proveedor') {
      toast({ title: "Acceso denegado", description: "Solo los proveedores autorizados pueden formular cursos.", status: "error" });
      return;
    }

    setIsLoading(true);

    const formData = new FormData(event.currentTarget);

    try {
      // Estructuramos el payload asegurando que todos los campos sean strings limpios
      const payload: PayloadFormulacionCurso = {
        titulo: (formData.get('denominacion') as string)?.trim(), 
        denominacion: (formData.get('denominacion') as string)?.trim(), 
        proposito: (formData.get('proposito') as string)?.trim(),
        fundamentacion: (formData.get('fundamentacion') as string)?.trim(),
        duracion: (formData.get('duracion') as string)?.trim(),
        estructura_costos: (formData.get('estructura-costos') as string)?.trim(),
        perfil_docente: (formData.get('perfil-docente') as string)?.trim(), 
        perfiles: (formData.get('perfiles') as string)?.trim(),
        exigencias: (formData.get('exigencias') as string)?.trim(),
        estructura_curricular: (formData.get('estructura-curricular') as string)?.trim(),
        evaluacion: (formData.get('evaluacion') as string)?.trim(),
        cronograma: (formData.get('cronograma') as string)?.trim(),
      };

      // ✨ Validación en el cliente: Asegurar que no manden espacios en blanco
      const hasEmptyFields = Object.values(payload).some(value => !value);
      if (hasEmptyFields) {
          toast({
              title: "Formulario incompleto",
              description: "Por favor, completa todos los campos requeridos.",
              status: "warning",
          });
          setIsLoading(false);
          return;
      }

      await solicitudesService.createSolicitud({
          userId: user.id, // Ojo, en tu servicio lo llamamos userId, asegúrate de mantener la consistencia
          tipo: 'formulacion-curso-directa',
          estado: 'pendiente',
          payload: payload
      });

      toast({
        title: "Curso formulado y enviado.",
        description: "Tu propuesta está siendo revisada por Coordinación.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      router.push(`/profile/${user.id}`); 
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Error al enviar la propuesta.",
        description: error.message || "Por favor, inténtalo de nuevo más tarde.",
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
      maxW="3xl" 
      mx="auto"
      p={{ base: 5, md: 8 }} 
      my={8}
      bg={useColorModeValue("white", "gray.700")} 
      rounded="lg"
      shadow="xl" 
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
        <VStack spacing={8}> 
          
          <FormSection title="1. Identificación del Curso">
            <CourseFormControl id="denominacion" label="Denominación del Curso" />
            <CourseFormControl id="proposito" label="Propósito" isTextArea />
            <CourseFormControl id="fundamentacion" label="Fundamentación" isTextArea />
          </FormSection>

          <FormSection title="2. Detalles Operativos">
            <CourseFormControl id="duracion" label="Duración (en horas)" />
            <CourseFormControl id="estructura-costos" label="Estructura de Costos" isTextArea />
            <CourseFormControl id="perfil-docente" label="Perfil del Docente o Facilitador" isTextArea />
          </FormSection>

          <FormSection title="3. Requisitos de los Participantes">
            <CourseFormControl id="perfiles" label="Perfiles de Ingreso y Egreso" isTextArea />
            <CourseFormControl id="exigencias" label="Exigencias en Materiales y Servicios" isTextArea />
          </FormSection>

          <FormSection title="4. Contenido y Evaluación">
            <CourseFormControl id="estructura-curricular" label="Estructura Curricular" isTextArea />
            <CourseFormControl id="evaluacion" label="Estrategias de Evaluación" isTextArea />
            <CourseFormControl id="cronograma" label="Cronograma de Ejecución Anual" isTextArea />
          </FormSection>

          <Button
            type="submit"
            colorScheme="teal"
            size="lg" 
            width="full"
            mt={6}
            isLoading={isLoading}
            loadingText="Enviando Formulación..."
            isDisabled={isLoading} // ✨ Previene múltiples clics a nivel de botón
          >
            Enviar Formulación
          </Button>
        </VStack>
      </form>
    </Box>
  );
};