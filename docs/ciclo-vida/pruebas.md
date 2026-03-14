# Fase 5: Pruebas

## 5.1 Estrategia de Pruebas

### Niveles de Prueba

```
┌─────────────────────────────────────────────────────────────┐
│                    PRUEBAS E2E                              │
│              (Cucumber / Supertest)                           │
│              Simulación de flujos completos                  │
├─────────────────────────────────────────────────────────────┤
│                  PRUEBAS DE INTEGRACIÓN                      │
│              (Módulos interconectados)                       │
├─────────────────────────────────────────────────────────────┤
│                   PRUEBAS UNITARIAS                          │
│              (Funciones y métodos individuales)              │
└─────────────────────────────────────────────────────────────┘
```

---

## 5.2 Pruebas Unitarias (Backend)

### Estado Actual

| Cobertura | Estado | Notas |
|-----------|--------|-------|
| Auth | ⚠️ Parcial | Faltan casos edge |
| Infracciones | ⚠️ Parcial | Service probados, controller no |
| Encierros | ⚠️ Parcial | Service probados |
| Users | ⚠️ Parcial | Service probados |
| Bitácora | ❌ Pendiente | No implementado |

### Scripts Disponibles

```bash
# Ejecutar todas las pruebas
npm test

# Modo watch (recarca automática)
npm run test:watch

# Coverage
npm run test:cov

# Depuración
npm run test:debug
```

### Estructura de Archivos de Prueba

```
src/
├── auth/
│   ├── auth.service.spec.ts     # ✅ Existe
│   └── jwt.strategy.spec.ts     # ⚠️ Pendiente
├── infracciones/
│   ├── infracciones.service.spec.ts  # ⚠️ Parcial
│   └── infracciones.controller.spec.ts  # ❌ Pendiente
├── encierro/
│   ├── encierro.service.spec.ts  # ⚠️ Pendiente
│   └── encierro.controller.spec.ts  # ❌ Pendiente
├── users/
│   ├── users.service.spec.ts    # ⚠️ Parcial
│   └── users.controller.spec.ts # ❌ Pendiente
└── bitacora/
    ├── bitacora.service.spec.ts # ❌ Pendiente
    └── bitacora.controller.spec.ts # ❌ Pendiente
```

### Ejemplo de Test Unitario

```typescript
// Ejemplo: auth.service.spec.ts
describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let bitacoraService: BitacoraService;
  
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: BitacoraService, useValue: mockBitacoraService },
      ],
    }).compile();
    
    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signin', () => {
    it('should throw if credentials are invalid', async () => {
      mockUsersService.findByUsername.mockResolvedValue(null);
      await expect(service.signin(credentials)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should return access_token if credentials are valid', async () => {
      mockUsersService.findByUsername.mockResolvedValue(user);
      mockUsersService.validatePassword.mockResolvedValue(true);
      mockBitacoraService.log.mockResolvedValue({});
      
      const result = await service.signin(credentials);
      expect(result).toHaveProperty('access_token');
    });
  });
});
```

---

## 5.3 Pruebas de Integración

### Estado Actual

| Módulo | Estado | Notas |
|--------|--------|-------|
| Auth E2E | ⚠️ Parcial | Faltan casos de prueba |
| Infracciones E2E | ❌ Pendiente | No implementado |
| Encierros E2E | ❌ Pendiente | No implementado |
| Usuarios E2E | ❌ Pendiente | No implementado |

### Configuración E2E

```typescript
// test/jest-e2e.json
{
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": ".",
  "testEnvironment": "node",
  "testRegex": ".e2e-spec.ts$",
  "transform": {
    "^.+\\.(t|j)s$": "ts-jest"
  }
}
```

### Ejemplo de Test E2E

```typescript
// test/app.e2e-spec.ts
describe('AppController (e2e)', () => {
  let app: INestApplication;
  
  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    
    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/auth/signin', () => {
    it('should return 401 for invalid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/signin')
        .send({ username: 'invalid', password: 'invalid' })
        .expect(401);
    });

    it('should return access_token for valid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/signin')
        .send({ username: 'admin', password: 'Admin123!' })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
        });
    });
  });
});
```

### Ejecutar Tests E2E

```bash
npm run test:e2e
```

---

## 5.4 Pruebas del Frontend

### Estado Actual

| Tipo | Estado | Notas |
|------|--------|-------|
| Unitarias (Vitest/Jest) | ❌ Pendiente | No configurado |
| E2E (Cypress/Playwright) | ❌ Pendiente | No configurado |
| Manual | ✅ En progreso | Pruebas funcionales |

### Recomendaciones para Frontend

#### Configuración Sugerida con Vitest

```bash
# Instalar dependencias
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
  },
});
```

#### Componentes a Probar Prioritariamente

| Componente | Prioridad | Razón |
|------------|----------|-------|
| InfraccionForm | Alta | Lógica de validación compleja |
| AuthProvider | Alta | Manejo de estado de autenticación |
| KpiCards | Media | Renderizado de datos |
| PaginationControls | Media | Lógica de paginación |
| PrivateRoute | Alta | Protección de rutas |

---

## 5.5 Matriz de Cobertura de Pruebas

### Backend

| Módulo | Unitarias | Integración | E2E | Prioridad Alta |
|--------|:---------:|:-----------:|:---:|:--------------:|
| Auth | 40% | 30% | 20% | ✅ |
| Infracciones | 50% | 0% | 0% | ⚠️ |
| Encierros | 20% | 0% | 0% | ⚠️ |
| Users | 30% | 0% | 0% | ⚠️ |
| Bitácora | 0% | 0% | 0% | ❌ |

### Frontend

| Tipo | Estado | Cobertura Objetivo |
|------|--------|-------------------|
| Unitarias | ❌ No implementado | 70% |
| E2E | ❌ No implementado | 50% |

---

## 5.6 Casos de Prueba Prioritarios

### CP-01: Autenticación

| ID | Descripción | Resultado Esperado |
|----|-------------|-------------------|
| CP-AUTH-01 | Login con credenciales válidas | Token JWT retornado |
| CP-AUTH-02 | Login con usuario inválido | Error 401 |
| CP-AUTH-03 | Login con contraseña incorrecta | Error 401 |
| CP-AUTH-04 | Acceso a ruta protegida sin token | Redirección a login |
| CP-AUTH-05 | Acceso a ruta con rol insuficiente | Redirección a dashboard |

### CP-02: Infracciones

| ID | Descripción | Resultado Esperado |
|----|-------------|-------------------|
| CP-INF-01 | Crear infracción con datos válidos | Infracción creada |
| CP-INF-02 | Crear infracción con folio duplicado | Error 400 |
| CP-INF-03 | Crear infracción con soloInfraccion=true y consignación | Error 400 |
| CP-INF-04 | Actualizar estatus a PAGADA | Actualización exitosa |
| CP-INF-05 | Eliminar infracción (admin) | Eliminación exitosa |
| CP-INF-06 | Lista con paginación | Datos paginados correctos |

### CP-03: Encierros

| ID | Descripción | Resultado Esperado |
|----|-------------|-------------------|
| CP-ENC-01 | Crear encierro para infracción existente | Encierro creado |
| CP-ENC-02 | Crear encierro para folio inexistente | Error 400 |
| CP-ENC-03 | Crear encierro duplicado | Error 400 |
| CP-ENC-04 | Lookup por folio | Datos de infracción y encierro |

---

## 5.7 Plan de Mejora de Pruebas

### Acciones Inmediatas (Sprint 1)

- [ ] Completar pruebas unitarias de AuthService
- [ ] Agregar pruebas unitarias de InfraccionesService
- [ ] Configurar Vitest en Frontend

### Acciones Corto Plazo (Sprint 2-3)

- [ ] Agregar pruebas unitarias de Encierros y Users
- [ ] Implementar pruebas de integración con base de datos de prueba
- [ ] Crear flujos E2E críticos

### Acciones Mediano Plazo (Sprint 4+)

- [ ] Lograr 70% cobertura en backend
- [ ] Agregar pruebas E2E en frontend
- [ ] Integrar con pipeline CI/CD
