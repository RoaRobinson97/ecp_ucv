"use client";

import React, { useEffect, useMemo, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Heading,
  HStack,
  Input,
  Select,
  Spinner,
  Text,
  VStack,
  useToast,
} from "@chakra-ui/react";
import NextLink from 'next/link';
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/auth-context";
import { userService } from '@/servicios/users-service';
import { formatDateForBackend } from '@/servicios/auth-service';
import { genderOptions, educationOptions } from '@/data/user-options';

type ProfileForm = {
  nombres: string;
  apellidos: string;
  cedula: string;
  email: string;
  fecha_de_nacimiento: string; // YYYY-MM-DD, el formato del input date
  genero: string;
  nivel_educativo: string;
  direccion: string;
};

const emptyForm: ProfileForm = {
  nombres: '',
  apellidos: '',
  cedula: '',
  email: '',
  fecha_de_nacimiento: '',
  genero: '',
  nivel_educativo: '',
  direccion: '',
};

// Convierte la respuesta de GET /users/:id a los valores del formulario.
function toForm(user: any): ProfileForm {
  return {
    nombres: user?.nombres || '',
    apellidos: user?.apellidos || '',
    cedula: user?.cedula || '',
    email: user?.email || '',
    // La API usa DD-MM-YYYY; formatDateForBackend invierte el orden en ambos sentidos.
    fecha_de_nacimiento: user?.fecha_de_nacimiento ? formatDateForBackend(user.fecha_de_nacimiento) : '',
    genero: user?.genero || '',
    nivel_educativo: user?.nivel_educativo || '',
    direccion: user?.direccion || '',
  };
}

function validate(form: ProfileForm, initial: ProfileForm): Partial<Record<keyof ProfileForm, string>> {
  const errors: Partial<Record<keyof ProfileForm, string>> = {};
  if (!form.nombres.trim()) errors.nombres = "Los nombres son obligatorios.";
  if (!form.apellidos.trim()) errors.apellidos = "Los apellidos son obligatorios.";
  if (!form.email.trim()) errors.email = "El email es obligatorio.";
  if (!/^\d+$/.test(form.cedula.trim()) || Number(form.cedula) <= 0) {
    errors.cedula = "La cédula debe ser un número.";
  }
  if (!form.fecha_de_nacimiento && initial.fecha_de_nacimiento) {
    errors.fecha_de_nacimiento = "La fecha de nacimiento no puede quedar vacía.";
  }
  return errors;
}

export const EditarPerfilForm = ({ userId }: { userId: string }) => {
  const { user, isHydrated } = useAuth();
  const router = useRouter();
  const toast = useToast();

  const [initial, setInitial] = useState<ProfileForm>(emptyForm);
  const [form, setForm] = useState<ProfileForm>(emptyForm);
  const [currentPhoto, setCurrentPhoto] = useState<string | undefined>();
  const [newPhoto, setNewPhoto] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof ProfileForm, string>>>({});

  const sessionUser = user as any;
  const isOwnProfile = String(sessionUser?.id || '') === userId;
  const isAdmin = sessionUser?.rol === 'admin' ||
    (sessionUser?.roles || []).some((r: string) => ['admin', 'deu_admin'].includes(r));

  // Solo el propio usuario o un administrador pueden editar el perfil.
  useEffect(() => {
    if (!isHydrated) return;
    if (!sessionUser) {
      router.replace('/login');
      return;
    }
    if (!isOwnProfile && !isAdmin) {
      router.replace(`/profile/${userId}`);
      return;
    }

    userService.getUserById(userId).then((data: any) => {
      if (!data) {
        toast({ title: "No se pudo cargar el perfil.", status: "error", duration: 5000, isClosable: true });
        router.replace(`/profile/${userId}`);
        return;
      }
      const values = toForm(data);
      setInitial(values);
      setForm(values);
      setCurrentPhoto(data.foto_perfil || undefined);
      setIsLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHydrated, sessionUser?.id, userId]);

  const photoPreview = useMemo(() => (newPhoto ? URL.createObjectURL(newPhoto) : undefined), [newPhoto]);
  useEffect(() => () => { if (photoPreview) URL.revokeObjectURL(photoPreview); }, [photoPreview]);

  // Un género guardado que no está en la lista se conserva como opción.
  const genders = form.genero && !genderOptions.some(o => o.value === form.genero)
    ? [...genderOptions, { value: form.genero, label: form.genero }]
    : genderOptions;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validate(form, initial);
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    // PUT /users/:id es una actualización parcial: solo se envía lo que cambió.
    const data = new FormData();
    (Object.keys(form) as (keyof ProfileForm)[]).forEach(key => {
      const value = form[key].trim();
      if (value === initial[key]) return;
      data.append(key, key === 'fecha_de_nacimiento' ? formatDateForBackend(value) : value);
    });
    if (newPhoto) data.append('profile_picture', newPhoto);

    if (Array.from(data.keys()).length === 0) {
      toast({ title: "No hay cambios para guardar.", status: "info", duration: 3000, isClosable: true });
      return;
    }

    setIsSaving(true);
    try {
      await userService.updateUser(userId, data);
      toast({ title: "Perfil actualizado.", status: "success", duration: 3000, isClosable: true });
      router.push(`/profile/${userId}`);
      router.refresh();
    } catch (err: any) {
      toast({
        title: "No se pudo actualizar el perfil",
        description: err.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!isHydrated || isLoading) {
    return (
      <Flex justify="center" align="center" py={20}>
        <Spinner color="teal.500" />
        <Text ml={4}>Cargando perfil...</Text>
      </Flex>
    );
  }

  const inputProps = { bg: "background", borderColor: "border", focusBorderColor: "primary", color: "text.primary" };
  const textField = (name: keyof ProfileForm, label: string, type = "text", isRequired = false) => (
    <FormControl id={name} isRequired={isRequired} isInvalid={!!errors[name]}>
      <FormLabel fontWeight="semibold" color="text.primary">{label}</FormLabel>
      <Input type={type} name={name} value={form[name]} onChange={handleChange} {...inputProps} />
      {errors[name] && <FormErrorMessage>{errors[name]}</FormErrorMessage>}
    </FormControl>
  );

  return (
    <Box
      bg="surface"
      p={{ base: 6, md: 8 }}
      rounded="xl"
      shadow="xl"
      borderWidth="1px"
      borderColor="border"
      w="full"
      maxW="2xl"
      mx="auto"
    >
      <Heading as="h1" size="lg" mb={2} color="text.primary" fontWeight="bold">
        Editar perfil
      </Heading>
      {!isOwnProfile && (
        <Text mb={4} color="text.muted">Estás editando el perfil de otro usuario como administrador.</Text>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <VStack spacing={5} mt={6} align="stretch">
          <FormControl id="profile_picture">
            <FormLabel fontWeight="semibold" color="text.primary">Foto de perfil</FormLabel>
            <HStack spacing={4}>
              <Avatar size="xl" name={`${form.nombres} ${form.apellidos}`} src={photoPreview || currentPhoto} />
              <Input
                type="file"
                accept="image/*"
                p={1}
                onChange={(e) => setNewPhoto(e.target.files?.[0] || null)}
                {...inputProps}
              />
            </HStack>
            <FormHelperText>Opcional. Reemplaza la foto actual.</FormHelperText>
          </FormControl>

          {textField('nombres', 'Nombres', 'text', true)}
          {textField('apellidos', 'Apellidos', 'text', true)}
          {textField('cedula', 'Cédula / CI', 'text', true)}
          {textField('email', 'Email', 'email', true)}
          {textField('fecha_de_nacimiento', 'Fecha de Nacimiento', 'date')}

          <FormControl id="genero">
            <FormLabel fontWeight="semibold" color="text.primary">Género</FormLabel>
            <Select name="genero" value={form.genero} onChange={handleChange} placeholder="Selecciona tu género" {...inputProps}>
              {genders.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </Select>
          </FormControl>

          <FormControl id="nivel_educativo">
            <FormLabel fontWeight="semibold" color="text.primary">Nivel Educativo</FormLabel>
            <Select
              name="nivel_educativo"
              value={form.nivel_educativo}
              onChange={handleChange}
              placeholder={form.nivel_educativo ? undefined : "Selecciona nivel educativo"}
              {...inputProps}
            >
              {educationOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </Select>
          </FormControl>

          {textField('direccion', 'Dirección')}

          {isOwnProfile && form.email.trim() !== initial.email && (
            <Text fontSize="sm" color="orange.500">
              El email es tu usuario para iniciar sesión: después de guardar, entra con el nuevo correo.
            </Text>
          )}

          <HStack justify="flex-end" spacing={3} pt={4}>
            <Button as={NextLink} href={`/profile/${userId}`} variant="ghost">
              Cancelar
            </Button>
            <Button
              type="submit"
              bg="primary"
              color="white"
              _hover={{ bg: "teal.600" }}
              isLoading={isSaving}
              loadingText="Guardando..."
            >
              Guardar cambios
            </Button>
          </HStack>
        </VStack>
      </form>
    </Box>
  );
};
