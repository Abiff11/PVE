---
alias: "API"
---

# Referencia de la API REST

**Base URL:** `http://localhost:3000` (configurable con `HOST` y `PORT`)

Todos los endpoints (excepto `POST /auth/signin`) requieren el header:

```
Authorization: Bearer <access_token>
```

---

## Arquitectura de Autenticación

### Componentes

| Componente | Ubicación | Función |
|------------|-----------|---------|
| **AuthGuard** | `@nestjs/passport` | Protege las rutas, valida que el token exista |
| **JwtStrategy** | [[01-arquitectura]] | Decodifica y valida el JWT con el secret |
| **RolesGuard** | [[01-arquitectura]] | Verifica roles de usuario |

### Flujo de Autenticación

```
1. Cliente → POST /auth/signin (username, password)
2. Servidor → Valida credenciales con bcrypt
3. Servidor → Genera JWT con payload {sub, username, role}
4. Cliente → Almacena el token
5. Cliente → Request subsiguientes: Authorization: Bearer <token>
6. AuthGuard('jwt') → JwtStrategy.validate() → Extrae usuario
7. RolesGuard → Verifica permisos por rol
```

### Uso en Controladores

```typescript
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles/roles.guard';

@Controller('infracciones')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class InfraccionesController { ... }
```

> **Nota:** `AuthGuard('jwt')` usa la `JwtStrategy` definida en [[01-arquitectura]]. No es un archivo personalizado, sino una clase proporcionada por `@nestjs/passport`.

---

## Autenticación — `/auth`

### `POST /auth/signin`

Inicia sesión y devuelve el token JWT.

**Sin autenticación requerida.**

**Body:**

```json
{
  "username": "string",
  "password": "string"
}
```

**Respuesta 201:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errores:**
| Código | Descripción |
|--------|-------------|
| 401 | Credenciales inválidas |

---

### `POST /auth/logout`

Registra el cierre de sesión en la bitácora.

**Roles:** Todos (requiere JWT válido)

**Respuesta 201:**

```json
{ "message": "Logout registrado" }
```

---

## Infracciones — `/infracciones`

### `POST /infracciones`

Registra una nueva infracción.

**Roles:** `admin`, `capturista`

**Body:**

```json
{
  "folio": "INF-001",
  "fecha": "2026-02-27",
  "hora": "14:30",
  "nombreInfractor": "Juan Pérez",
  "nombreOficial": "Oficial García",
  "delegacion": "Plaza",
  "detalleInfraccion": "Exceso de velocidad",
  "monto": 1800,
  "vehiculo": "Sedán",
  "placas": "ABC-123",
  "servicio": "Particular",
  "vehiculoDetenido": 0,
  "motocicletaDetenida": 0,
  "consignacionVehiculo": 0,
  "consignacionMotocicleta": 0,
  "soloInfraccion": true
}
```

**Validaciones:**

- `folio`: string no vacío, único en BD
- `fecha`: formato `YYYY-MM-DD`
- `hora`: formato `HH:mm` (00:00–23:59)
- `monto`: número positivo
- `vehiculoDetenido`, `motocicletaDetenida`, `consignacionVehiculo`, `consignacionMotocicleta`: entero ≥ 0
- `soloInfraccion`: boolean — **no puede ser `true` si hay consignaciones > 0**

**Respuesta 201:** Objeto `Infraccion` completo.

**Errores:**
| Código | Descripción |
|--------|-------------|
| 400 | Folio duplicado, fecha/hora inválida, coherencia soloInfraccion |
| 401 | Token inválido o ausente |
| 403 | Rol sin permiso |

---

### `GET /infracciones`

Lista paginada de infracciones con filtros opcionales.

**Roles:** `admin`, `capturista`, `actualizador`, `director`, `encierro`

**Query params:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `delegacion` | string | Filtro parcial (case-insensitive) |
| `nombreOficial` | string | Filtro parcial (case-insensitive) |
| `fecha` | `YYYY-MM-DD` | Filtra por día exacto |
| `fechaInicio` | `YYYY-MM-DD` | Inicio del rango de fechas |
| `fechaFin` | `YYYY-MM-DD` | Fin del rango de fechas |
| `page` | number | Página (default: 1) |
| `pageSize` | number | Registros por página (default: 5) |

**Respuesta 200:**

```json
{
  "data": [
    /* array de Infraccion */
  ],
  "total": 42,
  "page": 1,
  "pageSize": 5
}
```

**Errores:**
| Código | Descripción |
|--------|-------------|
| 400 | `fechaInicio` > `fechaFin`, formato de fecha inválido |

---

### `GET /infracciones/kpis/resumen`

Resumen estadístico para el dashboard del director.

**Roles:** `admin`, `director`

**Query params:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `delegacion` | string | Filtro por delegación |
| `fechaInicio` | `YYYY-MM-DD` | Inicio del rango |
| `fechaFin` | `YYYY-MM-DD` | Fin del rango |

**Respuesta 200:**

```json
{
  "filtros": { "delegacion": "Plaza", "fechaInicio": "2026-01-01", "fechaFin": "2026-12-31" },
  "totalInfracciones": 20,
  "conteoPorEstatus": { "PENDIENTE": 12, "PAGADA": 8 },
  "montoPorEstatus": { "PENDIENTE": 21600.0, "PAGADA": 14400.0 },
  "montoTotal": 36000.0,
  "topDelegaciones": [
    { "delegacion": "Plaza", "total": 8 },
    { "delegacion": "Norte", "total": 5 }
  ]
}
```

---

### `GET /infracciones/:folio`

Obtiene una infracción por su folio.

**Roles:** `admin`, `capturista`, `actualizador`, `director`, `encierro`

**Respuesta 200:** Objeto `Infraccion` completo.

**Errores:**
| Código | Descripción |
|--------|-------------|
| 400 | No existe infracción con ese folio |

---

### `PATCH /infracciones/:folio`

Actualiza campos de una infracción existente.

**Roles:** `admin`, `actualizador`, `encierro`

**Body:** Cualquier subconjunto de los campos de `CreateInfraccionDto` (excepto `folio`) más `estatus`.

```json
{
  "estatus": "PAGADA",
  "monto": 2000
}
```

**Respuesta 200:**

```json
{
  "message": "Infracción actualizada",
  "data": {
    /* Infraccion actualizada */
  }
}
```

---

### `DELETE /infracciones/:folio`

Elimina una infracción.

**Roles:** `admin`, `director`

**Respuesta 200:**

```json
{
  "message": "Infracción eliminada con éxito",
  "data": {
    /* Infraccion eliminada */
  }
}
```

---

## Usuarios — `/users`

> Todos los endpoints requieren rol `admin`.

### `POST /users`

Crea un nuevo usuario.

**Body:**

```json
{
  "nombre": "string",
  "apellido": "string",
  "username": "string",
  "password": "string",
  "telefono": "string",
  "delegacion": "string",
  "role": "admin | director | capturista | actualizador | encierro"
}
```

---

### `GET /users`

Lista todos los usuarios (sin campo `password`).

---

### `PATCH /users/:id/role`

Actualiza el rol de un usuario.

**Body:**

```json
{ "role": "actualizador" }
```

---

### `DELETE /users/:id`

Elimina un usuario.

---

## Bitácora — `/bitacora`

### `GET /bitacora`

Lista paginada de entradas de auditoría.

**Roles:** `admin`

**Query params:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `page` | number | Página (default: 1) |
| `pageSize` | number | Registros por página |

**Respuesta 200:**

```json
{
  "data": [
    {
      "id": 1,
      "action": "INFRACCION_CREADA",
      "description": "Se registró la infracción INF-001",
      "userId": 2,
      "username": "capturista1",
      "metadata": { "infraccionId": "uuid-..." },
      "createdAt": "2026-02-27T14:30:00.000Z"
    }
  ],
  "total": 150,
  "page": 1,
  "pageSize": 10
}
```

---

## Modelo de Respuesta de Error

Todos los errores siguen el formato estándar de NestJS:

```json
{
  "statusCode": 400,
  "message": ["folio must be a string", "monto must be a positive number"],
  "error": "Bad Request"
}
```
