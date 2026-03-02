"use client";

import React, { useState, useEffect } from 'react';
import { 
    Box, Heading, Text, Divider, useColorModeValue, VStack, Avatar,
    Table, Thead, Tbody, Tr, Th, Td, TableContainer, Badge, HStack, Icon 
} from '@chakra-ui/react';
import { MdEmail, MdPerson } from 'react-icons/md';
import { User, Course, FullProvider } from "@/data/types"; 
import { courseService } from '@/servicios/cursos-service';

export function ProfileOwnerView({ user, mode }: { user: User | FullProvider, mode: string }) {
    const [myCourses, setMyCourses] = useState<Course[]>([]);
    const brandColor = "teal.500";
    const isProveedor = user.rol === 'proveedor';

    useEffect(() => {
        async function loadMyCourses() {
            if (isProveedor) {
                try {
                    const result = await courseService.getCoursesByUserId(user.id);
                    setMyCourses(result.courses);
                } catch (e) { console.error(e); }
            }
        }
        loadMyCourses();
    }, [user.id, isProveedor]);

    const displayName = (isProveedor && 'nombre_proveedor' in user)
        ? (user as FullProvider).nombre_proveedor : `${user.nombres} ${user.apellidos}`;

    return (
        <Box p={6} bg={useColorModeValue("white", "gray.700")} shadow="xl" rounded="lg" borderTop="6px solid" borderColor={brandColor} maxW="3xl" mx="auto">
            
            <HStack justify="space-between" mb={4}>
                <Heading size="xl">{isProveedor ? "Perfil de Proveedor" : "Mi Perfil"}</Heading>
                <Badge colorScheme="teal">{mode}</Badge>
            </HStack>
            <Divider my={4} />
            <VStack spacing={4} align="center" mb={6}>
                <Avatar size="2xl" name={displayName as string} src={(user as any).avatarUrl} border="4px solid" borderColor={brandColor} />
                <Heading size="lg">{displayName as string}</Heading>
                <HStack><Icon as={MdEmail} color={brandColor} /><Text>{user.email}</Text></HStack>
            </VStack>

            {isProveedor && (
                <>
                    <Heading size="md" mb={3}>Mis Cursos Asignados</Heading>
                    <TableContainer border="1px" borderColor="gray.100" rounded="md">
                        <Table variant="simple" size="sm">
                            <Thead bg="gray.50"><Tr><Th>Título</Th><Th>Estado</Th></Tr></Thead>
                            <Tbody>
                                {myCourses.map(c => (
                                    <Tr key={c.id}>
                                        <Td fontWeight="medium">{c.titulo}</Td>
                                        <Td><Badge colorScheme="green">{c.estado_gestion || 'Activo'}</Badge></Td>
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>
                    </TableContainer>
                </>
            )}
        </Box>
    );
}