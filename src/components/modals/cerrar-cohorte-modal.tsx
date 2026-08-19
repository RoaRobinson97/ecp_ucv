"use client";

import React, { useState } from 'react';
import {
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
    Button, VStack, FormControl, FormLabel, Input, Text, useToast, Textarea
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { courseService } from '@/servicios/cursos-service';
import { useAuth } from '@/app/context/auth-context';

interface CloseCohortModalProps {
    isOpen: boolean;
    onClose: () => void;
    courseId: string;
    courseTitle: string;
    cohortName: string;
}

export default function CloseCohortModal({ isOpen, onClose, courseId, courseTitle, cohortName }: CloseCohortModalProps) {
    const toast = useToast();
    const router = useRouter();
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [observaciones, setObservaciones] = useState('');

    // --- Archivos (Requeridos) ---
    const [listadoFile, setListadoFile] = useState<File | null>(null);
    const [encuestaFile, setEncuestaFile] = useState<File | null>(null);
    const [pagoFile, setPagoFile] = useState<File | null>(null);

    const isReadyToSubmit = listadoFile && encuestaFile && pagoFile;

    const handleModalSubmit = async () => {
        if (!isReadyToSubmit) {
            toast({
                title: "Archivos faltantes",
                description: "Debes subir los tres archivos requeridos.",
                status: "warning",
                duration: 4000,
                isClosable: true,
            });
            return;
        }

        setIsLoading(true);
        try {
            const formData = new FormData();
            const userId = String(user?.id || (user as any)?.sub || (user as any)?.userID || '');
            
            // Metadatos
            formData.append('userId', userId);
            formData.append('titulo_curso', courseTitle);
            formData.append('nombre_cohorte', cohortName);
            formData.append('observaciones', observaciones);
            
            // Archivos
            formData.append('archivo_participantes', listadoFile);
            formData.append('archivo_vouchers', pagoFile);
            formData.append('archivo_encuesta', encuestaFile);

            // LLAMADA REAL AL BACKEND
            await courseService.requestCohortClosure(courseId, formData);
            
            toast({
                title: "Solicitud Enviada.",
                description: "La solicitud está bajo revisión del Coordinador.",
                status: "success",
                duration: 5000,
                isClosable: true,
            });
            
            onClose(); 
            window.location.reload(); 
        } catch (error: any) {
            toast({
                title: "Error al enviar la solicitud.",
                description: error.message || "Hubo un problema al procesar el cierre.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setListadoFile(null); setEncuestaFile(null); setPagoFile(null); setObservaciones('');
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} size="xl">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Solicitar Cierre: {cohortName}</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack spacing={4} align="stretch">
                        <Text fontSize="sm" color="gray.600" mb={2}>
                            Sube los respaldos académicos y administrativos para auditar el cierre del curso.
                        </Text>
                        
                        <FormControl isRequired>
                            <FormLabel fontSize="sm">1. Listado de Estudiantes (con notas)</FormLabel>
                            <Input type="file" p={1} onChange={(e) => setListadoFile(e.target.files?.[0] || null)} accept=".pdf,.doc,.docx,.xls,.xlsx,.csv" />
                        </FormControl>
                        
                        <FormControl isRequired>
                            <FormLabel fontSize="sm">2. Encuesta de Satisfacción (Resultados)</FormLabel>
                            <Input type="file" p={1} onChange={(e) => setEncuestaFile(e.target.files?.[0] || null)} accept=".pdf,.doc,.docx,.xls,.xlsx,.csv" />
                        </FormControl>
                        
                        <FormControl isRequired>
                            <FormLabel fontSize="sm">3. Comprobante de Pago Administrativo</FormLabel>
                            <Input type="file" p={1} onChange={(e) => setPagoFile(e.target.files?.[0] || null)} accept=".pdf,.zip,.jpg,.png" />
                        </FormControl>

                        <FormControl>
                            <FormLabel fontSize="sm">Observaciones (Opcional)</FormLabel>
                            <Textarea value={observaciones} onChange={e => setObservaciones(e.target.value)} placeholder="¿Alguna novedad sobre la cohorte?" />
                        </FormControl>
                    </VStack>
                </ModalBody>

                <ModalFooter>
                    <Button colorScheme="red" variant="ghost" mr={3} onClick={handleClose} isDisabled={isLoading}>
                        Cancelar
                    </Button>
                    <Button colorScheme="teal" onClick={handleModalSubmit} isLoading={isLoading} loadingText="Enviando..." isDisabled={!isReadyToSubmit}>
                        Solicitar Cierre
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}