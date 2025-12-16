# Setup Google OAuth para Inventariando

## Propósito
Este documento guía el proceso de configuración de Google OAuth 2.0 para permitir que los usuarios se autentiquen con su cuenta de Google y usen la funcionalidad de IA (Gemini) en Inventariando.

---

## Pasos de Configuración

### 1. Acceder a Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Inicia sesión con tu cuenta de Google
3. Crea un nuevo proyecto o selecciona uno existente:
   - Click en el selector de proyecto (arriba a la izquierda)
   - Click en "Nuevo Proyecto"
   - Nombre: `Inventariando` (o tu preferencia)
   - Crear

### 2. Habilitar APIs Requeridas

1. En el menú principal, ve a **APIs y Servicios** → **Biblioteca**
2. Busca **Generative Language API** (para usar Gemini)
3. Haz click en la tarjeta de la API
4. Click en **Habilitar**

Espera a que la API se habilite (puede tomar 1-2 minutos)

### 3. Crear Credenciales OAuth 2.0

1. Ve a **APIs y Servicios** → **Credenciales**
2. Click en **+ Crear credenciales** → **ID de cliente OAuth**
3. Si se requiere, **Configurar pantalla de consentimiento OAuth**:
   - Selecciona **Externo** como tipo de usuario
   - Complete los campos obligatorios:
     - Nombre de la app: `Inventariando`
     - Email de soporte: tu email
     - Información de contacto del desarrollador: tu email
   - Click en **Guardar y continuar**

4. De vuelta en Credenciales:
   - Tipo de aplicación: **Aplicación web**
   - Nombre: `Inventariando Web`

5. **Autoridades JavaScript:**
   - Desarrollo: `http://localhost:5173`
   - Producción: `https://tudominio.com` (reemplaza con tu dominio real)
   - Click en **+ Agregar URI**

6. **URIs autorizados de redirección:**
   - Desarrollo: `http://localhost:5173/google-oauth-callback`
   - Producción: `https://tudominio.com/google-oauth-callback`
   - Click en **+ Agregar URI**

7. Click en **Crear**

### 4. Copiar Client ID

1. Se mostrará un modal con tu Client ID y Client Secret
2. **Copia el Client ID** (se ve como: `123456789-abcdefg.apps.googleusercontent.com`)
3. Guárdalo en un lugar seguro (no compartas el Client Secret)

---

## Configurar Inventariando

### 1. Actualizar archivo `.env`

En la raíz del proyecto (`c:\Users\leoez\Documents\Proyectos VSC\Inventariando\`):

1. Abre `.env` en un editor
2. Reemplaza:
   ```dotenv
   VITE_GOOGLE_OAUTH_CLIENT_ID=tu_client_id.apps.googleusercontent.com
   ```
   
   Con tu Client ID real:
   ```dotenv
   VITE_GOOGLE_OAUTH_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
   ```

3. **Guarda el archivo**

### 2. Reinicia el servidor de desarrollo

```bash
npm run dev
```

El servidor reiniciará automáticamente si `npm run dev` estaba en ejecución.

---

## Probar la Configuración

1. Abre la app en `http://localhost:5173`
2. Navega a **Inteligencia Artificial** (o la sección de IA)
3. Click en **Abrir Login con Google** (o el botón de autenticación)
4. Debería abrirse una ventana popup con el login de Google
5. Si ves **Error 401: invalid_client**, vuelve a verificar:
   - Client ID copiar correctamente
   - `.env` está guardado
   - El servidor fue reiniciado después de cambiar `.env`

---

## Solución de Problemas

### Error 401: invalid_client
- **Causa:** Client ID incorrecto o mal copiado
- **Solución:** Verifica que el Client ID en `.env` coincida exactamente con el de Google Cloud Console

### Error: "No se pudo abrir la ventana de autenticación"
- **Causa:** Los popups están bloqueados en el navegador
- **Solución:** Permite popups para `localhost:5173` en tu navegador

### Error: "Error en la redirección"
- **Causa:** Redirect URI no coincide con la registrada en Google Cloud
- **Solución:** Verifica que `http://localhost:5173/google-oauth-callback` esté registrado en Google Cloud Console

### Después de cambiar `.env`, los cambios no se aplican
- **Causa:** El servidor de desarrollo no se reinició
- **Solución:** Detén `npm run dev` y reinicia con `npm run dev`

---

## Para Producción

Cuando despliegues a producción:

1. En Google Cloud Console:
   - Agrega tu dominio de producción en "Autoridades JavaScript"
   - Agrega `https://tudominio.com/google-oauth-callback` en "URIs de redirección"

2. En tu servidor de producción:
   - Actualiza `.env` (o variables de entorno del servidor):
     ```
     VITE_GOOGLE_OAUTH_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
     ```

3. Redeploy la aplicación

---

## Seguridad

⚠️ **IMPORTANTE:**
- **Nunca compartas tu Client Secret** (es diferente del Client ID)
- **Nunca commits `.env` a Git** (ya está en `.gitignore`)
- El Client ID es seguro compartir (se expone en el frontend)
- Para desarrollo local y producción, puedes usar el mismo Client ID si ambos están registrados en Google Cloud

---

## Referencias

- [Google Cloud Console](https://console.cloud.google.com)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Generative Language API](https://ai.google.dev/docs)

**Última Actualización:** 15 de Diciembre 2025  
**Estado:** Activo para Phase 1 Hotfixes
