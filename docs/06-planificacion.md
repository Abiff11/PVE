---
alias: "Planificación"
---

# Fase 1: Planificación

## 1.1 Definición del Proyecto

**Nombre del Proyecto:** PVE — Sistema de Gestión de Infracciones de Tránsito

**Tipo de Proyecto:** Aplicación Web Full-Stack (SPA + REST API)

**Descripción:** Sistema integral para el registro, consulta y gestión de infracciones de tránsito de la Policía Vial Estatal, incluyendo la administración de vehículos asegurados en depósitos de encierros.

---

## 1.2 Objetivos del Proyecto

### Objetivos Principales

| Objetivo | Descripción | Prioridad |
|----------|-------------|----------|
| OG-01 | Centralizar el registro de infracciones de tránsito | Alta |
| OG-02 | Controlar el acceso mediante roles diferenciados | Alta |
| OG-03 | Gestionar el ciclo de vida de vehículos asegurados | Alta |
| OG-04 | Proporcionar métricas e indicadores (KPIs) para directivos | Media |
| OG-05 | Mantener auditoría completa de todas las operaciones | Alta |

### Objetivos Específicos

| Objetivo | Métrica de Éxito |
|----------|------------------|
|OE-01: Registro de infracciones|Tiempo de registro < 2 minutos por infracción|
|OE-02: Consulta de infracciones|Respuesta de búsqueda < 1 segundo|
|OE-03: Gestión de encierros|Control completo de ingreso/salida de vehículos|
|OE-04: Reportes ejecutivos|Dashboard con KPIs actualizado en tiempo real|

---

## 1.3 Alcance del Proyecto

### Funcionalidades Incluidas (MVP)

#### Módulo de Infracciones
- [x] Registro de nuevas infracciones con todos los datos del infractor y vehículo
- [x] Consulta paginada con filtros (delegación, oficial, fecha)
- [x] Actualización de estatus (PENDIENTE → PAGADA)
- [x] Eliminación de infracciones (solo admin/director)
- [x] Cálculo de KPIs por delegación y rango de fechas

#### Módulo de Encierros
- [x] Registro de vehículos asegurados
- [x] Consulta de vehículos en depósito
- [x] Control de ingreso y egreso de vehículos
- [x] Integración con información de la infracción original

#### Módulo de Usuarios
- [x] Creación y gestión de usuarios
- [x] Asignación de roles (admin, director, capturista, actualizador, encierro)
- [x] Cambio de roles

#### Módulo de Seguridad
- [x] Autenticación mediante JWT
- [x] Autorización basada en roles
- [x] Bitácora de auditoría

### Funcionalidades Futuras (Roadmap)

| Funcionalidad | Descripción | Prioridad |
|---------------|-------------|----------|
| Exportación a PDF | Generación de reportes en PDF | Media |
| Notificaciones | Notificaciones por email/SMS | Baja |
| Dashboard avanzado | Gráficos y visualizaciones | Media |
| API pública | Integración con sistemas externos | Baja |

---

## 1.4 Restricciones

### Restricciones Técnicas

| Restricción | Descripción |
|-------------|-------------|
| RT-01 | PostgreSQL 14+ como motor de base de datos |
| RT-02 | Node.js 18+ en el servidor |
| RT-03 | Navegadores modernos (Chrome, Firefox, Edge) |
| RT-04 | Sin framework de CSS externo (estilos custom) |

### Restricciones de Negocio

| Restricción | Descripción |
|-------------|-------------|
| RN-01 | Un usuario no puede tener más de un rol |
| RN-02 | El folio de infracción debe ser único globalmente |
| RN-03 | No se puede eliminar una infracción con estatus PAGADA |
| RN-04 | Solo admin puede gestionar usuarios |

---

## 1.5 Supuestos

| Supuesto | Descripción |
|----------|-------------|
| S-01 | Existe infraestructura de base de datos PostgreSQL disponible |
| S-02 | Los usuarios tienen conocimientos básicos de navegación web |
| S-03 | La conexión a internet está disponible en los puntos de trabajo |
| S-04 | Se cuenta con certificados SSL para producción |

---

## 1.6 Riesgos Identificados

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| R-01: Pérdida de datos | Baja | Alto | Backup automático de BD |
| R-02: Acceso no autorizado | Media | Alto | Roles y JWT seguros |
| R-03: Sobrecarga del servidor | Baja | Medio | Escalabilidad horizontal |
| R-04: Datos inconsistentes | Media | Alto | Validaciones en frontend y backend |

---

## 1.7 Cronograma Tentativo (Semanas)

```
Semana 1-2:   Análisis de requisitos y diseño
Semana 3-5:   Desarrollo del Backend
Semana 6-8:   Desarrollo del Frontend
Semana 9:     Integración y pruebas
Semana 10:    Despliegue y capacitación
```

> Este cronograma es una estimación inicial basada en la complejidad del proyecto.

---

## 1.8 Recursos Necesarios

### Recursos Humanos

| Rol | Cantidad | Responsabilidad |
|-----|----------|-----------------|
| Desarrollador Full-Stack | 1-2 | Desarrollo completo |
| DBA | 1 (parcial) | Configuración y mantenimiento de BD |
| Tester | 1 (parcial) | Pruebas de integración |

### Recursos Técnicos

| Recurso | Especificación |
|---------|----------------|
| Servidor Backend | 2 vCPU, 4GB RAM, 50GB SSD |
| Servidor Frontend | 1 vCPU, 2GB RAM, 10GB SSD |
| Base de datos | PostgreSQL 14+, 10GB mínimo |

---

## 1.9 milestone

| Hito | Entregable | Criterio de Éxito |
|------|-------------|-------------------|
| H-01: Inicio | Documento de planificación | Aprobación del stakeholder |
| H-02: Análisis | Documento de requisitos | Requisitos aprobados |
| H-03: Diseño | Arquitectura y modelo de datos | Diagramas aprobados |
| H-04: Desarrollo Alpha | Backend funcional | CRUD de infracciones working |
| H-05: Desarrollo Beta | Frontend funcional | UI completa integrada |
| H-06: Pruebas | Reporte de pruebas | < 5 defectos críticos |
| H-07: Producción | Sistema en vivo | Disponibilidad 99% |
