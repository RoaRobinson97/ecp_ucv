"use client";

import {
  Table, Thead, Tbody, Tr, Th, Td, TableContainer, Tabs, TabList, Tab,
  TabPanels, TabPanel, Box, Text, Badge, RadioGroup, Stack, Radio,
  Link as ChakraLink, Tooltip, HStack,
} from '@chakra-ui/react';
import { FaFileSignature } from 'react-icons/fa'; 
import NextLink from 'next/link';
import { useRouter } from 'next/navigation'; 
import React, { useState, useMemo } from 'react';
import { Solicitud, EstadoSolicitud } from '@/data/types';

interface SolicitudesTableProps {
  educacionContinua: Solicitud[];
  grupoExtension: Solicitud[];
}

const tipoColorMap: { [key: string]: string } = {
  'codigo-proveedor': 'blue',
  'formulacion-curso-directa': 'purple',
  'formulacion-curso-indirecta': 'pink',
  'cierre-cohorte': 'orange',
};

const getBadgeColorScheme = (estado: EstadoSolicitud) => {
  switch (estado) {
    case 'pendiente': return 'orange';
    case 'aprobada': return 'green';
    case 'rechazada': return 'red';
    default: return 'gray';
  }
};

const LegalSeal = ({ hasContract, userId }: { hasContract: boolean, userId: string }) => {
  const router = useRouter();
  const tooltipLabel = hasContract ? 'Contrato legal vinculado (Ver Perfil)' : 'Sin contrato legal (Ir al Perfil)';

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation(); 
    router.push(`/profile/${userId}`);
  };

  return (
    <Box 
      display="inline" 
      ml={2} 
      lineHeight="1"
      onClick={handleClick}
      cursor="pointer"
      // ✨ HOVER ELIMINADO AQUÍ TAMBIÉN POR SI ACASO
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
  const [filter, setFilter] = useState('Todos');
  const [legalFilter, setLegalFilter] = useState('Todos');

  const isCourseTypeSelected = filter.includes('formulacion') || filter === 'Todos';
  const educacionContinuaTypes = useMemo(() => ['Todos', ...new Set(educacionContinua.map(sol => sol.tipo))], [educacionContinua]);

  const renderTable = (solicitudes: Solicitud[]) => {
    let filteredSolicitudes = solicitudes;

    if (filter !== 'Todos') {
      filteredSolicitudes = filteredSolicitudes.filter(sol => sol.tipo === filter);
    }

    if (legalFilter !== 'Todos') {
      const isLegalRequired = legalFilter === 'Vigente';
      filteredSolicitudes = filteredSolicitudes.filter(sol => {
          const hasContract = !!(sol.payload?.contratoId || sol.payload?.numContrato);
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
              <Th>Nombre / Título</Th>
              <Th>Fecha</Th>
              <Th>Estado</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredSolicitudes.length > 0 ? (
              filteredSolicitudes.map((sol) => {
                const isCourse = sol.tipo.includes('formulacion');
                const hasContract = !!(sol.payload?.contratoId || sol.payload?.numContrato);
                const solicitante = (sol as any).solicitante || 'Desconocido';
                
                return (
                  <NextLink key={sol.id} href={`/admin/solicitudes/${sol.id}`} passHref legacyBehavior>
                    <ChakraLink as="tr" _hover={{ cursor: 'pointer', textDecoration: 'none' }} style={{ display: 'table-row' }}>
                      <Td fontWeight="bold">{sol.id}</Td>
                      <Td>
                        <Badge colorScheme={tipoColorMap[sol.tipo] || 'gray'}>
                          {sol.tipo.replace(/-/g, ' ').toUpperCase()}
                        </Badge>
                      </Td>
                      <Td fontWeight="medium" color="gray.600">{solicitante}</Td>
                      <Td>{sol.payload?.nombreProveedor || sol.payload?.titulo || 'Sin nombre'}</Td>
                      <Td>{sol.fechaCreacion}</Td>
                      <Td>
                        <HStack spacing={2}>
                          <Badge colorScheme={getBadgeColorScheme(sol.estado)}>{sol.estado}</Badge>
                          
                          {/* Pasamos el userId al sello */}
                          {isCourse && <LegalSeal hasContract={hasContract} userId={sol.userId} />}
                          
                        </HStack>
                      </Td>
                    </ChakraLink>
                  </NextLink>
                );
              })
            ) : (
              <Tr><Td colSpan={6} textAlign="center" py={10}>No hay solicitudes.</Td></Tr>
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
          <Radio key={tipo} value={tipo}>
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
            
            {isCourseTypeSelected && (
              <Box mt={4} rounded="md">
                <Text mb={2} fontWeight="bold">Filtrar por Documentación Legal:</Text>
                <RadioGroup onChange={setLegalFilter} value={legalFilter}>
                  <Stack direction="row" spacing={4}>
                    <Radio value="Todos">Todos</Radio>
                    <Radio value="Vigente">Vigente</Radio>
                    <Radio value="No Vigente">No Vigente</Radio>
                  </Stack>
                </RadioGroup>
              </Box>
            )}
          </Box>
          {renderTable(educacionContinua)}
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
}