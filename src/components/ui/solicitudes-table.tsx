"use client";

import {
  Table, Thead, Tbody, Tr, Th, Td, Tabs, TabList, Tab,
  TabPanels, TabPanel, Box, Text, Badge, RadioGroup, Stack, Radio,
  Tooltip, HStack,
} from '@chakra-ui/react';
import { FaFileSignature } from 'react-icons/fa'; 
import { useRouter, usePathname, useSearchParams } from 'next/navigation'; 
import React from 'react';
import { Solicitud, EstadoSolicitud } from '@/data/types';

interface SolicitudEnriquecida extends Solicitud {
  solicitante?: string;
  nombre?: string;
  fecha?: string;
}

interface SolicitudesTableProps {
  educacionContinua: SolicitudEnriquecida[];
  grupoExtension: SolicitudEnriquecida[];
}

const tipoColorMap: { [key: string]: string } = {
  'codigo-proveedor': 'blue',
  'formulacion-curso-directa': 'purple',
  'formulacion-curso-indirecta': 'pink',
  'cierre-cohorte': 'orange',
};

const getBadgeColorScheme = (estado: EstadoSolicitud | string) => {
  switch (estado.toLowerCase()) {
    case 'pendiente': return 'orange';
    case 'aprobada': return 'green';
    case 'rechazada': return 'red';
    case 'remitida': return 'blue'; 
    case 'cerrado': return 'green'; 
    default: return 'gray';
  }
};

const LegalSeal = ({ hasContract, user_id, isCompleted }: { hasContract: boolean, user_id: string, isCompleted: boolean }) => {
  const router = useRouter();
  const tooltipLabel = hasContract ? 'Contrato legal vinculado (Ver Perfil)' : 'Sin contrato legal (Ir al Perfil)';

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation();
    if (!isCompleted) {
        router.push(`/profile/${user_id}`);
    }
  };

  return (
    <Box 
      display="inline" 
      ml={2} 
      lineHeight="1"
      onClick={handleClick}
      cursor={isCompleted ? "default" : "pointer"} 
    >
      <Tooltip label={tooltipLabel} placement="top" hasArrow>
        <Box opacity={hasContract ? 1 : 0.3} color={hasContract ? "teal.600" : "teal.300"} _dark={{ color: hasContract ? "teal.300" : "gray.500" }}>
            <FaFileSignature />
        </Box>
      </Tooltip>
    </Box>
  );
};

export function SolicitudesTable({ educacionContinua, grupoExtension }: SolicitudesTableProps) {
  const router = useRouter();
  const pathname = usePathname(); 
  const searchParams = useSearchParams(); 

  const currentFilter = searchParams.get('tipo') || 'Todos';
  
  const educacionContinuaTypes = [
    'Todos',
    'codigo-proveedor',
    'formulacion-curso-directa',
    'formulacion-curso-indirecta',
    'cierre-cohorte'
  ];

  const handleFilterChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', '1'); 
    
    if (value === 'Todos') {
        params.delete('tipo');
    } else {
        params.set('tipo', value);
    }
    
    router.replace(`${pathname}?${params.toString()}`);
  };

  const renderTable = (solicitudes: SolicitudEnriquecida[]) => {
    return (
      // ✨ FIX DARK MODE: Fondo oscuro y bordes para el contenedor de la tabla
      <Box w="100%" overflowX="auto" minH="500px" bg="white" _dark={{ bg: "gray.800", borderColor: "gray.700" }} shadow="sm" rounded="lg" borderWidth="1px">
        <Table variant="simple" sx={{ tableLayout: 'auto', 'td, th': { whiteSpace: 'normal', wordBreak: 'break-word' } }}>
          <Thead bg="gray.50" _dark={{ bg: "whiteAlpha.100" }}>
            <Tr>
              <Th py={4}>ID</Th>
              <Th py={4}>Tipo</Th>
              <Th py={4}>Solicitante</Th>
              <Th py={4}>Fecha</Th>
              <Th py={4}>Estado</Th>
            </Tr>
          </Thead>
          <Tbody>
            {solicitudes.length > 0 ? (
              solicitudes.map((sol) => {
                const isCourse = sol.tipo.includes('formulacion');
                const payloadData = sol.payload as Record<string, any>;
                const hasContract = !!(payloadData?.contrato_id || payloadData?.documento_legal_id || payloadData?.numContrato);
                
                let estadoNormalizado = String(sol.estado || 'pendiente').toLowerCase();
                if (estadoNormalizado === 'cerrado' || estadoNormalizado === 'cerrada') {
                    estadoNormalizado = 'aprobada';
                }
                
                let isFullyCompleted = false;
                if (estadoNormalizado === 'rechazada' || estadoNormalizado === 'rechazado') {
                    isFullyCompleted = true; 
                } else if (estadoNormalizado === 'aprobada' || estadoNormalizado === 'aprobado') {
                    if (isCourse) {
                        isFullyCompleted = hasContract; 
                    } else {
                        isFullyCompleted = true; 
                    }
                }
                
                const handleRowClick = () => {
                  if (isFullyCompleted) return;
                  if (isCourse && estadoNormalizado === 'aprobada' && !hasContract) {
                    router.push(`/profile/${sol.user_id}`); 
                  } else {
                    router.push(`/admin/solicitudes/${sol.id}`); 
                  }
                };
                
                const fechaLimpia = sol.fecha ? new Date(sol.fecha).toLocaleDateString('es-VE') : 'Sin Fecha';

                return (
                  <Tr 
                    key={`${sol.tipo}-${sol.id}`} 
                    // ✨ FIX DARK MODE: Fondo sutil al hacer hover
                    _hover={isFullyCompleted ? {} : { cursor: 'pointer', bg: 'gray.50', _dark: { bg: 'whiteAlpha.50' } }}
                    onClick={handleRowClick}
                    transition="all 0.2s"
                    opacity={isFullyCompleted ? 0.6 : 1} 
                    cursor={isFullyCompleted ? "default" : "pointer"}
                  >
                    <Td fontWeight="bold" color={isFullyCompleted ? "gray.400" : "teal.600"} _dark={{ color: isFullyCompleted ? "gray.500" : "teal.300" }} py={4}>{sol.id}</Td>
                    <Td py={4}>
                      <Badge colorScheme={tipoColorMap[sol.tipo] || 'gray'}>
                        {sol.tipo === 'codigo-proveedor' 
                            ? 'CÓDIGO COLABORADOR' 
                            : sol.tipo.replace(/-/g, ' ').toUpperCase()}
                      </Badge>
                    </Td>
                    <Td fontWeight="medium" color={isFullyCompleted ? "gray.500" : "gray.700"} _dark={{ color: isFullyCompleted ? "gray.500" : "gray.200" }} py={4}>{sol.solicitante}</Td>
                    <Td color="gray.500" _dark={{ color: "gray.400" }} py={4}>{fechaLimpia}</Td>
                    <Td py={4}>
                      <HStack spacing={2}>
                        <Badge colorScheme={getBadgeColorScheme(estadoNormalizado)}>{estadoNormalizado.toUpperCase()}</Badge>
                        {isCourse && <LegalSeal hasContract={hasContract} user_id={sol.user_id} isCompleted={isFullyCompleted} />}
                      </HStack>
                    </Td>
                  </Tr>
                );
              })
            ) : (
              <Tr><Td colSpan={5} textAlign="center" py={10} color="gray.500">No hay solicitudes registradas bajo este filtro.</Td></Tr>
            )}
          </Tbody>
        </Table>
      </Box>
    );
  };

  const renderFilters = (types: string[], filterVal: string, onChange: (value: string) => void) => (
    <RadioGroup onChange={onChange} value={filterVal}>
      <Stack direction={{ base: 'column', md: 'row' }} spacing={4} flexWrap="wrap">
        {types.map(tipo => (
          <Radio key={tipo} value={tipo} colorScheme="teal" size="md">
            {tipo === 'Todos' ? 'Todos' : tipo
              .replace('codigo-proveedor', 'Colaborador')
              .replace('formulacion-curso-directa', 'Formulación Directa')
              .replace('formulacion-curso-indirecta', 'Formulación Indirecta')
              .replace('cierre-cohorte', 'Cierre de Cohorte')
            }
          </Radio>
        ))}
      </Stack>
    </RadioGroup>
  );

  return (
    <Tabs variant="enclosed">
      <TabList>
        <Tab fontWeight="bold" color="teal.600" _dark={{ color: "teal.300" }}>Educación Continua</Tab>
      </TabList>
      <TabPanels>
        <TabPanel px={0}>
          {/* ✨ FIX DARK MODE: Fondo oscuro y borde adaptable para la caja de filtros */}
          <Box mb={6} p={4} bg="white" _dark={{ bg: "gray.800", borderColor: "gray.700" }} shadow="sm" rounded="lg" borderWidth="1px">
            <Text mb={3} fontWeight="bold" color="gray.700" _dark={{ color: "gray.200" }}>Filtrar por tipo de solicitud:</Text>
            {renderFilters(educacionContinuaTypes, currentFilter, handleFilterChange)}
          </Box>
          {renderTable(educacionContinua)}
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
}