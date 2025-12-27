# 🚀 Setup para Producción - indies.cl/trabajos

## Paso 1: Subir a GitHub

```bash
# Inicializar git (si no está inicializado)
git init

# Agregar todos los archivos
git add .

# Hacer commit inicial
git commit -m "Initial commit - Job board ready for production"

# Agregar remote (reemplaza con tu repo)
git remote add origin https://github.com/tu-usuario/tu-repo.git

# Push a GitHub
git branch -M main
git push -u origin main
```

## Paso 2: Desplegar en Railway

### 2.1 Crear cuenta en Railway
1. Ve a [railway.app](https://railway.app)
2. Crea una cuenta (puedes usar GitHub para login rápido)

### 2.2 Crear nuevo proyecto
1. Click en "New Project"
2. Selecciona "Deploy from GitHub repo"
3. Autoriza Railway a acceder a tu GitHub
4. Selecciona tu repositorio `jobs`

### 2.3 Agregar Base de Datos PostgreSQL
1. En tu proyecto de Railway, click en "New"
2. Selecciona "Database" → "Add PostgreSQL"
3. Railway creará automáticamente una base de datos PostgreSQL
4. **IMPORTANTE**: Copia la variable `DATABASE_URL` que Railway muestra

### 2.4 Configurar Variables de Entorno
1. En tu proyecto, ve a la pestaña "Variables"
2. Agrega las siguientes variables:

```
NODE_ENV=production
PORT=3000
ADMIN_PASSWORD=tu_contraseña_super_segura_aqui_cambiar
SESSION_SECRET=genera_una_clave_aleatoria_muy_larga_aqui
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

**Para generar SESSION_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2.5 Railway detectará automáticamente Node.js
- Railway detectará `package.json` y desplegará automáticamente
- El código detectará `DATABASE_URL` y usará PostgreSQL automáticamente

## Paso 3: Configurar Dominio

### Opción A: Subdominio (trabajos.indies.cl)
1. En Railway, ve a "Settings" → "Networking"
2. Click en "Generate Domain" (te dará algo como `tu-proyecto.railway.app`)
3. Para usar `trabajos.indies.cl`:
   - Ve a tu proveedor de DNS (donde está configurado indies.cl)
   - Agrega un registro CNAME:
     ```
     Type: CNAME
     Name: trabajos
     Value: tu-proyecto.railway.app
     ```

### Opción B: Path (indies.cl/trabajos)
Necesitarás configurar un reverse proxy en tu servidor principal de indies.cl que redirija `/trabajos` a Railway.

## Paso 4: Verificar Despliegue

1. **Verifica que el sitio carga**: Visita tu dominio
2. **Prueba el login de admin**: Ve a `https://tu-dominio.com/login.html`
3. **Prueba crear un trabajo**: Completa el formulario
4. **Prueba aprobar un trabajo**: Desde el panel de admin
5. **Verifica que aparece en el job board**: Recarga la página principal

## Paso 5: Monitoreo

- **Logs**: Railway muestra logs en tiempo real en el dashboard
- **Métricas**: Railway muestra uso de CPU, memoria, etc.
- **Base de datos**: Railway hace backups automáticos de PostgreSQL

## Troubleshooting

### El sitio no carga
- Verifica que las variables de entorno estén configuradas
- Revisa los logs en Railway para ver errores

### La base de datos no funciona
- Verifica que `DATABASE_URL` esté configurado correctamente
- Revisa que PostgreSQL esté corriendo en Railway
- Los logs mostrarán errores de conexión si hay problemas

### Los trabajos no aparecen
- Verifica que los trabajos estén aprobados en el panel de admin
- Revisa los logs del servidor para ver errores de queries
- Verifica que el filtro de equipo coincida con los valores en la BD

## Costos

- **Railway**: Tiene un plan gratuito generoso (500 horas/mes gratis)
- **PostgreSQL en Railway**: Incluido en el plan gratuito
- **Dominio**: Ya tienes indies.cl, solo necesitas configurar DNS

## Backup

Railway hace backups automáticos de PostgreSQL. Para backups manuales:

```bash
# Conectar a PostgreSQL de Railway y hacer dump
pg_dump $DATABASE_URL > backup.sql
```

## Actualizaciones Futuras

Para actualizar el código en producción:

```bash
git add .
git commit -m "Descripción de cambios"
git push origin main
```

Railway detectará automáticamente el push y redesplegará.

