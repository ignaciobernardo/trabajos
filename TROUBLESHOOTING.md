# 🔧 Troubleshooting - Problema de Login

## Problema: La contraseña no funciona / Redirige a la misma página

### Posibles Causas:

1. **La contraseña no está configurada en Vercel**
   - Ve a Vercel Dashboard → Tu Proyecto → Settings → Environment Variables
   - Verifica que `ADMIN_PASSWORD` esté configurada
   - **IMPORTANTE:** La contraseña debe ser EXACTAMENTE la que configuraste en Vercel
   - "tu_contraseña_super_segura" es solo un EJEMPLO en la documentación

2. **Las sesiones no persisten en Vercel (serverless)**
   - Vercel usa funciones serverless
   - Las sesiones en memoria no funcionan bien
   - Necesitas usar un store de sesiones persistente (Redis)

### Solución Rápida:

1. **Verifica la contraseña en Vercel:**
   - Ve a Vercel Dashboard
   - Settings → Environment Variables
   - Copia el valor exacto de `ADMIN_PASSWORD`
   - Úsala para hacer login

2. **Revisa los logs:**
   - En Vercel Dashboard → Tu Proyecto → Logs
   - Busca mensajes como:
     - "Login attempt - Password received"
     - "Password mismatch"
     - "Session saved successfully"

3. **Si las sesiones no funcionan:**
   - Las sesiones en memoria no persisten en Vercel
   - Considera usar Redis o cambiar a autenticación basada en tokens

### Solución Temporal (Para Testing):

Puedes deshabilitar temporalmente la autenticación en el middleware para probar:

En `middleware/auth.js`, comenta temporalmente:
```javascript
function requireAuth(req, res, next) {
  // Temporarily disabled for testing
  return next();
  
  // Original code:
  // if (req.session && req.session.isAuthenticated) {
  //   return next();
  // } else {
  //   return res.status(401).json({ error: 'no autorizado' });
  // }
}
```

**⚠️ NO OLVIDES REVERTIR ESTO DESPUÉS**

