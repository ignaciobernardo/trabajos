# Simplemente Trabajos

Job board minimalista para trabajos en tech y startups. Oportunidades top con compensación transparente.

## 🚀 Características

- ✅ Interfaz minimalista y responsive
- ✅ Sistema de pago con Fintoc ($15.000 por publicación)
- ✅ Base de datos SQLite (fácil migración a PostgreSQL)
- ✅ Fetch automático de favicons de empresas
- ✅ Filtrado por categorías (Design, Engineering, Product, Growth)
- ✅ Expiración automática de trabajos (30 días)
- ✅ Sistema de aprobación de trabajos

## 📋 Requisitos Previos

- Node.js 16+ 
- npm o yarn

## 🛠️ Instalación

1. **Clonar el repositorio**
```bash
git clone <tu-repo>
cd jobs
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp env.example.txt .env
```

Edita `.env` y configura:
- `ADMIN_PASSWORD`: Contraseña para acceder al panel de administración
- `SESSION_SECRET`: Clave secreta para las sesiones (cambiar en producción)
- `PORT`: Puerto del servidor (opcional, por defecto 3000)

4. **Inicializar la base de datos**
```bash
npm run init-db
```

O simplemente inicia el servidor, la base de datos se creará automáticamente:
```bash
npm start
```

## 🎯 Uso

### Desarrollo
```bash
npm run dev
```

El servidor estará disponible en `http://localhost:3000`

### Producción
```bash
npm start
```

## 💳 Sistema de Pago

El sistema de pago utiliza Fintoc. Cuando un usuario completa el formulario y hace clic en "Pagar", se muestra un iframe con la página de pago de Fintoc. Después de completar el pago, el usuario ingresa el número de cuenta y hace clic en "subir oferta" para enviar el trabajo a revisión.

## 🔐 Panel de Administración

El panel de administración permite revisar y aprobar las ofertas de trabajo:

1. **Acceder al panel**: Ve a `http://localhost:3000/login.html` (o tu dominio + `/login.html`)
2. **Iniciar sesión**: Usa la contraseña configurada en `ADMIN_PASSWORD` en tu archivo `.env`
3. **Gestionar trabajos**: 
   - Ver trabajos pendientes de revisión
   - Aprobar o rechazar trabajos
   - Ver todos los trabajos (pendientes, aprobados, rechazados)
   - Eliminar trabajos

**Nota**: Por defecto, la contraseña es `admin123` si no se configura `ADMIN_PASSWORD` en el `.env`. **¡Cambia esto en producción!**

## 📁 Estructura del Proyecto

```
jobs/
├── public/           # Archivos estáticos (HTML, CSS, JS)
├── db/              # Base de datos y configuración
├── routes/          # Rutas de la API
│   ├── jobs.js      # Endpoints de trabajos
│   └── payments.js  # Endpoints de pagos
├── server.js        # Servidor principal
└── package.json     # Dependencias
```

## 🔌 API Endpoints

### Jobs
- `GET /api/jobs` - Obtener todos los trabajos aprobados
- `GET /api/jobs?team=Design` - Filtrar por categoría
- `GET /api/jobs/:id` - Obtener trabajo por ID
- `POST /api/jobs` - Crear nuevo trabajo
- `PATCH /api/jobs/:id/payment` - Actualizar estado de pago
- `PATCH /api/jobs/:id/approve` - Aprobar trabajo (admin)
- `PATCH /api/jobs/:id/reject` - Rechazar trabajo (admin)


## 🗄️ Base de Datos

La aplicación usa SQLite por defecto. La base de datos se crea automáticamente en `db/jobs.db`.

### Esquema
- **jobs**: Almacena todos los trabajos con sus detalles
- Campos principales: company_name, job_title, compensation, team, status, payment_status

### Migración a PostgreSQL

Para usar PostgreSQL en producción:

1. Instala `pg`: `npm install pg`
2. Actualiza `db/database.js` para usar PostgreSQL
3. Configura `DATABASE_URL` en `.env`

## 🚢 Despliegue

### Despliegue en Vercel (Recomendado)

1. **Conecta tu repositorio a Vercel:**
   - Ve a [vercel.com](https://vercel.com)
   - Importa tu repositorio de GitHub
   - Vercel detectará automáticamente la configuración

2. **Configura variables de entorno en Vercel:**
   ```
   NODE_ENV=production
   ADMIN_PASSWORD=tu_contraseña_segura
   SESSION_SECRET=clave_secreta_larga_y_aleatoria
   ```

3. **Base de datos:**
   - **Opción rápida:** SQLite (funciona pero se reinicia en cada deploy)
   - **Opción producción:** PostgreSQL en Railway o Supabase
     - Railway: [railway.app](https://railway.app) - PostgreSQL gratis
     - Supabase: [supabase.com](https://supabase.com) - PostgreSQL gratis

4. **Configurar dominio:**
   - En Vercel: Settings → Domains → Agrega `trabajos.indies.cl`
   - En Cloudflare: CNAME `trabajos` → `cname.vercel-dns.com`

### Variables de entorno en producción:
- `NODE_ENV=production`
- `ADMIN_PASSWORD` (contraseña para panel admin)
- `SESSION_SECRET` (clave secreta para sesiones)
- `PORT` (Vercel lo maneja automáticamente)
- `DATABASE_URL` (si usas PostgreSQL en Railway/Supabase)

## 📝 Notas

- Los trabajos expiran automáticamente después de 30 días
- Los trabajos requieren aprobación manual antes de publicarse
- El pago debe completarse antes de que el trabajo sea considerado para aprobación
- Los favicons se obtienen automáticamente de Google's favicon service

## 📄 Licencia

MIT

## 👤 Autor

Creado por [indies.cl](https://indies.cl)

