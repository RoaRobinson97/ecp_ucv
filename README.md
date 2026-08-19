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