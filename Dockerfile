# --- ETAPA 1: Construcción (Build) ---
FROM node:18-alpine as build-stage
WORKDIR /app

# Copiar package.json y package-lock.json primero para aprovechar la caché de Docker
COPY package*.json ./
RUN npm install

# Copiar el resto del código y compilar para producción
COPY . .
RUN npm run build

# --- ETAPA 2: Servidor Web (Nginx) ---
FROM nginx:stable-alpine

# Copiar configuración de Nginx (para evitar errores 404 en el router de React)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar los estáticos generados en la Etapa 1
# NOTA: Como corres con "npm run dev", es muy probable que uses Vite. Vite genera la carpeta "dist".
# Si por casualidad usas Create React App, cambia "/app/dist" por "/app/build"
COPY --from=build-stage /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]