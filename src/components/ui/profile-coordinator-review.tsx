// components/ui/profile-coordinator-review.tsx (ACTUALIZADO)
"use client";

import { 
    Box, Heading, Text, Divider, useColorModeValue, Button, VStack, Avatar,
    useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
    Table, Thead, Tbody, Tr, Th, Td, TableContainer, List, ListItem, ListIcon, Badge, 
    // Importaciones necesarias para FileInput
    FormControl as ChakraFormControl, FormLabel as ChakraFormLabel, FormErrorMessage as ChakraFormErrorMessage, 
    Input as ChakraInput, Textarea as ChakraTextarea, FormControlProps, FormLabelProps, 
    InputProps, TextareaProps,   Button as ChakraButton, InputGroup as ChakraInputGroup, Flex
} from '@chakra-ui/react';
import React, { useState, useRef } from 'react';
import { CheckCircleIcon } from '@chakra-ui/icons';

// --- DEFINICIÓN DE INTERFACES (EXPORTADAS PARA USO EXTERNO) ---
export interface Course { 
    id: string;
    nombre: string;
    estado_gestion: 'Pendiente' | 'En Revisión' | 'Aprobado' | 'N/A';
}

export interface UserData { 
    name: string;
    documentStatus: string;
    bio: string;
    avatarUrl: string;
    courses: Course[]; 
}

// --- MOCK DE DATOS DE CURSOS ---
const mockCourses: Course[] = [
    { id: 'C001', nombre: 'Introducción a React Hooks', estado_gestion: 'En Revisión' },
    { id: 'C002', nombre: 'Arquitectura de Microservicios', estado_gestion: 'Pendiente' },
    { id: 'C003', nombre: 'Diseño UX Avanzado', estado_gestion: 'Aprobado' },
];

// === 🛠️ Componentes Base Reutilizados para FileInput ===

export const FormControl: React.FC<FormControlProps> = (props) => <ChakraFormControl {...props} />;
export const FormLabel: React.FC<FormLabelProps> = (props) => <ChakraFormLabel {...props} />;
export const Input: React.FC<InputProps> = (props) => <ChakraInput {...props} />;
export const Textarea: React.FC<TextareaProps> = (props) => <ChakraTextarea {...props} />;

// === 🚀 COMPONENTE CUSTOMIZADO: FileInput (Copiado de tu código) ===

interface FileInputProps extends InputProps {
    label: string;
    description: string;
    isRequired?: boolean;
    onFileChange: (file: File | null) => void;
    // Añadimos 'currentFile' para mostrar el nombre del archivo seleccionado desde el estado del padre
    currentFile: File | null; 
}

/**
 * Control de formulario reutilizable diseñado específicamente para la subida de archivos.
 */
export const FileInput: React.FC<FileInputProps> = ({
    label,
    description,
    isRequired = false,
    onFileChange,
    currentFile, // Recibimos el archivo actual
    ...rest
}) => {
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    // Usamos el estado del padre para el nombre del archivo
    const fileName = currentFile ? currentFile.name : "Ningún archivo seleccionado";

    const fileDescriptionColor = useColorModeValue("gray.500", "gray.400");
    const inputBg = useColorModeValue('white', 'gray.700');
    const inputBorder = useColorModeValue('gray.300', 'gray.600');

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] || null;
        onFileChange(file); // 1. Ejecutar la función de callback del padre
    };

    const handleButtonClick = () => {
        fileInputRef.current?.click(); // 2. Simular clic en el input de tipo archivo oculto
    };

    return (
        <FormControl isRequired={isRequired} {...rest}>
            <FormLabel fontWeight="bold" fontSize="md">{label}</FormLabel>
            
            <Text fontSize="sm" color={fileDescriptionColor} mb={1}>
                {description}
            </Text>
            
            <ChakraInputGroup size="lg" w="full">
                
                <Box w="full"> {/* Usamos Box o Flex para contener el Input y el Botón si es necesario */}
                    <Input
                        isReadOnly
                        placeholder={fileName}
                        value={fileName}
                        bg={inputBg}
                        borderColor={inputBorder}
                        _hover={{ cursor: 'pointer' }}
                        onClick={handleButtonClick}
                    />
                    <ChakraButton
                        onClick={handleButtonClick}
                        colorScheme="teal"
                        variant="solid"
                        size="sm" // Cambiado a 'sm' para que se vea mejor
                        mt={2}
                        w="fit-content"
                    >
                        {currentFile ? 'Cambiar archivo' : 'Seleccionar archivo'}
                    </ChakraButton>
                </Box>
                
                {/* 3. Input de tipo archivo real (Oculto) */}
                <Box 
                    as="input" 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileSelect}
                    position="absolute"
                    opacity="0"
                    width="0.1px"
                    height="0.1px"
                    pointerEvents="none"
                    // Puedes añadir 'accept' para restringir tipos, por ej: accept=".pdf, .docx"
                />

            </ChakraInputGroup>
        </FormControl>
    );
};


// Vista para la Carga de Documentos del Proveedor
export function ProfileCoordinatorReview({ user, mode }: { user: UserData, mode: string }) {
    const cardBg = useColorModeValue("white", "gray.700");
    const textColor = useColorModeValue("gray.600", "gray.400");
    const { isOpen, onOpen, onClose } = useDisclosure(); 

    // --- NUEVOS ESTADOS PARA MANEJAR LOS ARCHIVOS SUBIDOS ---
    const [cartaIntencionFile, setCartaIntencionFile] = useState<File | null>(null);
    const [cartaCompromisoFile, setCartaCompromisoFile] = useState<File | null>(null);

    // Verificación de si al menos un archivo ha sido seleccionado
    const isReadyToSubmit = cartaIntencionFile !== null && cartaCompromisoFile !== null;

    // Usamos los datos del servidor (user.courses) o el mock
    const providerCourses = user.courses || mockCourses;

    // --- MANEJADORES DE CAMBIO DE ARCHIVOS ---
    const handleIntencionChange = (file: File | null) => setCartaIntencionFile(file);
    const handleCompromisoChange = (file: File | null) => setCartaCompromisoFile(file);

    const handleFinalSubmission = () => {
        if (!isReadyToSubmit) {
            alert("Por favor, sube la Carta de Intención y la Carta de Compromiso antes de continuar.");
            return;
        }

        // 🚨 Lógica de subida y asociación aquí (Simulación)
        console.log("Subiendo Carta de Intención:", cartaIntencionFile?.name);
        console.log("Subiendo Carta de Compromiso:", cartaCompromisoFile?.name);
        
        // Aquí se llamaría a la API de subida real.
        alert("Documentos subidos y asociados a los cursos (Simulación)");
        onClose();
        
        // Opcional: Limpiar los estados de archivo después de una subida exitosa
        // setCartaIntencionFile(null);
        // setCartaCompromisoFile(null);
    }

    return (
        <Box p={6} bg={cardBg} shadow="xl" rounded="lg" border="3px" borderColor="teal.500">
            
            <Heading size="xl" mb={4}>Gestión Documental de Proveedor</Heading>
            <Text fontSize="lg" color="teal.500" fontWeight="bold">Modo: Carga y Gestión de Documentos</Text>
            <Divider my={4} />

            {/* SECCIÓN 1: PERFIL VISUAL */}
            <VStack spacing={4} align="center" mb={6}>
                <Avatar size="xl" name={user.name} src={user.avatarUrl} />
                <Heading size="lg">{user.name}</Heading>
                <Box textAlign="center" maxW="md">
                    <Text color={textColor} fontSize="md" fontStyle="italic">Biografía:</Text>
                    <Text fontSize="md">{user.bio}</Text>
                </Box>
            </VStack>
            <Divider my={6} />

            {/* SECCIÓN 2: TABLA DE CURSOS DEL PROVEEDOR */}
            <Heading size="md" mb={3}>Cursos a cargo del Proveedor</Heading>
            <TableContainer mb={6}>
                <Table variant="simple" size="sm">
                    <Thead>
                        <Tr>
                            <Th>ID</Th>
                            <Th>Nombre del Curso</Th>
                            <Th>Estado de Gestión</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {providerCourses.map(course => (
                            <Tr key={course.id}>
                                <Td>{course.id}</Td>
                                <Td>{course.nombre}</Td>
                                <Td>
                                    <Badge colorScheme={course.estado_gestion === 'Aprobado' ? 'green' : course.estado_gestion === 'En Revisión' ? 'orange' : 'red'}>
                                        {course.estado_gestion}
                                    </Badge>
                                </Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
            </TableContainer>
            
            <Divider my={6} />

            <Text mb={6} fontWeight="semibold" textAlign="center" fontSize="lg">
                Estado General de Documentos: 
                <Text as="span" color="orange.500" ml={2} fontWeight="bold">{user.documentStatus}</Text>
            </Text>
            
            {/* SECCIÓN 3: ÁREAS DE SUBIDA DE DOCUMENTOS (CON FILEINPUT) */}
            <VStack spacing={6} align="stretch" mb={6}>
                
                {/* 1. Documento: Carta de Intención (USANDO FileInput) */}
                <FileInput
                    label="1. Carta de Intención (Requerido)"
                    description="Sube el documento PDF o DOCX de tu Carta de Intención formal."
                    isRequired
                    onFileChange={handleIntencionChange}
                    currentFile={cartaIntencionFile}
                />

                {/* 2. Documento: Carta de Compromiso (USANDO FileInput) */}
                <FileInput
                    label="2. Carta de Compromiso (Requerido)"
                    description="Sube el documento PDF o DOCX de tu Carta de Compromiso firmada."
                    isRequired
                    onFileChange={handleCompromisoChange}
                    currentFile={cartaCompromisoFile}
                />

            </VStack>

            <Divider my={6} />

            {/* SECCIÓN 4: ACCIONES GLOBALES (Botón Subir Documentos) */}
            <VStack align="stretch" spacing={2}>
                <Button 
                    colorScheme="teal" 
                    size="lg" 
                    onClick={onOpen} // Abre el modal
                    fontWeight="bold"
                    // Desactivar si no se han subido ambos archivos
                    isDisabled={!isReadyToSubmit} 
                >
                    Subir Documentos y Asociar a Cursos
                </Button>
                {!isReadyToSubmit && (
                    <Text color="red.500" fontSize="sm" textAlign="center">
                        * Debes seleccionar ambos documentos para poder subir.
                    </Text>
                )}
            </VStack>
            
            {/* MODAL DE CONFIRMACIÓN DE CURSOS */}
            <Modal isOpen={isOpen} onClose={onClose} isCentered>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Confirmar Documentación para Cursos</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Text mb={4}>Los documentos seleccionados (**{cartaIntencionFile?.name}** y **{cartaCompromisoFile?.name}**) **cubrirán la gestión** de los siguientes cursos:</Text>
                        <List spacing={2}>
                            {providerCourses.map(course => (
                                <ListItem key={course.id}>
                                    <ListIcon as={CheckCircleIcon} color="green.500" />
                                    {course.nombre}
                                </ListItem>
                            ))}
                        </List>
                        <Text mt={4} fontWeight="bold">¿Deseas proceder con la subida y asociar estos documentos a la lista anterior?</Text>
                    </ModalBody>

                    <ModalFooter>
                        <Button colorScheme='gray' mr={3} onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button 
                            colorScheme='teal' 
                            onClick={handleFinalSubmission} // Llama a la nueva función de envío
                        >
                            Aceptar y Subir Documentos
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
}