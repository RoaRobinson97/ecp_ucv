// /app/admin/solicitudes/[id]/page.tsx

import { 
  Box, Heading, Text, Divider, VStack, Container, Badge, HStack, SimpleGrid, Stat, StatLabel, StatNumber
} from '@chakra-ui/react';
import { redirect, notFound } from 'next/navigation';
import { cookies } from 'next/headers'; 

// Importamos los tipos y el SERVICIO
import { 
  PayloadCodigoProveedor, 
  PayloadFormulacionCurso,
  PayloadCierreCohorte, // ✨ IMPORTANTE: Traer el nuevo tipo
  User
} from '@/data/types';
import { solicitudesService } from '@/servicios/solicitudes-service';
import { userService } from '@/servicios/users-service';

// Vistas específicas
import { CodigoProveedorView } from '@/components/ui/codigo-proveedor-view';
import { CourseDetailsView } from '@/components/ui/course-details-view';
import { AdminActions } from '@/components/ui/admin-actions';
import { CierreCohorteView } from '@/components/ui/cierre-cohorte-view'; // ✨ LA NUEVA VISTA

export default async function SolicitudDetallePage({ params }: { params: { id: string } }) {
  
  // ✨ SEGURIDAD REAL (Eliminamos el hardcodeo inútil)
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  const currentUser = userService.getUserFromToken(token) as User | null;

  if (!currentUser || !['admin', 'coordinador'].includes(currentUser.rol)) {
      redirect('/login?error=unauthorized');
  }

  // Ahora buscamos en la base de datos completa a través del servicio
  const solicitud = await solicitudesService.getSolicitudById(params.id);

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
          <StatCard label="Categoría de Trámite" value={solicitud.tipo.replace(/-/g, ' ').toUpperCase()} color="purple.500" />
          <StatCard label="Fecha de Registro" value={solicitud.fecha_creacion} color="blue.500" />
          <StatCard label="ID de Usuario" value={solicitud.user_id} color="teal.500" />
        </SimpleGrid>

        <Divider />

        {/* CONTENIDO DINÁMICO */}
        <Box p={8} bg="white" shadow="sm" borderWidth="1px" rounded="xl">
          {solicitud.tipo === 'codigo-proveedor' ? (
            <CodigoProveedorView payload={solicitud.payload as PayloadCodigoProveedor} />
          ) : solicitud.tipo === 'cierre-cohorte' ? (
            // ✨ AQUÍ RENDERIZAMOS EL CIERRE
            <CierreCohorteView payload={solicitud.payload as PayloadCierreCohorte} />
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
            currentUserId={currentUser?.id} // ✨ LE PASAMOS EL ID REAL
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