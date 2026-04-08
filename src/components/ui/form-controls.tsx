//compobets/ui/form-controls.tsx

"use client";

import {
  FormControl as ChakraFormControl,
  FormLabel as ChakraFormLabel,
  FormErrorMessage as ChakraFormErrorMessage,
  Input as ChakraInput,
  Textarea as ChakraTextarea,
  FormControlProps,
  FormLabelProps,
  FormErrorMessageProps,
  InputProps,
  TextareaProps,
  Text,
  useColorModeValue,
  Button as ChakraButton,
  InputGroup as ChakraInputGroup,
  Box,
  Flex, // Importación necesaria para el layout de FileInput
  
} from "@chakra-ui/react";
import React, { useRef, useState } from 'react';

// === 🛠️ Componentes Base Reutilizados ===

/**
 * Un contenedor para controles de formulario, con soporte para etiquetas y mensajes de error.
 */
export const FormControl: React.FC<FormControlProps> = (props) => {
  return <ChakraFormControl {...props} />;
};

/**
 * Etiqueta para un control de formulario.
 */
export const FormLabel: React.FC<FormLabelProps> = (props) => {
  return <ChakraFormLabel {...props} />;
};

/**
 * Mensaje de error para un campo de formulario.
 */
export const FormErrorMessage: React.FC<FormErrorMessageProps> = (props) => {
  return <ChakraFormErrorMessage {...props} />;
};

/**
 * Campo de entrada de texto.
 */
export const Input: React.FC<InputProps> = (props) => {
  return <ChakraInput {...props} />;
};

/**
 * Área de texto para entradas de varias líneas.
 */
export const Textarea: React.FC<TextareaProps> = (props) => {
  return <ChakraTextarea {...props} />;
};

// === 🚀 COMPONENTE CUSTOMIZADO: FileInput ===

interface FileInputProps extends InputProps {
    label: string;
    description: string;
    isRequired?: boolean;
    onFileChange: (file: File | null) => void;
}

/**
 * Control de formulario reutilizable diseñado específicamente para la subida de archivos.
 * Utiliza Flex para controlar la separación del campo de texto y el botón.
 */
export const FileInput: React.FC<FileInputProps> = ({
    label,
    description,
    isRequired = false,
    onFileChange,
    ...rest
}) => {
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [fileName, setFileName] = useState<string>("Ningún archivo seleccionado");

    const fileDescriptionColor = useColorModeValue("gray.500", "gray.400");
    const inputBg = useColorModeValue('white', 'gray.700');
    const inputBorder = useColorModeValue('gray.300', 'gray.600');
    const buttonColorScheme = useColorModeValue("gray", "gray"); // Color para el botón

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] || null;
        
        // 1. Actualizar el estado del nombre del archivo para mostrarlo
        setFileName(file ? file.name : "Ningún archivo seleccionado");
        
        // 2. Ejecutar la función de callback del padre
        onFileChange(file);
    };

    const handleButtonClick = () => {
        // Simular clic en el input de tipo archivo oculto
        fileInputRef.current?.click();
    };

    return (
        <FormControl isRequired={isRequired} {...rest}>
            <FormLabel fontWeight="bold" fontSize="md">{label}</FormLabel>
            
            <Text fontSize="sm" color={fileDescriptionColor} mb={1}>
                {description}
            </Text>
            
            {/* Contenedor principal del Input */}
            <ChakraInputGroup size="lg" w="full">
                
                {/* 1. Input de texto simulado que muestra el nombre del archivo */}
                <Box>
                <Input
                    isReadOnly
                    placeholder={fileName}
                    value={fileName}
                    bg={inputBg}
                    borderColor={inputBorder}
                    _hover={{ cursor: 'pointer' }}
                    onClick={handleButtonClick} // Al hacer clic en el campo, abre el selector
                />
                      {/* 2. Botón que dispara el selector de archivos */}
                <ChakraButton
                    onClick={handleButtonClick}
                    colorScheme="teal"
                    variant="solid"
                    size="xs"
                    mt={2}
                >
                    Seleccionar archivo
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
                />

            </ChakraInputGroup>
        </FormControl>
    );
};

// Agrega esto en /components/ui/form-controls.tsx

// === ✨ COMPONENTE GENÉRICO: FormField ===

// Unimos las props de Input y Textarea para que el componente sea flexible
type FormFieldProps = InputProps & TextareaProps & {
  id: string;
  label: string;
  type?: 'text' | 'textarea' | 'email' | 'password' | 'number';
};

/**
 * Un componente de campo de formulario todo-en-uno que renderiza un Input o Textarea.
 * Ideal para simplificar la creación de formularios.
 */
export const FormField: React.FC<FormFieldProps> = ({ 
  id, 
  name,
  label, 
  type = 'text', 
  isRequired, 
  ...rest 
}) => {
  // Determina si el campo es un Input o un Textarea
  const InputComponent = type === 'textarea' ? Textarea : Input;
  
  return (
    <FormControl id={id} isRequired={isRequired}>
      <FormLabel>{label}</FormLabel>
      <InputComponent
        id={id}
        name={name || id} // Asegura que el 'name' sea el mismo que el 'id' para los handlers
        placeholder={`Escribe ${label.toLowerCase()} aquí...`}
        {...rest}
      />
    </FormControl>
  );
};