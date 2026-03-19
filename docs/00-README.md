---
alias: "Índice"
---

# PVE — Documentación del Proyecto

**Sistema de Gestión de Infracciones de Tránsito**

---

## Índice General

### 📚 Documentación Técnica

| # | Documento | Descripción |
|---| ---------- | ----------- |
| 01 | [[01-arquitectura\|Arquitectura]] | Visión general del sistema, módulos y flujo de datos |
| 02 | [[02-api\|API]] | Referencia completa de endpoints REST del backend |
| 03 | [[03-base-de-datos\|Base de Datos]] | Modelo de datos, entidades y relaciones |
| 04 | [[04-frontend\|Frontend]] | Estructura del SPA, rutas y componentes principales |
| 05 | [[05-configuracion\|Configuración]] | Variables de entorno, arranque local y despliegue |

### 🔄 Ciclo de Vida del Desarrollo

| # | Fase | Documento | Descripción |
|---|------|------------|-------------|
| 06 | 1. Planificación | [[06-planificacion\|Planificación]] | Definición del proyecto, objetivos y alcance |
| 07 | 2. Análisis de Requisitos | [[07-analisis-requisitos\|Análisis de Requisitos]] | Requisitos funcionales y no funcionales |
| 08 | 3. Diseño | [[08-diseno\|Diseño]] | Arquitectura, modelo de datos y diseño de interfaz |
| 09 | 4. Desarrollo | [[09-desarrollo\|Desarrollo]] | Estado actual del código e implementación |
| 10 | 5. Pruebas | [[10-pruebas\|Pruebas]] | Estrategia de pruebas y cobertura |
| 11 | 6. Implementación | [[11-implementacion\|Implementación]] | Despliegue y configuración de producción |
| 12 | 7. Mantenimiento | [[12-mantenimiento\|Mantenimiento]] | Operaciones, monitoreo y mejoras |
| 13 | — | [[13-presupuesto\|Presupuesto]] | Estimación de costos y recursos |
| 14 | — | [[14-faltantes\|Faltantes]] | Identificación de faltantes y plan de desarrollo |

---

## Descripción General

PVE es una aplicación web full-stack para el registro, consulta y gestión de infracciones de la Policia Vial Estatal. Permite a distintos roles (admin, director, capturista, actualizador) operar sobre los registros con permisos diferenciados.

### Stack Tecnológico

| Capa | Tecnología |
| ---- | ----------- |
| Backend | NestJS 11 + TypeORM + PostgreSQL |
| Frontend | React 19 + Vite + React Router 7 |
| Autenticación | JWT (passport-jwt) + bcrypt |
| Validación | class-validator + class-transformer |

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

---

## 🚀 Inicio Rápido

### Requisitos Previos

- Node.js 18+
- PostgreSQL 14+
- npm o yarn

### Instalación

```bash
# Backend
cd Back/project-pve
npm install

# Frontend
cd Front/project-PVE
npm install
```

Consulta [[05-configuracion|Configuración]] para más detalles sobre la configuración del entorno.
