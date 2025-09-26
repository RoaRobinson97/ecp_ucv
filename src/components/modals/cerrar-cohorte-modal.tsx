// app/components/cerrar-cohorte-modal
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

    const handleModalSubmit = async () => {
        setIsLoading(true);
        try {
            // Lógica para subir archivos (simulada)
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Lógica para cerrar la cohorte y redirigir
            setCohortOpen(false); // Cambia el estado global a 'false'
            onClose(); // Cierra el modal
            
            toast({
              title: "Cohorte Cerrada.",
              description: "La cohorte ha sido cerrada con éxito.",
              status: "success",
              duration: 3000,
              isClosable: true,
            });
            
            router.push(`/`); // Redirige a la página principal
        } catch (error) {
            toast({
                title: "Error al cerrar cohorte.",
                description: "Hubo un problema al subir los archivos. Inténtalo de nuevo.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Cerrar Cohorte y Subir Archivos</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack spacing={4}>
                        <Text>
                            Por favor, sube los tres archivos requeridos para finalizar el curso.
                        </Text>
                        <FormControl>
                            <FormLabel>Archivo de Notas Finales</FormLabel>
                            <Input type="file" p={1} />
                        </FormControl>
                        <FormControl>
                            <FormLabel>Reporte de Participación</FormLabel>
                            <Input type="file" p={1} />
                        </FormControl>
                        <FormControl>
                            <FormLabel>Certificaciones de Título</FormLabel>
                            <Input type="file" p={1} />
                        </FormControl>
                    </VStack>
                </ModalBody>

                <ModalFooter>
                    <Button colorScheme="red" variant="ghost" mr={3} onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button 
                        colorScheme="teal" 
                        onClick={handleModalSubmit}
                        isLoading={isLoading}
                        loadingText="Subiendo..."
                    >
                        Subir y Cerrar Cohorte
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}