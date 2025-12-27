# 🚀 Setup Rápido para Producción

## Paso 1: Push a GitHub

```bash
git push origin main
```

Si tienes problemas con SSL:
```bash
git config --global http.sslVerify false
git push origin main
```

## Paso 2: Configurar Vercel

1. Ve a https://vercel.com
2. Login con GitHub
3. "Add New Project" → Importa tu repo `trabajos`
4. Deja todo por defecto (Vercel detectará automáticamente)

## Paso 3: Variables de Entorno en Vercel

En Vercel → Settings → Environment Variables, agrega:

```
NODE_ENV=production
ADMIN_PASSWORD=tu_contraseña_segura_aqui
SESSION_SECRET=genera_clave_aleatoria_32_caracteres_minimo
```

**Generar SESSION_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Paso 4: Base de Datos (IMPORTANTE)

### Opción Rápida: SQLite (Solo para pruebas)
- Funciona pero se reinicia en cada deploy
- No recomendado para producción

### Opción Producción: Railway PostgreSQL (RECOMENDADO)

1. Ve a https://railway.app
2. Sign up con GitHub
3. "New Project" → "Provision PostgreSQL"
4. Click en PostgreSQL → "Connect" → Copia `DATABASE_URL`
5. En Vercel, agrega:
   ```
   DATABASE_URL=postgresql://postgres:password@host:port/railway
   ```

El código detectará automáticamente PostgreSQL si `DATABASE_URL` está configurado.

## Paso 5: Configurar Dominio

### En Vercel:
1. Settings → Domains
2. Agrega: `trabajos.indies.cl` (o el subdominio que prefieras)

### En Cloudflare:
1. DNS → Add Record
2. Tipo: CNAME
3. Nombre: `trabajos`
4. Contenido: `cname.vercel-dns.com` (o el que Vercel te indique)
5. Proxy: ✅ Activado (naranja)

## Paso 6: Verificar

1. Vercel desplegará automáticamente
2. Espera 1-2 minutos
3. Visita: `https://trabajos.indies.cl`
4. Prueba:
   - Crear un trabajo
   - Login admin: `https://trabajos.indies.cl/login.html`
   - Aprobar trabajo
   - Verificar que aparezca en la página

## ✅ Checklist

- [ ] Push a GitHub completado
- [ ] Proyecto en Vercel creado
- [ ] Variables de entorno configuradas
- [ ] PostgreSQL en Railway configurado (opcional pero recomendado)
- [ ] Dominio configurado en Cloudflare
- [ ] Despliegue exitoso
- [ ] Todo funciona correctamente

## 🆘 Si algo falla

1. Revisa logs en Vercel Dashboard
2. Verifica variables de entorno
3. Verifica DNS en Cloudflare
4. Asegúrate de que PostgreSQL esté configurado si usas Railway

