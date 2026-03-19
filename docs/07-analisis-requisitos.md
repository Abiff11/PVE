---
alias: "Análisis de Requisitos"
---

# Fase 2: Análisis de Requisitos

## 2.1 Requisitos Funcionales

### Módulo de Autenticación

| ID | Requisito | Descripción | Prioridad |
|----|-----------|-------------|-----------|
| RF-AUTH-01 | Inicio de sesión | El sistema debe permitir a los usuarios autenticarse con username y password | Alta |
| RF-AUTH-02 | Cierre de sesión | El sistema debe registrar el cierre de sesión en la bitácora | Alta |
| RF-AUTH-03 | Sesión persistente | El sistema debe mantener la sesión mediante JWT tokens | Alta |
| RF-AUTH-04 | Protección de rutas | El sistema debe restringir el acceso a rutas según el rol del usuario | Alta |

### Módulo de Infracciones

| ID | Requisito | Descripción | Prioridad |
|----|-----------|-------------|-----------|
| RF-INF-01 | Crear infracción | El sistema debe permitir registrar una nueva infracción con todos los datos del infractor y vehículo | Alta |
| RF-INF-02 | Listar infracciones | El sistema debe mostrar una lista paginada de infracciones con filtros por delegación, oficial y fecha | Alta |
| RF-INF-03 | Consultar detalle | El sistema debe mostrar el detalle completo de una infracción | Alta |
| RF-INF-04 | Actualizar estatus | El sistema debe permitir cambiar el estatus de una infracción (PENDIENTE/PAGADA) | Alta |
| RF-INF-05 | Eliminar infracción | El sistema debe permitir eliminar una infracción (solo admin/director) | Media |
| RF-INF-06 | Folio único | El sistema debe validar que el folio de infracción sea único | Alta |
| RF-INF-07 | Validar coherencia | El sistema debe validar que `soloInfraccion` sea incompatible con consignaciones | Alta |
| RF-INF-08 | Calcular KPIs | El sistema debe calcular indicadores: total, por estatus, por delegación | Alta |

### Módulo de Encierros

| ID | Requisito | Descripción | Prioridad |
|----|-----------|-------------|-----------|
| RF-ENC-01 | Registrar encierro | El sistema debe permitir registrar el ingreso de un vehículo al depósito | Alta |
| RF-ENC-02 | Consultar encierros | El sistema debe mostrar lista de vehículos en depósito con filtros | Alta |
| RF-ENC-03 | Buscar por folio | El sistema debe permitir buscar información de encierro por folio de infracción | Alta |
| RF-ENC-04 | Actualizar encierro | El sistema debe permitir actualizar datos del encierro (fecha liberación, quien entrega) | Alta |
| RF-ENC-05 | Eliminar encierro | El sistema debe permitir eliminar un registro de encierro (solo admin) | Media |
| RF-ENC-06 | Lookup de infracción | El sistema debe mostrar información de la infracción asociada al encierro | Alta |

### Módulo de Usuarios

| ID | Requisito | Descripción | Prioridad |
|----|-----------|-------------|-----------|
| RF-USR-01 | Crear usuario | El sistema debe permitir crear nuevos usuarios (solo admin) | Alta |
| RF-USR-02 | Listar usuarios | El sistema debe mostrar todos los usuarios registrados | Alta |
| RF-USR-03 | Actualizar rol | El sistema debe permitir cambiar el rol de un usuario | Alta |
| RF-USR-04 | Eliminar usuario | El sistema debe permitir eliminar un usuario (solo admin) | Alta |
| RF-USR-05 | Hash de contraseña | Las contraseñas deben almacenarse hasheadas con bcrypt | Alta |

### Módulo de Bitácora

| ID | Requisito | Descripción | Prioridad |
|----|-----------|-------------|-----------|
| RF-BIT-01 | Registrar acciones | El sistema debe registrar todas las acciones importantes en la bitácora | Alta |
| RF-BIT-02 | Consultar bitácora | El sistema debe mostrar el historial de acciones (solo admin) | Alta |
| RF-BIT-03 | Filtrar por fecha | El sistema debe permitir filtrar la bitácora por rango de fechas | Media |

---

## 2.2 Requisitos No Funcionales

### Rendimiento

| ID | Requisito | Criterio |
|----|-----------|----------|
| RNF-REND-01 | Tiempo de respuesta | Las consultas deben responder en menos de 1 segundo |
| RNF-REND-02 | Paginación | Soporte para paginación de hasta 1000 registros |
| RNF-REND-03 | Concurrencia | Soporte para al menos 50 usuarios simultáneos |

### Seguridad

| ID | Requisito | Criterio |
|----|-----------|----------|
| RNF-SEG-01 | Contraseñas | Almacenamiento con bcrypt (10 rondas) |
| RNF-SEG-02 | Tokens | JWT con expiración configurable |
| RNF-SEG-03 | Validación | Validación de datos en frontend y backend |
| RNF-SEG-04 | CORS | Configuración de orígenes permitidos |

### Usabilidad

| ID | Requisito | Criterio |
|----|-----------|----------|
| RNF-USAB-01 | Navegadores | Compatibilidad con Chrome, Firefox, Edge (versiones actuales) |
| RNF-USAB-02 | Diseño responsive | Adaptable a pantallas de escritorio |
| RNF-USAB-03 | Mensajes claros | Feedback claro para el usuario en todas las operaciones |

### Mantenibilidad

| ID | Requisito | Criterio |
|----|-----------|----------|
| RNF-MANT-01 | Estructura | Código modular y organizado por funcionalidad |
| RNF-MANT-02 | Documentación | Comentarios en funciones complejas |
| RNF-MANT-03 | Convenciones | Estilo de código consistente (ESLint, Prettier) |

---

## 2.3 Reglas de Negocio

| ID | Regla | Descripción |
|----|-------|-------------|
| RN-01 | Roles de usuario | El sistema define 5 roles: admin, director, capturista, actualizador, encierro |
| RN-02 | Relación usuario-infracción | Toda infracción debe tener un usuario creador (createdBy) |
| RN-03 | Folio único | El folio de infracción no puede repetirse en el sistema |
| RN-04 | Coherencia soloInfraccion | Si soloInfraccion=true, entonces consignacionVehiculo=0 y consignacionMotocicleta=0 |
| RN-05 | Estados de infracción | Solo existen dos estados: PENDIENTE y PAGADA |
| RN-06 | Relación encierro-infracción | Un encierro está asociado a una y solo una infracción mediante el folio |
| RN-07 | Auditoría | Toda acción importante debe registrarse en la bitácora |

---

## 2.4 Matriz de Trazabilidad

| Requisito | Módulo | Estado Implementación |
|-----------|--------|----------------------|
| RF-AUTH-01 a RF-AUTH-04 | Auth | ✅ Completado |
| RF-INF-01 a RF-INF-08 | Infracciones | ✅ Completado |
| RF-ENC-01 a RF-ENC-06 | Encierros | ✅ Completado |
| RF-USR-01 a RF-USR-05 | Usuarios | ✅ Completado |
| RF-BIT-01 a RF-BIT-03 | Bitácora | ✅ Completado |

---

## 2.5 Casos de Uso Principales

### UC-01: Registro de Infracción

```
Actor: Capturista
Flujo principal:
1. El usuario navega a "Nueva Infracción"
2. El usuario completa el formulario con todos los datos
3. El sistema valida que el folio sea único
4. El sistema valida la coherencia de soloInfraccion
5. El sistema guarda la infracción
6. El sistema registra la acción en bitácora
7. El sistema muestra mensaje de éxito
```

### UC-02: Consulta de Infracciones

```
Actor: Usuario autenticado
Flujo principal:
1. El usuario navega a "Infracciones"
2. El usuario aplica filtros (delegación, oficial, fecha)
3. El sistema muestra resultados paginados
4. El usuario selecciona una infracción
5. El sistema muestra el detalle
```

### UC-03: Registro de Encierro

```
Actor: Personal de encierro
Flujo principal:
1. El usuario ingresa el folio de la infracción
2. El sistema busca y muestra los datos del vehículo e infracción
3. El usuario completa datos del encierro (encierro, recibe, grúa)
4. El sistema guarda el registro
5. El sistema registra en bitácora
```

### UC-04: Actualización de Estatus de Infracción

```
Actor: Actualizador
Flujo principal:
1. El usuario busca una infracción
2. El usuario modifica el estatus a "PAGADA"
3. El sistema valida la actualización
4. El sistema guarda los cambios
5. El sistema registra en bitácora
```
