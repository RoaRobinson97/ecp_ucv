"use client";

import { Button, ButtonGroup, Flex } from "@chakra-ui/react";
// Importamos los hooks necesarios de next/navigation
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import React from 'react';

// Interfaz para las props que recibe el componente
interface PaginationProps {
    currentPage: number;
    totalPages: number;
}

// Tipo alias para los elementos que mostraremos (números o '...')
type PageNumber = number | string;

export function Pagination({ currentPage, totalPages }: PaginationProps) {
    const router = useRouter();
    const pathname = usePathname(); // Obtiene la ruta actual (ej: '/mis-cursos')
    const searchParams = useSearchParams(); // Obtiene los parámetros de búsqueda actuales

    // Función para construir la URL de la página siguiente/anterior/específica
    const createPageURL = (pageNumber: number) => {
        const params = new URLSearchParams(searchParams); // Copia los parámetros actuales
        params.set('page', pageNumber.toString()); // Actualiza solo el parámetro 'page'
        return `${pathname}?${params.toString()}`; // Devuelve la ruta completa con parámetros
    };

    // Función para generar el array de botones a mostrar (números y '...')
    const getPageNumbers = (): PageNumber[] => {
        const pageNumbers: PageNumber[] = [];
        const maxPagesToShow = 5; // Máximo de botones numéricos visibles
        const ellipsis = '...';

        // Si hay pocas páginas, las mostramos todas
        if (totalPages <= maxPagesToShow + 2) { // +2 para incluir el 1 y el totalPages sin ellipsis
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            // Lógica para mostrar las páginas del medio con '...'
            let startPage = Math.max(2, currentPage - 1);
            let endPage = Math.min(totalPages - 1, currentPage + 1);

            // Ajustes para los extremos
            if (currentPage <= 3) { // Si estamos cerca del inicio
                startPage = 2;
                endPage = 4;
            } else if (currentPage >= totalPages - 2) { // Si estamos cerca del final
                startPage = totalPages - 3;
                endPage = totalPages - 1;
            }

            pageNumbers.push(1); // Siempre la primera página
            if (startPage > 2) {
                pageNumbers.push(ellipsis); // Ellipsis al inicio si es necesario
            }
            for (let i = startPage; i <= endPage; i++) {
                pageNumbers.push(i); // Páginas intermedias
            }
            if (endPage < totalPages - 1) {
                pageNumbers.push(ellipsis); // Ellipsis al final si es necesario
            }
            pageNumbers.push(totalPages); // Siempre la última página
        }
        return pageNumbers;
    };

    // Manejadores para los clics en los botones
    const handlePageClick = (page: number) => {
        router.push(createPageURL(page));
    };

    const handlePrevious = () => {
        if (currentPage > 1) {
            router.push(createPageURL(currentPage - 1));
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            router.push(createPageURL(currentPage + 1));
        }
    };

    // Obtenemos el array de botones/ellipsis a renderizar
    const pages = getPageNumbers();

    // No renderizar nada si solo hay una página
    if (totalPages <= 1) {
      return null;
    }

    return (
        <Flex mt={10} justifyContent="center" alignItems="center">
            <ButtonGroup spacing="2">
                <Button onClick={handlePrevious} isDisabled={currentPage === 1}>Anterior</Button>
                {/* Mapeamos el array 'pages' añadiendo el tipo explícito */}
                {pages.map((page: PageNumber, index: number) =>
                    typeof page === 'number' ? (
                        <Button
                            key={index}
                            onClick={() => handlePageClick(page)}
                            variant={page === currentPage ? 'solid' : 'outline'}
                            colorScheme={page === currentPage ? 'blue' : 'gray'}
                        >
                            {page}
                        </Button>
                    ) : (
                        // Renderizamos los '...' como un botón deshabilitado
                        <Button key={index} variant="ghost" isDisabled _disabled={{ opacity: 0.5, cursor: "default" }}>
                            {page}
                        </Button>
                    )
                )}
                <Button onClick={handleNext} isDisabled={currentPage === totalPages}>Siguiente</Button>
            </ButtonGroup>
        </Flex>
    );
}
