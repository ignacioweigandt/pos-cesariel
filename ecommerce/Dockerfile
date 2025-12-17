# Dockerfile para desarrollo del e-commerce
FROM node:18-alpine

WORKDIR /app

# Instalar dependencias del sistema
RUN apk add --no-cache libc6-compat

# Copiar archivos de dependencias
COPY package*.json ./

# Limpiar cache y reinstalar dependencias
RUN npm cache clean --force && \
    rm -rf node_modules package-lock.json && \
    npm install --legacy-peer-deps

# Copiar el resto del código
COPY . .

# Exponer puerto
EXPOSE 3001

# Variables de entorno
ENV PORT=3001
ENV NODE_ENV=development

# Comando para desarrollo
CMD ["npm", "run", "dev"]