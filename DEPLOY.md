# 🚀 Guía de Despliegue - indies.cl/trabajos

## Opción 1: Railway (Recomendado - Incluye PostgreSQL gratis)

### 1. Preparar el repositorio
```bash
git init
git add .
git commit -m "Initial commit - Job board ready for production"
git remote add origin <tu-repo-github>
git push -u origin main
```

### 2. Desplegar en Railway

1. Ve a [railway.app](https://railway.app) y crea una cuenta
2. Click en "New Project" → "Deploy from GitHub repo"
3. Selecciona tu repositorio
4. Railway detectará automáticamente el proyecto Node.js

### 3. Configurar Base de Datos PostgreSQL

1. En Railway, click en "New" → "Database" → "Add PostgreSQL"
2. Railway creará automáticamente una base de datos PostgreSQL
3. Copia la variable `DATABASE_URL` que Railway genera

### 4. Configurar Variables de Entorno

En Railway, ve a "Variables" y agrega:

```
NODE_ENV=production
PORT=3000
ADMIN_PASSWORD=tu_contraseña_super_segura_aqui
SESSION_SECRET=tu_secret_key_muy_larga_y_aleatoria_aqui
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

### 5. Actualizar código para PostgreSQL

El código ya está preparado para usar PostgreSQL si `DATABASE_URL` está configurado.

### 6. Configurar Dominio

1. En Railway, ve a "Settings" → "Networking"
2. Click en "Generate Domain" o agrega tu dominio personalizado
3. Para `indies.cl/trabajos`, configura un subdominio o path en tu DNS

## Opción 2: Vercel + Railway DB

### 1. Base de Datos en Railway
- Sigue los pasos 3-4 de Railway arriba para crear la DB

### 2. Desplegar en Vercel
1. Ve a [vercel.com](https://vercel.com)
2. Importa tu repositorio de GitHub
3. Vercel detectará automáticamente la configuración
4. Agrega las variables de entorno (sin DATABASE_URL, usa la de Railway)

### 3. Configurar Dominio
- En Vercel, ve a "Settings" → "Domains"
- Agrega `trabajos.indies.cl` o configura el path en tu DNS

## Configuración DNS para indies.cl/trabajos

### Opción A: Subdominio (trabajos.indies.cl)
```
Type: CNAME
Name: trabajos
Value: [tu-dominio-de-railway].railway.app
```

### Opción B: Path (indies.cl/trabajos)
Necesitarás configurar un reverse proxy en tu servidor principal de indies.cl

## Variables de Entorno Requeridas

```env
NODE_ENV=production
PORT=3000
ADMIN_PASSWORD=tu_contraseña_segura
SESSION_SECRET=tu_secret_key_aleatoria_larga
DATABASE_URL=postgresql://user:password@host:port/database
```

## Post-Deploy Checklist

- [ ] Verificar que la base de datos se inicializa correctamente
- [ ] Probar el login de admin
- [ ] Probar crear un trabajo de prueba
- [ ] Verificar que los trabajos se muestran correctamente
- [ ] Probar el flujo completo de pago
- [ ] Verificar que el iframe de Fintoc funciona
- [ ] Probar aprobar un trabajo desde el admin
- [ ] Verificar que los trabajos aprobados aparecen en el job board

## Migración de Datos (si tienes datos en SQLite local)

Si tienes datos en SQLite que quieres migrar:

```bash
# Exportar datos de SQLite
sqlite3 db/jobs.db .dump > backup.sql

# Importar a PostgreSQL (ajusta la conexión)
psql $DATABASE_URL < backup.sql
```

## Monitoreo

- Railway: Dashboard muestra logs y métricas
- Vercel: Analytics en el dashboard
- Considera agregar Sentry para error tracking

## Backup

- Railway PostgreSQL: Backups automáticos diarios
- Configura backups adicionales si es necesario

