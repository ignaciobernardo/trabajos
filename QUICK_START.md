# 🚀 Quick Start - Despliegue a Producción

## 1. Subir a GitHub

```bash
# En la terminal, desde la carpeta del proyecto:
git init
git add .
git commit -m "Initial commit - Job board ready for production"

# Crea un repo en GitHub (https://github.com/new) y luego:
git remote add origin https://github.com/TU-USUARIO/TU-REPO.git
git branch -M main
git push -u origin main
```

## 2. Desplegar en Railway (5 minutos)

1. **Ve a [railway.app](https://railway.app)** y crea cuenta (puedes usar GitHub)

2. **Nuevo Proyecto**:
   - Click "New Project"
   - "Deploy from GitHub repo"
   - Selecciona tu repositorio

3. **Agregar PostgreSQL**:
   - Click "New" → "Database" → "Add PostgreSQL"
   - Railway crea la DB automáticamente

4. **Variables de Entorno**:
   En "Variables", agrega:
   ```
   NODE_ENV=production
   ADMIN_PASSWORD=tu_contraseña_segura
   SESSION_SECRET=genera_con: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   ```

5. **Railway despliega automáticamente** ✅

## 3. Configurar Dominio

### Para trabajos.indies.cl:
1. En Railway: Settings → Networking → Generate Domain
2. En tu DNS (donde está indies.cl):
   - Tipo: CNAME
   - Nombre: trabajos
   - Valor: [tu-dominio-railway].railway.app

## 4. Listo! 🎉

Tu job board estará en `https://trabajos.indies.cl` (o el dominio que configuraste)

## Verificación

- ✅ Sitio carga: `https://trabajos.indies.cl`
- ✅ Admin funciona: `https://trabajos.indies.cl/login.html`
- ✅ Puedes crear trabajos
- ✅ Puedes aprobar trabajos desde admin
- ✅ Los trabajos aparecen en el job board

## Costos

- **Railway**: Plan gratuito (500 horas/mes)
- **PostgreSQL**: Incluido gratis
- **Total**: $0/mes para empezar

## Soporte

Si algo no funciona:
1. Revisa los logs en Railway
2. Verifica las variables de entorno
3. Asegúrate que PostgreSQL esté corriendo

