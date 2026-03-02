import { Box, Heading, Text, VStack } from '@chakra-ui/react';
import { redirect } from 'next/navigation';
import { SolicitudesTable } from '@/components/ui/solicitudes-table';
import { solicitudesService } from '@/servicios/solicitudes-service';
import { userService } from '@/servicios/users-service';

// 1. IMPORTA TUS TIPOS
import { Solicitud, User } from '@/data/types';

export default async function SolicitudesPage() {
  const userRole = { role: 'admin' }; 
  if (userRole.role !== 'admin') redirect('/login?error=unauthorized');

  const response = await solicitudesService.getAllSolicitudes({ limit: 100 });
  const solicitudes = response.solicitudes as Solicitud[];
  
  const todasLasSolicitudes = await Promise.all(solicitudes.map(async (sol: Solicitud) => {
    const user = await userService.getUserById(sol.userId) as User | null;
    
    // Nombres base
    const nombreUsuario = user ? `${user.nombres} ${user.apellidos}` : 'Usuario Desconocido';
    const nombreProveedor = (sol.payload as any)?.nombreProveedor;

    return {
      ...sol,
      // ✨ TU LÓGICA PEDIDA: Si hay proveedor, usa ese. Si no, el usuario.
      solicitante: nombreProveedor || nombreUsuario,
      
      // Mantenemos esto para la columna "Nombre / Título" (lo que se solicita)
      nombre: (sol.payload as any)?.nombreProveedor || (sol.payload as any)?.titulo || 'Sin nombre',
      fecha: sol.fechaCreacion
    };
  }));

  const solicitudesUnificadas = todasLasSolicitudes.filter(s => 
    ['codigo-proveedor', 'formulacion-curso-directa', 'formulacion-curso-indirecta', 'cierre-cohorte'].includes(s.tipo)
  );

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