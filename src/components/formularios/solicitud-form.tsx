"use client";

import React, { useState, useCallback } from 'react';
import {
  Box, Button, FormControl, FormLabel, Input, Textarea, VStack,
  Heading, Text, useToast, RadioGroup, Radio, HStack, FormHelperText,
  Divider, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody,
  ModalFooter, Slider, SliderTrack, SliderFilledTrack, SliderThumb,
  Avatar, Icon, useDisclosure
} from "@chakra-ui/react";
// Librería para recortar imágenes
import Cropper from 'react-easy-crop';
import { useAuth } from "@/app/context/auth-context";
import { useRouter } from "next/navigation";
import { FaCamera } from 'react-icons/fa';

import { solicitudesService } from '@/servicios/solicitudes-service';

// --- UTILIDAD PARA RECORTAR LA IMAGEN (Canvas) ---
const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.src = url;
  });

async function getCroppedImg(imageSrc: string, pixelCrop: any) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) return null;

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise<Blob>((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
    }, 'image/jpeg', 0.95);
  });
}
// --- FIN UTILIDAD ---

const FileUploadControl = ({ id, label, accept, onChange, file }: { 
  id: string, 
  label: string, 
  accept?: string,
  onChange: (file: File | null) => void,
  file: File | null 
}) => (
  <FormControl id={id}>
    <FormLabel fontSize="sm" fontWeight="medium">
      {label} {file && <Text as="span" color="green.500" ml={2}>(✓ Cargado)</Text>}
    </FormLabel>
    <Input 
      type="file" 
      p={1} 
      accept={accept} 
      onChange={(e) => onChange(e.target.files ? e.target.files[0] : null)}
      sx={{
        '::file-selector-button': {
          height: 8,
          padding: 0,
          mr: 4,
          background: 'none',
          border: 'none',
          fontWeight: 'bold',
        },
      }}
    />
  </FormControl>
);

export const SolicitudForm = () => {

  const { user } = useAuth();
  const router = useRouter();
  const toast = useToast();

  const [personType, setPersonType] = useState<"natural" | "juridica" | "">("natural");
  const [providerName, setProviderName] = useState("");
  const [bio, setBio] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [legalDocs, setLegalDocs] = useState<{ [key: string]: File | null }>({
    cedula: null,
    rif: null,
    islr: null,
    cv: null,
    titulo: null,
    regMercantil: null
  });

  const handleDocChange = (key: string, file: File | null) => {
    setLegalDocs(prev => ({ ...prev, [key]: file }));
  };

  // --- ESTADOS PARA EL EDITOR DE IMAGEN ---
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  
  const [finalProfileImage, setFinalProfileImage] = useState<string | null>(null); 
  const [finalImageFile, setFinalImageFile] = useState<Blob | null>(null);

  // 1. Seleccionar archivo
  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImageSrc(reader.result as string);
        onOpen();
      });
      reader.readAsDataURL(file);
    }
  };

  // 2. Guardar coordenadas
  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  // 3. Procesar recorte
  const showCroppedImage = useCallback(async () => {
    try {
      if (imageSrc && croppedAreaPixels) {
        const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
        if (croppedImageBlob) {
          const previewUrl = URL.createObjectURL(croppedImageBlob);
          setFinalProfileImage(previewUrl);
          setFinalImageFile(croppedImageBlob); 
          onClose();
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, [imageSrc, croppedAreaPixels, onClose]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!user) {
        toast({ title: "Error", description: "Debes iniciar sesión.", status: "error" });
        return;
    }

    if (!legalDocs.cedula || !legalDocs.rif) {
        toast({ title: "Faltan documentos", description: "Cédula y RIF son obligatorios.", status: "warning" });
        return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      
      formData.append('userId', user.id);
      formData.append('tipo', 'codigo-proveedor');
      formData.append('estado', 'pendiente');
      formData.append('tipoPersona', personType);
      formData.append('nombreProveedor', providerName);
      formData.append('biografia', bio);

      if (finalImageFile) {
          formData.append('avatar', finalImageFile, 'avatar.jpg');
      }

      if (legalDocs.cedula) formData.append('cedula', legalDocs.cedula);
      if (legalDocs.rif) formData.append('rif', legalDocs.rif);
      if (legalDocs.islr) formData.append('islr', legalDocs.islr);
      if (legalDocs.titulo) formData.append('titulo', legalDocs.titulo);
      
      if (personType === 'natural' && legalDocs.cv) {
          formData.append('curriculum', legalDocs.cv);
      }
      if (personType === 'juridica' && legalDocs.regMercantil) {
          formData.append('registroMercantil', legalDocs.regMercantil);
      }

      await solicitudesService.createSolicitud(formData); 

      toast({
        title: "Solicitud enviada exitosamente.",
        description: "Tus documentos han sido subidos para revisión.",
        status: "success",
        duration: 6000,
        isClosable: true,
      });

      router.push(`/profile/${user.id}`); 
      
    } catch (error: any) {
      console.error(error);
      toast({ 
        title: "Error al subir los documentos", 
        description: error.message || "Fallo en el servidor.",
        status: "error" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box maxW="xl" mx="auto" p={8} bg="white" rounded="xl" shadow="lg">
      <VStack spacing={6} align="stretch">
        <Box textAlign="center">
          <Heading as="h1" size="lg" mb={2} color="teal.600">Únete como Proveedor</Heading>
          <Text fontSize="md" color="gray.600">Completa tu perfil público y entrega la documentación.</Text>
        </Box>

        <form onSubmit={handleSubmit}>
          <VStack spacing={6}>
            
            {/* TIPO DE PERSONA */}
            <FormControl id="person-type" as="fieldset" isRequired>
              <FormLabel as="legend" fontWeight="bold">Tipo de Persona</FormLabel>
              <RadioGroup onChange={(value: any) => setPersonType(value)} value={personType}>
                <HStack spacing="24px">
                  <Radio value="natural" colorScheme="teal">Persona Natural</Radio>
                  <Radio value="juridica" colorScheme="teal">Persona Jurídica</Radio>
                </HStack>
              </RadioGroup>
            </FormControl>

            <Divider />

            {/* PERFIL PÚBLICO */}
            <VStack spacing={4} align="stretch" w="full">
              <Heading size="md" color="gray.700">Perfil Público</Heading>
              
              <FormControl id="providerName" isRequired>
                <FormLabel>Nombre del Proveedor / Organización</FormLabel>
                <Input 
                  placeholder="Ej: Academia de Artes Visuales" 
                  value={providerName} 
                  onChange={(e) => setProviderName(e.target.value)} 
                />
                <FormHelperText>Visible para estudiantes.</FormHelperText>
              </FormControl>

              <FormControl id="bio" isRequired>
                <FormLabel>Biografía</FormLabel>
                <Textarea 
                  placeholder="Describe tu experiencia..." 
                  rows={4} 
                  value={bio} 
                  onChange={(e) => setBio(e.target.value)} 
                />
              </FormControl>

              <FormControl>
                <FormLabel>Imagen de Perfil (Cuadrada)</FormLabel>
                <HStack spacing={4} align="center">
                  <Avatar 
                    size="xl" 
                    src={finalProfileImage || undefined} 
                    icon={<Icon as={FaCamera} fontSize="1.5rem" />} 
                    bg="gray.200" 
                  />
                  <Box>
                    <Input 
                      type="file" 
                      accept="image/png, image/jpeg, image/jpg" 
                      onChange={onFileChange} 
                      display="none" 
                      id="file-upload" 
                    />
                    <label htmlFor="file-upload">
                      <Button as="span" size="sm" colorScheme="teal" variant="outline" cursor="pointer">
                        {finalProfileImage ? "Cambiar Imagen" : "Subir Imagen"}
                      </Button>
                    </label>
                    <FormHelperText>JPG o PNG.</FormHelperText>
                  </Box>
                </HStack>
              </FormControl>
            </VStack>

            <Divider />

            {/* DOCUMENTACIÓN LEGAL */}
            {personType === "natural" && (
              <VStack spacing={4} align="stretch" w="full">
                <Heading size="md" color="gray.700">Documentación (Persona Natural)</Heading>
                <FileUploadControl id="cedula" label="Cédula de Identidad" accept=".pdf" onChange={(f) => handleDocChange('cedula', f)} file={legalDocs.cedula} />
                <FileUploadControl id="rif-natural" label="Registro de Información Fiscal (RIF)" accept=".pdf" onChange={(f) => handleDocChange('rif', f)} file={legalDocs.rif} />
                <FileUploadControl id="islr-natural" label="Certificados de Declaración ISLR" accept=".pdf" onChange={(f) => handleDocChange('islr', f)} file={legalDocs.islr} />
                <FileUploadControl id="cv-natural" label="Resumen curricular del facilitador(es)" accept=".pdf" onChange={(f) => handleDocChange('cv', f)} file={legalDocs.cv} />
                <FileUploadControl id="titulo-natural" label="Copia del título" accept=".pdf" onChange={(f) => handleDocChange('titulo', f)} file={legalDocs.titulo} />
              </VStack>
            )}

            {personType === "juridica" && (
              <VStack spacing={4} align="stretch" w="full">
                <Heading size="md" color="gray.700">Documentación (Persona Jurídica)</Heading>
                <FileUploadControl id="reg-mercantil" label="Registro Mercantil" accept=".pdf" onChange={(f) => handleDocChange('regMercantil', f)} file={legalDocs.regMercantil} />
                <FileUploadControl id="cedula-legal" label="Cédula de Identidad del representante legal" accept=".pdf" onChange={(f) => handleDocChange('cedula', f)} file={legalDocs.cedula} />
                <FileUploadControl id="rif-juridico" label="Registro de Información Fiscal (RIF)" accept=".pdf" onChange={(f) => handleDocChange('rif', f)} file={legalDocs.rif} />
                <FileUploadControl id="islr-juridico" label="Certificado de Declaración ISLR" accept=".pdf" onChange={(f) => handleDocChange('islr', f)} file={legalDocs.islr} />
                <FileUploadControl id="cv-juridico" label="Resumen curricular del facilitador(es)" accept=".pdf" onChange={(f) => handleDocChange('cv', f)} file={legalDocs.cv} />
                <FileUploadControl id="titulo-juridico" label="Copia del título" accept=".pdf" onChange={(f) => handleDocChange('titulo', f)} file={legalDocs.titulo} />
              </VStack>
            )}
            
            <Button 
              type="submit" 
              colorScheme="teal" 
              size="lg" 
              width="full" 
              mt={4} 
              isLoading={isLoading} 
              isDisabled={!personType || !providerName.trim() || !bio.trim() || !legalDocs.cedula || !legalDocs.rif}
            >
              Enviar Solicitud
            </Button>
          </VStack>
        </form>
      </VStack>

      {/* MODAL DE RECORTE */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl" closeOnOverlayClick={false} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Editar Imagen de Perfil</ModalHeader>
          <ModalBody>
            <Box position="relative" height="400px" width="100%" bg="black">
              <Cropper
                image={imageSrc || undefined}
                crop={crop}
                zoom={zoom}
                aspect={1 / 1}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </Box>
            <Box mt={4}>
              <Text mb={2} fontSize="sm">Zoom</Text>
              <Slider value={zoom} min={1} max={3} step={0.1} aria-label="zoom" onChange={(val) => setZoom(val)}>
                <SliderTrack>
                  <SliderFilledTrack bg="teal.500" />
                </SliderTrack>
                <SliderThumb />
              </Slider>
            </Box>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>Cancelar</Button>
            <Button colorScheme="teal" onClick={showCroppedImage}>Guardar Recorte</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

    </Box>
  );
};