"use client";

import React, { useState } from 'react';
import { 
  Box, 
  Heading, 
  VStack, 
  Radio, 
  RadioGroup, 
  Stack, 
  Select, 
  FormLabel, 
  FormControl, 
  Text,
} from '@chakra-ui/react';

const FACULTADES_MOCK = [
  { id: 'ing', name: 'Facultad de Ingeniería' },
  { id: 'cien', name: 'Facultad de Ciencias y Tecnología' },
  { id: 'hum', name: 'Facultad de Humanidades y Artes' },
  { id: 'salud', name: 'Facultad de Ciencias de la Salud' },
];

export function CourseClassificationForm() {
  const [clasificacion, setClasificacion] = useState('');
  const [facultad, setFacultad] = useState('');

  const CLASIFICACION_REQUIERE_FACULTAD = 'Formación para el mejoramiento técnico/profesional';

  const opcionesClasificacion = [
    { value: 'Formación para todo público', description: 'Actividades formativas dirigidos a explorar de manera general algún área de conocimiento y que no requieran un perfíl de ingreso técnico ni profesional.' },
    { value: 'Formación para el trabajo', description: 'Actividades formativas cuyo objetivo es la profesionalización de algún oficio a través del desarrollo de competencias específicas.' },
    { value: 'Formación para toda la vida', description: 'Actividades formativas cuyo objetivo es brindar competencias y herramientas personales útiles en diversos contextos.' },
    { value: CLASIFICACION_REQUIERE_FACULTAD, description: 'Actividades formativas cuyo contenido profundiza en áreas técnicas y profesionales para las que se requiere un nivel profesional en el perfil de ingreso.' },
  ];

  return (
    <Box 
      p={{ base: 6, md: 8 }} 
      borderWidth="1px" 
      borderRadius="xl" 
      shadow="md" 
      bg="surface"
      borderColor="border"
      mb={8}
    >
      <Heading as="h3" size="md" mb={6} color="primary">
        Clasificación Administrativa del Curso
      </Heading>

      <RadioGroup onChange={setClasificacion} value={clasificacion}>
        <Stack direction="column" spacing={6}>
          {opcionesClasificacion.map((op) => (
            <Radio key={op.value} value={op.value} size="lg" colorScheme="teal" alignItems="flex-start">
              <VStack align="start" spacing={1} mt="-1">
                <Text fontWeight="semibold" color="text.primary">{op.value}</Text>
                <Text fontSize="sm" color="text.muted" lineHeight="tall">{op.description}</Text>
              </VStack>
            </Radio>
          ))}
        </Stack>
      </RadioGroup>

      {clasificacion === CLASIFICACION_REQUIERE_FACULTAD && (
        <FormControl mt={8} isRequired>
          <FormLabel fontWeight="bold" color="text.primary">Remitir a Facultad</FormLabel>
          <Select 
            placeholder="Selecciona la facultad de revisión"
            value={facultad}
            onChange={(e) => setFacultad(e.target.value)}
            bg="background"
            borderColor="border"
            focusBorderColor="primary"
            color="text.primary"
          >
            {FACULTADES_MOCK.map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </Select>
        </FormControl>
      )}
    </Box>
  );
}