"use client";

import React, { useState } from 'react';
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
  useToast
} from "@chakra-ui/react";
import { useAuth } from "@/app/context/auth-context";
import { useRouter } from "next/navigation";
import { PayloadFormulacionCurso } from '@/data/types';

const FormSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <VStack spacing={4} align="stretch" w="full">
    <Heading 
      as="h3" 
      size="md" 
      color="primary"
      borderBottomWidth="1px" 
      borderColor="border"
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
    <FormControl id={id} isRequired={true}>
      <FormLabel fontWeight="bold" color="text.primary">{label}</FormLabel>
      {isTextArea ? (
        <Textarea name={id} placeholder={`Describe ${label.toLowerCase()} aquí...`} rows={4} bg="background" borderColor="border" focusBorderColor="primary" color="text.primary" />
      ) : (
        <Input type="text" name={id} placeholder={`Escribe ${label.toLowerCase()} aquí...`} bg="background" borderColor="border" focusBorderColor="primary" color="text.primary" />
      )}
    </FormControl>
  );
};

export const CourseForm = () => {
  const { user } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [coverImage, setCoverImage] = useState<File | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isLoading) return;
    
    if (!user || user.rol !== 'proveedor') {
      toast({ title: "Acceso denegado", description: "Solo los proveedores autorizados pueden formular cursos.", status: "error" });
      return;
    }

    setIsLoading(true);
    const formData = new FormData(event.currentTarget);

    try {
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

      const hasEmptyFields = Object.values(payload).some(value => !value);
      if (hasEmptyFields) {
          toast({ title: "Formulario incompleto", description: "Por favor, completa todos los campos requeridos.", status: "warning" });
          setIsLoading(false);
          return;
      }

      if (!coverImage) {
          toast({ title: "Falta la imagen de portada", description: "Es obligatorio subir una imagen representativa para el curso.", status: "warning" });
          setIsLoading(false);
          return;
      }

      const finalFormData = new FormData();
      finalFormData.append('userId', user.id || '');
      finalFormData.append('tipo', 'formulacion-curso-directa');
      finalFormData.append('payload', JSON.stringify(payload)); 
      
      if (coverImage) {
        finalFormData.append('cover', coverImage);
      }

      const response = await fetch('/api/courses', { method: 'POST', body: finalFormData });

      if (!response.ok) {
        const err = await response.json().catch(()=>({}));
        throw new Error(err.error || "Error al enviar al servidor");
      }

      toast({ title: "Curso formulado y enviado.", description: "Tu propuesta está siendo revisada por Coordinación.", status: "success", duration: 5000, isClosable: true });
      router.push(`/profile/${user.id}`); 
    } catch (error: any) {
      console.error(error);
      toast({ title: "Error al enviar la propuesta.", description: error.message || "Por favor, inténtalo de nuevo más tarde.", status: "error", duration: 5000, isClosable: true });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box maxW="3xl" mx="auto" p={{ base: 6, md: 8 }} my={{ base: 8, md: 12 }} bg="surface" rounded="xl" shadow="xl" borderWidth="1px" borderColor="border">
      <VStack spacing={4} align="stretch" mb={8}>
        <Heading as="h1" size="lg" textAlign="center" color="primary" fontWeight="bold">
          Formulación de Nuevo Curso
        </Heading>
        <Text fontSize="md" textAlign="center" color="text.muted">
          Completa la siguiente información para proponer un nuevo programa de formación.
        </Text>
      </VStack>
      
      <form onSubmit={handleSubmit}>
        <VStack spacing={8}> 
          
          <FormSection title="1. Identificación del Curso">
            <FormControl id="cover" isRequired={true}>
              <FormLabel fontWeight="bold" color="text.primary">Imagen de Portada</FormLabel>
              <Input 
                type="file" 
                accept="image/png, image/jpeg, image/jpg" 
                p={1}
                onChange={(e) => setCoverImage(e.target.files?.[0] || null)}
                bg="background" borderColor="border" focusBorderColor="primary" color="text.primary"
                sx={{ '::file-selector-button': { height: 8, padding: 0, mr: 4, background: 'none', border: 'none', fontWeight: 'bold', color: 'text.primary' } }}
              />
            </FormControl>

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

          <Button type="submit" colorScheme="teal" size="lg" width="full" mt={6} isLoading={isLoading} loadingText="Enviando Formulación..." isDisabled={isLoading} shadow="md">
            Enviar Formulación
          </Button>
        </VStack>
      </form>
    </Box>
  );
};