"use client";

import {
  Table, Thead, Tbody, Tr, Th, Td, TableContainer, Tabs, TabList, Tab,
  TabPanels, TabPanel, Box, Text, Badge, RadioGroup, Stack, Radio,
  Tooltip, HStack,
} from '@chakra-ui/react';
import { FaFileSignature } from 'react-icons/fa'; 
import { useRouter } from 'next/navigation'; 
import React, { useState } from 'react';
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
    default: return 'gray';
  }
};

const LegalSeal = ({ hasContract, user_id }: { hasContract: boolean, user_id: string }) => {
  const router = useRouter();
  const tooltipLabel = hasContract ? 'Contrato legal vinculado (Ver Perfil)' : 'Sin contrato legal (Ir al Perfil)';

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation(); 
    router.push(`/profile/${user_id}`);
  };

  return (
    <Box 
      display="inline" 
      ml={2} 
      lineHeight="1"
      onClick={handleClick}
      cursor="pointer"
    >
      <Tooltip label={tooltipLabel} placement="top" hasArrow>
        <Box opacity={hasContract ? 1 : 0.3} color={hasContract ? "teal.600" : "gray.400"}>
            <FaFileSignature />
        </Box>
      </Tooltip>
    </Box>
  );
};

export function SolicitudesTable({ educacionContinua, grupoExtension }: SolicitudesTableProps) {
  const router = useRouter();
  const [filter, setFilter] = useState('Todos');
  const [legalFilter, setLegalFilter] = useState('Todos');

  const isCourseTypeSelected = filter.includes('formulacion') || filter === 'Todos';
  
  const educacionContinuaTypes = [
    'Todos',
    'codigo-proveedor',
    'formulacion-curso-directa',
    'formulacion-curso-indirecta',
    'cierre-cohorte'
  ];

  const renderTable = (solicitudes: SolicitudEnriquecida[]) => {
    let filteredSolicitudes = solicitudes;

    if (filter !== 'Todos') {
      filteredSolicitudes = filteredSolicitudes.filter(sol => sol.tipo === filter);
    }

    if (legalFilter !== 'Todos') {
      const isLegalRequired = legalFilter === 'Vigente';
      filteredSolicitudes = filteredSolicitudes.filter(sol => {
          const payloadData = sol.payload as Record<string, any>;
          const hasContract = !!(payloadData?.contrato_id || payloadData?.numContrato);
          return hasContract === isLegalRequired;
      });
    }

    return (
      <TableContainer minH="500px">
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>ID</Th>
              <Th>Tipo</Th>
              <Th>Solicitante</Th>
              <Th>Fecha</Th>
              <Th>Estado</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredSolicitudes.length > 0 ? (
              filteredSolicitudes.map((sol) => {
                const isCourse = sol.tipo.includes('formulacion');
                const payloadData = sol.payload as Record<string, any>;
                const hasContract = !!(payloadData?.contrato_id || payloadData?.numContrato);
                
                // ✨ FIX: Evaluamos si está aprobada para redirigir al perfil si falta contrato
                const isApproved = sol.estado.toLowerCase() === 'aprobada' || sol.estado.toLowerCase() === 'aprobado';
                
                const handleRowClick = () => {
                  if (isCourse && isApproved && !hasContract) {
                    router.push(`/profile/${sol.user_id}`); // Va al perfil para tramitar el contrato
                  } else {
                    router.push(`/admin/solicitudes/${sol.id}`); // Flujo normal
                  }
                };
                
                return (
                  <Tr 
                    key={`${sol.tipo}-${sol.id}`} 
                    _hover={{ cursor: 'pointer', bg: 'gray.50' }}
                    onClick={handleRowClick}
                    transition="background-color 0.2s"
                  >
                    <Td fontWeight="bold" color="teal.600">{sol.id}</Td>
                    <Td>
                      <Badge colorScheme={tipoColorMap[sol.tipo] || 'gray'}>
                        {sol.tipo.replace(/-/g, ' ').toUpperCase()}
                      </Badge>
                    </Td>
                    <Td fontWeight="medium" color="gray.600">{sol.solicitante}</Td>
                    <Td>{sol.fecha}</Td>
                    <Td>
                      <HStack spacing={2}>
                        <Badge colorScheme={getBadgeColorScheme(sol.estado)}>{sol.estado}</Badge>
                        {isCourse && <LegalSeal hasContract={hasContract} user_id={sol.user_id} />}
                      </HStack>
                    </Td>
                  </Tr>
                );
              })
            ) : (
              <Tr><Td colSpan={5} textAlign="center" py={10}>No hay solicitudes registradas bajo estos criterios.</Td></Tr>
            )}
          </Tbody>
        </Table>
      </TableContainer>
    );
  };

  const renderFilters = (types: string[], currentFilter: string, setFilter: (value: string) => void) => (
    <RadioGroup onChange={setFilter} value={currentFilter}>
      <Stack direction={{ base: 'column', md: 'row' }} spacing={4}>
        {types.map(tipo => (
          <Radio key={tipo} value={tipo} colorScheme="teal">
            {tipo === 'Todos' ? 'Todos' : tipo
              .replace('codigo-proveedor', 'Proveedor')
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
    <Tabs variant="enclosed" onChange={() => { setFilter('Todos'); setLegalFilter('Todos'); }}>
      <TabList>
        <Tab>Educación Continua ({educacionContinua.length})</Tab>
      </TabList>
      <TabPanels>
        <TabPanel>
          <Box mb={6}>
            <Text mb={2} fontWeight="bold">Filtrar por tipo:</Text>
            {renderFilters(educacionContinuaTypes, filter, setFilter)}
            
          
          </Box>
          {renderTable(educacionContinua)}
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
}