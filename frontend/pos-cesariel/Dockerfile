# Usar Node.js 18 como base
FROM node:18-alpine

# Instalar dependencias del sistema
RUN apk add --no-cache libc6-compat

# Establecer directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json (si existe)
COPY package*.json ./

# Instalar dependencias
RUN npm install --legacy-peer-deps

# Copiar el código fuente
COPY . .

# Exponer el puerto
EXPOSE 3000

# Comando por defecto para desarrollo
CMD ["npm", "run", "dev"]
