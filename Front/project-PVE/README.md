# Front PVE Frontend

Este paquete contiene la SPA en React/Vite que consume el API Nest del módulo de infracciones.

## Requisitos
- Node.js 20+
- Backend (Back/project-pve) levantado en el puerto indicado (por defecto http://localhost:3000)
- Variables de entorno definidas en ambos proyectos

## Configuración
1. Instala dependencias:
   `ash
   cd Front/project-PVE
   npm install
   `
2. Copia .env.development (ya incluye VITE_API_URL=http://localhost:3000). Ajusta el valor si el backend corre en otra URL.
3. Asegúrate de que el backend tenga FRONT_ORIGINS configurado (archivo Back/project-pve/.env.development) para permitir CORS desde la URL donde corre Vite (por defecto http://localhost:5173).

## Scripts útiles
- 
pm run dev: inicia Vite con HMR en http://localhost:5173.
- 
pm run build: genera los artefactos de producción.
- 
pm run preview: sirve el build generado.
- 
pm run lint: ejecuta ESLint siguiendo las reglas del proyecto.

## Flujo para conectar con el backend
1. Levanta la API: cd Back/project-pve && npm run start:dev.
2. Levanta el front: cd Front/project-PVE && npm run dev.
3. Inicia sesión con alguno de los usuarios sembrados (ej. dmin / P@ssw0rd!).
4. Navega por Dashboard, listado y formularios; todas las peticiones se harán contra VITE_API_URL.

## Problemas comunes
- **CORS bloqueado**: confirma que FRONT_ORIGINS incluya la URL del front y reinicia el backend.
- **Errores 401**: el token expiró o las credenciales son incorrectas. Inicia sesión nuevamente.
- **Backend en otro host/puerto**: actualiza Front/project-PVE/.env.development con la nueva URL y reinicia Vite.
