// /src/data/mock-data.ts (Ahora con extensión .ts)

// Importamos las interfaces desde el componente principal.
// Asegúrate de que la ruta sea correcta para tu proyecto.
import { Course, UserData } from '@/components/ui/profile-coordinator-review';

// Tipo base para el mock que incluye campos de la DB
type MockUserBase = Omit<UserData, 'courses'> & { 
    id: string; 
    role: 'admin' | 'coordinador' | 'proveedor' | 'visitante';
};

// ----------------------------------------------------
// 1. Datos Mockeados
// ----------------------------------------------------

const MOCK_COURSES_DATA: any = [
     {
        id: "1",
        titulo: "Introducción a la Programación",
        descripcion: "Aprende los fundamentos de la programación con Python, desde variables hasta estructuras de datos.",
        image: 'image-1.jpg'
    },
    {
        id: "2",
        titulo: "Marketing Digital Avanzado",
        descripcion: "Domina estrategias de SEO, SEM y redes sociales para impulsar cualquier negocio.",
        image: null
    },
    {
        id: "3",
        titulo: "Bases de Datos con SQL",
        descripcion: "Diseña y gestiona bases de datos relacionales con los principales comandos de SQL.",
        image: null
    },
];

export const MOCK_USER_PROFILES_DATA: MockUserBase[] = [
    { 
        id: 'ec-user-003',
        name: 'María García (Proveedor)', 
        bio: 'Experta en Ciencias Económicas. Necesita documentación legal.', 
        documentStatus: 'Pendiente de Revisión',
        avatarUrl: 'https://i.pravatar.cc/150?u=ec-user-003',
        role: 'proveedor',
    },
    { 
        id: 'ec-user-002',
        name: 'Ana Pérez (Coordinador)', 
        bio: 'Administradora del sistema DEU.', 
        documentStatus: 'Documentos Aprobados',
        avatarUrl: 'https://i.pravatar.cc/150?u=ec-user-002',
        role: 'coordinador',
    },
    { 
        id: 'ec-user-005',
        name: 'Sofía Martínez (Visitante)', 
        bio: 'Usuario estándar sin roles especiales.', 
        documentStatus: 'N/A', 
        avatarUrl: 'https://i.pravatar.cc/150?u=ec-user-005',
        role: 'visitante',
    },
];

// ----------------------------------------------------
// 2. Exportación de la Base de Datos Centralizada
// ----------------------------------------------------

/**
 * MOCKED_DB centraliza todas las colecciones para que el BaseApiService
 * pueda accederlas usando el nombre de la entidad (ej: 'courses', 'users').
 */
export const MOCKED_DB = {
    // La clave es el nombre de la entidad que se usará en el ApiService.
    'courses': MOCK_COURSES_DATA, 
    'user-profiles': MOCK_USER_PROFILES_DATA, // O 'users' si prefieres esa clave
    // Aquí puedes añadir más entidades: 'orders', 'documents', etc.
};


// ----------------------------------------------------
// 3. Lógica de ID para el Mock (Se mantiene igual)
// ------------------------------------------------------

// Define el tipo de la función si es necesario, aunque TS puede inferirlo
export const generateMockId = (prefix: string): string => `${prefix}${nextMockId++}`;

// El contador debe definirse primero
let nextMockId = 1000;