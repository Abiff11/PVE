# Modelo de Datos

## Diagrama de Entidades

```
┌──────────────────────────────────────────────────────────────┐
│                          users                               │
├──────────────────────────────────────────────────────────────┤
│ id          INTEGER PK AUTO_INCREMENT                        │
│ nombre      VARCHAR NOT NULL                                 │
│ apellido    VARCHAR NOT NULL                                 │
│ username    VARCHAR UNIQUE NOT NULL                          │
│ password    VARCHAR NOT NULL  (bcrypt, select: false)        │
│ telefono    VARCHAR NOT NULL                                 │
│ delegacion  VARCHAR NOT NULL                                 │
│ role        ENUM('admin','director','capturista',            │
│                  'actualizador','encierro') NOT NULL         │
└──────────────────────────┬───────────────────────────────────┘
                           │ 1:N
                           ▼
┌──────────────────────────────────────────────────────────────┐
│                       infracciones                           │
├──────────────────────────────────────────────────────────────┤
│ id                    UUID PK                                │
│ folio                 VARCHAR UNIQUE NOT NULL  [idx]         │
│ nombreInfractor       VARCHAR NOT NULL                       │
│ nombreOficial         VARCHAR NOT NULL         [idx]         │
│ delegacion            VARCHAR NOT NULL         [idx]         │
│ vehiculo              VARCHAR NOT NULL                       │
│ placas                VARCHAR NOT NULL                       │
│ detalleInfraccion     TEXT NOT NULL                          │
│ servicio              VARCHAR NOT NULL                       │
│ fechaHora             TIMESTAMP NOT NULL       [idx]         │
│ monto                 DECIMAL(10,2) NOT NULL                 │
│ vehiculoDetenido      INT DEFAULT 0                          │
│ motocicletaDetenida   INT DEFAULT 0                          │
│ consignacionVehiculo  INT DEFAULT 0                          │
│ consignacionMotocicleta INT DEFAULT 0                        │
│ soloInfraccion        BOOLEAN DEFAULT true                   │
│ estatus               ENUM('PENDIENTE','PAGADA')             │
│                            DEFAULT 'PENDIENTE'               │
│ created_by_id         INTEGER FK → users.id NOT NULL         │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                         bitacora                             │
├──────────────────────────────────────────────────────────────┤
│ id          INTEGER PK AUTO_INCREMENT                        │
│ action      VARCHAR NOT NULL                                 │
│ description TEXT NULLABLE                                    │
│ userId      INTEGER NULLABLE                                 │
│ username    VARCHAR NULLABLE                                 │
│ metadata    JSONB NULLABLE                                   │
│ createdAt   TIMESTAMP DEFAULT NOW()                          │
└──────────────────────────────────────────────────────────────┘
```

---

## Tabla `users`

| Columna      | Tipo    | Restricciones          | Descripción                                |
| ------------ | ------- | ---------------------- | ------------------------------------------ |
| `id`         | INTEGER | PK, AUTO_INCREMENT     | Identificador numérico                     |
| `nombre`     | VARCHAR | NOT NULL               | Nombre del usuario                         |
| `apellido`   | VARCHAR | NOT NULL               | Apellido del usuario                       |
| `username`   | VARCHAR | UNIQUE, NOT NULL       | Nombre de usuario para login               |
| `password`   | VARCHAR | NOT NULL, select:false | Hash bcrypt (nunca se devuelve en queries) |
| `telefono`   | VARCHAR | NOT NULL               | Teléfono de contacto                       |
| `delegacion` | VARCHAR | NOT NULL               | Delegación a la que pertenece              |
| `role`       | ENUM    | NOT NULL               | Rol del sistema                            |

**Roles disponibles:**

- `admin` — Acceso total
- `director` — Lectura + KPIs + eliminación
- `capturista` — Creación + lectura
- `actualizador` — Lectura + actualización
- `encierro` — Lectura + actualización

---

## Tabla `infracciones`

| Columna                   | Tipo          | Restricciones           | Descripción                                            |
| ------------------------- | ------------- | ----------------------- | ------------------------------------------------------ |
| `id`                      | UUID          | PK                      | Identificador único generado automáticamente           |
| `folio`                   | VARCHAR       | UNIQUE, NOT NULL        | Folio de la infracción (ej. `INF-001`)                 |
| `nombreInfractor`         | VARCHAR       | NOT NULL                | Nombre de la persona infractora                        |
| `nombreOficial`           | VARCHAR       | NOT NULL                | Nombre del oficial que levantó la infracción           |
| `delegacion`              | VARCHAR       | NOT NULL                | Delegación donde ocurrió                               |
| `vehiculo`                | VARCHAR       | NOT NULL                | Tipo de vehículo (Sedán, Camioneta, Motocicleta, etc.) |
| `placas`                  | VARCHAR       | NOT NULL                | Placas del vehículo                                    |
| `detalleInfraccion`       | TEXT          | NOT NULL                | Descripción detallada de la infracción                 |
| `servicio`                | VARCHAR       | NOT NULL                | Tipo de servicio (Particular, Foráneo, Carga, Oficial) |
| `fechaHora`               | TIMESTAMP     | NOT NULL                | Fecha y hora del evento                                |
| `monto`                   | DECIMAL(10,2) | NOT NULL                | Monto de la multa                                      |
| `vehiculoDetenido`        | INT           | DEFAULT 0               | Cantidad de vehículos detenidos                        |
| `motocicletaDetenida`     | INT           | DEFAULT 0               | Cantidad de motocicletas detenidas                     |
| `consignacionVehiculo`    | INT           | DEFAULT 0               | Cantidad de vehículos consignados                      |
| `consignacionMotocicleta` | INT           | DEFAULT 0               | Cantidad de motocicletas consignadas                   |
| `soloInfraccion`          | BOOLEAN       | DEFAULT true            | `true` = sin consignación; `false` = con consignación  |
| `estatus`                 | ENUM          | DEFAULT 'PENDIENTE'     | Estado del ciclo de vida                               |
| `created_by_id`           | INTEGER       | FK → users.id, NOT NULL | Usuario que registró la infracción                     |

### Índices

| Índice | Columna(s)      | Tipo   | Propósito                                  |
| ------ | --------------- | ------ | ------------------------------------------ |
| PK     | `id`            | B-tree | Clave primaria                             |
| UNIQUE | `folio`         | B-tree | Unicidad + búsqueda por folio              |
| IDX    | `delegacion`    | B-tree | Filtros frecuentes por delegación          |
| IDX    | `nombreOficial` | B-tree | Búsquedas por nombre de oficial            |
| IDX    | `fechaHora`     | B-tree | Ordenamiento y filtros por rango de fechas |

### Regla de Negocio: `soloInfraccion`

> `soloInfraccion = true` implica que `consignacionVehiculo = 0` Y `consignacionMotocicleta = 0`.
> Esta invariante se valida en el servicio antes de cada `INSERT` y `UPDATE`.

---

## Tabla `bitacora`

| Columna       | Tipo      | Restricciones      | Descripción                                        |
| ------------- | --------- | ------------------ | -------------------------------------------------- |
| `id`          | INTEGER   | PK, AUTO_INCREMENT | Identificador                                      |
| `action`      | VARCHAR   | NOT NULL           | Código de la acción (ej. `INFRACCION_CREADA`)      |
| `description` | TEXT      | NULLABLE           | Descripción legible                                |
| `userId`      | INTEGER   | NULLABLE           | ID del usuario que realizó la acción               |
| `username`    | VARCHAR   | NULLABLE           | Username del actor                                 |
| `metadata`    | JSONB     | NULLABLE           | Datos adicionales (ej. `{ infraccionId: "uuid" }`) |
| `createdAt`   | TIMESTAMP | DEFAULT NOW()      | Fecha/hora del evento                              |

### Acciones Registradas

| Acción                   | Disparada por                       |
| ------------------------ | ----------------------------------- |
| `USER_LOGIN`             | `AuthService.signin()`              |
| `USER_LOGOUT`            | `AuthService.logout()`              |
| `INFRACCION_CREADA`      | `InfraccionesService.create()`      |
| `INFRACCION_ACTUALIZADA` | `InfraccionesService.update()`      |
| `INFRACCION_ELIMINADA`   | `InfraccionesService.deleteInfra()` |
| `USER_CREATED`           | `UsersService.create()`             |
| `USER_ROLE_UPDATED`      | `UsersService.updateRole()`         |
| `USER_DELETED`           | `UsersService.remove()`             |

---

## Configuración TypeORM

| Entorno     | `synchronize` | `logging` | `migrationsRun` |
| ----------- | :-----------: | :-------: | :-------------: |
| development |    `true`     |  `true`   |     `false`     |
| production  |    `false`    |  `false`  |     `true`      |

> **Importante:** En producción, `synchronize: false` previene modificaciones automáticas al esquema. Las migraciones se ejecutan automáticamente al arrancar (`migrationsRun: true`).
