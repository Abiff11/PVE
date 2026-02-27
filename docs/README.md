# PVE — Documentación del Proyecto

**Sistema de Gestión de Infracciones de Tránsito**

---

## Índice

| Documento                              | Descripción                                          |
| -------------------------------------- | ---------------------------------------------------- |
| [arquitectura.md](./arquitectura.md)   | Visión general del sistema, módulos y flujo de datos |
| [api.md](./api.md)                     | Referencia completa de endpoints REST del backend    |
| [base-de-datos.md](./base-de-datos.md) | Modelo de datos, entidades y relaciones              |
| [frontend.md](./frontend.md)           | Estructura del SPA, rutas y componentes principales  |
| [configuracion.md](./configuracion.md) | Variables de entorno, arranque local y despliegue    |

---

## Descripción General

PVE es una aplicación web full-stack para el registro, consulta y gestión de infracciones de la Policia Vial Estatal. Permite a distintos roles (admin, director, capturista, actualizador) operar sobre los registros con permisos diferenciados.

### Stack Tecnológico

| Capa          | Tecnología                          |
| ------------- | ----------------------------------- |
| Backend       | NestJS 11 + TypeORM + PostgreSQL    |
| Frontend      | React 19 + Vite + React Router 7    |
| Autenticación | JWT (passport-jwt) + bcrypt         |
| Validación    | class-validator + class-transformer |

---

## Estructura del Repositorio

```
PVE/
├── Back/
│   └── project-pve/          # API REST (NestJS)
│       └── src/
│           ├── auth/          # Autenticación JWT
│           ├── bitacora/      # Auditoría de acciones
│           ├── config/        # Entorno y TypeORM
│           ├── infracciones/  # Módulo principal
│           ├── seeds/         # Datos de prueba
│           ├── scripts/       # Utilidades de mantenimiento
│           └── users/         # Gestión de usuarios
├── Front/
│   └── project-PVE/          # SPA (React + Vite)
│       └── src/
│           ├── components/    # Componentes reutilizables
│           ├── context/       # Contexto de autenticación
│           ├── hooks/         # Custom hooks
│           ├── pages/         # Páginas de la aplicación
│           ├── router/        # Definición de rutas
│           └── services/      # Clientes HTTP
└── docs/                     # Esta documentación
```
