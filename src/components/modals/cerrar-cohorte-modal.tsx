"use client";

import React, { useState } from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button,
    VStack,
    FormControl,
    FormLabel,
    Input,
    Text,
    useToast,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useGlobalData } from "@/app/context/global-data-context";

interface CloseCohortModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CloseCohortModal({ isOpen, onClose }: CloseCohortModalProps) {
    const toast = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const { setCohortOpen } = useGlobalData();
    const router = useRouter();

    // --- Estados para los 3 archivos requeridos ---
    const [listadoFile, setListadoFile] = useState<File | null>(null);
    const [encuestaFile, setEncuestaFile] = useState<File | null>(null);
    const [pagoFile, setPagoFile] = useState<File | null>(null);

    // El botón se activa solo si los 3 archivos están seleccionados
    const isReadyToSubmit = listadoFile && encuestaFile && pagoFile;

    const handleModalSubmit = async () => {
        // Verificación de que los archivos estén cargados
        if (!isReadyToSubmit) {
            toast({
                title: "Faltan archivos",
                description: "Debes subir los tres archivos requeridos para solicitar el cierre.",
                status: "warning",
                duration: 4000,
                isClosable: true,
            });
            return;
        }

        setIsLoading(true);
        try {
            // Lógica para subir archivos (simulada)
            console.log("Subiendo Listado:", listadoFile.name);
            console.log("Subiendo Encuesta:", encuestaFile.name);
            console.log("Subiendo Comprobante:", pagoFile.name);
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Lógica para "solicitar" el cierre
            // En un futuro, esto podría cambiar el estado del curso a 'pendiente-cierre'
            setCohortOpen(false); // Por ahora, simula el cierre inmediato
            onClose(); 
            
            toast({
                title: "Solicitud Enviada.",
                description: "La solicitud para cerrar la cohorte ha sido enviada con éxito.",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            
            router.push(`/`); 
        } catch (error) {
            toast({
                title: "Error al enviar la solicitud.",
                description: "Hubo un problema al subir los archivos. Inténtalo de nuevo.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Resetea los archivos al cerrar el modal
    const handleClose = () => {
        setListadoFile(null);
        setEncuestaFile(null);
        setPagoFile(null);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Solicitar Cierre de Cohorte</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack spacing={4}>
                        <Text>
                            Por favor, sube los tres archivos requeridos para finalizar el curso y solicitar su cierre.
                        </Text>
                        
                        {/* CAMBIO 1: Listado de Estudiantes */}
                        <FormControl isRequired>
                            <FormLabel>Listado de Estudiantes (con notas)</FormLabel>
                            <Input 
                                type="file" 
                                p={1} 
                                onChange={(e) => setListadoFile(e.target.files?.[0] || null)}
                                // Acepta formatos comunes de documentos/hojas de cálculo
                                accept=".pdf,.doc,.docx,.xls,.xlsx,.csv"
                            />
                        </FormControl>
                        
                        {/* CAMBIO 2: Encuesta de Satisfacción */}
                        <FormControl isRequired>
                            <FormLabel>Encuesta de Satisfacción (Resultados)</FormLabel>
                            <Input 
                                type="file" 
                                p={1} 
                                onChange={(e) => setEncuestaFile(e.target.files?.[0] || null)}
                                accept=".pdf,.doc,.docx,.xls,.xlsx,.csv"
                            />
                        </FormControl>
                        
                        {/* CAMBIO 3: Comprobante de Pago */}
                        <FormControl isRequired>
                            <FormLabel>Comprobante de Pago (Administrativo)</FormLabel>
                            <Input 
                                type="file" 
                                p={1} 
                                onChange={(e) => setPagoFile(e.target.files?.[0] || null)}
                                accept=".pdf,.jpg,.jpeg,.png"
                            />
                        </FormControl>
                    </VStack>
                </ModalBody>

                <ModalFooter>
                    <Button colorScheme="red" variant="ghost" mr={3} onClick={handleClose}>
                        Cancelar
                    </Button>
                    <Button 
                        colorScheme="teal" 
                        onClick={handleModalSubmit}
                        isLoading={isLoading}
                        loadingText="Solicitando..."
                        // Se deshabilita si faltan archivos
                        isDisabled={!isReadyToSubmit} 
                    >
                        {/* CAMBIO 4: Texto del Botón */}
                        Solicitar Cierre de Cohorte
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}