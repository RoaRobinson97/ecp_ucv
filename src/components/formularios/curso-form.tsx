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
  HStack,
  Heading,
  Text,
  useToast,
  Badge,
  useColorModeValue
} from "@chakra-ui/react";
import { useAuth } from "@/app/context/auth-context";
import { useRouter } from "next/navigation";
import { PayloadFormulacionCurso } from '@/data/types';
import { solicitudesService } from '@/servicios/solicitudes-service';

interface ModuloItem {
  titulo: string;
  contenido: string;
  competencia: string;
}

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

const CourseFormControl = ({ id, label, isTextArea = false, placeholder = "", helperText = "" }: { 
  id: string; 
  label: string; 
  isTextArea?: boolean; 
  placeholder?: string;
  helperText?: string;
}) => {
  return (
    <FormControl id={id} isRequired={true}>
      <FormLabel fontWeight="bold" color="text.primary">{label}</FormLabel>
      {isTextArea ? (
        <Textarea 
            name={id} 
            placeholder={placeholder || `Describe ${label.toLowerCase()} aquí...`} 
            rows={4} 
            bg="background" 
            borderColor="border" 
            focusBorderColor="primary" 
            color="text.primary" 
        />
      ) : (
        <Input 
            type="text" 
            name={id} 
            placeholder={placeholder || `Escribe ${label.toLowerCase()} aquí...`} 
            bg="background" 
            borderColor="border" 
            focusBorderColor="primary" 
            color="text.primary" 
        />
      )}
      {helperText && <Text fontSize="xs" color="text.muted" mt={1}>{helperText}</Text>}
    </FormControl>
  );
};

export const CourseForm = () => {
  const { user } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [facilitadorCv, setFacilitadorCv] = useState<File | null>(null);

  const [modulos, setModulos] = useState<ModuloItem[]>([
    { titulo: '', contenido: '', competencia: '' }
  ]);

  const cardModuloBg = useColorModeValue("gray.50", "whiteAlpha.50");

  const handleAddModulo = () => {
    setModulos((prev) => [...prev, { titulo: '', contenido: '', competencia: '' }]);
  };

  const handleRemoveModulo = (index: number) => {
    if (modulos.length <= 1) return;
    setModulos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleModuloChange = (index: number, field: keyof ModuloItem, value: string) => {
    setModulos((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isLoading) return;
    
    if (!user || user.rol !== 'proveedor') {
      toast({ title: "Acceso denegado", description: "Solo los proveedores autorizados pueden formular cursos.", status: "error" });
      return;
    }

    const hasEmptyModulos = modulos.some(
      (m) => !m.titulo.trim() || !m.contenido.trim() || !m.competencia.trim()
    );
    if (hasEmptyModulos) {
      toast({
        title: "Módulos incompletos",
        description: "Por favor, completa el nombre, contenido y competencia de todos los módulos.",
        status: "warning"
      });
      return;
    }

    if (!coverImage) {
      toast({ title: "Falta la imagen de portada", description: "Es obligatorio subir una imagen representativa para el curso.", status: "warning" });
      return;
    }

    if (!facilitadorCv) {
      toast({ title: "Falta el CV del facilitador", description: "Es obligatorio adjuntar el resumen curricular del facilitador en formato PDF.", status: "warning" });
      return;
    }

    setIsLoading(true);
    const formData = new FormData(event.currentTarget);

    try {
      const contenidoCompetenciasString = modulos
        .map(
          (m, idx) =>
            `Módulo ${idx + 1}: ${m.titulo.trim()}\nContenido: ${m.contenido.trim()}\nCompetencia: ${m.competencia.trim()}`
        )
        .join('\n\n');

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
        contenido_competencias: contenidoCompetenciasString,
        bibliografia: (formData.get('bibliografia') as string)?.trim(),
      };

      const requiredFields = { ...payload };
      const hasEmptyFields = Object.values(requiredFields).some(value => !value);
      if (hasEmptyFields) {
          toast({ title: "Formulario incompleto", description: "Por favor, completa todos los campos requeridos.", status: "warning" });
          setIsLoading(false);
          return;
      }

      const finalFormData = new FormData();
      finalFormData.append('userId', user.id || '');
      finalFormData.append('tipo', 'formulacion-curso-directa');
      finalFormData.append('payload', JSON.stringify(payload)); 
      finalFormData.append('cover', coverImage);
      finalFormData.append('cv_facilitador', facilitadorCv);

      // ✨ AHORA USA EL SERVICIO EN LUGAR DE FETCH DIRECTO
      await solicitudesService.createSolicitud(finalFormData);

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
            <CourseFormControl 
                id="duracion" 
                label="Duración y Modalidad" 
                placeholder="Ej: 200 horas (150 presenciales, 50 virtuales)"
            />
            <CourseFormControl id="estructura-costos" label="Estructura de Costos" isTextArea />
            <CourseFormControl id="exigencias" label="Exigencias en Materiales y Servicios" isTextArea />
          </FormSection>

          <FormSection title="3. Perfiles">
            <CourseFormControl 
                id="perfiles" 
                label="Perfil de Ingreso y Egreso" 
                isTextArea 
                placeholder="Ingreso: Dirigido a... / Egreso: Al finalizar el participante será capaz de..."
            />
            <CourseFormControl 
                id="perfil-docente" 
                label="Perfil del Facilitador" 
                isTextArea 
                placeholder="Profesional con título de cuarto nivel o experiencia comprobable en..."
            />

            <FormControl id="cv_facilitador" isRequired={true}>
              <FormLabel fontWeight="bold" color="text.primary">
                Síntesis Curricular del Facilitador(es) (PDF){" "}
                {facilitadorCv && <Text as="span" color="teal.500" fontSize="sm" ml={2}>(✓ Archivo cargado)</Text>}
              </FormLabel>
              <Input 
                type="file" 
                accept=".pdf,application/pdf" 
                p={1}
                onChange={(e) => setFacilitadorCv(e.target.files?.[0] || null)}
                bg="background" borderColor="border" focusBorderColor="primary" color="text.primary"
                sx={{ '::file-selector-button': { height: 8, padding: 0, mr: 4, background: 'none', border: 'none', fontWeight: 'bold', color: 'text.primary' } }}
              />
              <Text fontSize="xs" color="text.muted" mt={1}>
                Adjunta en un único archivo PDF el resumen curricular actualizado y soportes de quien(es) dictará(n) el curso.
              </Text>
            </FormControl>
          </FormSection>

          <FormSection title="4. Contenido por Módulos y Competencias">
            <Box w="full">
              <HStack justify="space-between" align="center" mb={2}>
                <FormLabel fontWeight="bold" color="text.primary" mb={0}>
                  Desglose de Módulos, Contenido Temático y Competencias <Text as="span" color="red.500">*</Text>
                </FormLabel>
                <Button 
                  size="sm" 
                  colorScheme="teal" 
                  onClick={handleAddModulo}
                >
                  + Agregar Módulo
                </Button>
              </HStack>
              
              <Text fontSize="xs" color="text.muted" mb={4} lineHeight="tall">
                Detalla cada unidad temática del programa. Puedes añadir tantos módulos como requiera el curso usando el botón <b>(+ Agregar Módulo)</b>. En cada bloque especifica el título de la unidad, los temas que se impartirán y la destreza verificable que desarrollará el estudiante.
              </Text>

              <VStack spacing={4} align="stretch" w="full">
                {modulos.map((modulo, index) => (
                  <Box 
                    key={index} 
                    p={5} 
                    bg={cardModuloBg} 
                    borderWidth="1px" 
                    borderColor="border" 
                    rounded="lg"
                  >
                    <HStack justify="space-between" align="center" mb={4} pb={2} borderBottomWidth="1px" borderColor="border">
                      <Badge colorScheme="teal" variant="solid" px={2.5} py={1} rounded="md" fontSize="xs">
                        MÓDULO {index + 1}
                      </Badge>
                      {modulos.length > 1 && (
                        <Button
                          size="xs"
                          colorScheme="red"
                          variant="outline"
                          onClick={() => handleRemoveModulo(index)}
                        >
                          − Quitar módulo
                        </Button>
                      )}
                    </HStack>

                    <VStack spacing={4} align="stretch">
                      <FormControl isRequired>
                        <FormLabel fontSize="sm" fontWeight="semibold" color="text.primary" mb={1}>
                          Nombre del Módulo
                        </FormLabel>
                        <Input
                          value={modulo.titulo}
                          onChange={(e) => handleModuloChange(index, 'titulo', e.target.value)}
                          placeholder="Ej: Fundamentos de Python para Ciencias"
                          size="md"
                          bg="background"
                          borderColor="border"
                          focusBorderColor="primary"
                          color="text.primary"
                        />
                      </FormControl>

                      <FormControl isRequired>
                        <FormLabel fontSize="sm" fontWeight="semibold" color="text.primary" mb={1}>
                          Contenido Programático
                        </FormLabel>
                        <Textarea
                          value={modulo.contenido}
                          onChange={(e) => handleModuloChange(index, 'contenido', e.target.value)}
                          placeholder="Ej: Estructuras de datos, control de flujo, librerías científicas (NumPy, Pandas, Matplotlib)..."
                          rows={3}
                          fontSize="sm"
                          bg="background"
                          borderColor="border"
                          focusBorderColor="primary"
                          color="text.primary"
                        />
                      </FormControl>

                      <FormControl isRequired>
                        <FormLabel fontSize="sm" fontWeight="semibold" color="text.primary" mb={1}>
                          Competencia a Desarrollar
                        </FormLabel>
                        <Textarea
                          value={modulo.competencia}
                          onChange={(e) => handleModuloChange(index, 'competencia', e.target.value)}
                          placeholder="Ej: Manipula y transforma grandes volúmenes de datos tabulares de forma eficiente y reproducible."
                          rows={2}
                          fontSize="sm"
                          bg="background"
                          borderColor="border"
                          focusBorderColor="primary"
                          color="text.primary"
                        />
                      </FormControl>
                    </VStack>
                  </Box>
                ))}
              </VStack>
            </Box>

            <CourseFormControl id="estructura-curricular" label="Estructura Curricular General" isTextArea />
            <CourseFormControl id="evaluacion" label="Estrategias de Evaluación" isTextArea />
            <CourseFormControl id="cronograma" label="Cronograma de Ejecución Anual" isTextArea />
          </FormSection>

          <FormSection title="5. Referencias">
             <CourseFormControl 
                id="bibliografia" 
                label="Bibliografía" 
                isTextArea 
                placeholder="Ejemplo: Acuña-Gómez, L. V., & Vargas-Ochoa, M. E. (2021). La investigación..."
                helperText="Incluye las referencias bibliográficas utilizando el formato APA."
             />
          </FormSection>

          <Button type="submit" colorScheme="teal" size="lg" width="full" mt={6} isLoading={isLoading} loadingText="Enviando Formulación..." isDisabled={isLoading} shadow="md">
            Enviar Formulación
          </Button>
        </VStack>
      </form>
    </Box>
  );
};