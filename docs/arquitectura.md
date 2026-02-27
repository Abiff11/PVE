# Arquitectura del Sistema

## Visión General

PVE sigue una arquitectura cliente-servidor clásica con separación estricta entre el frontend (SPA) y el backend (API REST). La comunicación se realiza exclusivamente mediante HTTP/JSON con autenticación JWT Bearer.

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENTE (Browser)                     │
│                                                             │
│   React 19 SPA (Vite)                                       │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│   │  Login   │  │Dashboard │  │Infracc.  │  │Usuarios  │  │
│   └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
│                                                             │
│   AuthContext (JWT en localStorage)                         │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTP/JSON + Bearer Token
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                    SERVIDOR (NestJS 11)                      │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │   Auth   │  │Infracc.  │  │  Users   │  │Bitácora  │   │
│  │ Module   │  │ Module   │  │  Module  │  │  Module  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                                                             │
│  Guards: AuthGuard('jwt') + RolesGuard                      │
│  Pipes: ValidationPipe (whitelist + transform)              │
└─────────────────────┬───────────────────────────────────────┘
                      │ TypeORM
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                    PostgreSQL                                │
│                                                             │
│   users  ──< infracciones    bitacora                       │
└─────────────────────────────────────────────────────────────┘
```

---

## Módulos del Backend

### `AppModule`

Módulo raíz. Registra `ConfigModule` (global), `TypeOrmModule` y los módulos de dominio.

### `AuthModule`

Gestiona autenticación JWT.

| Componente       | Responsabilidad                                                             |
| ---------------- | --------------------------------------------------------------------------- |
| `AuthController` | `POST /auth/signin`, `POST /auth/logout`                                    |
| `AuthService`    | Valida credenciales con bcrypt, firma JWT, registra en bitácora             |
| `JwtStrategy`    | Decodifica el token Bearer y puebla `req.user` con `{ id, username, role }` |
| `RolesGuard`     | Verifica que el rol del token esté en la lista `@Roles(...)` del handler    |

**Payload del JWT:**

```json
{ "sub": 1, "username": "admin", "role": "admin" }
```

### `InfraccionesModule`

Módulo principal del negocio.

| Componente               | Responsabilidad                                                                             |
| ------------------------ | ------------------------------------------------------------------------------------------- |
| `InfraccionesController` | CRUD + KPIs, aplica guards JWT + RolesGuard                                                 |
| `InfraccionesService`    | Lógica de negocio: validación de folio único, coherencia `soloInfraccion`, paginación, KPIs |
| `Infraccion` (entity)    | Tabla `infracciones` con índices en `delegacion`, `nombreOficial`, `fechaHora`              |
| `CreateInfraccionDto`    | Validación de entrada para creación                                                         |
| `UpdateInfraccionDto`    | Extiende `CreateInfraccionDto` (parcial, sin `folio`) + campo `estatus`                     |
| `QueryInfraccionDto`     | Filtros de búsqueda paginada                                                                |
| `KpiInfraccionDto`       | Filtros para el resumen de KPIs                                                             |

### `UsersModule`

Administración de usuarios del sistema.

| Componente        | Responsabilidad                                |
| ----------------- | ---------------------------------------------- |
| `UsersController` | CRUD de usuarios (solo `admin`)                |
| `UsersService`    | Hashea contraseñas con bcrypt, gestiona roles  |
| `User` (entity)   | Tabla `users`, relación 1:N con `infracciones` |

### `BitacoraModule`

Auditoría de acciones del sistema.

| Componente               | Responsabilidad                                                            |
| ------------------------ | -------------------------------------------------------------------------- |
| `BitacoraController`     | `GET /bitacora` (solo `admin`)                                             |
| `BitacoraService`        | Método `log(action, data)` llamado desde otros servicios                   |
| `BitacoraEntry` (entity) | Tabla `bitacora` con `action`, `description`, `userId`, `metadata` (JSONB) |

**Acciones registradas:**

- `USER_LOGIN` / `USER_LOGOUT`
- `INFRACCION_CREADA` / `INFRACCION_ACTUALIZADA` / `INFRACCION_ELIMINADA`
- `USER_CREATED` / `USER_ROLE_UPDATED` / `USER_DELETED`

---

## Flujo de Autenticación

```
1. POST /auth/signin  { username, password }
        │
        ▼
2. AuthService.signin()
   - Busca usuario en BD
   - Compara password con bcrypt
   - Firma JWT con { sub, username, role }
   - Registra USER_LOGIN en bitácora
        │
        ▼
3. Respuesta: { access_token: "eyJ..." }
        │
        ▼
4. Frontend guarda token en localStorage (clave: pve.auth)
        │
        ▼
5. Cada petición incluye: Authorization: Bearer <token>
        │
        ▼
6. AuthGuard('jwt') → JwtStrategy.validate() → req.user = { id, username, role }
        │
        ▼
7. RolesGuard verifica que role esté en @Roles(...)
```

---

## Roles y Permisos

| Rol            | Crear infracción | Ver lista | Ver detalle | Actualizar | Eliminar | KPIs | Usuarios | Bitácora |
| -------------- | :--------------: | :-------: | :---------: | :--------: | :------: | :--: | :------: | :------: |
| `admin`        |        ✅        |    ✅     |     ✅      |     ✅     |    ✅    |  ✅  |    ✅    |    ✅    |
| `director`     |        ❌        |    ✅     |     ✅      |     ❌     |    ✅    |  ✅  |    ❌    |    ❌    |
| `capturista`   |        ✅        |    ✅     |     ✅      |     ❌     |    ❌    |  ❌  |    ❌    |    ❌    |
| `actualizador` |        ❌        |    ✅     |     ✅      |     ✅     |    ❌    |  ❌  |    ❌    |    ❌    |
| `encierro`     |        ❌        |    ✅     |     ✅      |     ✅     |    ❌    |  ❌  |    ❌    |    ❌    |

---

## Validación de Negocio

### Coherencia `soloInfraccion`

El campo `soloInfraccion` indica que no hubo consignación de ningún tipo. El servicio valida esta regla en `create()` y `update()`:

```
soloInfraccion = true  AND  (consignacionVehiculo > 0 OR consignacionMotocicleta > 0)
→ BadRequestException: "soloInfraccion no puede ser true si hay consignaciones registradas"
```

### Folio único

El servicio verifica en BD antes de insertar. La columna también tiene `{ unique: true }` como respaldo a nivel de base de datos.
