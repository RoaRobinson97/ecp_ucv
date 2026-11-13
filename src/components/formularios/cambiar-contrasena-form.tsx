"use client";

import React, { useEffect, useState } from 'react';
import {
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
  InputGroup,
  InputRightElement,
  Spinner,
  VStack,
  useToast,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import NextLink from 'next/link';
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/auth-context";
import { authService } from '@/servicios/auth-service';

const MIN_LENGTH = 8; // El mismo mínimo que exige el backend.

type Field = 'actual' | 'nueva' | 'confirmacion';

export const CambiarContrasenaForm = ({ userId }: { userId: string }) => {
  const { user, isHydrated } = useAuth();
  const router = useRouter();
  const toast = useToast();

  const [values, setValues] = useState<Record<Field, string>>({ actual: '', nueva: '', confirmacion: '' });
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [show, setShow] = useState<Record<Field, boolean>>({ actual: false, nueva: false, confirmacion: false });
  const [isSaving, setIsSaving] = useState(false);

  const isOwnProfile = String((user as any)?.id || '') === userId;

  // Cada usuario cambia solo su propia contraseña.
  useEffect(() => {
    if (!isHydrated) return;
    if (!user) router.replace('/login');
    else if (!isOwnProfile) router.replace(`/profile/${userId}`);
  }, [isHydrated, user, isOwnProfile, router, userId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation: Partial<Record<Field, string>> = {};
    if (!values.actual) validation.actual = "Ingresa tu contraseña actual.";
    if (values.nueva.length < MIN_LENGTH) validation.nueva = `La nueva contraseña debe tener al menos ${MIN_LENGTH} caracteres.`;
    if (values.confirmacion !== values.nueva) validation.confirmacion = "Las contraseñas no coinciden.";
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    setIsSaving(true);
    try {
      await authService.changePassword(values.actual, values.nueva);
      toast({ title: "Contraseña actualizada.", status: "success", duration: 3000, isClosable: true });
      router.push(`/profile/${userId}`);
    } catch (err: any) {
      if (String(err.message).includes('contraseña actual incorrecta')) {
        setErrors({ actual: "La contraseña actual no es correcta." });
      } else {
        toast({
          title: "No se pudo cambiar la contraseña",
          description: err.message,
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "top",
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (!isHydrated || !isOwnProfile) {
    return (
      <Flex justify="center" align="center" py={20}>
        <Spinner color="teal.500" />
      </Flex>
    );
  }

  const passwordField = (name: Field, label: string, helper?: string) => (
    <FormControl id={name} isRequired isInvalid={!!errors[name]}>
      <FormLabel fontWeight="semibold" color="text.primary">{label}</FormLabel>
      <InputGroup>
        <Input
          type={show[name] ? 'text' : 'password'}
          name={name}
          value={values[name]}
          onChange={handleChange}
          autoComplete={name === 'actual' ? 'current-password' : 'new-password'}
          bg="background"
          borderColor="border"
          focusBorderColor="primary"
          color="text.primary"
        />
        <InputRightElement>
          <Button
            variant="ghost"
            aria-label={show[name] ? "Ocultar contraseña" : "Mostrar contraseña"}
            onClick={() => setShow(prev => ({ ...prev, [name]: !prev[name] }))}
            color="text.muted"
            _hover={{ bg: "transparent", color: "text.primary" }}
          >
            {show[name] ? <ViewOffIcon /> : <ViewIcon />}
          </Button>
        </InputRightElement>
      </InputGroup>
      {errors[name]
        ? <FormErrorMessage>{errors[name]}</FormErrorMessage>
        : helper && <FormHelperText>{helper}</FormHelperText>}
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
      maxW="md"
      mx="auto"
    >
      <Heading as="h1" size="lg" mb={6} color="text.primary" fontWeight="bold">
        Cambiar contraseña
      </Heading>

      <form onSubmit={handleSubmit} noValidate>
        <VStack spacing={5} align="stretch">
          {passwordField('actual', 'Contraseña actual')}
          {passwordField('nueva', 'Nueva contraseña', `Mínimo ${MIN_LENGTH} caracteres.`)}
          {passwordField('confirmacion', 'Confirmar nueva contraseña')}

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
              Cambiar contraseña
            </Button>
          </HStack>
        </VStack>
      </form>
    </Box>
  );
};
