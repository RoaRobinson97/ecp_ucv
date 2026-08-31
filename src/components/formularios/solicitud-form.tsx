"use client";

import React, { useState, useCallback, useEffect } from 'react';
import {
  Box, Button, FormControl, FormLabel, Input, Textarea, VStack,
  Heading, Text, useToast, RadioGroup, Radio, HStack, FormHelperText,
  Divider, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody,
  ModalFooter, Slider, SliderTrack, SliderFilledTrack, SliderThumb,
  Avatar, Icon, useDisclosure, Select
} from "@chakra-ui/react";
import Cropper from 'react-easy-crop';
import { useAuth } from "@/app/context/auth-context";
import { useRouter } from "next/navigation";
import { FaCamera } from 'react-icons/fa';
import { solicitudesService } from '@/servicios/solicitudes-service';
import { userService } from '@/servicios/users-service';

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
  ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, pixelCrop.width, pixelCrop.height);
  return new Promise<Blob>((resolve) => {
    canvas.toBlob((blob) => { if (blob) resolve(blob); }, 'image/jpeg', 0.95);
  });
}

const FileUploadControl = ({ id, label, accept, onChange, file }: { 
  id: string, label: string, accept?: string, onChange: (file: File | null) => void, file: File | null 
}) => (
  <FormControl id={id}>
    <FormLabel fontSize="sm" fontWeight="medium" color="text.primary">
      {label} {file && <Text as="span" color="success" ml={2}>(✓ Cargado)</Text>}
    </FormLabel>
    <Input 
      type="file" p={1} accept={accept} 
      onChange={(e) => onChange(e.target.files ? e.target.files[0] : null)}
      bg="background" borderColor="border" focusBorderColor="primary" color="text.primary"
      sx={{ '::file-selector-button': { height: 8, padding: 0, mr: 4, background: 'none', border: 'none', fontWeight: 'bold', color: 'text.primary' } }}
    />
  </FormControl>
);

export const SolicitudForm = () => {
  const { user } = useAuth();
  const router = useRouter();
  const toast = useToast();

  const [personType, setPersonType] = useState<"natural" | "juridica">("natural");
  const [isInternal, setIsInternal] = useState<"true" | "false">("false"); 
  const [tipoLucro, setTipoLucro] = useState<"lucrativo" | "no_lucrativo">("no_lucrativo");
  const [providerName, setProviderName] = useState("");
  const [bio, setBio] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const [facultadId, setFacultadId] = useState("");
  const [facultadesList, setFacultadesList] = useState<any[]>([]);
  const [isLoadingFacultades, setIsLoadingFacultades] = useState(false);

  const [legalDocs, setLegalDocs] = useState<{ [key: string]: File | null }>({
    cedula: null, rif: null, islr: null, cv: null, titulo: null, regMercantil: null
  });

  const handleDocChange = (key: string, file: File | null) => {
    setLegalDocs(prev => ({ ...prev, [key]: file }));
  };

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [finalProfileImage, setFinalProfileImage] = useState<string | null>(null); 
  const [finalImageFile, setFinalImageFile] = useState<Blob | null>(null);

  useEffect(() => {
    async function loadFacultades() {
        setIsLoadingFacultades(true);
        try {
            const coordinadores = await userService.getCoordinadores();
            const facultadesMapeadas = (coordinadores || [])
                .filter((coord: any) => coord && coord.id)
                .map((coord: any) => ({
                    id: coord.id,
                    name: coord.facultad || `${coord.first_name || coord.nombres || ''} ${coord.last_name || coord.apellidos || ''}`.trim()
                }));
            setFacultadesList(facultadesMapeadas);
        } catch (error) {
            console.error("Error al cargar lista de facultades:", error);
        } finally {
            setIsLoadingFacultades(false);
        }
    }
    loadFacultades();
  }, []); 

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => { setImageSrc(reader.result as string); onOpen(); });
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = useCallback((_: any, croppedAreaPixels: any) => { setCroppedAreaPixels(croppedAreaPixels); }, []);

  const showCroppedImage = useCallback(async () => {
    try {
      if (imageSrc && croppedAreaPixels) {
        const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
        if (croppedImageBlob) {
          setFinalProfileImage(URL.createObjectURL(croppedImageBlob));
          setFinalImageFile(croppedImageBlob); 
          onClose();
        }
      }
    } catch (e) { console.error(e); }
  }, [imageSrc, croppedAreaPixels, onClose]);

  const isFormValid = Boolean(
    personType && facultadId !== '' && providerName.trim() !== '' && bio.trim() !== '' && finalImageFile &&
    legalDocs.cedula && legalDocs.rif && legalDocs.islr && legalDocs.cv && legalDocs.titulo &&
    (personType === 'natural' || (personType === 'juridica' && legalDocs.regMercantil))
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const finalUserId = String(user?.id || user?.ID || "");

    if (!user || !finalUserId) {
        toast({ title: "Error", description: "Debes iniciar sesión.", status: "error" });
        return;
    }

    if (!isFormValid) {
        toast({ title: "Documentación incompleta", description: "Asegúrate de subir TODOS los documentos requeridos antes de enviar.", status: "warning" });
        return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('userId', finalUserId);
      formData.append('tipo', 'codigo-proveedor'); 
      formData.append('estado', 'pendiente');
      formData.append('tipo_persona', personType);
      formData.append('es_interno', isInternal); 
      formData.append('tipo_lucro', tipoLucro);
      formData.append('nombre_proveedor', providerName);
      formData.append('biografia', bio);
      formData.append('coordinador_id', facultadId); 

      if (finalImageFile) formData.append('avatar', finalImageFile, 'avatar.jpg');
      if (legalDocs.cedula) formData.append('cedula', legalDocs.cedula);
      if (legalDocs.rif) formData.append('rif', legalDocs.rif);
      if (legalDocs.islr) formData.append('islr', legalDocs.islr);
      if (legalDocs.titulo) formData.append('titulo', legalDocs.titulo);
      if (legalDocs.cv) formData.append('curriculum', legalDocs.cv);
      if (personType === 'juridica' && legalDocs.regMercantil) {
        formData.append('registro_mercantil', legalDocs.regMercantil);
      }

      await solicitudesService.createSolicitud(formData); 

      toast({ title: "Solicitud enviada exitosamente.", description: "Tus documentos han sido subidos para revisión.", status: "success", duration: 6000, isClosable: true });
      router.push('/'); 
    } catch (error: any) {
      console.error(error);
      toast({ title: "Error al subir los documentos", description: error.message || "Fallo en el servidor.", status: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box maxW="xl" mx="auto" p={{ base: 6, md: 8 }} my={{ base: 8, md: 12 }} bg="surface" borderWidth="1px" borderColor="border" rounded="xl" shadow="xl">
      <VStack spacing={6} align="stretch">
        <Box textAlign="center">
          <Heading as="h1" size="lg" mb={2} color="primary" fontWeight="bold">Únete como Proveedor</Heading>
          <Text fontSize="md" color="text.muted">Completa tu perfil público y entrega la documentación.</Text>
        </Box>

        <form onSubmit={handleSubmit}>
          <VStack spacing={6}>
            <FormControl id="facultad" isRequired>
              <FormLabel fontWeight="bold" color="text.primary">¿A qué Facultad diriges tu solicitud?</FormLabel>
              <Select
                placeholder={isLoadingFacultades ? "Cargando facultades..." : "Selecciona una facultad"}
                value={facultadId}
                onChange={(e) => setFacultadId(e.target.value)}
                isDisabled={isLoadingFacultades}
                bg="background" borderColor="border" focusBorderColor="primary" color="text.primary"
              >
                {facultadesList.map((fac) => (
                  <option key={fac.id} value={fac.id}>{fac.name}</option>
                ))}
              </Select>
              <FormHelperText color="text.muted">Tu documentación será evaluada por el coordinador de esta facultad.</FormHelperText>
            </FormControl>

            <Divider borderColor="border" />

            <FormControl id="person-type" as="fieldset" isRequired>
              <FormLabel as="legend" fontWeight="bold" color="text.primary">Tipo de Persona</FormLabel>
              <RadioGroup onChange={(value: any) => setPersonType(value)} value={personType}>
                <HStack spacing="24px">
                  <Radio value="natural" colorScheme="teal">Persona Natural</Radio>
                  <Radio value="juridica" colorScheme="teal">Persona Jurídica</Radio>
                </HStack>
              </RadioGroup>
            </FormControl>

            <Divider borderColor="border" />

            <FormControl id="internal-type" as="fieldset" isRequired>
              <FormLabel as="legend" fontWeight="bold" color="text.primary">¿El proveedor pertenece a la UCV?</FormLabel>
              <RadioGroup onChange={(value: any) => setIsInternal(value)} value={isInternal}>
                <HStack spacing="24px">
                  <Radio value="true" colorScheme="teal">Sí, pertenece (Interno)</Radio>
                  <Radio value="false" colorScheme="teal">No (Externo)</Radio>
                </HStack>
              </RadioGroup>
            </FormControl>

            <Divider borderColor="border" />

            <FormControl id="lucro-type" as="fieldset" isRequired>
              <FormLabel as="legend" fontWeight="bold" color="text.primary">Naturaleza de la Organización</FormLabel>
              <RadioGroup onChange={(value: any) => setTipoLucro(value)} value={tipoLucro}>
                <HStack spacing="24px">
                  <Radio value="lucrativo" colorScheme="teal">Con fines de lucro</Radio>
                  <Radio value="no_lucrativo" colorScheme="teal">Sin fines de lucro</Radio>
                </HStack>
              </RadioGroup>
            </FormControl>

            <Divider borderColor="border" />

            <VStack spacing={4} align="stretch" w="full">
              <Heading size="md" color="primary">Perfil Público</Heading>
              <FormControl id="providerName" isRequired>
                <FormLabel color="text.primary">Nombre del Proveedor / Organización</FormLabel>
                <Input placeholder="Ej: Academia de Artes" value={providerName} onChange={(e) => setProviderName(e.target.value)} bg="background" borderColor="border" focusBorderColor="primary" color="text.primary" />
              </FormControl>

              <FormControl id="bio" isRequired>
                <FormLabel color="text.primary">Biografía</FormLabel>
                <Textarea placeholder="Describe tu experiencia..." rows={4} value={bio} onChange={(e) => setBio(e.target.value)} bg="background" borderColor="border" focusBorderColor="primary" color="text.primary" />
              </FormControl>

              <FormControl>
                <FormLabel color="text.primary">Imagen de Perfil (Cuadrada) <Text as="span" color="danger">*</Text></FormLabel>
                <HStack spacing={4} align="center">
                  <Avatar size="xl" src={finalProfileImage || undefined} icon={<Icon as={FaCamera} fontSize="1.5rem" />} bg="neutral" />
                  <Box>
                    <Input type="file" accept="image/png, image/jpeg, image/jpg" onChange={onFileChange} display="none" id="file-upload" />
                    <label htmlFor="file-upload">
                      <Button as="span" size="sm" colorScheme="teal" variant="outline" cursor="pointer">
                        {finalProfileImage ? "Cambiar Imagen" : "Subir Imagen"}
                      </Button>
                    </label>
                    <FormHelperText color="text.muted">JPG o PNG. Requerido.</FormHelperText>
                  </Box>
                </HStack>
              </FormControl>
            </VStack>

            <Divider borderColor="border" />

            {personType === "natural" && (
              <VStack spacing={4} align="stretch" w="full">
                <Heading size="md" color="primary">Documentación (Persona Natural)</Heading>
                <FileUploadControl id="cedula" label="Cédula de Identidad *" accept=".pdf" onChange={(f) => handleDocChange('cedula', f)} file={legalDocs.cedula} />
                <FileUploadControl id="rif-natural" label="Registro de Información Fiscal (RIF) *" accept=".pdf" onChange={(f) => handleDocChange('rif', f)} file={legalDocs.rif} />
                <FileUploadControl id="islr-natural" label="Certificados de Declaración ISLR *" accept=".pdf" onChange={(f) => handleDocChange('islr', f)} file={legalDocs.islr} />
                <FileUploadControl id="cv-natural" label="Resumen curricular del facilitador *" accept=".pdf" onChange={(f) => handleDocChange('cv', f)} file={legalDocs.cv} />
                <FileUploadControl id="titulo-natural" label="Copia del título *" accept=".pdf" onChange={(f) => handleDocChange('titulo', f)} file={legalDocs.titulo} />
              </VStack>
            )}

            {personType === "juridica" && (
              <VStack spacing={4} align="stretch" w="full">
                <Heading size="md" color="primary">Documentación (Persona Jurídica)</Heading>
                <FileUploadControl id="reg-mercantil" label="Registro Mercantil *" accept=".pdf" onChange={(f) => handleDocChange('regMercantil', f)} file={legalDocs.regMercantil} />
                <FileUploadControl id="cedula-legal" label="Cédula de Identidad del representante legal *" accept=".pdf" onChange={(f) => handleDocChange('cedula', f)} file={legalDocs.cedula} />
                <FileUploadControl id="rif-juridico" label="Registro de Información Fiscal (RIF) *" accept=".pdf" onChange={(f) => handleDocChange('rif', f)} file={legalDocs.rif} />
                <FileUploadControl id="islr-juridico" label="Certificado de Declaración ISLR *" accept=".pdf" onChange={(f) => handleDocChange('islr', f)} file={legalDocs.islr} />
                <FileUploadControl id="cv-juridico" label="Resumen curricular del facilitador(es) *" accept=".pdf" onChange={(f) => handleDocChange('cv', f)} file={legalDocs.cv} />
                <FileUploadControl id="titulo-juridico" label="Copia del título *" accept=".pdf" onChange={(f) => handleDocChange('titulo', f)} file={legalDocs.titulo} />
              </VStack>
            )}
            
            <Button type="submit" colorScheme="teal" size="lg" width="full" mt={4} isLoading={isLoading} isDisabled={!isFormValid}>
              Enviar Solicitud
            </Button>
          </VStack>
        </form>
      </VStack>
      
      <Modal isOpen={isOpen} onClose={onClose} size="xl" closeOnOverlayClick={false} isCentered>
        <ModalOverlay />
        <ModalContent bg="surface">
          <ModalHeader color="text.primary">Editar Imagen de Perfil</ModalHeader>
          <ModalBody>
            <Box position="relative" height="400px" width="100%" bg="black">
              <Cropper image={imageSrc || undefined} crop={crop} zoom={zoom} aspect={1 / 1} onCropChange={setCrop} onCropComplete={onCropComplete} onZoomChange={setZoom} />
            </Box>
            <Box mt={4}>
              <Text mb={2} fontSize="sm" color="text.primary">Zoom</Text>
              <Slider value={zoom} min={1} max={3} step={0.1} aria-label="zoom" onChange={setZoom}>
                <SliderTrack><SliderFilledTrack bg="teal.500" /></SliderTrack>
                <SliderThumb />
              </Slider>
            </Box>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose} color="text.primary">Cancelar</Button>
            <Button colorScheme="teal" onClick={showCroppedImage}>Guardar Recorte</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};