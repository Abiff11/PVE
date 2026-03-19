# Dockerfile para NestJS Backend
# Usamos node:20-alpine para compatibilidad

FROM node:20-alpine AS builder

# Argumento para modo de build
ARG NODE_ENV=production

WORKDIR /app

# Copiar package files primero para caching
COPY package*.json ./

# Instalar todas las dependencias (incluyendo devDependencies para nest CLI)
RUN npm install --include=dev && \
    npm cache clean --force

# Copiar código fuente
COPY . .

# Generar Prisma Client (si usa Prisma)
# RUN npx prisma generate

# Build de producción
RUN npx nest build

# ============================================
# STAGE 2: Producción (imagen final)
# ============================================
FROM node:20-alpine AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar solo dependencias de producción
RUN npm ci --if-present --only=production && \
    npm cache clean --force

# Copiar archivos compilados del builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/tsconfig.json ./
COPY --from=builder /app/tsconfig.build.json ./

# Cambiar ownership
RUN chown -R nodejs:nodejs /app

USER nodejs

# Exponer puerto
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1

# Comando de inicio
CMD ["node", "dist/main"]


