---
alias: "Mantenimiento"
---

# Fase 7: Mantenimiento

## 7.1 Tipos de Mantenimiento

| Tipo | Descripción | Porcentaje Estimado |
|------|-------------|--------------------|
| Correctivo | Corrección de defectos | 20% |
| Adaptativo | Cambios por entorno | 15% |
| Perfectivo | Mejoras y optimizaciones | 40% |
| Preventivo | Prevenir problemas | 25% |

---

## 7.2 Monitoreo del Sistema

### Métricas de Salud

| Métrica | Descripción | Herramienta |
|---------|-------------|-------------|
| Uptime | Disponibilidad del servicio | UptimeRobot |
| Latencia | Tiempo de respuesta | APM |
| Errores | Tasa de errores 5xx | Logs |
| Throughput | Transacciones por segundo | Prometheus |

### Alertas

| Alerta | Condición | Acción |
|--------|-----------|--------|
| CPU | > 80% por 5 min | Notificación email |
| Memoria | > 85% por 5 min | Notificación email |
| Disco | > 90% | Notificación email |
| Errores 5xx | > 10/min | Notificación email |
| BD conexiones | > 80% max | Notificación email |

---

## 7.3 Backup y Recuperación

### Estrategia de Backup

| Tipo | Frecuencia | Retención | Ubicación |
|------|------------|-----------|-----------|
| Base de datos | Diario (00:00) | 30 días | Servidor backup |
| Base de datos | Semanal | 12 semanas | Off-site |
| Archivos | Diario | 30 días | Servidor backup |
| Configuración | Por cambio | 12 meses | Git |

### Script de Backup

```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="pve_db_prod"
DB_USER="pve_user"
BACKUP_DIR="/backup/pve"

# Backup de base de datos
pg_dump -U $DB_USER -Fc $DB_NAME > $BACKUP_DIR/pve_db_$DATE.dump

# Comprimir
gzip $BACKUP_DIR/pve_db_$DATE.dump

# Eliminar backups mayores a 30 días
find $BACKUP_DIR -name "*.dump.gz" -mtime +30 -delete

# Backup de archivos subidos (si hay)
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz /var/www/pve/uploads

echo "Backup completado: $DATE"
```

### Recuperación

```bash
# Restaurar base de datos
pg_restore -U $DB_USER -d pve_db_restored -Fc /backup/pve/pve_db_20260115_000000.dump

# Restaurar archivos
tar -xzf /backup/pve/uploads_20260115_000000.tar.gz -C /
```

---

## 7.4 Actualizaciones y Mejoras

### Proceso de Actualización

```
1. Desarrollo → Feature branch
2. Pruebas → Staging
3. Aprobación → Release notes
4. Despliegue → Producción
5. Monitoreo → Post-deploy
```

### Checklist de Actualización

- [ ] Tests pasan en staging
- [ ] Documentación actualizada
- [ ] Release notes preparados
- [ ] Backup realizado
- [ ] Ventana de mantenimiento comunicada
- [ ] Rollback planificado

---

## 7.5 Gestión de Incidentes

### Severidad

| Nivel | Descripción | SLA |
|-------|-------------|-----|
| Crítico | Sistema no disponible | 1 hora |
| Alto | Funcionalidad principal afectada | 4 horas |
| Medio | Funcionalidad secundaria afectada | 24 horas |
| Bajo | Mejora o косметика | 1 semana |

### Procedimiento de Incidente

```
1. Identificar y documentar
2. Notificar al equipo
3. Investigar causa raíz
4. Implementar solución
5. Verificar funcionamiento
6. Documentar lección aprendida
```

---

## 7.6 Mantenimiento Preventivo

### Tareas Programadas

| Tarea | Frecuencia | Descripción |
|--------|------------|-------------|
| Limpieza de logs | Diario | Rotar logs > 100MB |
| Vacuum BD | Semanal | Optimizar tablas |
| Actualizar dependencias | Mensual | Seguridad |
| Revisar capacidad | Mensonal | Espacio en disco |
| Tests de carga | Trimestral | Performance |

### Revisión de Seguridad

- [ ] Dependencias actualizadas (npm audit)
- [ ] Contraseñas rotadas
- [ ] Certificados SSL vigentes
- [ ] Permisos de archivos correctos
- [ ] Logs revisados por anomalías

---

## 7.7 Optimización de Rendimiento

### Áreas de Optimización

| Área | Problema Potencial | Solución |
|------|-------------------|----------|
| Base de datos | Queries lentos | Agregar índices, optimize queries |
| API | Endpoints lentos | Cache, pagination |
| Frontend | Carga lenta | Lazy loading,CDN |
| Servidor | CPU alto | Escalar horizontalmente |

### Índices Existentes

| Tabla | Índice | Propósito |
|-------|--------|----------|
| infracciones | folio_infraccion | Búsqueda por folio |
| infracciones | delegacion | Filtros por delegación |
| infracciones | nombreOficial | Filtros por oficial |
| infracciones | fechaHora | Filtros por fecha |
| encierros | folio_infraccion | Unique, búsqueda |
| users | username | Login |

---

## 7.8 Documentación de Mantenimiento

### Bitácora de Cambios

| Fecha | Versión | Cambio | Responsable |
|-------|---------|--------|-------------|
| 2026-01-15 | 1.0.0 | Release inicial | Equipo Dev |
| | | | |

### Contactos de Soporte

| Rol | Contacto | Disponibilidad |
|-----|----------|----------------|
| Desarrollador Lead | Por definir | 24/7 (crítico) |
| DBA | Por definir | Horario office |
| SysAdmin | Por definir | 24/7 (infra) |

---

## 7.9 Métricas de Operación

### KPIs Operacionales

| Métrica | Objetivo | Actual |
|---------|----------|--------|
| Uptime | > 99.9% | - |
| MTTR (Mean Time To Recover) | < 1 hora | - |
| MTBF (Mean Time Between Failures) | > 720 horas | - |
| Tasa de defectos | < 5% | - |
| Satisfacción usuario | > 4/5 | - |

---

## 7.10 Plan de Contingencia

### Escenarios de Falla

| Escenario | Probabilidad | Impacto | Plan |
|-----------|--------------|---------|------|
| Caída BD | Baja | Alto | Restore from backup |
| Caída Backend | Baja | Alto | Restart service |
| Caída Frontend | Baja | Medio | Rebuild + restart |
| DDoS | Media | Alto | CloudFlare / WAF |
| Data loss | Muy baja | Crítico | Restore from backup |
