# Trabajos Indies

Job board para trabajos tech y startups.

## Requisitos

- Node.js >= 18
- npm o yarn

## Instalación

```bash
npm install
cp env.example .env
# Edita .env con tus configuraciones
npm run dev
```

## Configuración

Variables de entorno:

| Variable | Descripción | Default |
|----------|-------------|---------|
| `PORT` | Puerto del servidor | 3000 |
| `NODE_ENV` | Ambiente | development |
| `ADMIN_PASSWORD` | Contraseña del admin | admin123 |
| `SESSION_SECRET` | Secret para sesiones | (generado) |
| `DATABASE_URL` | URL de PostgreSQL (opcional) | SQLite local |

## Estructura

```
├── server.js           # Entry point
├── db/
│   └── database.js     # Database abstraction (SQLite/PostgreSQL)
├── routes/
│   ├── jobs.js         # API de trabajos
│   ├── admin.js        # API de administración
│   └── auth.js         # Autenticación
├── middleware/
│   └── auth.js         # Middleware de autenticación
└── public/             # Frontend estático
```

## API

### Públicas
- `GET /api/jobs` - Lista trabajos aprobados
- `GET /api/jobs?team=design` - Filtra por equipo
- `POST /api/jobs` - Crea nuevo trabajo
- `PATCH /api/jobs/:id/payment` - Actualiza pago

### Admin (requiere autenticación)
- `GET /api/admin/jobs` - Lista trabajos pendientes
- `GET /api/admin/jobs/all` - Lista todos los trabajos
- `PATCH /api/admin/jobs/:id/approve` - Aprueba trabajo
- `PATCH /api/admin/jobs/:id/reject` - Rechaza trabajo
- `DELETE /api/admin/jobs/:id` - Elimina trabajo

### Auth
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/logout` - Cerrar sesión
- `GET /api/auth/check` - Verificar sesión

## Deploy

### Vercel

1. Conecta tu repo a Vercel
2. Configura variables de entorno:
   - `ADMIN_PASSWORD`
   - `SESSION_SECRET`
   - `DATABASE_URL` (opcional, para PostgreSQL)
3. Deploy

### Cloudflare (DNS)

Configura CNAME apuntando a tu proyecto de Vercel.

## Desarrollo

```bash
npm run dev   # Inicia con nodemon
npm start     # Inicia en producción
```

## Licencia

MIT
