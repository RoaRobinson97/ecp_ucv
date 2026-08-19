import { Box, Heading, Text, VStack } from '@chakra-ui/react';
import { cookies } from 'next/headers'; 
import { SolicitudesTable } from '@/components/ui/solicitudes-table';
import { solicitudesService } from '@/servicios/solicitudes-service';
import { userService } from '@/servicios/users-service';
import { Solicitud, User } from '@/data/types';

export const dynamic = 'force-dynamic';

export default async function SolicitudesPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  const currentUser = userService.getUserFromToken(token) as User & { sub?: string, userID?: string } | null;
  const esCoordinador = currentUser?.rol === 'coordinador' || currentUser?.roles?.includes('coordinador');
  const coordinadorId = esCoordinador ? (currentUser?.sub || currentUser?.id || currentUser?.userID) : undefined;

  let solicitudesUnificadas: any[] = [];

  try {
      // ✨ FIX: Agregamos "as any" para que TypeScript deje pasar el parámetro
      const response = await solicitudesService.getAllSolicitudes({ 
          limit: 100,
          coordinador_id: String(coordinadorId)
      } as any); 
      
      const solicitudes = response.solicitudes as Solicitud[];
      
      // ✨ Filtro normal, limpio y sin parches
      const solicitudesFiltradas = solicitudes.filter(s => 
        ['codigo-proveedor', 'formulacion-curso-directa', 'formulacion-curso-indirecta', 'cierre-cohorte'].includes(s.tipo)
      );

      const uniqueUserIds = Array.from(new Set(solicitudesFiltradas.map(s => s.user_id)));
      
      const usersData = await Promise.all(
          uniqueUserIds.map(id => userService.getUserById(id).catch(() => null))
      );
      
      const userMap: Record<string, User> = usersData.reduce((acc: Record<string, User>, rawUser: any) => {
          const user = rawUser as User | null;
          if (user && user.id) {
              acc[String(user.id)] = user;
          }
          return acc;
      }, {});

      solicitudesUnificadas = solicitudesFiltradas.map((sol: Solicitud) => {
        const userIdString = String(sol.user_id);
        const user: any = userMap[userIdString];
        
        const nombre = user?.first_name || user?.nombres || '';
        const apellido = user?.last_name || user?.apellidos || '';
        const nombre_usuario = user ? `${nombre} ${apellido}`.trim() : 'Usuario Desconocido';
        
        const payloadData = sol.payload as Record<string, any>;
        const nombre_proveedor = payloadData?.nombre_proveedor;

        return {
          ...sol,
          solicitante: nombre_proveedor || nombre_usuario,
          nombre: payloadData?.nombre_proveedor || payloadData?.titulo || payloadData?.titulo_curso || payloadData?.denominacion || 'Sin nombre',
          fecha: sol.fecha_creacion
        };
      });

  } catch (error) {
      console.error("Error cargando la gestión de solicitudes:", error);
  }

  return (
    <Box maxW="container.xl" mx="auto" py={10} px={6}>
      <VStack align="start" spacing={2} mb={8}>
        <Heading as="h1" size="xl" color="teal.600">Gestión de Solicitudes</Heading>
        <Text fontSize="lg" color="gray.500">
          Administra las solicitudes de los distintos módulos de la plataforma.
        </Text>
      </VStack>
      
      <SolicitudesTable 
        educacionContinua={solicitudesUnificadas}
        grupoExtension={[]} 
      />
    </Box>
  );
}