// /app/admin/dashboard/page.tsx
import { Box, Heading, Text, SimpleGrid } from '@chakra-ui/react';
import { redirect } from 'next/navigation';
import { DashboardCard } from '@/components/ui/dashboard-card';
import { solicitudesService } from '@/servicios/solicitudes-service';
import { Solicitud } from '@/data/types';

export default async function AdminDashboardPage() {
  // Seguridad
  const user = { role: 'admin' };
  if (user.role !== 'admin') redirect('/login?error=unauthorized');

  // Llamadas a servicios reales/mock
  const { solicitudes } = await solicitudesService.getAllSolicitudes({ limit: 100 });
  const pendingRequests = solicitudes.filter((s: Solicitud) => s.estado === 'pendiente').length;

  // Si tienes un método para cuentas no verificadas en userService, úsalo aquí
  // Por ahora simulamos basado en el rol visitante o un campo de verificación
  const unverifiedAccounts = 3; 

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
        <DashboardCard
          title="Gestión de Usuarios"
          description="Administra los usuarios y sus roles en la plataforma."
          count={unverifiedAccounts}
          countLabel="por verificar"
          link="/admin/usuarios"
          linkText="Ir a Usuarios"
        />
      </SimpleGrid>
    </Box>
  );
}