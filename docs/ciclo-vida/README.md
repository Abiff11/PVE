# Ciclo de Vida del Desarrollo de Software — PVE

## Índice de Fases

| Fase | Documento | Descripción |
|------|-----------|-------------|
| 1. Planificación | [`planificacion.md`](./planificacion.md) | Definición del proyecto, objetivos y alcance |
| 2. Análisis de Requisitos | [`analisis-requisitos.md`](./analisis-requisitos.md) | Requisitos funcionales y no funcionales |
| 3. Diseño | [`diseno.md`](./diseno.md) | Arquitectura, modelo de datos y diseño de interfaz |
| 4. Desarrollo | [`desarrollo.md`](./desarrollo.md) | Estado actual del código e implementación |
| 5. Pruebas | [`pruebas.md`](./pruebas.md) | Estrategia de pruebas y cobertura |
| 6. Implementación | [`implementacion.md`](./implementacion.md) | Despliegue y configuración de producción |
| 7. Mantenimiento | [`mantenimiento.md`](./mantenimiento.md) | Operaciones, monitoreo y mejoras |
| — | [`faltantes.md`](./faltantes.md) | Identificación de faltantes y plan de desarrollo |

---

## Visión General del Proyecto

**PVE (Policía Vial Estatal)** es un sistema de gestión de infracciones de tránsito que permite:

- Registro y consulta de infracciones de tránsito
- Gestión de vehículos asegurados en depósitos de encierros
- Control de usuarios con roles diferenciados
- Auditoría completa de todas las operaciones

### Stakeholders

| Stakeholder | Rol | Interés |
|-------------|-----|---------|
| Administradores del sistema | `admin` | Gestión completa de usuarios y datos |
| Directores de la corporación | `director` | KPIs y reportes ejecutivos |
| Capturistas de infracciones | `capturista` | Registro de nuevas infracciones |
| Actualizadores de estatus | `actualizador` | Actualización de estado de infracciones |
| Personal de encierros | `encierro` | Gestión de vehículos asegurados |

---

## Tecnologías Utilizadas

| Capa | Tecnología | Versión |
|------|------------|---------|
| Backend | NestJS | 11.x |
| Frontend | React | 19.x |
| Base de datos | PostgreSQL | 14+ |
| ORM | TypeORM | 0.3.x |
| Autenticación | JWT (passport-jwt) | — |
| Build tools | Vite | 7.x |

> Para más detalles técnicos, consulta los documentos específicos en la carpeta principal `docs/`.
