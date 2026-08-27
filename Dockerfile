FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
RUN npm install
RUN npm install -g json-server

COPY . .
RUN npm run build
EXPOSE 3000

# Cambia solo la última línea por esto:
CMD ["npm", "run", "start:prod"]