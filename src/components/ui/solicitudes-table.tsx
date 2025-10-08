"use client";

import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Box,
  Text,
  Badge,
  RadioGroup,
  Stack,
  Radio,
  Link as ChakraLink,
  Tooltip,
  HStack, 
} from '@chakra-ui/react';
import { FaFileAlt } from 'react-icons/fa'; 
import NextLink from 'next/link';
import React, { useState, useMemo } from 'react';

interface Solicitud {
  id: string;
  tipo: string;
  fecha: string;
  estado: string;
  nombre: string;
  isLegal?: boolean; 
}

interface SolicitudesTableProps {
  educacionContinua: Solicitud[];
  grupoExtension: Solicitud[];
}

const tipoColorMap: { [key: string]: string } = {
  'Código de Proveedor': 'blue',
  'Formulación de Curso - Directa': 'purple',
  'Formulación de Curso - Indirecta': 'pink',
  'Actualización de Curso': 'red',
  'Solicitud de Evento': 'green',
  'Solicitud de Recurso': 'orange',
};

const getBadgeColorScheme = (estado: string) => {
  switch (estado.toLowerCase()) {
    case 'pendiente':
      return 'orange';
    case 'aprobada':
      return 'green';
    case 'rechazada':
      return 'red';
    default:
      return 'gray';
  }
};

const LegalSeal = ({ isLegal }: { isLegal?: boolean }) => {
  const legalStatus = !!isLegal; 

  const tooltipLabel = legalStatus 
    ? 'Documentación legal en vigencia' 
    : 'Documentación legal no vigente';
  
  const sealColor = 'gray.500';
  const sealOpacity = legalStatus ? 1 : 0.4;

  return (
    <Box display="inline" ml={2} lineHeight="1"> 
      <Tooltip label={tooltipLabel} placement="top" hasArrow>
        <FaFileAlt
          color={sealColor} 
          opacity={sealOpacity} 
          cursor="pointer" 
        />
      </Tooltip>
    </Box>
  );
};

export function SolicitudesTable({ educacionContinua, grupoExtension }: SolicitudesTableProps) {
  const [filter, setFilter] = useState('Todos');
  const [legalFilter, setLegalFilter] = useState('Todos'); 

  const educacionContinuaTypes = useMemo(() => ['Todos', ...new Set(educacionContinua.map(sol => sol.tipo))], [educacionContinua]);
  const grupoExtensionTypes = useMemo(() => ['Todos', ...new Set(grupoExtension.map(sol => sol.tipo))], [grupoExtension]);

  const courseTypes = ['Formulación de Curso - Directa', 'Formulación de Curso - Indirecta'];
  // CAMBIO: isCourseTypeSelected se basa en el filtro actual
  const isCourseTypeSelected = courseTypes.includes(filter);


  const renderTable = (solicitudes: Solicitud[]) => {
    
    let filteredSolicitudes = solicitudes;

    // 1. Filtro por tipo
    filteredSolicitudes = filter === 'Todos'
      ? filteredSolicitudes
      : filteredSolicitudes.filter(sol => sol.tipo === filter);


    // 2. Filtro por estado legal, solo si un tipo de curso está seleccionado
    if (isCourseTypeSelected && legalFilter !== 'Todos') {
      const isLegalRequired = legalFilter === 'Vigente';

      filteredSolicitudes = filteredSolicitudes.filter(sol => {
        const currentLegalStatus = !!sol.isLegal;
        return currentLegalStatus === isLegalRequired;
      });
    }

    return (
      <TableContainer minH="500px">
        {/* CORRECCIÓN DE HYDRACIÓN: Eliminar el whitespace entre <Table> y <Thead>, y <Thead> y <Tbody> */}
        <Table variant="simple"><Thead>
            <Tr>
              <Th>ID</Th>
              <Th>Tipo</Th>
              <Th>Nombre</Th>
              <Th>Fecha</Th>
              <Th>Estado</Th>
            </Tr>
        </Thead><Tbody>
            {filteredSolicitudes.length > 0 ? (
              filteredSolicitudes.map((sol) => {
                const isCourse = sol.tipo.includes('Formulación de Curso');
                const showSeal = isCourse && sol.estado.toLowerCase() === 'aprobada';

                return (
                <NextLink key={sol.id} href={`/admin/solicitudes/${sol.id}`} passHref legacyBehavior>
                  <ChakraLink
                    as="tr"
                    _hover={{ bg: 'rowhover', cursor: 'pointer' }} 
                    style={{ display: 'table-row' }}
                  >
                    <Td>{sol.id}</Td>
                    <Td>
                      <Badge colorScheme={tipoColorMap[sol.tipo] || 'gray'}>{sol.tipo}</Badge>
                    </Td>
                    <Td>{sol.nombre}</Td>
                    <Td>{sol.fecha}</Td>
                    <Td display={'flex'} flexDir={'row'} alignItems={'center'} >
                      <Badge colorScheme={getBadgeColorScheme(sol.estado)}>{sol.estado}</Badge>
                      {showSeal && <LegalSeal isLegal={sol.isLegal} />}
                    </Td>
                  </ChakraLink>
                </NextLink>
                );
              })
            ) : (
              <Tr>
                <Td colSpan={5} textAlign="center" py={10}>
                  <Text>No hay solicitudes de este tipo.</Text>
                </Td>
              </Tr>
            )}
        </Tbody></Table>
      </TableContainer>
    );
  };

  const renderFilters = (types: string[], currentFilter: string, setFilter: (value: string) => void) => (
    <RadioGroup onChange={setFilter} value={currentFilter}>
      <Stack direction={{ base: 'column', md: 'row' }} spacing={4}>
        {types.map(tipo => (
          <Radio key={tipo} value={tipo}>
            {tipo}
          </Radio>
        ))}
      </Stack>
    </RadioGroup>
  );

  const renderLegalFilter = () => (
    <Box mt={4}>
      <Text mb={2} fontWeight="bold">Filtrar por Documentación Legal:</Text>
      <RadioGroup onChange={setLegalFilter} value={legalFilter}>
        <Stack direction={{ base: 'column', md: 'row' }} spacing={4}>
          <Radio value="Todos">Todos</Radio>
          <Radio value="Vigente">Documentacion Legal Vigente</Radio>
          <Radio value="No Vigente">Documentacion Legal No Vigente</Radio>
        </Stack>
      </RadioGroup>
    </Box>
  );

  // Al cambiar la pestaña, reseteamos ambos filtros
  const handleTabChange = () => {
    setFilter('Todos');
    setLegalFilter('Todos');
  };
  
  // Al cambiar el filtro de tipo, reseteamos el filtro legal para evitar estados incoherentes
  const handleTypeFilterChange = (newFilter: string) => {
    setFilter(newFilter);
    setLegalFilter('Todos');
  }

  return (
    <Tabs variant="enclosed" onChange={handleTabChange}>
      <TabList>
        <Tab>Educación Continua ({educacionContinua.length})</Tab>
        <Tab>Grupo de Extensión ({grupoExtension.length})</Tab>
      </TabList>
      <TabPanels>
        <TabPanel>
          <Box mb={6}>
            <Text mb={2} fontWeight="bold">Filtrar por tipo de solicitud:</Text>
            {renderFilters(educacionContinuaTypes, filter, handleTypeFilterChange)}
          
            {/* Mostrar filtro legal solo si se ha seleccionado un tipo de curso */}
            {isCourseTypeSelected && renderLegalFilter()}
            
          </Box>
          {renderTable(educacionContinua)}
        </TabPanel>
        <TabPanel>
          <Box mb={6}>
            <Text mb={2} fontWeight="bold">Filtrar por tipo de solicitud:</Text>
            {renderFilters(grupoExtensionTypes, filter, handleTypeFilterChange)}

            {/* Mostrar filtro legal solo si se ha seleccionado un tipo de curso */}
            {isCourseTypeSelected && renderLegalFilter()}
            
          </Box>
          {renderTable(grupoExtension)}
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
}