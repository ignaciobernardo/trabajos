# Guía de Despliegue - indies.cl/trabajos

## 🚀 Despliegue en Vercel

### 1. Preparación

1. **Asegúrate de tener todo en GitHub:**
   ```bash
   git add .
   git commit -m "Ready for production"
   git push origin main
   ```

### 2. Configurar Vercel

1. Ve a [vercel.com](https://vercel.com) e inicia sesión con GitHub
2. Importa el repositorio
3. Configura las variables de entorno en Vercel:
   - `NODE_ENV` = `production`
   - `ADMIN_PASSWORD` = `tu_contraseña_segura`
   - `SESSION_SECRET` = `genera_una_clave_secreta_larga_y_aleatoria`
   - `PORT` = `3000` (Vercel lo maneja automáticamente)

### 3. Base de Datos

**Opción A: SQLite (simple, pero no persistente en Vercel)**
- SQLite funcionará pero se reiniciará en cada deploy
- Para producción, usa una de las opciones siguientes

**Opción B: Railway (Recomendado)**
1. Ve a [railway.app](https://railway.app)
2. Crea un nuevo proyecto
3. Agrega PostgreSQL
4. Copia la `DATABASE_URL` de Railway
5. Agrega `DATABASE_URL` a las variables de entorno en Vercel
6. Actualiza `db/database.js` para usar PostgreSQL

**Opción C: Supabase (Gratis)**
1. Ve a [supabase.com](https://supabase.com)
2. Crea un nuevo proyecto
3. Copia la connection string
4. Agrega `DATABASE_URL` a las variables de entorno en Vercel

### 4. Configurar Dominio

1. En Vercel, ve a Settings → Domains
2. Agrega `trabajos.indies.cl` o `indies.cl/trabajos`
3. En Cloudflare:
   - Si usas subdominio: CNAME `trabajos` → `cname.vercel-dns.com`
   - Si usas path: Configura un proxy o redirige

### 5. Variables de Entorno en Vercel

```
NODE_ENV=production
ADMIN_PASSWORD=tu_contraseña_super_segura_aqui
SESSION_SECRET=genera_una_clave_muy_larga_y_aleatoria_aqui
PORT=3000
```

### 6. Desplegar

1. Vercel detectará automáticamente el `vercel.json`
2. El despliegue se hará automáticamente en cada push a `main`
3. Verifica que todo funcione en `https://indies.cl/trabajos`

## 🔧 Troubleshooting

- Si la BD no funciona, verifica las variables de entorno
- Si el dominio no funciona, verifica DNS en Cloudflare
- Revisa los logs en Vercel Dashboard

## 📝 Notas

- La BD SQLite se reiniciará en cada deploy en Vercel
- Para producción, usa PostgreSQL en Railway o Supabase
- El panel de admin está en `/admin.html`
- El login está en `/login.html`

