# Instrucciones de Deploy

## 1. Push a GitHub

```bash
cd /Users/natochi/Documents/jobs
git add -A
git commit -m "Refactor: código limpio y organizado"
git push origin main
```

## 2. Vercel

1. Ve a [vercel.com](https://vercel.com)
2. Importa tu repositorio de GitHub
3. Configura las variables de entorno:
   - `ADMIN_PASSWORD` = tu contraseña de admin
   - `SESSION_SECRET` = un string aleatorio largo
   - `NODE_ENV` = production
   - `DATABASE_URL` = (opcional, si usas PostgreSQL)
4. Deploy

## 3. Cloudflare (DNS)

Para trabajos.indies.cl:

1. Ve a Cloudflare Dashboard
2. Selecciona tu dominio (indies.cl)
3. DNS > Add Record:
   - Type: CNAME
   - Name: trabajos
   - Target: tu-proyecto.vercel.app
   - Proxy: ON (naranja)

## 4. PostgreSQL (Opcional)

Si quieres usar PostgreSQL en lugar de SQLite:

### Railway
1. Crea proyecto en [railway.app](https://railway.app)
2. Add PostgreSQL
3. Copia la `DATABASE_URL`
4. Agrégala a Vercel

### Supabase
1. Crea proyecto en [supabase.com](https://supabase.com)
2. Copia la connection string de Settings > Database
3. Agrégala a Vercel como `DATABASE_URL`

## Verificación

Después del deploy:

1. Visita trabajos.indies.cl
2. Prueba el formulario de trabajo
3. Ve a /login.html y prueba el admin
4. Verifica que los trabajos se creen y aprueben correctamente
