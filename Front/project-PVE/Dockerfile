# Dockerfile para React Frontend con Vite
# Usamos node:18-alpine para construir

FROM node:18-alpine AS builder

# Argumento para la URL del API
ARG VITE_API_URL=http://localhost:3000

WORKDIR /app

# Copiar package files primero para caching
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar código fuente
COPY . .

# Build de producción con la URL del API
RUN VITE_API_URL=${VITE_API_URL} npm run build

# ============================================
# STAGE 2: Producción (imagen con nginx)
# ============================================
FROM nginx:alpine AS production

# Copiar built files de la etapa builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuración de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer puerto 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:80 || exit 1

# Iniciar nginx
CMD ["nginx", "-g", "daemon off;"]

# ============================================
# STAGE: Desarrollo (alternativo)
# ============================================
FROM node:18-alpine AS development

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar todas las dependencias
RUN npm install

# Copiar código fuente
COPY . .

# Exponer puerto de Vite
EXPOSE 5173

# Comando para desarrollo (hot reload)
CMD ["npm", "run", "dev", "--", "--host"]
