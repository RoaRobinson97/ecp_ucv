import { Box, Heading, Text, VStack } from '@chakra-ui/react';
import { redirect } from 'next/navigation';
// ✨ Importamos cookies de Next.js
import { cookies } from 'next/headers'; 
import { SolicitudesTable } from '@/components/ui/solicitudes-table';
import { solicitudesService } from '@/servicios/solicitudes-service';
import { userService } from '@/servicios/users-service';
import { Solicitud, User } from '@/data/types';

export default async function SolicitudesPage() {

  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  // ✨ CHISMOSOS EN LA TERMINAL DEL SERVIDOR
  console.log("--- DEBUG SEGURIDAD ---");
  console.log("1. Token recibido de la cookie:", token ? "SÍ HAY TOKEN" : "NO HAY TOKEN");

  // ✨ FIX TYPESCRIPT: Le decimos que lo trate como un objeto de tipo 'User'
  const currentUser = userService.getUserFromToken(token) as User | null;

  // 3. Validamos si existe y si su rol es 'admin' o 'coordinador'
  if (!currentUser || !['admin', 'coordinador'].includes(currentUser.rol)) {
      console.warn("Intento de acceso no autorizado a panel de admin/coordinador");
      redirect('/login?error=unauthorized');
  }

  // --- El resto del código de optimización N+1 ---
  let solicitudesUnificadas: any[] = [];

  try {
      const response = await solicitudesService.getAllSolicitudes({ limit: 100 });
      const solicitudes = response.solicitudes as Solicitud[];
      
      const solicitudesFiltradas = solicitudes.filter(s => 
        ['codigo-proveedor', 'formulacion-curso-directa', 'formulacion-curso-indirecta', 'cierre-cohorte'].includes(s.tipo)
      );

      const uniqueUserIds = Array.from(new Set(solicitudesFiltradas.map(s => s.user_id)));
      
      const usersData = await Promise.all(
          uniqueUserIds.map(id => userService.getUserById(id).catch(() => null))
      );
      
      // ✨ FIX TYPESCRIPT EXTREMO: Forzamos el tipo Record<string, User> tanto en la variable como en el acumulador (acc)
      const userMap: Record<string, User> = usersData.reduce((acc: Record<string, User>, rawUser) => {
          const user = rawUser as User | null;
          if (user && user.id) {
              // Aseguramos que la llave se guarde como string
              acc[String(user.id)] = user;
          }
          return acc;
      }, {});

      solicitudesUnificadas = solicitudesFiltradas.map((sol: Solicitud) => {
        const userIdString = String(sol.user_id);
        const user = userMap[userIdString];
        
        const nombreUsuario = user ? `${user.nombres} ${user.apellidos}` : 'Usuario Desconocido';
        const payloadData = sol.payload as Record<string, any>;
        const nombreProveedor = payloadData?.nombreProveedor;

        return {
          ...sol,
          solicitante: nombreProveedor || nombreUsuario,
          nombre: payloadData?.nombreProveedor || payloadData?.titulo || 'Sin nombre',
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