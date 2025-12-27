# 🚀 INSTRUCCIONES PARA DESPLEGAR A PRODUCCIÓN

## ✅ Estado Actual

- ✅ Código listo para producción
- ✅ Commit realizado (falta push)
- ✅ Configuración de Vercel lista
- ✅ Soporte para PostgreSQL preparado

## 📋 PASOS PARA DESPLEGAR

### 1. Push a GitHub (HAZLO AHORA)

```bash
cd /Users/natochi/Documents/jobs
git push origin main
```

Si falla por SSL:
```bash
git config --global http.sslVerify false
git push origin main
```

### 2. Crear Proyecto en Vercel

1. Ve a https://vercel.com
2. Login con GitHub
3. Click "Add New Project"
4. Selecciona tu repositorio `trabajos`
5. Vercel detectará automáticamente la configuración
6. Click "Deploy"

### 3. Configurar Variables de Entorno

En Vercel Dashboard → Tu Proyecto → Settings → Environment Variables:

Agrega estas 3 variables:

```
NODE_ENV = production
ADMIN_PASSWORD = tu_contraseña_super_segura
SESSION_SECRET = [genera una clave aleatoria de 32+ caracteres]
```

**Para generar SESSION_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Configurar Base de Datos PostgreSQL (RECOMENDADO)

**SQLite NO es persistente en Vercel** (se reinicia en cada deploy).

#### Opción A: Railway (Más fácil, gratis)

1. Ve a https://railway.app
2. Sign up con GitHub
3. "New Project" → "Provision PostgreSQL"
4. Click en PostgreSQL → Tab "Connect" → Copia `DATABASE_URL`
5. En Vercel, agrega variable:
   ```
   DATABASE_URL = [pega la URL que copiaste de Railway]
   ```
6. Vercel redeployará automáticamente

#### Opción B: Supabase (Gratis)

1. Ve a https://supabase.com
2. Crea proyecto
3. Settings → Database → Connection string
4. Copia la URI
5. En Vercel, agrega:
   ```
   DATABASE_URL = [URI de Supabase]
   ```

**Nota:** El código detectará automáticamente PostgreSQL si `DATABASE_URL` está configurado.

### 5. Configurar Dominio en Cloudflare

#### Opción A: Subdominio (trabajos.indies.cl) - RECOMENDADO

1. **En Vercel:**
   - Settings → Domains
   - Agrega: `trabajos.indies.cl`
   - Vercel te dará un registro DNS

2. **En Cloudflare:**
   - DNS → Add Record
   - Tipo: `CNAME`
   - Nombre: `trabajos`
   - Contenido: `cname.vercel-dns.com` (o el que Vercel te indique)
   - Proxy: ✅ Activado (naranja)
   - TTL: Auto

#### Opción B: Path (indies.cl/trabajos)

Requiere configuración más compleja. Mejor usar subdominio.

### 6. Verificar Despliegue

1. Espera 1-2 minutos después del deploy
2. Visita: `https://trabajos.indies.cl`
3. Prueba:
   - ✅ Página principal carga
   - ✅ Puedes crear un trabajo
   - ✅ Login admin funciona: `https://trabajos.indies.cl/login.html`
   - ✅ Puedes aprobar trabajos
   - ✅ Trabajos aparecen en la página

## 🔧 Troubleshooting

### Error: "Cannot find module"
- Verifica que todas las dependencias estén en `package.json`
- Revisa logs en Vercel Dashboard

### Error: "Database error"
- Si usas SQLite: Normal, se reinicia en cada deploy
- Si usas PostgreSQL: Verifica `DATABASE_URL` en variables de entorno

### Dominio no funciona
- Verifica DNS en Cloudflare (puede tardar hasta 24h)
- Asegúrate de que el proxy esté activado (naranja)
- Verifica que el dominio esté agregado en Vercel

### Sesiones no funcionan
- Verifica `SESSION_SECRET` está configurado
- En producción, cookies requieren HTTPS (Vercel lo maneja)

## 📝 URLs Importantes

- **Página principal:** `https://trabajos.indies.cl`
- **Panel admin:** `https://trabajos.indies.cl/admin.html`
- **Login:** `https://trabajos.indies.cl/login.html`

## ✅ Checklist Final

- [ ] Push a GitHub completado
- [ ] Proyecto creado en Vercel
- [ ] Variables de entorno configuradas (NODE_ENV, ADMIN_PASSWORD, SESSION_SECRET)
- [ ] PostgreSQL configurado en Railway/Supabase (opcional pero recomendado)
- [ ] DATABASE_URL agregada en Vercel (si usas PostgreSQL)
- [ ] Dominio configurado en Cloudflare
- [ ] Despliegue exitoso
- [ ] Todo funciona correctamente

## 🎯 Próximos Pasos

1. Haz el push a GitHub
2. Configura Vercel
3. Configura PostgreSQL en Railway
4. Configura el dominio
5. ¡Listo! 🎉

