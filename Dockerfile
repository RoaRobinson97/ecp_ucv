FROM node:20-alpine
WORKDIR /app

COPY package.json package-lock.json ./
# La caché de npm persiste entre builds: si cambia el lockfile solo se baja lo nuevo.
RUN --mount=type=cache,target=/root/.npm \
    npm ci --no-audit --no-fund

COPY . .
# Next.js fija NEXT_PUBLIC_* en el build; sin valor, el navegador usa el proxy /api.
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN --mount=type=cache,target=/app/.next/cache \
    npm run build
EXPOSE 3000

CMD ["npm", "start"]