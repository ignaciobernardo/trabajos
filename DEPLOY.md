# Guía de Deployment a indies.cl/trabajos

## Opción 1: Cloudflare Pages (Directo - Sin Git)

### Paso 1: Preparar los archivos
1. Asegúrate de tener todos los archivos listos:
   - index.html
   - styles.css
   - script.js
   - _headers (opcional, para seguridad)

### Paso 2: Acceder a Cloudflare Pages
1. Ve a [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Inicia sesión con tu cuenta
3. En el menú lateral, busca y haz clic en **"Pages"**
4. Haz clic en **"Create a project"**

### Paso 3: Subir archivos
1. Selecciona **"Upload assets"** (no "Connect to Git")
2. Arrastra y suelta todos los archivos de la carpeta `jobs` o haz clic en "Select files"
3. Sube:
   - index.html
   - styles.css
   - script.js
   - _headers (opcional)
4. Haz clic en **"Deploy site"**

### Paso 4: Configurar dominio personalizado
1. Una vez desplegado, verás una URL tipo: `tu-proyecto.pages.dev`
2. Ve a **"Custom domains"** en la configuración del proyecto
3. Haz clic en **"Set up a custom domain"**
4. Ingresa: `trabajos.indies.cl` o `indies.cl/trabajos`
5. Cloudflare te guiará para configurar los DNS

### Paso 5: Configurar DNS (si usas subdominio)
Si usas `trabajos.indies.cl`:
- En Cloudflare DNS, agrega un registro CNAME:
  - Nombre: `trabajos`
  - Target: `tu-proyecto.pages.dev`
  - Proxy: Activado (nube naranja)

### Paso 6: Configurar para ruta (indies.cl/trabajos)
Si quieres usar `indies.cl/trabajos` (ruta en lugar de subdominio):
1. En Cloudflare Pages, ve a **"Custom domains"**
2. Agrega `indies.cl` como dominio
3. En **"Page Rules"** o usando **Workers**, configura una regla para redirigir `/trabajos` al proyecto de Pages
4. O mejor aún, usa **Cloudflare Workers** para servir el contenido en `/trabajos`

---

## Opción 2: Cloudflare Pages con Git (Recomendado)

### Paso 1: Crear repositorio Git
```bash
cd /Users/natochi/Documents/jobs
git init
git add .
git commit -m "Initial commit: job board"
```

### Paso 2: Subir a GitHub/GitLab
1. Crea un repositorio en GitHub (público o privado)
2. Conecta tu repositorio local:
```bash
git remote add origin https://github.com/tu-usuario/trabajos.git
git branch -M main
git push -u origin main
```

### Paso 3: Conectar con Cloudflare Pages
1. Ve a Cloudflare Dashboard > Pages
2. Haz clic en **"Create a project"**
3. Selecciona **"Connect to Git"**
4. Autoriza Cloudflare a acceder a tu repositorio
5. Selecciona el repositorio `trabajos`
6. Configuración de build:
   - **Build command**: (dejar vacío, es sitio estático)
   - **Build output directory**: `/` (raíz)
   - **Root directory**: `/` (raíz)
7. Haz clic en **"Save and Deploy"**

### Paso 4: Configurar dominio
1. Una vez desplegado, ve a **"Custom domains"**
2. Agrega `trabajos.indies.cl` o configura `indies.cl/trabajos`

---

## Opción 3: Usar Workers para ruta /trabajos

Si necesitas que esté en `indies.cl/trabajos` (no subdominio), usa Cloudflare Workers:

1. Ve a **Workers & Pages** > **Create** > **Worker**
2. Crea un worker que sirva los archivos estáticos en la ruta `/trabajos`
3. O usa **Workers Routes** para enrutar `/trabajos/*` a tu proyecto de Pages

---

## Notas importantes:

- **HTTPS**: Cloudflare Pages incluye HTTPS automático
- **Actualizaciones**: Con Git, cada push actualiza automáticamente el sitio
- **Rutas**: Para `indies.cl/trabajos`, considera usar Workers o configurar el sitio principal para servir desde esa ruta

