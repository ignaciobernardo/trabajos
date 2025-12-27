# Simplemente Trabajos

Job board minimalista para trabajos en tech y startups. Oportunidades top con compensación transparente.

## 🚀 Características

- ✅ Interfaz minimalista y responsive
- ✅ Sistema de pago con Fintoc ($15.000 CLP por publicación)
- ✅ Base de datos SQLite (desarrollo) / PostgreSQL (producción)
- ✅ Fetch automático de favicons de empresas
- ✅ Filtrado por categorías (Design, Engineering, Product, Growth)
- ✅ Expiración automática de trabajos (30 días)
- ✅ Sistema de aprobación de trabajos con panel de admin
- ✅ Autenticación con contraseña para el panel de admin

## 📋 Requisitos Previos

- Node.js 16+ 
- npm o yarn

## 🛠️ Instalación Local

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

4. **Iniciar el servidor**
```bash
npm start
# o para desarrollo:
npm run dev
```

El servidor estará disponible en `http://localhost:3000`

## 🚀 Despliegue en Producción

### Opción Recomendada: Railway

Railway es la opción más simple porque incluye PostgreSQL gratis y es fácil de configurar.

1. **Sube el código a GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <tu-repo-github>
git push -u origin main
```

2. **Despliega en Railway**
   - Ve a [railway.app](https://railway.app) y crea una cuenta
   - Click en "New Project" → "Deploy from GitHub repo"
   - Selecciona tu repositorio
   - Railway detectará automáticamente el proyecto Node.js

3. **Configura Base de Datos PostgreSQL**
   - En Railway, click en "New" → "Database" → "Add PostgreSQL"
   - Railway creará automáticamente una base de datos PostgreSQL
   - Copia la variable `DATABASE_URL` que Railway genera

4. **Configura Variables de Entorno**
   En Railway, ve a "Variables" y agrega:
   ```
   NODE_ENV=production
   PORT=3000
   ADMIN_PASSWORD=tu_contraseña_super_segura_aqui
   SESSION_SECRET=tu_secret_key_muy_larga_y_aleatoria_aqui
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   ```

5. **El código detectará automáticamente PostgreSQL** si `DATABASE_URL` está configurado

6. **Configura el Dominio**
   - En Railway, ve a "Settings" → "Networking"
   - Click en "Generate Domain" o agrega tu dominio personalizado
   - Para `indies.cl/trabajos`, configura un subdominio o path en tu DNS

## 🔐 Panel de Administración

El panel de administración permite revisar y aprobar las ofertas de trabajo:

1. **Acceder al panel**: Ve a `https://tu-dominio.com/login.html`
2. **Iniciar sesión**: Usa la contraseña configurada en `ADMIN_PASSWORD`
3. **Gestionar trabajos**: 
   - Ver trabajos pendientes de revisión
   - Aprobar o rechazar trabajos
   - Ver todos los trabajos (pendientes, aprobados, rechazados)
   - Eliminar trabajos

## 💳 Sistema de Pago

El sistema de pago utiliza Fintoc. Cuando un usuario completa el formulario y hace clic en "Pagar", se muestra un iframe con la página de pago de Fintoc. Después de completar el pago, el usuario ingresa el número de cuenta y hace clic en "subir oferta" para enviar el trabajo a revisión.

## 📁 Estructura del Proyecto

```
jobs/
├── public/           # Archivos estáticos (HTML, CSS, JS)
├── db/              # Base de datos y configuración
├── routes/          # Rutas de la API
│   ├── jobs.js      # Endpoints de trabajos
│   ├── admin.js     # Endpoints de admin
│   └── auth.js      # Endpoints de autenticación
├── middleware/      # Middleware (autenticación)
├── server.js        # Servidor principal
└── package.json     # Dependencias
```

## 🔌 API Endpoints

### Jobs (Público)
- `GET /api/jobs` - Obtener todos los trabajos aprobados
- `GET /api/jobs?team=design` - Filtrar por categoría
- `POST /api/jobs` - Crear nuevo trabajo
- `PATCH /api/jobs/:id/payment` - Actualizar estado de pago

### Admin (Protegido)
- `GET /api/admin/jobs` - Obtener trabajos pendientes
- `GET /api/admin/jobs/all` - Obtener todos los trabajos
- `PATCH /api/admin/jobs/:id/approve` - Aprobar trabajo
- `PATCH /api/admin/jobs/:id/reject` - Rechazar trabajo
- `DELETE /api/admin/jobs/:id` - Eliminar trabajo

### Auth
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/logout` - Cerrar sesión
- `GET /api/auth/check` - Verificar estado de autenticación

## 🗄️ Base de Datos

### Desarrollo (SQLite)
La aplicación usa SQLite por defecto. La base de datos se crea automáticamente en `db/jobs.db`.

### Producción (PostgreSQL)
Cuando `DATABASE_URL` está configurado, la aplicación usa PostgreSQL automáticamente. Railway proporciona PostgreSQL gratis.

## 📝 Notas

- Los trabajos expiran automáticamente después de 30 días desde la aprobación
- Los trabajos requieren aprobación manual antes de publicarse
- El pago debe completarse antes de que el trabajo sea considerado para aprobación
- Los favicons se obtienen automáticamente de Google's favicon service

## 📄 Licencia

MIT

## 👤 Autor

Creado por [indies.cl](https://indies.cl)
