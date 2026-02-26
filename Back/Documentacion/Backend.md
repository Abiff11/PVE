# Backend PVE - Estado Actual (26-Feb-2026)

## Resumen
API NestJS para gestionar infracciones con autenticacion JWT y control por roles.
- Modulo de usuarios: altas administradas, hashing y enum `UserRole`.
- Modulo de auth: `/auth/signin` entrega JWT con `id`, `username`, `role`.
- Modulo de infracciones: CRUD completo, filtros opcionales y paginacion.
- Relacion `User -> Infraccion` para saber quien creo cada registro.
- Seeds con usuarios de prueba (uno por rol) y 20 infracciones por delegacion.

## Arquitectura Rapida
```
AppModule
 |- ConfigModule (.env)
 |- TypeOrmModule (PostgreSQL)
 |- UsersModule
 |    |- UsersController -> POST /users (solo admin)
 |    |- UsersService -> create/findByUsername/findById
 |- AuthModule
 |    |- AuthController -> POST /auth/signin
 |    |- AuthService -> valida credenciales y firma JWT
 |    |- JwtStrategy + RolesGuard -> proteccion de endpoints
 |- InfraccionesModule
      |- InfraccionesController -> CRUD + filtros + guards
      |- InfraccionesService -> logica y paginacion
```

## Roles y Permisos
| Rol | Accesos principales |
| --- | --- |
| `admin` | CRUD completo de infracciones + crear usuarios |
| `capturista` | Crear y consultar infracciones |
| `actualizador` | Consultar y actualizar infracciones |
| `director` | Consultar y eliminar infracciones |

Todos los endpoints usan `AuthGuard('jwt')` y `RolesGuard`.

## Endpoints Implementados
### Auth
- `POST /auth/signin` -> Body `{ username, password }` -> `{ access_token }`.

### Usuarios
- `POST /users` (solo admin) -> crea usuario con `nombre`, `apellido`, `username`, `password`, `telefono`, `delegacion`, `role`.

### Infracciones
- `POST /infracciones` (admin/capturista) -> crea registro y marca `createdBy` con el usuario autenticado.
- `GET /infracciones` -> acepta `delegacion`, `nombreOficial`, `fecha` (YYYY-MM-DD), `page`, `pageSize`; responde `{ data, total, page, pageSize }`.
- `GET /infracciones/:folio` -> devuelve detalle por folio.
- `PATCH /infracciones/:folio` (admin/actualizador) -> actualiza campos y `estatus` (`PENDIENTE` o `PAGADA`).
- `DELETE /infracciones/:folio` (admin/director) -> elimina y retorna mensaje + datos.

## Seeds y Datos
Script: `npm run seed`
1. Inserta usuarios `admin`, `director`, `capturista`, `actualizador` con password `P@ssw0rd!`.
2. Inserta 20 infracciones (`INF-001`...`INF-020`) distribuidas en delegaciones como Alcoholimetro, Oaxaca Camina, Foraneos Mixteca, etc., cada una ligada a un usuario.

## Configuracion / Ejecucion
1. Ajusta `.env.development` (DB, host, `JWT_SECRET`).
2. `cd Back/project-pve && npm install`.
3. (Opcional) `npm run seed` para datos de ejemplo. En PowerShell puede requerir `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass`.
4. `npm run start:dev` para modo watch (o `npm run start`).
5. Autentica en `/auth/signin` y usa el JWT en `Authorization: Bearer <token>` para el resto de endpoints.

## Proximos Pasos
- Documentar tambien el frontend y crear una tabla de permisos definitiva.
- Exponer endpoints de consulta/gestion de usuarios si se necesita UI administrativa.
- Agregar auditoria (timestamps de cambios, logins) y pruebas e2e para auth + roles.
- Evaluar migraciones/seeders por entorno y monitoreo centralizado de logs.

---
Ultima actualizacion: 26-Feb-2026.
