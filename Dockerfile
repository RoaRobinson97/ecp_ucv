FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
# Next.js fija NEXT_PUBLIC_* en el build; sin valor, el navegador usa el proxy /api.
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN npm run build
EXPOSE 3000

CMD ["npm", "start"]