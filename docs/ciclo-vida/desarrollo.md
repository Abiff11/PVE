# Fase 4: Desarrollo

## 4.1 Estado Actual del Proyecto

### Resumen de Implementación

| Módulo | Estado | Complejidad | Líneas Estimadas |
|--------|--------|-------------|------------------|
| Auth | ✅ Completo | Alta | ~500 |
| Infracciones | ✅ Completo | Alta | ~2000 |
| Encierros | ✅ Completo | Media | ~800 |
| Usuarios | ✅ Completo | Media | ~700 |
| Bitácora | ✅ Completo | Baja | ~300 |
| Frontend | ✅ Completo | Alta | ~3000 |

---

## 4.2 Estructura del Proyecto

```
PVE/
├── Back/
│   └── project-pve/
│       ├── src/
│       │   ├── auth/                  # Módulo de autenticación
│       │   │   ├── auth.controller.ts
│       │   │   ├── auth.module.ts
│       │   │   ├── auth.service.ts
│       │   │   ├── decorators/
│       │   │   │   └── roles.decorators.ts
│       │   │   ├── roles/
│       │   │   │   └── roles.guard.ts
│       │   │   └── strategies/
│       │   │       └── jwt.strategy.ts
│       │   │
│       │   ├── bitacora/              # Módulo de auditoría
│       │   │   ├── bitacora.controller.ts
│       │   │   ├── bitacora.module.ts
│       │   │   ├── bitacora.service.ts
│       │   │   ├── dto/
│       │   │   └── entities/
│       │   │
│       │   ├── encierro/              # Módulo de depósitos
│       │   │   ├── encierro.controller.ts
│       │   │   ├── encierro.module.ts
│       │   │   ├── encierro.service.ts
│       │   │   ├── dto/
│       │   │   └── entities/
│       │   │
│       │   ├── infracciones/          # Módulo principal
│       │   │   ├── infracciones.controller.ts
│       │   │   ├── infracciones.module.ts
│       │   │   ├── infracciones.service.ts
│       │   │   ├── dto/
│       │   │   └── entities/
│       │   │
│       │   ├── users/                 # Gestión de usuarios
│       │   │   ├── users.controller.ts
│       │   │   ├── users.module.ts
│       │   │   ├── users.service.ts
│       │   │   ├── dto/
│       │   │   └── entities/
│       │   │
│       │   ├── config/                # Configuración
│       │   │   ├── environment.ts
│       │   │   └── typeorm.ts
│       │   │
│       │   ├── scripts/               # Utilidades
│       │   ├── seeds/                # Datos de prueba
│       │   ├── app.module.ts
│       │   ├── app.controller.ts
│       │   ├── app.service.ts
│       │   ├── catalogos.ts
│       │   └── main.ts
│       │
│       ├── package.json
│       ├── tsconfig.json
│       ├── nest-cli.json
│       └── .env.development
│
├── Front/
│   └── project-PVE/
│       ├── src/
│       │   ├── components/
│       │   │   ├── FormInfraccion/
│       │   │   ├── KPI/
│       │   │   ├── Layout/
│       │   │   ├── Table/
│       │   │   └── Users/
│       │   │
│       │   ├── context/
│       │   │   ├── AuthContext.js
│       │   │   └── AuthProvider.jsx
│       │   │
│       │   ├── hooks/
│       │   │   └── useAuth.js
│       │   │
│       │   ├── pages/
│       │   │   ├── Bitacora/
│       │   │   ├── Dashboard/
│       │   │   ├── EncierroDetail/
│       │   │   ├── EncierroRegistro/
│       │   │   ├── Encierros/
│       │   │   ├── InfraccionDetail/
│       │   │   ├── InfraccionesList/
│       │   │   ├── Login/
│       │   │   ├── NuevaInfraccion/
│       │   │   └── Users/
│       │   │
│       │   ├── router/
│       │   │   └── AppRouter.jsx
│       │   │
│       │   ├── services/
│       │   │   ├── apiClient.js
│       │   │   ├── auth.js
│       │   │   ├── bitacora.js
│       │   │   ├──encierros.js
│       │   │   ├── infracciones.js
│       │   │   └── users.js
│       │   │
│       │   ├── catalogos.js
│       │   ├── App.jsx
│       │   ├── App.css
│       │   ├── main.jsx
│       │   └── index.css
│       │
│       ├── package.json
│       ├── vite.config.js
│       ├── index.html
│       └── .env
│
└── docs/                              # Documentación
    ├── ciclo-vida/
    ├── api.md
    ├── arquitectura.md
    ├── base-de-datos.md
    ├── configuracion.md
    └── frontend.md
```

---

## 4.3 Dependencias del Proyecto

### Backend (package.json)

```json
{
  "dependencies": {
    "@nestjs/common": "^11.0.1",
    "@nestjs/config": "^4.0.3",
    "@nestjs/core": "^11.0.1",
    "@nestjs/jwt": "^11.0.2",
    "@nestjs/mapped-types": "^2.1.0",
    "@nestjs/passport": "^11.0.5",
    "@nestjs/platform-express": "^11.0.1",
    "@nestjs/typeorm": "^11.0.0",
    "bcrypt": "^6.0.0",
    "class-transformer": "^0.5.1",
    "class-validator": "^0.14.3",
    "dotenv": "^17.3.1",
    "passport": "^0.7.0",
    "passport-jwt": "^4.0.1",
    "pg": "^8.19.0",
    "reflect-metadata": "^0.2.2",
    "rxjs": "^7.8.1",
    "typeorm": "^0.3.28"
  }
}
```

### Frontend (package.json)

```json
{
  "dependencies": {
    "jwt-decode": "^4.0.0",
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "react-router-dom": "^7.13.1"
  }
}
```

---

## 4.4 Componentes del Frontend

### Páginas Implementadas

| Página | Ruta | Roles | Descripción |
|--------|------|-------|-------------|
| Login | `/login` | Público | Formulario de autenticación |
| Dashboard | `/dashboard` | admin, director | KPIs y métricas |
| Infracciones List | `/infracciones` | Todos | Lista paginada con filtros |
| Nueva Infracción | `/infracciones/nueva` | admin, capturista | Formulario de registro |
| Infracción Detail | `/infracciones/:folio` | Todos | Ver/editar详情 |
| Encierros | `/encierros` | Todos | Lista de depósitos |
| Encierro Detail | `/encierros/:folio` | Todos | Ver/editar encierro |
| Usuarios | `/usuarios` | admin | Gestión de usuarios |
| Bitácora | `/bitacora` | admin | Historial de acciones |

### Servicios API

| Servicio | Métodos | Descripción |
|----------|---------|-------------|
| apiClient.js | request, apiRequest | Cliente HTTP centralizado |
| auth.js | signin, logoutRequest | Autenticación |
| infracciones.js | list, getByFolio, create, update, remove, getKpis | Infracciones |
| encierros.js | list, getByFolio, lookupByFolio, create, update | Encierros |
| users.js | getUsers, createUser, updateRole, deleteUser | Usuarios |
| bitacora.js | getBitacora | Bitácora |

---

## 4.5 Decisiones Técnicas Implementadas

### Backend

| Decisión | Justificación |
|----------|---------------|
| NestJS | Framework opinionado, buena organización modular |
| TypeORM | Integración nativa con NestJS, migrations |
| JWT | Stateless, adecuado para SPA |
| bcrypt (10 rondas) | Balance seguridad/rendimiento |
| UUID para IDs | Distribución, sin colisiones |
| Índices en BD | Optimización de búsquedas frecuentes |

### Frontend

| Decisión | Justificación |
|----------|---------------|
| React 19 | Latest version con concurrent features |
| Vite | Build rápido, HMR eficiente |
| React Router 7 | Routing moderno |
| Context + Hooks | Estado global ligero |
| CSS custom | Sin dependencias externas |

---

## 4.6 Funcionalidades Clave Implementadas

### Validaciones de Negocio

```typescript
// Validación: folio único
const existe = await repo.findOne({ where: { folioInfraccion } });
if (existe) throw new BadRequestException('Folio duplicado');

// Validación: coherencia soloInfraccion
if (dto.soloInfraccion && (dto.consignacionVehiculo > 0 || dto.consignacionMotocicleta > 0)) {
  throw new BadRequestException('soloInfraccion no puede ser true si hay consignaciones');
}
```

### Paginación

```typescript
// Query params: page, pageSize
const pageNumber = page > 0 ? page : 1;
const take = pageSize > 0 ? pageSize : 10;
qb.skip((pageNumber - 1) * take).take(take);
const [data, total] = await qb.getManyAndCount();
```

### Bitácora

```typescript
// Logging automático de acciones
await this.bitacoraService.log('INFRACCION_CREADA', {
  description: `Se creó la infracción ${folio}`,
  userId: actor?.id,
  username: actor?.username,
  metadata: { infraccionId: id }
});
```

---

## 4.7 Datos de Prueba (Seed)

El proyecto incluye un script de seed que crea usuarios de prueba:

| Username | Password | Rol |
|----------|----------|-----|
| admin | Admin123! | admin |
| director | Director123! | director |
| capturista | Capturista123! | capturista |
| actualizador | Actualizador123! | actualizador |

> Para ejecutar el seed: `npm run seed` en el directorio Back/project-pve
