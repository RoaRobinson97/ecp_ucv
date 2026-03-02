"use client";

import React, { useState, useCallback } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
  Heading,
  Text,
  useToast,
  RadioGroup,
  Radio,
  HStack,
  FormHelperText,
  Divider,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Avatar,
  Icon,
  useDisclosure
} from "@chakra-ui/react";
// Librería para recortar imágenes
import Cropper from 'react-easy-crop';
import { useAuth } from "@/app/context/auth-context";
import { useGlobalData } from "@/app/context/global-data-context";
import { useRouter } from "next/navigation";
import { FaCamera } from 'react-icons/fa';

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

const FileUploadControl = ({ id, label, accept }: { id: string, label: string, accept?: string }) => (
  <FormControl id={id}>
    <FormLabel fontSize="sm" fontWeight="medium">{label}</FormLabel>
    <Input type="file" p={1} accept={accept} />
  </FormControl>
);

export const SolicitudForm = () => {
  const { setcodigo_proveedor } = useGlobalData();
  const router = useRouter();
  const toast = useToast();

  // Estados del formulario
  const [personType, setPersonType] = useState<"natural" | "juridica" | "">("natural");
  const [providerName, setProviderName] = useState("");
  const [bio, setBio] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
      const imageDataUrl = await readFile(file);
      setImageSrc(imageDataUrl as string);
      onOpen();
    }
  };

  const readFile = (file: File) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.addEventListener('load', () => resolve(reader.result), false);
      reader.readAsDataURL(file);
    });
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
    setIsLoading(true);

    try {
      console.log("Enviando datos:", { providerName, bio, personType, finalImageFile });
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      const newcodigo_proveedor = "ORG123";
      setcodigo_proveedor(newcodigo_proveedor);

      toast({
        title: "Solicitud enviada.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      router.push(`/`);
    } catch (error) {
      toast({ title: "Error", status: "error" });
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

            {/* DOCUMENTACIÓN LEGAL (COMPLETA) */}
            {personType === "natural" && (
              <VStack spacing={4} align="stretch" w="full">
                <Heading size="md" color="gray.700">Documentación (Persona Natural)</Heading>
                <FileUploadControl id="cedula" label="Cédula de Identidad" />
                <FileUploadControl id="rif-natural" label="Registro de Información Fiscal (RIF)" />
                <FileUploadControl id="islr-natural" label="Certificados de Declaración ISLR" />
                <FileUploadControl id="cv-natural" label="Resumen curricular del facilitador(es)" />
                <FileUploadControl id="titulo-natural" label="Copia del título" />
              </VStack>
            )}

            {personType === "juridica" && (
              <VStack spacing={4} align="stretch" w="full">
                <Heading size="md" color="gray.700">Documentación (Persona Jurídica)</Heading>
                <FileUploadControl id="reg-mercantil" label="Registro Mercantil" />
                <FileUploadControl id="cedula-legal" label="Cédula de Identidad del representante legal" />
                <FileUploadControl id="rif-juridico" label="Registro de Información Fiscal (RIF)" />
                <FileUploadControl id="islr-juridico" label="Certificado de Declaración ISLR" />
                <FileUploadControl id="cv-juridico" label="Resumen curricular del facilitador(es)" />
                <FileUploadControl id="titulo-juridico" label="Copia del título" />
              </VStack>
            )}
            
            <Button type="submit" colorScheme="teal" size="lg" width="full" mt={4} isLoading={isLoading} isDisabled={!personType || !providerName || !bio || !finalImageFile}>
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