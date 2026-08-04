// /app/admin/dashboard/page.tsx
import { Box, Heading, Text, SimpleGrid } from '@chakra-ui/react';
import { DashboardCard } from '@/components/ui/dashboard-card';
import { solicitudesService } from '@/servicios/solicitudes-service';
import { Solicitud } from '@/data/types';

export default async function AdminDashboardPage() {
  // Las llamadas a servicios reales/mock
  let pendingRequests = 0;
  
  try {
      const { solicitudes } = await solicitudesService.getAllSolicitudes({ limit: 100 });
      pendingRequests = solicitudes.filter((s: Solicitud) => s.estado === 'pendiente').length;
  } catch(error) {
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
        {/* <DashboardCard
          title="Gestión de Usuarios"
          description="Administra los usuarios y sus roles en la plataforma."
          count={unverifiedAccounts}
          countLabel="por verificar"
          link="/admin/usuarios"
          linkText="Ir a Usuarios"
        /> */}
      </SimpleGrid>
    </Box>
  );
}