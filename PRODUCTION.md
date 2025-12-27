# 🚀 Guía de Despliegue a Producción - indies.cl/trabajos

## ✅ Estado Actual

- ✅ Código listo para producción
- ✅ Commit realizado localmente
- ⚠️ Falta hacer push a GitHub (hazlo manualmente)
- ⚠️ Falta configurar Vercel
- ⚠️ Falta configurar base de datos persistente

## 📋 Pasos para Desplegar

### 1. Push a GitHub (Hazlo manualmente)

```bash
git push origin main
```

Si tienes problemas con certificados SSL, puedes usar:
```bash
git config --global http.sslVerify false
git push origin main
```

### 2. Configurar Vercel

1. Ve a [vercel.com](https://vercel.com) e inicia sesión con GitHub
2. Click en "Add New Project"
3. Importa tu repositorio `trabajos`
4. Vercel detectará automáticamente:
   - Framework: Other
   - Build Command: (dejar vacío)
   - Output Directory: (dejar vacío)
   - Install Command: `npm install`

### 3. Variables de Entorno en Vercel

En Vercel Dashboard → Settings → Environment Variables, agrega:

```
NODE_ENV=production
ADMIN_PASSWORD=tu_contraseña_super_segura_aqui
SESSION_SECRET=genera_una_clave_muy_larga_y_aleatoria_minimo_32_caracteres
```

**Para generar SESSION_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Base de Datos - OPCIÓN RECOMENDADA: Railway

**SQLite NO es persistente en Vercel** (se reinicia en cada deploy). Usa PostgreSQL:

#### Opción A: Railway (Más fácil)

1. Ve a [railway.app](https://railway.app)
2. Sign up con GitHub
3. Click "New Project" → "Provision PostgreSQL"
4. Click en la base de datos → "Connect" → Copia la `DATABASE_URL`
5. En Vercel, agrega la variable:
   ```
   DATABASE_URL=postgresql://postgres:password@host:port/railway
   ```

#### Opción B: Supabase (Gratis)

1. Ve a [supabase.com](https://supabase.com)
2. Crea un proyecto
3. Settings → Database → Connection string
4. Copia la URI de conexión
5. En Vercel, agrega:
   ```
   DATABASE_URL=postgresql://postgres:password@host:port/dbname
   ```

### 5. Actualizar Código para PostgreSQL (Si usas Railway/Supabase)

Si usas PostgreSQL, necesitas actualizar `db/database.js`. Por ahora SQLite funcionará pero se reiniciará en cada deploy.

**Para producción con PostgreSQL, instala:**
```bash
npm install pg
```

Y actualiza `db/database.js` para usar PostgreSQL cuando `DATABASE_URL` esté presente.

### 6. Configurar Dominio en Cloudflare

#### Opción A: Subdominio (trabajos.indies.cl)

1. En Vercel: Settings → Domains → Add `trabajos.indies.cl`
2. En Cloudflare:
   - Tipo: CNAME
   - Nombre: trabajos
   - Contenido: `cname.vercel-dns.com` (o el que Vercel te indique)
   - Proxy: ✅ (naranja)

#### Opción B: Path (indies.cl/trabajos)

1. En Vercel: Settings → Domains → Add `indies.cl`
2. En Cloudflare:
   - Configura un Page Rule o Worker para redirigir `/trabajos` a Vercel
   - O usa un proxy en Cloudflare

### 7. Verificar Despliegue

1. Vercel desplegará automáticamente después del push
2. Revisa los logs en Vercel Dashboard
3. Verifica que funcione:
   - `https://trabajos.indies.cl` (o tu dominio)
   - `https://trabajos.indies.cl/admin.html` (panel admin)
   - `https://trabajos.indies.cl/login.html` (login)

### 8. Probar en Producción

1. Crea un trabajo de prueba
2. Aprueba desde el panel de admin
3. Verifica que aparezca en la página principal

## 🔧 Troubleshooting

### Error: "Cannot find module"
- Verifica que `package.json` tenga todas las dependencias
- En Vercel, revisa los logs de build

### Error: "Database not found"
- SQLite: Normal en Vercel (se reinicia)
- PostgreSQL: Verifica `DATABASE_URL` en variables de entorno

### Error: "Session not working"
- Verifica `SESSION_SECRET` está configurado
- En producción, las cookies necesitan HTTPS (Vercel lo maneja)

### Dominio no funciona
- Verifica DNS en Cloudflare
- Espera propagación (puede tardar hasta 24 horas)
- Verifica que el proxy esté activado (naranja) en Cloudflare

## 📝 Notas Importantes

- **SQLite en Vercel**: Funciona pero se reinicia en cada deploy. Solo para pruebas.
- **PostgreSQL**: Necesario para producción. Railway o Supabase son gratis.
- **Sesiones**: Funcionan con cookies seguras en HTTPS (Vercel lo maneja).
- **Admin Panel**: Protegido con contraseña. Cambia `ADMIN_PASSWORD` en producción.

## 🎯 Checklist Final

- [ ] Push a GitHub completado
- [ ] Proyecto creado en Vercel
- [ ] Variables de entorno configuradas
- [ ] Base de datos PostgreSQL configurada (Railway/Supabase)
- [ ] Dominio configurado en Cloudflare
- [ ] Despliegue exitoso en Vercel
- [ ] Pruebas realizadas en producción
- [ ] Panel admin funciona
- [ ] Trabajos se aprueban y muestran correctamente

## 🆘 Soporte

Si algo no funciona:
1. Revisa los logs en Vercel Dashboard
2. Verifica las variables de entorno
3. Revisa la configuración de DNS en Cloudflare
4. Asegúrate de que la BD esté configurada correctamente

