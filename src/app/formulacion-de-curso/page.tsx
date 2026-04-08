// app/formular-curso/page.tsx
"use client";

import React from 'react';
import { Flex } from "@chakra-ui/react";
import { CourseForm } from "../../components/formularios/curso-form";

export default function FormularCursoPage() {
  return (
    <Flex
      justifyContent="center"
      alignItems="center"
      minH="100vh"
      bg="gray.100"
    >
      <CourseForm />
    </Flex>
  );
}