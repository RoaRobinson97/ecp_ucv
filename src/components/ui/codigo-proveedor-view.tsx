"use client";

import { Box, Heading, Text, VStack, Link, Button, HStack, Badge, SimpleGrid } from '@chakra-ui/react';
import { PayloadCodigoProveedor } from '@/data/types';

interface CodigoProveedorViewProps {
  payload: PayloadCodigoProveedor;
}

export function CodigoProveedorView({ payload }: CodigoProveedorViewProps) {
  // 1. Extracción de datos
  const tipoPersona = payload.tipo_persona || 'null';
  const tipoLucro = payload.tipo_lucro ? payload.tipo_lucro.replace('_', ' ').toUpperCase() : 'null';
  const bio = payload.biografia ? payload.biografia.replace(/"/g, '') : 'null';
  
  const isInternalStr = payload.interno !== undefined ? String(payload.interno) : (payload.es_interno !== undefined ? String(payload.es_interno) : 'null');
  let relacionUCV = 'null';
  if (isInternalStr === 'true') relacionUCV = 'PROVEEDOR INTERNO (UCV)';
  if (isInternalStr === 'false') relacionUCV = 'PROVEEDOR EXTERNO';

  const docs = (payload as any).archivos || payload.documentos || {};
  const avatarUrl = docs.logo || docs.avatar || payload.avatar_url || null;

  // Componente interno para simular un "Input" de solo lectura del formulario
  const FormField = ({ label, value }: { label: string, value: string }) => {
    const isNull = value === 'null';
    return (
      <Box 
        bg="gray.50" _dark={{ bg: "gray.800", borderColor: "gray.700" }} 
        p={4} 
        rounded="md" 
        borderWidth="1px" 
        borderColor="gray.200"
      >
        <Text fontSize="xs" fontWeight="bold" color="gray.500" _dark={{ color: "gray.400" }} textTransform="uppercase" mb={1}>
          {label}
        </Text>
        <Text fontSize="md" fontWeight={isNull ? "normal" : "medium"} color={isNull ? "red.400" : "inherit"} _dark={{ color: isNull ? "red.300" : "white" }}>
          {value}
        </Text>
      </Box>
    );
  };

  // Componente para simular un input de archivo subido
  const DocumentField = ({ label, url }: { label: string, url?: string }) => {
    const isNull = !url;
    const isImage = url?.toLowerCase().match(/\.(png|jpg|jpeg)$/);
    const demoPdfUrl = "/sample-local.pdf"; 

    return (
      <Box 
        bg="white" _dark={{ bg: "gray.800", borderColor: "gray.700" }} 
        p={4} 
        rounded="md" 
        borderWidth="1px" 
        borderColor="gray.200"
      >
        <HStack justifyContent="space-between" mb={3}>
          <Text fontSize="sm" fontWeight="bold" color="gray.600" _dark={{ color: "gray.300" }}>
            {label}
          </Text>
          {isNull ? (
            <Badge colorScheme="red">null</Badge>
          ) : (
            <Link href={url} isExternal download>
              <Button size="xs" colorScheme="teal" variant="solid">Ver / Descargar</Button>
            </Link>
          )}
        </HStack>

        {!isNull && (
          <Box position="relative" width="100%" height="200px" border="1px dashed #e2e8f0" rounded="md" overflow="hidden" bg="gray.50" _dark={{ bg: "gray.900", borderColor: "gray.700" }}>
            {isImage ? (
              <img src={url} alt={label} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            ) : (
              // ✨ Como ya tenemos URLs reales, usamos la URL real en vez de demoPdfUrl
              <iframe src={url} title={label} style={{ width: "100%", height: "100%", border: "none" }} />
            )}
          </Box>
        )}
      </Box>
    );
  };

  // Para extraer de forma segura el array de otros documentos
  const otrosDocs = Array.isArray(docs.otros_documentos) ? docs.otros_documentos : (Array.isArray(docs.otros) ? docs.otros : []);

  return (
    <Box mb={10}>
      <VStack align="stretch" spacing={8}>
        
        {/* SECCIÓN 1: DATOS DEL FORMULARIO */}
        <Box>
          <Heading size="md" mb={4} color="gray.700" _dark={{ color: "gray.200" }} borderBottom="2px solid" borderColor="teal.500" pb={2} display="inline-block">
            Datos del Proveedor
          </Heading>
          
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <FormField label="Nombre del Proveedor / Organización" value={payload.nombre_proveedor || 'null'} />
            <FormField label="Tipo de Persona" value={tipoPersona.toUpperCase()} />
            <FormField label="Tipo de Lucro" value={tipoLucro} />
            <FormField label="Relación con la Institución" value={relacionUCV} />
          </SimpleGrid>

          <Box mt={4}>
            <FormField label="Biografía / Resumen" value={bio} />
          </Box>
        </Box>

        {/* SECCIÓN 2: ARCHIVOS ADJUNTOS */}
        <Box>
          <Heading size="md" mb={4} color="gray.700" _dark={{ color: "gray.200" }} borderBottom="2px solid" borderColor="teal.500" pb={2} display="inline-block">
            Archivos Adjuntos
          </Heading>
          
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            <DocumentField label="Foto de Perfil (Avatar)" url={avatarUrl} />
            <DocumentField label="Cédula de Identidad" url={docs.ci || docs.cedula} />
            <DocumentField label="Registro de Información Fiscal (RIF)" url={docs.rif} />
            <DocumentField label="Certificado ISLR" url={docs.islr} />
            <DocumentField label="Resumen Curricular" url={docs.curriculum || docs.resumenes} />
            
            {/* ✨ Leemos directamente su llave dedicada */}
            <DocumentField label="Copia del Título Profesional" url={docs.titulo} />
            
            {/* ✨ Solo lo muestra si existe (para jurídicas) */}
            {docs.registro_mercantil && (
              <DocumentField label="Registro Mercantil" url={docs.registro_mercantil} />
            )}
          </SimpleGrid>
        </Box>

      </VStack>
    </Box>
  );
}