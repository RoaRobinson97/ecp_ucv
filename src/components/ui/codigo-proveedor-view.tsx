"use client";

import { Box, Heading, Text, VStack, Link, Button, HStack, Badge, SimpleGrid } from '@chakra-ui/react';
import { PayloadCodigoProveedor } from '@/data/types';

interface CodigoProveedorViewProps {
  payload: PayloadCodigoProveedor;
}

export function CodigoProveedorView({ payload }: CodigoProveedorViewProps) {
  const { documentos, tipo_persona } = payload;

  // Función para renderizar cada tarjeta de documento de forma específica
  const DocumentCard = ({ title, url }: { title: string, url?: string }) => {
    if (!url) return null;

    const isImage = url.toLowerCase().match(/\.(png|jpg|jpeg)$/);
    const demoPdfUrl = "/sample-local.pdf"; // Mantengo tu lógica de demo

    return (
      <Box p={5} shadow="md" borderWidth="1px" rounded="lg" bg="white">
        <HStack justifyContent="space-between" mb={4}>
          <Badge colorScheme="teal" p={1}>{title}</Badge>
          <Link href={url} isExternal download>
            <Button size="xs" variant="outline">Descargar Original</Button>
          </Link>
        </HStack>

        <Box position="relative" width="100%" height="300px" border="1px solid #e2e8f0" rounded="md" overflow="hidden" bg="gray.50">
          {isImage ? (
            <img src={url} alt={title} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          ) : (
            <iframe src={demoPdfUrl} title={title} style={{ width: "100%", height: "100%", border: "none" }} />
          )}
        </Box>
      </Box>
    );
  };

  return (
    <Box mb={10}>
      <VStack align="stretch" spacing={6}>
        <Box>
          <Heading size="md" mb={2}>Información del Solicitante</Heading>
          <Text><strong>Nombre:</strong> {payload.nombre_proveedor}</Text>
          <Badge colorScheme={tipo_persona === 'natural' ? 'blue' : 'purple'}>
            Persona {tipo_persona.toUpperCase()}
          </Badge>
        </Box>

        <Heading as="h2" size="lg">Expediente Digital</Heading>
        
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          <DocumentCard title="Cédula / ID" url={documentos.cedula} />
          <DocumentCard title="RIF" url={documentos.rif} />
          <DocumentCard title="ISLR" url={documentos.islr} />
          <DocumentCard title="Curriculum Vitae" url={documentos.curriculum} />
          <DocumentCard title="Título Profesional" url={documentos.titulo} />
          {tipo_persona === 'juridica' && (
            <DocumentCard title="Registro Mercantil" url={documentos.registro_mercantil} />
          )}
        </SimpleGrid>
      </VStack>
    </Box>
  );
}