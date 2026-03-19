---
alias: "Implementación"
---

# Fase 6: Implementación

## 6.1 Entornos

| Entorno | Propósito | URL | Base de Datos |
|---------|-----------|-----|---------------|
| Desarrollo | Pruebas locales | localhost:5173 (FE) / localhost:3000 (BE) | pve_db_dev |
| Staging | Pre-producción | Por definir | pve_db_staging |
| Producción | Ambiente live | Por definir | pve_db_prod |

---

## 6.2 Configuración de Producción

### Variables de Entorno del Backend

```env
# Servidor
NODE_ENV=production
HOST=0.0.0.0
PORT=3000

# Base de datos PostgreSQL
DB_HOST=prod-db-host
DB_PORT=5432
DB_NAME=pve_db_prod
DB_USERNAME=pve_user
DB_PASSWORD=strong_password_here

# JWT
JWT_SECRET=generate_secure_random_string_min_64_chars

# CORS
FRONT_ORIGINS=https://tu-dominio.com
```

### Variables de Entorno del Frontend

```env
VITE_API_URL=https://api.tu-dominio.com
```

### Configuración TypeORM

| Entorno | synchronize | logging | migrationsRun |
|---------|:-----------:|:-------:|:-------------:|
| development | true | true | false |
| production | false | false | true |

> ⚠️ **Importante:** En producción, `synchronize: false` es obligatorio para evitar cambios no controlados en el esquema.

---

## 6.3 Pasos de Despliegue

### Backend

```bash
# 1. Conectar al servidor
ssh usuario@servidor-backend

# 2. Crear directorio del proyecto
mkdir -p /opt/pve-backend && cd /opt/pve-backend

# 3. Clonar repositorio
git clone <repo-url> .

# 4. Instalar dependencias
npm install --production

# 5. Configurar variables de entorno
cp .env.example .env.production
# Editar .env.production con valores de producción

# 6. Compilar
npm run build

# 7. Ejecutar migraciones (si existen)
npm run migration:run

# 8. Crear servicio systemd
sudo nano /etc/systemd/system/pve-backend.service

# Contenido del servicio:
# [Unit]
# Description=PVE Backend API
# After=network.target postgresql.service
#
# [Service]
# Type=simple
# User=ubuntu
# WorkingDirectory=/opt/pve-backend
# ExecStart=/usr/bin/npm run start:prod
# Restart=always
#
# [Install]
# WantedBy=multi-user.target

# 9. Habilitar y arrancar
sudo systemctl daemon-reload
sudo systemctl enable pve-backend
sudo systemctl start pve-backend

# 10. Verificar estado
sudo systemctl status pve-backend
```

### Frontend

```bash
# 1. Conectar al servidor
ssh usuario@servidor-frontend

# 2. Crear directorio
mkdir -p /var/www/pve-frontend && cd /var/www/pve-frontend

# 3. Clonar repositorio
git clone <repo-url> .

# 4. Instalar dependencias
npm install

# 5. Configurar variable de entorno
echo "VITE_API_URL=https://api.tu-dominio.com" > .env.production

# 6. Compilar
npm run build

# 7. Configurar nginx
sudo nano /etc/nginx/sites-available/pve

# Configuración nginx:
# server {
#     listen 80;
#     server_name tu-dominio.com;
#     root /var/www/pve-frontend/dist;
#     index index.html;
#     
#     location / {
#         try_files $uri $uri/ /index.html;
#     }
#     
#     # Proxy para API (opcional, si no hay servidor separado)
#     location /api {
#         proxy_pass http://backend-server:3000;
#         proxy_http_version 1.1;
#         proxy_set_header Upgrade $http_upgrade;
#         proxy_set_header Connection 'upgrade';
#         proxy_set_header Host $host;
#         proxy_cache_bypass $http_upgrade;
#     }
# }

# 8. Habilitar sitio
sudo ln -s /etc/nginx/sites-available/pve /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 6.4 Configuración con Docker (Opcional)

### Dockerfile (Backend)

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist/ ./dist/
COPY package*.json ./

EXPOSE 3000

CMD ["node", "dist/main.js"]
```

### Dockerfile (Frontend)

```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  db:
    image: postgres:14
    environment:
      POSTGRES_DB: pve_db
      POSTGRES_USER: pve_user
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - pve-network

  backend:
    build: ./Back/project-pve
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DB_HOST=db
    depends_on:
      - db
    networks:
      - pve-network

  frontend:
    build: ./Front/project-PVE
    ports:
      - "80:80"
    depends_on:
      - backend
    networks:
      - pve-network

volumes:
  postgres_data:

networks:
  pve-network:
    driver: bridge
```

---

## 6.5 SSL/TLS

### Certbot (Let's Encrypt)

```bash
# Instalar certbot
sudo apt install certbot python3-certbot-nginx

# Obtener certificado
sudo certbot --nginx -d tu-dominio.com

# Renew automático
sudo certbot renew --dry-run
```

---

## 6.6 Checklist de Despliegue

### Pre-Despliegue

- [ ] Base de datos creada y configurada
- [ ] Variables de entorno configuradas
- [ ] Certificados SSL obtenidos
- [ ] Backups programados
- [ ] Monitoreo configurado

### Despliegue

- [ ] Backend compilado sin errores
- [ ] Frontend build sin errores
- [ ] Conexión a base de datos verificada
- [ ] Rutas configuradas correctamente
- [ ] Logs funcionando

### Post-Despliegue

- [ ] Pruebas smoke ejecutadas
- [ ] Login funcionando
- [ ] Crear infracción funcionando
- [ ] KPIs mostrando datos
- [ ] Bitácora registrando acciones

---

## 6.7 Rollback

### Procedimiento de Rollback

```bash
# Si hay problemas, revertir a versión anterior
git checkout v1.0.0

# Backend
cd Back/project-pve
npm install
npm run build
sudo systemctl restart pve-backend

# Frontend
cd Front/project-PVE
npm install
npm run build
sudo systemctl reload nginx
```

---

## 6.8 Monitoreo Post-Despliegue

### Métricas a Monitorear

| Métrica | Herramienta | Umbral de Alerta |
|---------|-------------|------------------|
| Uptime | UptimeRobot | < 99.9% |
| Latencia API | Prometheus/Grafana | > 2s |
| Errores 5xx | Logs | > 0 |
| Uso CPU | Prometheus | > 80% |
| Uso Memoria | Prometheus | > 85% |
| Conexiones BD | pgAdmin | > 80% |

### Logs

```bash
# Ver logs del backend
sudo journalctl -u pve-backend -f

# Ver errores nginx
sudo tail -f /var/log/nginx/error.log
```
