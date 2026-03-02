// /app/admin/solicitudes/[id]/page.tsx

import { 
  Box, Heading, Text, Divider, VStack, Container, Badge, HStack, SimpleGrid, Stat, StatLabel, StatNumber
} from '@chakra-ui/react';
import { redirect, notFound } from 'next/navigation';

// Importamos los tipos y el SERVICIO
import { 
  PayloadCodigoProveedor, 
  PayloadFormulacionCurso
} from '@/data/types';
import { solicitudesService } from '@/servicios/solicitudes-service';

// Vistas específicas
import { CodigoProveedorView } from '@/components/ui/codigo-proveedor-view';
import { CourseDetailsView } from '@/components/ui/course-details-view';
import { AdminActions } from '@/components/ui/admin-actions';

// Ya no necesitamos la función mock interna porque usamos el service

export default async function SolicitudDetallePage({ params }: { params: { id: string } }) {
  
  // Seguridad (Mantenida)
  const userRole = 'admin'; 
  if (userRole !== 'admin') redirect('/login?error=unauthorized');

  // ✨ LA CLAVE: Ahora buscamos en la base de datos completa a través del servicio
  const solicitud = await solicitudesService.getSolicitudById(params.id);

  // Si no existe en el MOCKED_DB completo, entonces sí manda 404
  if (!solicitud) notFound();

  const getStatusColor = (estado: string) => {
    const colors: Record<string, string> = {
      'pendiente': 'orange',
      'aprobada': 'green',
      'rechazada': 'red'
    };
    return colors[estado.toLowerCase()] || 'gray';
  };

  return (
    <Container maxW="container.xl" py={10}>
      <VStack align="stretch" spacing={8}>
        
        {/* ENCABEZADO */}
        <Box>
          <HStack justify="space-between" align="flex-end">
            <VStack align="start" spacing={1}>
              <Heading as="h1" size="xl">Detalle de Gestión</Heading>
              <Text fontSize="lg" color="gray.500">Expediente ID: {solicitud.id}</Text>
            </VStack>
            <Badge colorScheme={getStatusColor(solicitud.estado)} fontSize="md" p={2} rounded="md">
              {solicitud.estado.toUpperCase()}
            </Badge>
          </HStack>
        </Box>

        {/* STATS RÁPIDOS */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
          {/* Limpiamos el slug para mostrar texto humano */}
          <StatCard label="Categoría de Trámite" value={solicitud.tipo.replace(/-/g, ' ').toUpperCase()} color="purple.500" />
          <StatCard label="Fecha de Registro" value={solicitud.fechaCreacion} color="blue.500" />
          <StatCard label="ID de Usuario" value={solicitud.userId} color="teal.500" />
        </SimpleGrid>

        <Divider />

        {/* CONTENIDO DINÁMICO */}
        <Box p={8} bg="white" shadow="sm" borderWidth="1px" rounded="xl">
          {solicitud.tipo === 'codigo-proveedor' ? (
            <CodigoProveedorView payload={solicitud.payload as PayloadCodigoProveedor} />
          ) : (
            <CourseDetailsView 
              payload={solicitud.payload as PayloadFormulacionCurso} 
              tipo={solicitud.tipo} 
            />
          )}
        </Box>

        <Divider />

        {/* ACCIONES */}
        <Box bg="gray.50" p={6} rounded="xl" border="1px dashed" borderColor="gray.300">
          <Heading size="md" mb={4}>Panel de Decisiones</Heading>
          <AdminActions 
            solicitudId={solicitud.id} 
            solicitudTipo={solicitud.tipo} 
            adminOrganismo="DEU" 
          />
        </Box>

      </VStack>
    </Container>
  );
}

function StatCard({ label, value, color }: { label: string, value: string, color: string }) {
  return (
    <Stat p={5} shadow="sm" border="1px" borderColor="gray.200" rounded="xl" bg="white">
      <StatLabel fontWeight="bold" color="gray.600">{label}</StatLabel>
      <StatNumber fontSize="xl" color={color}>{value}</StatNumber>
    </Stat>
  );
}