# 🚀 Plataforma ECP - Entorno de Desarrollo Local

Esta guía describe los pasos exactos para inicializar tanto la aplicación frontend (Next.js) como el servidor de base de datos simulado (json-server).

## 1. Instalar y Configurar Node.js
Asegúrate de estar utilizando la versión correcta de Node.js mediante `nvm` (Node Version Manager). En tu terminal, instala y usa la versión 18.20.4 ejecutando:

    nvm install 18.20.4
    nvm use 18.20.4

## 2. Instalar Dependencias del Proyecto
Una vez en la versión correcta de Node, instala las dependencias base de la plataforma:

    npm install

## 3. Instalar y Levantar el Backend Simulado (Terminal 1)
El proyecto utiliza una base de datos local basada en el archivo `db.json`. Para que funcione, primero debes instalar `json-server` globalmente en tu máquina. Ejecuta:

    npm install -g json-server

Una vez instalado, levanta el servidor simulado ejecutando el siguiente comando en la raíz del proyecto:

    json-server --watch db.json --port 8080

*El backend quedará escuchando en http://localhost:8080. Este proceso debe mantenerse en ejecución ininterrumpida.*

## 4. Levantar la Aplicación Frontend (Terminal 2)
Para iniciar la interfaz de usuario, debes abrir una **NUEVA pestaña** o ventana en tu terminal (sin cerrar la de json-server). En la raíz del proyecto, ejecuta:

    npm run dev

La plataforma estará lista y accesible desde tu navegador en: http://localhost:3000.

1. El fallo de ESLint: Reglas de los Hooks de React
El error original decía: Error: React Hook "useColorModeValue" cannot be called inside a callback... y ...is called conditionally.

React tiene reglas inmutables sobre cómo gestiona su árbol interno (el Virtual DOM) y el estado. Los hooks (useState, useEffect, y los personalizados como useColorModeValue de Chakra UI o similar) dependen absolutamente del orden en que son llamados. React no identifica los hooks por nombre, los identifica por la secuencia en que aparecen durante el renderizado.

Por qué fallaba tu código:
Si pones un hook dentro de un if (condicional) o dentro de una función de respuesta (callback), como un onClick:

JavaScript
// MAL - React estalla
if (userIsAdmin) {
  const color = useColorModeValue('white', 'black');
}

// MAL - React estalla
const handleClick = () => {
  const color = useColorModeValue('white', 'black'); 
}
En un render, el hook se ejecuta, en el siguiente quizás no. Esto desincroniza las listas internas de React y rompe la aplicación de forma impredecible.

Cómo debes arreglarlo:
Los hooks siempre deben ir en el nivel más alto del componente, antes de cualquier return o lógica condicional.

JavaScript
// BIEN
const color = useColorModeValue('white', 'black');

if (userIsAdmin) {
  // usa la variable 'color' aquí
}
2. El fallo de TypeScript: Parámetros como Promesas en Next.js 15
El error decía: Type '{ courseId: string; }' is missing the following properties from type 'Promise<any>'.

Esto no existía en versiones anteriores. En Next.js 14 y hacia atrás, cuando tenías una ruta dinámica como app/curso/[courseId]/page.tsx, Next.js te entregaba el valor de la URL de forma sincrónica.

Por qué Next.js 15 lo cambió a Promise:
La arquitectura del App Router ha evolucionado para priorizar el Partial Prerendering (PPR) y la generación de páginas en el servidor de la forma más asíncrona y paralela posible.
Al forzar que params y searchParams sean promesas, Next.js se reserva el derecho de retrasar la resolución de esos parámetros hasta el último microsegundo posible antes de renderizar, permitiendo optimizaciones agresivas en la caché y en el motor del servidor (Turbopack).

Si tratas params como un objeto estático, estás bloqueando esa optimización y TypeScript te detiene.

Cómo debes arreglarlo:

Tienes que transformar tu componente de página en una función asíncrona (lo cual es válido en Server Components) y usar await para desempacar la promesa.

TypeScript
// ESTO YA NO FUNCIONA (Next.js 14 o menor)
export default function CursoPage({ params }: { params: { courseId: string } }) {
  const id = params.courseId; // TypeScript se queja
}

// ASÍ SE HACE EN NEXT.JS 15 (Lo que debes implementar)
type Props = {
  params: Promise<{ courseId: string }>;
};

export default async function CursoPage({ params }: Props) {
  const resolvedParams = await params;
  const id = resolvedParams.courseId; 
  // Ahora sí puedes usar el id de forma segura
}