# Guía de arranque Front PVE

## Objetivo
Documentar el alcance mínimo viable del front React para la PVE, enlazando vistas con endpoints existentes y dejando lista la arquitectura inicial.

## Endpoints y roles
- **POST /auth/signin** (archivo `Back/project-pve/src/auth/auth.controller.ts`): Genera token JWT, acceden todos los usuarios registrados.
- **GET /infracciones** (archivo `Back/project-pve/src/infracciones/infracciones.controller.ts`): Lista paginada con filtros por delegación, oficial y fecha. Roles: admin, capturista, actualizador, director.
- **GET /infracciones/:folio**: Consulta detalle puntual, mismos roles de lectura que el listado.
- **POST /infracciones**: Crear registro, roles admin y capturista.
- **PATCH /infracciones/:folio**: Actualizar campos editables (estatus, monto, fecha/hora). Roles admin y actualizador.
- **DELETE /infracciones/:folio**: Eliminar registro (acción auditada). Roles admin y director.
- **GET /infracciones/kpis/resumen**: KPIs (totales, montos, top delegaciones) exclusivo para admin y director.

## Vistas previstas
1. **Login** (`/login`)
   - Formulario usuario/contraseña.
   - Consumo de `POST /auth/signin` y persistencia de token + rol.
2. **Dashboard / KPIs** (`/dashboard`)
   - Tarjetas de totales, gráficas simples con datos de `GET /infracciones/kpis/resumen`.
   - Filtros opcionales (fechaInicio, fechaFin, delegación).
3. **Listado de Infracciones** (`/infracciones`)
   - Tabla con paginación, filtros (delegación, oficial, fecha).
   - Acciones según rol: ver detalle, crear, editar, eliminar.
4. **Detalle / Edición** (`/infracciones/:folio`)
   - Muestra todos los campos, permite editar dependiendo del rol.
5. **Nuevo registro** (`/infracciones/nueva`)
   - Formulario basado en `CreateInfraccionDto`.

## Arquitectura React propuesta
- **Router**: `react-router-dom` con estructura `PublicLayout` (solo login) y `PrivateLayout` (resto). Componente `RequireAuth` valida token y rol requerido.
- **Estado global**: `AuthContext` almacena `{ user, role, token }`, expone `login()` y `logout()`. Hooks `useAuth` y `useRequireRole` para reutilizar lógica.
- **Servicios HTTP**: `apiClient` centraliza `fetch`/`axios`, inyecta `Authorization: Bearer <token>` y lee `import.meta.env.VITE_API_URL`. Servicios específicos:
  - `authService.signin(credentials)`
  - `infraccionesService.list(params)`
  - `infraccionesService.getByFolio(folio)`
  - `infraccionesService.create(payload)`
  - `infraccionesService.update(folio, payload)`
  - `infraccionesService.remove(folio)`
  - `infraccionesService.getKpis(filters)`
- **Control de roles**: utilidades `hasRole(userRole, allowedRoles)` y componentes de botones protegidos.

## Estructura inicial de carpetas (`src/`)
```
components/
  Layout/
  Table/
  Filters/
  KPI/
  FormInfraccion/
context/
  AuthContext.jsx
hooks/
  useAuth.js
pages/
  Login/
  Dashboard/
  InfraccionesList/
  InfraccionDetail/
  NuevaInfraccion/
router/
  AppRouter.jsx
services/
  apiClient.js
  auth.js
  infracciones.js
utils/
  roles.js
styles/
  globals.css (opcional)
```

## Flujo de autenticación
1. Usuario envía credenciales desde Login -> `authService.signin`.
2. Al recibir token + datos básicos, `AuthContext` guarda en estado y localStorage.
3. `PrivateLayout` verifica token al montar; si falta, redirige a `/login`.
4. Cada servicio utiliza `apiClient` para adjuntar el token y manejar expiración (si el backend responde 401, se limpia sesión y se redirige).

## Próximos pasos
1. Implementar archivos base (`AuthContext`, `apiClient`, `AppRouter`) con rutas y placeholders.
2. Construir pantalla de Login y verificar autenticación contra backend.
3. Maquetar Dashboard y Listado reutilizando componentes, añadiendo filtros/paginación.
4. Añadir formularios de creación/edición con validaciones alineadas a los DTOs del backend.
