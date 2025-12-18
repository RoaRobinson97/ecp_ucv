// components/ui/profile-coordinator-review.tsx (COMPLETO)
"use client";

import { 
    Box, Heading, Text, Divider, useColorModeValue, Button, VStack, Avatar,
    useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
    Table, Thead, Tbody, Tr, Th, Td, TableContainer, List, ListItem, ListIcon, Badge, 
    FormControl as ChakraFormControl, FormLabel as ChakraFormLabel, FormErrorMessage as ChakraFormErrorMessage, 
    Input as ChakraInput, Textarea as ChakraTextarea, FormControlProps, FormLabelProps, 
    InputProps, TextareaProps,  Button as ChakraButton, InputGroup as ChakraInputGroup, Flex,
    HStack, // ✨ Añadido
    Icon    // ✨ Añadido
} from '@chakra-ui/react';
import React, { useState, useRef } from 'react';
import { CheckCircleIcon } from '@chakra-ui/icons';

// ✨ ADICIÓN: Importamos los tipos globales
import { User, Course } from "@/data/types"; 
import { MdEmail, MdPhone } from 'react-icons/md'; // ✨ Añadido para iconos


// === 🛠️ Componentes Base Reutilizados para FileInput ===
// (Necesarios para que FileInput funcione)

export const FormControl: React.FC<FormControlProps> = (props) => <ChakraFormControl {...props} />;
export const FormLabel: React.FC<FormLabelProps> = (props) => <ChakraFormLabel {...props} />;
export const Input: React.FC<InputProps> = (props) => <ChakraInput {...props} />;
export const Textarea: React.FC<TextareaProps> = (props) => <ChakraTextarea {...props} />;


// === 🚀 COMPONENTE CUSTOMIZADO: FileInput (Código Completo) ===

interface FileInputProps extends InputProps {
    label: string;
    description: string;
    isRequired?: boolean;
    onFileChange: (file: File | null) => void;
    currentFile: File | null; 
}

/**
 * Control de formulario reutilizable diseñado para la subida de archivos.
 */
export const FileInput: React.FC<FileInputProps> = ({
    label,
    description,
    isRequired = false,
    onFileChange,
    currentFile, 
    ...rest
}) => {
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const fileName = currentFile ? currentFile.name : "Ningún archivo seleccionado";
    const fileDescriptionColor = useColorModeValue("gray.500", "gray.400");
    const inputBg = useColorModeValue('white', 'gray.700');
    const inputBorder = useColorModeValue('gray.300', 'gray.600');

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] || null;
        onFileChange(file); 
    };

    const handleButtonClick = () => {
        fileInputRef.current?.click(); 
    };

    return (
        <FormControl isRequired={isRequired} {...rest}>
            <FormLabel fontWeight="bold" fontSize="md">{label}</FormLabel>
            <Text fontSize="sm" color={fileDescriptionColor} mb={1}>
                {description}
            </Text>
            <ChakraInputGroup size="lg" w="full">
                <Box w="full">
                    {/* Input Falso (visible) */}
                    <Input
                        isReadOnly
                        placeholder={fileName}
                        value={fileName}
                        bg={inputBg}
                        borderColor={inputBorder}
                        _hover={{ cursor: 'pointer' }}
                        onClick={handleButtonClick}
                    />
                    {/* Botón de selección */}
                    <ChakraButton
                        onClick={handleButtonClick}
                        colorScheme="teal"
                        variant="solid"
                        size="sm"
                        mt={2}
                        w="fit-content"
                    >
                        {currentFile ? 'Cambiar archivo' : 'Seleccionar archivo'}
                    </ChakraButton>
                </Box>
                {/* Input Real (oculto) */}
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
                />
            </ChakraInputGroup>
        </FormControl>
    );
};


// === Componente Principal: ProfileCoordinatorReview ===

export function ProfileCoordinatorReview({ user, mode }: { user: User, mode: string }) {
    const cardBg = useColorModeValue("white", "gray.700");
    const textColor = useColorModeValue("gray.600", "gray.400");
    const mutedTextColor = useColorModeValue("gray.500", "gray.400"); // Color para el contacto
    const { isOpen, onOpen, onClose } = useDisclosure(); 

    const [cartaIntencionFile, setCartaIntencionFile] = useState<File | null>(null);
    const [cartaCompromisoFile, setCartaCompromisoFile] = useState<File | null>(null);

    const isReadyToSubmit = cartaIntencionFile !== null && cartaCompromisoFile !== null;
    const providerCourses = user.courses ?? [];

    const handleIntencionChange = (file: File | null) => setCartaIntencionFile(file);
    const handleCompromisoChange = (file: File | null) => setCartaCompromisoFile(file);

    const handleFinalSubmission = () => {
        if (!isReadyToSubmit) {
            console.error("Faltan documentos requeridos.");
            return;
        }

        console.log("Subiendo Carta de Intención:", cartaIntencionFile?.name);
        console.log("Subiendo Carta de Compromiso:", cartaCompromisoFile?.name);
        alert("Documentos subidos y asociados a los cursos (Simulación)");
        onClose();
    }

    const getStatusColor = (status: string | undefined) => {
        switch (status) {
            case 'aprobado': return 'green';
            case 'pendiente': return 'orange';
            case 'rechazado': return 'red';
            default: return 'gray';
        }
    };

    return (
        <Box p={6} bg={cardBg} shadow="xl" rounded="lg" border="3px" borderColor="teal.500">
            
            <Heading size="xl" mb={4}>Gestión Documental de Proveedor</Heading>
            <Text fontSize="lg" color="teal.500" fontWeight="bold">Modo: {mode}</Text>
            <Divider my={4} />

            {/* SECCIÓN 1: PERFIL VISUAL (Actualizado) */}
            <VStack spacing={4} align="center" mb={6}>
                <Avatar size="xl" name={user.name} src={user.avatarUrl} />
                <Heading size="lg">{user.name}</Heading>
                <Box textAlign="center" maxW="md">
                    <Text color={textColor} fontSize="md" fontStyle="italic">Biografía:</Text>
                    <Text fontSize="md">{user.bio ?? "Biografía no definida."}</Text>
                </Box>

                {/* ✨ ADICIÓN: Información de Contacto Pública */}
                <VStack align="stretch" spacing={1} pt={4}>
                    {(user.contactEmails && user.contactEmails.length > 0) && (
                        <HStack spacing={2} fontSize="sm" color={mutedTextColor} justify="center">
                            <Icon as={MdEmail} color="teal.500" boxSize={5} />
                            <Text>{user.contactEmails.join(', ')}</Text>
                        </HStack>
                    )}
                    {(user.contactPhones && user.contactPhones.length > 0) && (
                        <HStack spacing={2} fontSize="sm" color={mutedTextColor} justify="center">
                            <Icon as={MdPhone} color="teal.500" boxSize={5} />
                            <Text>{user.contactPhones.join(', ')}</Text>
                        </HStack>
                    )}
                </VStack>
                {/* --- FIN DE LA ADICIÓN --- */}
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
                                <Td>{course.titulo}</Td> 
                                <Td>
                                    <Badge colorScheme={getStatusColor(course.estado_gestion)}>
                                        {course.estado_gestion ?? 'N/A'}
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
                <Text as="span" color="orange.500" ml={2} fontWeight="bold">{user.documentStatus ?? "N/A"}</Text>
            </Text>
            
            {/* SECCIÓN 3: ÁREAS DE SUBIDA DE DOCUMENTOS */}
            <VStack spacing={6} align="stretch" mb={6}>
                <FileInput
                    label="1. Carta de Intención (Requerido)"
                    description="Sube el documento PDF o DOCX de tu Carta de Intención formal."
                    isRequired
                    onFileChange={handleIntencionChange}
                    currentFile={cartaIntencionFile}
                />
                <FileInput
                    label="2. Carta de Compromiso (Requerido)"
                    description="Sube el documento PDF o DOCX de tu Carta de Compromiso firmada."
                    isRequired
                    onFileChange={handleCompromisoChange}
                    currentFile={cartaCompromisoFile}
                />
            </VStack>

            <Divider my={6} />

            {/* SECCIÓN 4: ACCIONES GLOBALES */}
            <VStack align="stretch" spacing={2}>
                <Button 
                    colorScheme="teal" 
                    size="lg" 
                    onClick={onOpen}
                    fontWeight="bold"
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
                                    {course.titulo} 
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
                            onClick={handleFinalSubmission}
                        >
                            Aceptar y Subir Documentos
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
}