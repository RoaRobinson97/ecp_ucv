import { Box, Heading, Text, VStack } from '@chakra-ui/react';
import { cookies } from 'next/headers'; 
import { SolicitudesTable } from '@/components/ui/solicitudes-table';
import { Pagination } from '@/components/ui/pagination'; 
import { solicitudesService } from '@/servicios/solicitudes-service';
import { userService } from '@/servicios/users-service';
import { Solicitud, User } from '@/data/types';

export const dynamic = 'force-dynamic';

export default async function SolicitudesPage({
  searchParams,
}: {
  // Atrapamos 'tipo' desde la URL en lugar de 'search'
  searchParams: Promise<{ page?: string; tipo?: string }>; 
}) {
  const resolvedSearchParams = await searchParams;
  const currentPage = parseInt(resolvedSearchParams.page || '1', 10);
  const tipoFiltro = resolvedSearchParams.tipo || 'Todos'; 
  const itemsPerPage = 10; 

  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  const currentUser = userService.getUserFromToken(token) as User & { sub?: string, userID?: string } | null;
  const esCoordinador = currentUser?.rol === 'coordinador' || currentUser?.roles?.includes('coordinador');
  const coordinadorId = esCoordinador ? (currentUser?.sub || currentUser?.id || currentUser?.userID) : undefined;

  let solicitudesUnificadas: any[] = [];

  try {
      const response = await solicitudesService.getAllSolicitudes({ 
          limit: 1000, 
          status: 'all',
          coordinador_id: String(coordinadorId)
      } as any); 
      
      const solicitudes = response.solicitudes as Solicitud[];
      
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

        // ✨ FIX MAESTRO: Atrapamos cualquier formato de fecha que use tu db.json
        const fechaCruda = sol.fecha_creacion || 
                           (sol as any).creado_en || 
                           (sol as any).fecha || 
                           (sol as any).actualizado_en || 
                           payloadData?.creado_en || 
                           payloadData?.fecha || 
                           new Date().toISOString();

        return {
          ...sol,
          solicitante: nombre_proveedor || nombre_usuario,
          nombre: payloadData?.nombre_proveedor || payloadData?.titulo || payloadData?.titulo_curso || payloadData?.denominacion || 'Sin nombre',
          fecha: fechaCruda
        };
      });

  } catch (error) {
      console.error("Error cargando la gestión de solicitudes:", error);
  }

  // 1. ORDEN CRONOLÓGICO (Más reciente primero)
  solicitudesUnificadas.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

  // 2. FILTRADO DESDE EL SERVIDOR ANTES DE PAGINAR
  let datosAFiltrar = solicitudesUnificadas;
  if (tipoFiltro !== 'Todos') {
      datosAFiltrar = solicitudesUnificadas.filter(sol => sol.tipo === tipoFiltro);
  }

  // 3. PAGINACIÓN PERFECTA SOBRE EL RESULTADO FILTRADO
  const totalItems = datosAFiltrar.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSolicitudes = datosAFiltrar.slice(startIndex, startIndex + itemsPerPage);

  return (
    <Box maxW="container.xl" mx="auto" py={10} px={6}>
      <VStack align="start" spacing={2} mb={8}>
        <Heading as="h1" size="xl" color="teal.600">Gestión de Solicitudes</Heading>
        <Text fontSize="lg" color="gray.500">
          Administra las solicitudes de los distintos módulos de la plataforma.
        </Text>
      </VStack>
      
      <SolicitudesTable 
        educacionContinua={paginatedSolicitudes} 
        grupoExtension={[]} 
      />

      {totalPages > 1 && (
        <Pagination currentPage={currentPage} totalPages={totalPages} />
      )}
    </Box>
  );
}