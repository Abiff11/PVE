# Configuración y Arranque

## Requisitos Previos

| Herramienta | Versión mínima |
| ----------- | -------------- |
| Node.js     | 18+            |
| npm         | 9+             |
| PostgreSQL  | 14+            |

---

## Variables de Entorno del Backend

El backend carga el archivo `.env.<NODE_ENV>` según el entorno activo. Por defecto usa `.env.development`.

### Archivo `.env.development` (ejemplo)

```env
# Servidor
HOST=localhost
PORT=3000

# Base de datos PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pve_db
DB_USERNAME=postgres
DB_PASSWORD=tu_password_aqui

# JWT
JWT_SECRET=una_clave_secreta_muy_larga_y_segura

# CORS (opcional, separar por comas si hay múltiples orígenes)
FRONT_ORIGINS=http://localhost:5173
```

### Variables Obligatorias

Las siguientes variables son **requeridas** — el servidor lanzará un error al arrancar si no están definidas o están vacías:

| Variable      | Descripción                          |
| ------------- | ------------------------------------ |
| `DB_NAME`     | Nombre de la base de datos           |
| `DB_USERNAME` | Usuario de PostgreSQL                |
| `DB_PASSWORD` | Contraseña de PostgreSQL             |
| `JWT_SECRET`  | Clave secreta para firmar tokens JWT |

### Variables Opcionales

| Variable        | Default                 | Descripción                                   |
| --------------- | ----------------------- | --------------------------------------------- |
| `HOST`          | `localhost`             | Host donde escucha el servidor                |
| `PORT`          | `3000`                  | Puerto del servidor                           |
| `DB_HOST`       | `localhost`             | Host de PostgreSQL                            |
| `DB_PORT`       | `5432`                  | Puerto de PostgreSQL                          |
| `FRONT_ORIGINS` | `http://localhost:5173` | Orígenes CORS permitidos (separados por coma) |
| `NODE_ENV`      | `development`           | Entorno (`development` \| `production`)       |

---

## Variables de Entorno del Frontend

Crear el archivo `Front/project-PVE/.env.local`:

```env
VITE_API_URL=http://localhost:3000
```

> El archivo `.env.example` en `Front/project-PVE/` sirve como plantilla.

---

## Arranque en Desarrollo

### 1. Base de Datos

```bash
# Crear la base de datos en PostgreSQL
psql -U postgres -c "CREATE DATABASE pve_db;"
```

### 2. Backend (NestJS)

```bash
cd Back/project-pve

# Instalar dependencias
npm install

# Crear archivo de entorno
cp .env.example .env.development
# Editar .env.development con tus credenciales

# Arrancar en modo watch (recarga automática)
npm run start:dev
```

El servidor estará disponible en `http://localhost:3000`.

Con `synchronize: true` (modo development), TypeORM creará/actualizará las tablas automáticamente al arrancar.

### 3. Seed de Datos de Prueba

```bash
cd Back/project-pve

# Poblar la BD con usuarios y 20 infracciones de ejemplo
npm run seed
```

**Usuarios creados por el seed:**

| Username       | Password           | Rol          |
| -------------- | ------------------ | ------------ |
| `admin`        | `Admin123!`        | admin        |
| `director`     | `Director123!`     | director     |
| `capturista`   | `Capturista123!`   | capturista   |
| `actualizador` | `Actualizador123!` | actualizador |

### 4. Frontend (React + Vite)

```bash
cd Front/project-PVE

# Instalar dependencias
npm install

# Crear archivo de entorno
echo "VITE_API_URL=http://localhost:3000" > .env.local

# Arrancar servidor de desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`.

---

## Scripts Disponibles

### Backend

| Script     | Comando                      | Descripción                         |
| ---------- | ---------------------------- | ----------------------------------- |
| Desarrollo | `npm run start:dev`          | Modo watch con recarga automática   |
| Producción | `npm run start:prod`         | Ejecuta el build compilado          |
| Build      | `npm run build`              | Compila TypeScript a `dist/`        |
| Seed       | `npm run seed`               | Pobla la BD con datos de prueba     |
| Backfill   | `npm run backfill:createdBy` | Script de migración de datos legacy |
| Tests      | `npm test`                   | Ejecuta tests unitarios             |
| Tests E2E  | `npm run test:e2e`           | Ejecuta tests end-to-end            |
| Lint       | `npm run lint`               | Verifica y corrige estilo de código |
| Format     | `npm run format`             | Formatea con Prettier               |

### Frontend

| Script     | Comando           | Descripción                             |
| ---------- | ----------------- | --------------------------------------- |
| Desarrollo | `npm run dev`     | Servidor Vite con HMR                   |
| Build      | `npm run build`   | Genera bundle de producción en `dist/`  |
| Preview    | `npm run preview` | Sirve el build de producción localmente |
| Lint       | `npm run lint`    | Verifica estilo con ESLint              |

---

## Despliegue en Producción

### Backend

```bash
# 1. Configurar variables de entorno de producción
NODE_ENV=production
# (resto de variables en .env.production)

# 2. Compilar
npm run build

# 3. Arrancar
npm run start:prod
```

Con `NODE_ENV=production`:

- `synchronize: false` — No modifica el esquema automáticamente
- `migrationsRun: true` — Ejecuta migraciones pendientes al arrancar
- `logging: false` — Sin logs de SQL

### Frontend

```bash
# 1. Configurar VITE_API_URL con la URL del backend en producción
echo "VITE_API_URL=https://api.tu-dominio.com" > .env.production

# 2. Generar bundle
npm run build

# 3. Servir el directorio dist/ con nginx, Apache o cualquier servidor estático
```

---

## Seguridad

### Recomendaciones para Producción

1. **JWT_SECRET**: Usar una cadena aleatoria de al menos 64 caracteres.

   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

2. **CORS**: Configurar `FRONT_ORIGINS` con el dominio exacto del frontend.

3. **Helmet**: El código incluye comentarios para activar `helmet` en `main.ts`:

   ```bash
   npm install helmet
   ```

   Luego descomentar `app.use(helmet())` en `Back/project-pve/src/main.ts`.

4. **HTTPS**: Usar un proxy inverso (nginx) con certificado SSL/TLS.

5. **Variables de entorno**: Nunca commitear archivos `.env.*` con credenciales reales. El `.gitignore` ya los excluye.
