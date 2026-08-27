FROM node:18-alpine
WORKDIR /app

COPY package*.json ./
RUN npm install
RUN npm install -g json-server

COPY . .
RUN npm run build

EXPOSE 3000

CMD json-server --watch db.json --port 8080 --host 0.0.0.0 & npm run start