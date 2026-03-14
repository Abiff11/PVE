# Fase 3: Diseño

## 3.1 Arquitectura del Sistema

> Para detalles completos de la arquitectura técnica, consulta [`../arquitectura.md`](../arquitectura.md)

### Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────────────┐
│                           CLIENTE (Browser)                          │
│                                                                      │
│   React 19 SPA (Vite)                                               │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│   │  Login   │  │Dashboard │  │Infracc.  │  │Encierros │       │
│   └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
│                                                                      │
│   AuthContext (JWT en localStorage)                                 │
└────────────────────────────┬────────────────────────────────────────┘
                             │ HTTP/JSON + Bearer Token
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         SERVIDOR (NestJS 11)                         │
│                                                                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────┐ │
│  │   Auth   │  │Infracc.  │  │Encierros │  │  Users   │  │Bit │ │
│  │ Module   │  │ Module   │  │ Module   │  │  Module  │  │ác. │ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └────┘ │
│                                                                      │
│  Guards: AuthGuard('jwt') + RolesGuard                              │
└────────────────────────────┬────────────────────────────────────────┘
                             │ TypeORM
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         PostgreSQL                                   │
│                                                                      │
│   users  ──< infracciones    ──< encierros    bitacora              │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 3.2 Diseño de Interfaz de Usuario

### Estructura de Layouts

#### Layout Público (Login)
- Fondo con gradiente institucional
- Formulario de login centrado
- Logo de la institución
- Mensajes de error claros

#### Layout Privado
```
┌─────────────────────────────────────────────────────────────┐
│ HEADER: Logo + Nombre usuario + Rol + Cerrar sesión        │
├─────────────────────────────────────────────────────────────┤
│ SIDEBAR        │              CONTENIDO                    │
│                │                                             │
│ • Dashboard    │   [Breadcrumb]                              │
│ • Infracciones│                                             │
│ • Encierros   │   [Título de página]                        │
│ • Usuarios    │                                             │
│   (admin)     │   [Contenido principal]                     │
│ • Bitácora    │                                             │
│   (admin)     │                                             │
│                │                                             │
└────────────────┴────────────────────────────────────────────┘
```

### Wireframes de Pantallas Principales

#### Login
```
┌─────────────────────────────────────────┐
│                                         │
│         [LOGO]                          │
│     Policía Vial Estatal               │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ Username                        │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ Password                        │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │        Iniciar Sesión          │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

#### Dashboard (KPIs)
```
┌─────────────────────────────────────────────────────────────┐
│ Dashboard                                    [Usuario: X]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ Total    │  │ Pendiente│  │  Pagadas │  │ Monto    │  │
│  │  150     │  │    80    │  │    70    │  │$180,000  │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ Top Delegaciones                                     │  │
│  │ • Plaza: 50                                          │  │
│  │ • Norte: 35                                          │  │
│  │ • Sur: 25                                            │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Lista de Infracciones
```
┌─────────────────────────────────────────────────────────────┐
│ Infracciones                              [+ Nueva]        │
├─────────────────────────────────────────────────────────────┤
│ Filtros:                                                  │
│ [Delegación ▼] [Oficial____] [Fecha desde] [Fecha hasta] │
│                        [Aplicar filtros]                   │
├─────────────────────────────────────────────────────────────┤
│ Folio     │ Fecha    │ Infractor   │ Oficial  │ Estatus │
├───────────┼──────────┼──────────────┼──────────┼─────────┤
│ INF-001   │2026-01-15│Juan Pérez   │Of. García│PENDIENTE│
│ INF-002   │2026-01-16│Maria López  │Of. Martínez│PAGADA│
│ ...       │...       │...          │...       │...      │
├─────────────────────────────────────────────────────────────┤
│ < Anterior 1 2 3 ... 10 Siguiente >                       │
└─────────────────────────────────────────────────────────────┘
```

### Paleta de Colores

| Color | Hex | Uso |
|-------|-----|-----|
| Primary | `#1a365d` | Headers, botones principales |
| Secondary | `#2c5282` | Links, acentos |
| Success | `#38a169` | Estados exitosos, PAGADA |
| Warning | `#d69e2e` | Estados pendientes |
| Danger | `#e53e3e` | Errores, eliminación |
| Background | `#f7fafc` | Fondo general |
| Surface | `#ffffff` | Tarjetas, formularios |
| Text Primary | `#1a202c` | Texto principal |
| Text Secondary | `#718096` | Texto secundario |

### Tipografía

| Elemento | Font | Tamaño | Peso |
|----------|------|--------|------|
| H1 | System UI | 24px | 700 |
| H2 | System UI | 20px | 600 |
| H3 | System UI | 16px | 600 |
| Body | System UI | 14px | 400 |
| Small | System UI | 12px | 400 |

---

## 3.3 Diseño de Base de Datos

### Modelo Entidad-Relación

```
┌──────────────────────────────────────────────────────────────┐
│                          users                               │
├──────────────────────────────────────────────────────────────┤
│ id          INTEGER PK AUTO_INCREMENT                        │
│ nombre      VARCHAR NOT NULL                                 │
│ apellido    VARCHAR NOT NULL                                 │
│ username    VARCHAR UNIQUE NOT NULL                         │
│ password    VARCHAR NOT NULL (bcrypt)                       │
│ telefono    VARCHAR NOT NULL                                 │
│ delegacion  VARCHAR NOT NULL                                 │
│ role        ENUM('admin','director','capturista',           │
│                  'actualizador','encierro') NOT NULL        │
└──────────────────────────┬───────────────────────────────────┘
                           │ 1:N
                           ▼
┌──────────────────────────────────────────────────────────────┐
│                       infracciones                           │
├──────────────────────────────────────────────────────────────┤
│ id                    UUID PK                                │
│ folio_infraccion      VARCHAR UNIQUE NOT NULL               │
│ fecha                 DATE NOT NULL                          │
│ hora                  TIME NOT NULL                          │
│ nombre_infractor      VARCHAR NOT NULL                       │
│ ... (otros campos del vehículo e infracción)               │
│ monto                 DECIMAL(12,2) NOT NULL                │
│ estatus               ENUM('PENDIENTE','PAGADA')            │
│ created_by_id         INTEGER FK → users.id NOT NULL        │
└──────────────────────────┬───────────────────────────────────┘
                           │ 1:1
                           ▼
┌──────────────────────────────────────────────────────────────┐
│                        encierros                             │
├──────────────────────────────────────────────────────────────┤
│ id                UUID PK                                    │
│ folio_infraccion  VARCHAR FK UNIQUE → infracciones          │
│ fecha_ingreso     DATE NOT NULL                             │
│ encierro          VARCHAR NOT NULL                          │
│ nombre_quien_recibe VARCHAR NOT NULL                         │
│ servicio_grua     VARCHAR NULLABLE                          │
│ fecha_liberacion  DATE NULLABLE                             │
│ fecha_salida      DATE NULLABLE                             │
│ nombre_quien_entrega VARCHAR NULLABLE                       │
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

> Para detalles completos del modelo de datos, consulta [`../base-de-datos.md`](../base-de-datos.md)

---

## 3.4 Diseño de API REST

### Endpoints Principales

| Método | Endpoint | Descripción | Roles |
|--------|----------|-------------|-------|
| POST | /auth/signin | Inicio de sesión | Público |
| POST | /auth/logout | Cierre de sesión | Todos |
| GET | /infracciones | Lista paginada | Todos |
| POST | /infracciones | Crear infracción | admin, capturista |
| GET | /infracciones/:folio | Ver detalle | Todos |
| PATCH | /infracciones/:folio | Actualizar | admin, actualizador |
| DELETE | /infracciones/:folio | Eliminar | admin, director |
| GET | /infracciones/kpis/resumen | KPIs | admin, director |
| GET | /encierros | Lista de encierros | Todos |
| POST | /encierros | Crear encierro | admin, encierro |
| GET | /encierros/:folio | Ver encierro | Todos |
| PATCH | /encierros/:folio | Actualizar | admin, encierro |
| GET | /encierros/lookup/:folio | Buscar por folio | Todos |
| GET | /users | Lista de usuarios | admin |
| POST | /users | Crear usuario | admin |
| PATCH | /users/:id/role | Cambiar rol | admin |
| DELETE | /users/:id | Eliminar usuario | admin |
| GET | /bitacora | Ver bitácora | admin |

> Para referencia completa de la API, consulta [`../api.md`](../api.md)

---

## 3.5 Diseño de Seguridad

### Flujo de Autenticación

```
1. Usuario envía credenciales → POST /auth/signin
2. Backend valida usuario y contraseña con bcrypt
3. Backend firma JWT con { sub, username, role }
4. Frontend guarda token en localStorage
5. Frontend incluye token en cada request: Authorization: Bearer <token>
6. Backend valida JWT en cada request protegido
7. Backend verifica rol contra RolesGuard
```

### Matriz de Permisos

| Funcionalidad | admin | director | capturista | actualizador | encierro |
|---------------|:-----:|:--------:|:----------:|:------------:|:--------:|
| Login/Logout | ✅ | ✅ | ✅ | ✅ | ✅ |
| Ver Dashboard KPIs | ✅ | ✅ | ❌ | ❌ | ❌ |
| Crear Infracción | ✅ | ❌ | ✅ | ❌ | ❌ |
| Ver Infracciones | ✅ | ✅ | ✅ | ✅ | ✅ |
| Actualizar Infracción | ✅ | ❌ | ❌ | ✅ | ❌ |
| Eliminar Infracción | ✅ | ✅ | ❌ | ❌ | ❌ |
| Crear Encierro | ✅ | ❌ | ❌ | ❌ | ✅ |
| Ver Encierros | ✅ | ✅ | ✅ | ✅ | ✅ |
| Actualizar Encierro | ✅ | ❌ | ❌ | ❌ | ✅ |
| Gestionar Usuarios | ✅ | ❌ | ❌ | ❌ | ❌ |
| Ver Bitácora | ✅ | ❌ | ❌ | ❌ | ❌ |
