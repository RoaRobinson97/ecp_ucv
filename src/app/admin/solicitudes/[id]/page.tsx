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
// (Tus imports se quedan igual...)

export default async function SolicitudDetallePage({ params }: { params: Promise<{ id: string }> }) {
  // (Toda tu lógica de seguridad se queda exactamente igual...)
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  const currentUser = userService.getUserFromToken(token) as Record<string, any> | null;

  if (!currentUser) redirect('/login?error=unauthorized');

  const userRole = currentUser.rol || '';
  const userRolesList = currentUser.roles || currentUser.v1?.roles || [];
  
  const isAuthorized = 
      ['admin', 'coordinador'].includes(userRole) || 
      userRolesList.some((r: string) => ['deu_admin', 'deu_coordinator', 'admin'].includes(r));

  if (!isAuthorized) redirect('/login?error=unauthorized');

  const solicitud = await solicitudesService.getSolicitudById(id);

  if (!solicitud) notFound();

  const getStatusColor = (estado: string) => {
    const colors: Record<string, string> = { 'pendiente': 'orange', 'aprobada': 'green', 'rechazada': 'red' };
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
              {/* ✨ SOPORTE DARK MODE */}
              <Text fontSize="lg" color="gray.500" _dark={{ color: "gray.400" }}>Expediente ID: {solicitud.id}</Text>
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
        {/* ✨ SOPORTE DARK MODE: Fondo de la caja principal */}
        <Box p={8} bg="white" _dark={{ bg: "gray.800", borderColor: "gray.700" }} shadow="sm" borderWidth="1px" rounded="xl">
          {solicitud.tipo === 'codigo-proveedor' ? (
            <CodigoProveedorView payload={solicitud.payload as PayloadCodigoProveedor} />
          ) : solicitud.tipo === 'cierre-cohorte' ? (
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
        {/* ✨ SOPORTE DARK MODE: Caja de acciones */}
        <Box bg="gray.50" _dark={{ bg: "gray.900", borderColor: "gray.700" }} p={6} rounded="xl" border="1px dashed" borderColor="gray.300">
          <Heading size="md" mb={4}>Panel de Decisiones</Heading>
          <AdminActions 
            solicitudId={solicitud.id} 
            solicitudTipo={solicitud.tipo} 
            currentUserId={currentUser?.id} 
          />
        </Box>

      </VStack>
    </Container>
  );
}

function StatCard({ label, value, color }: { label: string, value: string, color: string }) {
  return (
    // ✨ SOPORTE DARK MODE: Tarjetas de estadísticas
    <Stat p={5} shadow="sm" border="1px" borderColor="gray.200" rounded="xl" bg="white" _dark={{ bg: "gray.800", borderColor: "gray.700" }}>
      <StatLabel fontWeight="bold" color="gray.600" _dark={{ color: "gray.300" }}>{label}</StatLabel>
      <StatNumber fontSize="xl" color={color} _dark={{ color: color }}>{value}</StatNumber>
    </Stat>
  );
}