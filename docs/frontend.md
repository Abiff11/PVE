# Frontend — Estructura y Componentes

## Stack

| Tecnología   | Versión | Uso                                     |
| ------------ | ------- | --------------------------------------- |
| React        | 19      | UI declarativa                          |
| Vite         | 7       | Bundler y servidor de desarrollo        |
| React Router | 7       | Enrutamiento SPA                        |
| jwt-decode   | 4       | Decodificación del token JWT en cliente |

---

## Estructura de Directorios

```
Front/project-PVE/src/
├── App.jsx              # Punto de entrada del árbol React
├── App.css              # Estilos globales de la aplicación
├── main.jsx             # Montaje de React + AuthProvider
│
├── context/
│   ├── AuthContext.js   # Definición del contexto (createContext)
│   └── AuthProvider.jsx # Proveedor: login, logout, token, role
│
├── hooks/
│   └── useAuth.js       # Hook para consumir AuthContext
│
├── router/
│   └── AppRouter.jsx    # Definición de rutas + PrivateRoute + PublicRoute
│
├── services/
│   ├── apiClient.js     # Cliente HTTP centralizado (fetch + JWT)
│   ├── auth.js          # signin, logoutRequest
│   ├── infracciones.js  # list, getByFolio, create, update, remove, getKpis
│   ├── users.js         # getUsers, createUser, updateRole, deleteUser
│   └── bitacora.js      # getBitacora
│
├── components/
│   ├── FormInfraccion/
│   │   └── InfraccionForm.jsx   # Formulario reutilizable (crear/editar)
│   ├── KPI/
│   │   └── KpiCards.jsx         # Tarjetas de métricas del dashboard
│   ├── Layout/
│   │   ├── PrivateLayout.jsx    # Layout con navbar para rutas protegidas
│   │   └── PublicLayout.jsx     # Layout sin navbar para login
│   ├── Table/
│   │   └── PaginationControls.jsx # Controles de paginación reutilizables
│   └── Users/
│       └── UserForm.jsx         # Formulario de creación/edición de usuarios
│
└── pages/
    ├── Login/
    │   └── Login.jsx            # Página de inicio de sesión
    ├── Dashboard/
    │   └── Dashboard.jsx        # KPIs y resumen (admin/director)
    ├── InfraccionesList/
    │   └── InfraccionesList.jsx # Lista paginada con filtros
    ├── InfraccionDetail/
    │   └── InfraccionDetail.jsx # Detalle + formulario de edición
    ├── NuevaInfraccion/
    │   └── NuevaInfraccion.jsx  # Página de registro de nueva infracción
    ├── Users/
    │   └── UsersDashboard.jsx   # Gestión de usuarios (solo admin)
    └── Bitacora/
        └── Bitacora.jsx         # Consulta de bitácora (solo admin)
```

---

## Rutas de la Aplicación

| Ruta                   | Componente              | Roles permitidos                                              |
| ---------------------- | ----------------------- | ------------------------------------------------------------- |
| `/login`               | `LoginPage`             | Público (redirige a `/dashboard` si ya autenticado)           |
| `/dashboard`           | `DashboardPage`         | `admin`, `director`                                           |
| `/infracciones`        | `InfraccionesListPage`  | `admin`, `director`, `capturista`, `actualizador`, `encierro` |
| `/infracciones/nueva`  | `NuevaInfraccionPage`   | `admin`, `capturista`                                         |
| `/infracciones/:folio` | `InfraccionDetailPage`  | `admin`, `director`, `capturista`, `actualizador`, `encierro` |
| `/usuarios`            | `UsersDashboard`        | `admin`                                                       |
| `/bitacora`            | `BitacoraPage`          | `admin`                                                       |
| `/`                    | Redirect → `/dashboard` | —                                                             |
| `*`                    | Redirect → `/dashboard` | —                                                             |

### Protección de Rutas

```jsx
// PrivateRoute: redirige a /login si no autenticado,
//               redirige a /dashboard si el rol no está permitido
<PrivateRoute allowedRoles={['admin', 'capturista']}>
  <NuevaInfraccionPage />
</PrivateRoute>

// PublicRoute: redirige a /dashboard si ya autenticado
<PublicRoute>
  <LoginPage />
</PublicRoute>
```

---

## Contexto de Autenticación

El estado de autenticación se gestiona con React Context y se persiste en `localStorage` bajo la clave `pve.auth`.

### API del contexto (`useAuth()`)

```js
const {
  token, // string | null — JWT Bearer
  user, // { id, username, role } | null
  role, // string | null — shortcut de user.role
  isAuthenticated, // boolean
  login, // (accessToken: string) => void
  logout, // () => Promise<void>
} = useAuth();
```

### Flujo de Login

```
1. Usuario envía credenciales en LoginPage
2. authService.signin(username, password) → POST /auth/signin
3. Respuesta: { access_token }
4. AuthProvider.login(access_token):
   - Decodifica JWT con jwt-decode
   - Guarda { token, user } en estado React
   - Persiste { token } en localStorage
5. React Router redirige a /dashboard
```

### Flujo de Logout

```
1. Usuario hace clic en "Cerrar sesión"
2. AuthProvider.logout():
   - POST /auth/logout (registra en bitácora)
   - Limpia estado React
   - Elimina localStorage
3. React Router redirige a /login
```

---

## Componente `InfraccionForm`

Formulario reutilizable para crear y editar infracciones.

### Props

| Prop            | Tipo     | Default     | Descripción                                      |
| --------------- | -------- | ----------- | ------------------------------------------------ |
| `initialValues` | object   | `{}`        | Valores iniciales del formulario                 |
| `onSubmit`      | function | —           | Callback con el payload validado                 |
| `submitting`    | boolean  | `false`     | Deshabilita el formulario durante envío          |
| `submitLabel`   | string   | `"Guardar"` | Texto del botón de envío                         |
| `showFolio`     | boolean  | `true`      | Muestra/oculta el campo folio                    |
| `allowStatus`   | boolean  | `false`     | Muestra el selector de estatus (solo en edición) |

### Campos del Formulario

| Campo                    | Tipo HTML | Validación                   |
| ------------------------ | --------- | ---------------------------- |
| Folio                    | text      | Obligatorio (si `showFolio`) |
| Nombre del infractor     | text      | Obligatorio                  |
| Nombre del oficial       | text      | Obligatorio                  |
| Delegación               | text      | Obligatorio                  |
| Detalle de la infracción | textarea  | Obligatorio                  |
| Fecha                    | date      | Formato `YYYY-MM-DD`         |
| Hora                     | time      | Formato `HH:mm`              |
| Monto                    | number    | > 0                          |
| Vehículo                 | text      | Obligatorio                  |
| Placas                   | text      | Obligatorio                  |
| Servicio                 | text      | Obligatorio                  |
| Vehículo detenido        | checkbox  | Entero 0/1                   |
| Motocicleta detenida     | checkbox  | Entero 0/1                   |
| Consignación vehículo    | checkbox  | Entero 0/1                   |
| Consignación motocicleta | checkbox  | Entero 0/1                   |
| Solo infracción          | checkbox  | Boolean                      |
| Estatus                  | select    | Solo si `allowStatus=true`   |

### Manejo de Checkboxes

Los campos de detención/consignación se almacenan como enteros (`0` o `1`) para coincidir con el tipo `int` de la BD. El campo `soloInfraccion` se almacena como `boolean`.

```js
// En updateField():
if (name === "soloInfraccion") {
  newValue = checked; // boolean
} else {
  newValue = checked ? 1 : 0; // entero
}
```

---

## Cliente HTTP (`apiClient.js`)

Centraliza todas las peticiones al backend.

```js
apiRequest(path, { method, body, token, headers });
```

- **Base URL:** `import.meta.env.VITE_API_URL` (default: `http://localhost:3000`)
- Agrega `Content-Type: application/json` automáticamente
- Agrega `Authorization: Bearer <token>` si se proporciona
- Lanza `Error` con `status` y `details` si la respuesta no es `ok`
- Maneja respuestas `204 No Content` devolviendo `null`

---

## Variables de Entorno del Frontend

| Variable       | Descripción          | Ejemplo                 |
| -------------- | -------------------- | ----------------------- |
| `VITE_API_URL` | URL base del backend | `http://localhost:3000` |

Crear archivo `Front/project-PVE/.env.local`:

```
VITE_API_URL=http://localhost:3000
```
