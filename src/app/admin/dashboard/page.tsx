import { Box, Heading, Text, SimpleGrid } from '@chakra-ui/react';
import { cookies } from 'next/headers'; 
import { DashboardCard } from '@/components/ui/dashboard-card';
import { solicitudesService } from '@/servicios/solicitudes-service';
import { userService } from '@/servicios/users-service';
import { Solicitud, User } from '@/data/types';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  // 🔒 1. LEEMOS LA COOKIE Y SACAMOS EL ID DEL COORDINADOR
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  
  const currentUser = userService.getUserFromToken(token) as User & { sub?: string, userID?: string } | null;
  const esCoordinador = currentUser?.rol === 'coordinador' || currentUser?.roles?.includes('coordinador');
  const coordinadorId = esCoordinador ? (currentUser?.sub || currentUser?.id || currentUser?.userID) : undefined;

  let pendingRequests = 0;
  
  try {
      // ✨ FIX: Agregamos "as any" para evitar el chequeo estricto de TS
      const { solicitudes } = await solicitudesService.getAllSolicitudes({ 
          limit: 100,
          coordinador_id: String(coordinadorId) 
      } as any);
      
      pendingRequests = solicitudes.filter((s: Solicitud) => {
          const isPendiente = s.estado === 'pendiente';
          const payload = s.payload as Record<string, any> || {};
          const hasContract = !!(payload?.contrato_id || payload?.numContrato);
          const isAprobadaSinContrato = s.estado === 'aprobada' && !hasContract;

          return isPendiente || isAprobadaSinContrato;
      }).length;

  } catch (error) {
      console.error("Fallo al traer solicitudes en el dashboard:", error);
  }

  return (
    <Box maxW="container.xl" mx="auto" py={10} px={6}>
      <Heading as="h1" size="xl">Panel de Administración</Heading>
      <Text mt={4}>Bienvenido, aquí tienes un resumen de las tareas pendientes.</Text>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10} mt={10}>
        <DashboardCard
          title="Gestión de Solicitudes"
          description="Revisa las solicitudes de organizaciones y cursos pendientes."
          count={pendingRequests}
          countLabel="pendientes"
          link="/admin/solicitudes"
          linkText="Ir a Solicitudes"
        />
      </SimpleGrid>
    </Box>
  );
}