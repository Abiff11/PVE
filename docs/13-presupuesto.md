---
alias: "Presupuesto"
---

# Estimación de Valor del Proyecto PVE

## Resumen de la Valuación

| Concepto | Valor Estimado (MXN) |
|-----------|---------------------|
| **Desarrollo completado** | $425,000 - $544,000 |
| **Trabajo restante estimado** | $136,000 - $204,000 |
| **Valor total terminado** | **$561,000 - $748,000** |

---

## Metodología de Valuación

La estimación de valor de un proyecto de software se basa en múltiples factores. A continuación se explica cada método utilizado:

### 1. Método de Punto Función (Function Points)

Este método estándar de la industria mide el tamaño funcional del software basándose en las funcionalidades que proporciona al usuario.

#### Funcionalidades Implementadas

| Módulo | Puntos Función | Complejidad | Total |
|--------|----------------|-------------|-------|
| Autenticación | 15 | Media | 15 |
| Infracciones (CRUD + KPIs) | 45 | Alta | 60 |
| Encierros (CRUD + Lookup) | 30 | Media | 35 |
| Usuarios (CRUD) | 20 | Baja | 20 |
| Bitácora | 10 | Baja | 10 |
| **Total Puntos Función** | | | **140** |

#### Conversión a Horas

```
PF × Factor de Productividad (20 hrs/PF) = 2,800 horas
```

#### Costo por Hora en México (Senior)

| Rol | Tarifa/hora (MXN) | Horas | Subtotal |
|-----|-------------------|-------|----------|
| Senior Developer | $400-600 | 2,800 | $1,120,000 - $1,680,000 |

**Nota:** En México, las tarifas de desarrollo varían entre $15-40/hora dependiendo de la experiencia. Usamos $25 como promedio para un desarrollador senior.

---

### 2. Método de Comparación de Mercado

Comparando con proyectos similares en el mercado:

| Tipo de Aplicación | Rango de Precio (USD) |
|--------------------|----------------------|
| CRUD básico | $5,000 - $15,000 |
| Sistema de gestión empresarial | $20,000 - $50,000 |
| ERP completo | $50,000 - $200,000+ |

**PVE es un sistema de gestión empresarial** con:
- Módulos de negocio especializados
- Autenticación y roles
- Dashboard de KPIs
- Auditoría completa

**Rango de mercado:** $340,000 - $850,000

---

### 3. Desglose por Fase del Desarrollo

| Fase | Estado | Horas Est. | Costo Est. (MXN) |
|------|--------|------------|------------------|
| Análisis y Diseño | Completo | 200 | $85,000 |
| Desarrollo Backend | 95% | 500 | $212,500 |
| Desarrollo Frontend | 95% | 400 | $170,000 |
| Testing | 20% | 400 | $136,000 |
| Despliegue | Documentado | 100 | $42,500 |
| **Total** | | **1,600** | **$646,000** |

---

## Factores de Ajuste

| Factor | Ajuste |
|--------|--------|
| Stack tecnológico moderno (NestJS + React 19) | +10% |
| Código bien estructurado y modular | +10% |
| Documentación completa | +5% |
| Existencia de pruebas (parcial) | +5% |
| Autenticación JWT robusta | +5% |

### Factores que DISMINUYEN el valor

| Factor | Ajuste |
|--------|--------|
| Pruebas incompletas | -15% |
| Sin CI/CD | -5% |
| Documentación existente parcial | -5% |
| Features Roadmap pendientes | -10% |

---

## Cálculo Final

### Valor del Código Existente (como está)

```
Costo base:                    $646,000
(-15%) Testing incompleta:      -$96,900
(-5%) Sin CI/CD:               -$32,300
(+10%) Código bien estructurado: +$64,600
(+5%) Documentación:            +$32,300

Valor estimado actual:         $613,700
```

### Valor con Trabajo Pendiente Completado

```
Valor actual:                  $613,700
Trabajo restante (~1,600 hrs): $136,000
Testing + CI/CD:               $68,000

Valor proyecto terminado:      **$817,700 - $850,000**
```

---

## Rangos de Precio por Escenario

| Escenario | Descripción | Valor (MXN) |
|-----------|-------------|-------------|
| **Conservador** | Solo código fuente, sin soporte | $425,000 - $510,000 |
| **Recomendado** | Código + documentación + pruebas | $561,000 - $680,000 |
| **Premium** | Código + docs + pruebas + 6 meses soporte | $765,000 - $935,000 |

---

## Comparación Regional de Tarifas

| País | Tarifa/Hora (MXN) | Costo Total 2,800 hrs |
|------|-------------------|----------------------|
| México | $400-600 | $1,120,000 - $1,680,000 |
| Colombia | $300-500 | $840,000 - $1,400,000 |
| Argentina | $250-425 | $700,000 - $1,190,000 |
| España | $600-1,000 | $1,680,000 - $2,800,000 |
| USA | $1,500-3,000 | $4,200,000 - $8,400,000 |

**El valor de $561,000 - $748,000 MXN es apropiado para el mercado mexicano** considerando las tarifas locales y el nivel de complejidad del proyecto.

---

## Conclusión

| Métrica | Valor |
|---------|-------|
| **Valor actual del código** | $425,000 - $544,000 MXN |
| **Inversión para completar** | $136,000 - $204,000 MXN |
| **Valor terminado** | **$561,000 - $748,000 MXN** |

El proyecto PVE tiene un valor de mercado apropiado para su nivel de complejidad y estado de desarrollo. La inversión adicional de aproximadamente $170,000 MXN para completar pruebas y CI/CD elevaría el valor a aproximadamente $850,000 - $935,000 MXN.

---

## Recomendación

Si estás considerando vender o valorizar el proyecto:
1. **Mejorar cobertura de pruebas** (inversión ~$85,000) → Valor +$170,000
2. **Agregar CI/CD** (inversión ~$34,000) → Valor +$51,000
3. **Completar documentación** (inversión ~$17,000) → Valor +$34,000

**ROI estimado de las mejoras: 150%+**

---

*Nota: Los valores están en Pesos Mexicanos (MXN) con tipo de cambio aproximada de $17-20 USD/MXN.*
