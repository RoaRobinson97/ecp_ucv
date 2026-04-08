// src/components/dev/DevLoginHelper.tsx
"use client";

import React, { useMemo } from 'react';
import { Box, Flex, FormLabel, Select, Tag, Text } from "@chakra-ui/react";
// 👇 ¡AQUÍ ESTÁ EL CAMBIO PRINCIPAL! Importamos MOCKED_DB, la única fuente de verdad.
import { MOCKED_DB } from '@/data/mock-data';

interface DevLoginHelperProps {
    onUserSelect: (email: string, password: string) => void;
}

// Sacamos la lista de usuarios de MOCKED_DB. Añadimos '|| []' como medida de seguridad.
const usersList = MOCKED_DB.users || [];

// La función para agrupar ahora es más robusta
const groupUsersByRole = (users: typeof usersList) => {
    return users.reduce((acc, user) => {
        const rol = user.rol || 'Sin Rol';
        if (!acc[rol]) {
            acc[rol] = [];
        }
        acc[rol].push(user);
        return acc;
    }, {} as Record<string, typeof usersList>);
};

export const DevLoginHelper = ({ onUserSelect }: DevLoginHelperProps) => {
    
    // Agrupamos los usuarios usando la lista correcta
    const groupedUsers = useMemo(() => groupUsersByRole(usersList), []);

    const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedEmail = event.target.value;
        if (!selectedEmail) {
            onUserSelect('', '');
            return;
        }

        // Buscamos en la lista correcta
        const selectedUser = usersList.find(user => user.email === selectedEmail);

        if (selectedUser) {
            onUserSelect(selectedUser.email, selectedUser.password);
        }
    };

    const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

    return (
        <Box 
            border="2px dashed" 
            borderColor="red.300" 
            p={4} 
            rounded="md" 
            mb={6}
        >
            <Flex align="center" justify="space-between" mb={2}>
                <FormLabel htmlFor="dev-user-select" m={0}>
                    Inicio Rápido (Dev)
                </FormLabel>
                <Tag colorScheme="red" size="sm">DEV ONLY</Tag>
            </Flex>
            <Text fontSize="xs" color="gray.500" mb={2}>
                Selecciona un usuario para autocompletar el formulario.
            </Text>
            <Select 
                id="dev-user-select"
                placeholder="-- Seleccionar un usuario --" 
                onChange={handleSelectChange}
                focusBorderColor="red.400"
            >
                {/* El renderizado dinámico ahora funciona con la data correcta */}
                {Object.entries(groupedUsers).map(([rol, usersInRole]) => (
                    <optgroup key={rol} label={capitalize(rol)}>
                        {usersInRole.map(user => (
                            <option key={user.id} value={user.email}>
                                {user.nombres}
                            </option>
                        ))}
                    </optgroup>
                ))}
            </Select>
        </Box>
    );
};