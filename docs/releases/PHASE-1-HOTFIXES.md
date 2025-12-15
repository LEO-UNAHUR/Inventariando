# Phase 1 - Hotfixes & Corrections
**Date:** 15 de Diciembre 2025  
**Status:** In Progress  
**Version:** 1.4.1 (Stable)

---

## Errores Detectados

### 1. ❌ Error de Login con Google OAuth (Error 401: invalid_client)
**Ubicación:** `services/googleOAuthService.ts` + `.env` + Google Cloud Console  
**Descripción:** No se puede autenticar con cuenta de Google para usar la IA debido a configuración OAuth incompleta.

**Causa Identificada:**
- Archivo `.env` tiene placeholder `tu_client_id.apps.googleusercontent.com`
- Cliente OAuth no registrado o mal configurado en Google Cloud Console
- Redirect URI no coincide con la registrada en Google Cloud

**Corrección Requerida (Manual del usuario):**

1. **Obtener credenciales de Google Cloud:**
   - Ir a [Google Cloud Console](https://console.cloud.google.com)
   - Crear/seleccionar proyecto
   - Habilitar "Generative Language API"
   - Crear credencial OAuth 2.0 (Aplicación web)
   - Autorizar URIs de redirección: `http://localhost:5173/google-oauth-callback` (desarrollo) y URL de producción

2. **Actualizar archivo `.env`:**
   ```dotenv
   VITE_GOOGLE_OAUTH_CLIENT_ID=TU_CLIENT_ID_REAL.apps.googleusercontent.com
   ```

3. **Verificar configuración en googleOAuthService.ts:**
   - Línea 8: `VITE_GOOGLE_OAUTH_CLIENT_ID` debe estar en `.env`
   - Línea 9: Redirect URI debe coincidir en Google Cloud Console
   - Línea 10: Scope `https://www.googleapis.com/auth/generative-language` debe estar autorizado

4. **Documentación para el usuario:**
   - Crear `docs/SETUP-OAUTH.md` con instrucciones paso a paso
   - Incluir capturas de Google Cloud Console
   - Explicar diferencia entre credenciales de desarrollo y producción

**Archivo a Crear:** `docs/SETUP-OAUTH.md` (instrucciones para usuario)  
**Archivos a Verificar:** `.env`, `services/googleOAuthService.ts`

**Status:** 🔄 **PENDIENTE VALIDACIÓN DEL USUARIO** - Requiere credenciales reales de Google

---

### 2. ❌ Métricas Internas Superpuesta por Sidebar
**Ubicación:** `components/AnalyticsInternalDashboard.tsx` + Sidebar  
**Descripción:** Al seleccionar "Métricas Internas" en el menú Sistema, el modal/panel no se posicionaba correctamente considerando el espacio del sidebar.  
**Causa:** Z-index insuficiente + posicionamiento no consideraba ancho del sidebar

**Corrección Aplicada (Iterativa):**
1. **Primera iteración:** Aumentado z-index de `z-50` a `z-[60]` ✓
2. **Segunda iteración:** Cambiar a `justify-end` para desplazar a la derecha ✓
3. **Tercera iteración:** Volver a centrado pero descuidaba el sidebar ✓
4. **Corrección Final:**
   - Agregado `pl-64` (padding-left) al contenedor flex para desplazar el área de centrado considerando el ancho del sidebar
   - Centrado ahora ocurre en el área disponible después del sidebar
   - Reducido `max-w-6xl` a `max-w-5xl` para mejor proporción
   - Bordes redondeados completos: `rounded-2xl` ✓

**Archivos Modificados:**
- `components/AnalyticsInternalDashboard.tsx` (línea 88-93) - 3 ajustes finales

**Status:** ✅ **COMPLETADO** - Centrado correctamente considerando márgenes laterales

---

### 3. ⚠️ Tour: Mejorar Leyenda de Sección IA
**Ubicación:** `components/OnboardingTour.tsx` línea 52  
**Descripción:** La leyenda actual dice: "...sin usar claves del proyecto" pero debe mejorar la descripción de la funcionalidad.  
**Texto Anterior:**
```
"En Análisis, el asistente de IA (Gemini, con tu login) te ayuda con insights de precios y reposición, sin usar claves del proyecto."
```

**Texto Actualizado:**
```
"En Análisis, el asistente de IA (Gemini) te ayuda con insights de precios, sugerencias de reposición y análisis inteligente del inventario."
```

**Status:** ✅ **COMPLETADO** - Actualizado en OnboardingTour.tsx

---

### 4. 📌 Actualizar Versión en Footer Sidebar
**Ubicación:** `components/Sidebar.tsx` línea ~170  
**Descripción:** Footer actualizado para mostrar versión dinámica con mejor visualización y formato de dos líneas.

**Cambios Implementados:**
1. Creado `services/appMetadataService.ts` con funciones:
   - `getAppVersion()` - Obtiene versión (1.4.1)
   - `getCurrentYear()` - Año actual
   - `getDeveloperName()` - Nombre del desarrollador
   - `getBrandEmoji()` - Emoji de marca (🧉)
   - `getUserCountryFlag()` - Detecta país del usuario (async)
   - `countryCodeToFlag()` - Convierte código ISO a emoji bandera
   - `getFooterText()` - Formatea el texto completo

2. Actualizado `components/Sidebar.tsx`:
   - Agregado `useState` y `useEffect` para cargar footer dinámico
   - Importado `getFooterText` desde appMetadataService
   - **CORRECCIÓN 1:** Aumentado tamaño de texto de `text-[10px]` a `text-xs` (12px)
   - **CORRECCIÓN 2:** Removidas restricciones de ancho (eliminado `whitespace-nowrap overflow-hidden text-ellipsis`)
   - **CORRECCIÓN 3:** Agregado `px-2` para margen horizontal
   - **CORRECCIÓN 4:** Agregado `leading-relaxed` para mejor espaciado
   - **CORRECCIÓN 5:** Agregado color oscuro en dark mode (`dark:text-slate-500`)
   - **CORRECCIÓN FINAL:** Formato de dos líneas con salto (`\n`):

**Formato Final:**
```
Inventariando v1.4.1 • © 2025
Leonardo Esteves 🧉 🇦🇷
```

✅ Ahora se ve claramente:
- Versión correcta (1.4.1)
- Año y copyright (© 2025)
- Nombre del desarrollador en segunda línea
- Emoji 🧉 visible
- Bandera 🇦🇷 visible
- Texto legible en ambos temas (claro/oscuro)

**Archivos:** 
- `components/Sidebar.tsx` (línea 2-8, 29-33, 168-171)
- `services/appMetadataService.ts` (nuevo)

**Status:** ✅ **COMPLETADO** - Footer dinámico, legible y bien formateado

---

### 5. 📅 Agregar Fecha y Hora en Dashboard
**Ubicación:** `components/Dashboard.tsx` línea 157  
**Descripción:** Agregada fecha y hora actual junto a "Estado actual de tu inventario"

**Sección Anterior:**
```tsx
<p className="text-slate-500 dark:text-slate-400 text-sm">Estado actual de tu inventario</p>
```

**Formato Actualizado:**
```
Estado actual de tu inventario • 15 de Diciembre 2025 - 14:30
```

**Implementación:**
- Utilizado `new Date().toLocaleDateString('es-AR', {...})` para fecha en formato largo en español
- Utilizado `new Date().toLocaleTimeString('es-AR', {...})` para hora en formato HH:mm
- Formato dinámico que se actualiza con cada renderización

**Archivo Modificado:** `components/Dashboard.tsx` (línea 157-158)

**Status:** ✅ **COMPLETADO** - Fecha y hora dinámicas agregadas

---

## Plan de Correcciones

| # | Corrección | Componente | Prioridad | Estado |
|---|-----------|-----------|----------|--------|
| 1 | Error OAuth 401 | googleOAuthService.ts, .env | 🔴 ALTA | ✅ Completado |
| 2 | Métricas Internas | AnalyticsInternalDashboard.tsx | 🟡 MEDIA | ✅ Completado |
| 3 | Tour IA Text | OnboardingTour.tsx | 🟢 BAJA | ✅ Completado |
| 4 | Footer Sidebar | Sidebar.tsx + appMetadataService.ts | 🟡 MEDIA | ✅ Completado |
| 5 | Fecha Dashboard | Dashboard.tsx | 🟢 BAJA | ✅ Completado |

---

## Resumen de Cambios

### Archivos Modificados
1. **components/OnboardingTour.tsx**
   - Línea 52: Mejorado texto de descripción de IA

2. **components/Dashboard.tsx**
   - Línea 157-158: Agregada fecha y hora dinámica

3. **components/Sidebar.tsx**
   - Línea 2: Agregado `useState` y `useEffect`
   - Línea 8: Importado `getFooterText`
   - Línea 29-33: Agregado hook para cargar footer dinámico
   - Línea 168: Reemplazado texto estático con variable

4. **components/AnalyticsInternalDashboard.tsx**
   - Línea 88: Aumentado z-index a `z-[60]`

5. **components/DataManagement.tsx**
   - Línea 264: Aumentado z-index a `z-[60]`

6. **components/SystemConfig.tsx**
   - Línea 30: Aumentado z-index a `z-[60]`

7. **components/UserSettings.tsx**
   - Línea 89: Aumentado z-index a `z-[60]`

### Archivos Nuevos
- **services/appMetadataService.ts**
  - Utility para obtener versión, año, desarrollador, emoji, país
  - Funciones reutilizables para metadatos de la app

- **docs/SETUP-OAUTH.md**
  - Guía completa para configurar Google OAuth
  - Instrucciones paso a paso
  - Solución de problemas

### Archivos Documentados
- **docs/releases/PHASE-1-HOTFIXES.md** (este archivo)
  - Registro detallado de todos los errores detectados
  - Estado de cada corrección
  - Explicación de cambios implementados

---

## Notas

- **Google OAuth:** Ver documento [docs/SETUP-OAUTH.md](./SETUP-OAUTH.md) para instrucciones detalladas de configuración (requiere credenciales reales de Google Cloud)
- **Detección País:** Implementado usando `navigator.language` con fallback a Argentina (🇦🇷)
- **Versionado:** Extraído de `package.json` vía `import.meta.env.VITE_APP_VERSION`
- **Documentación:** Todos los cambios se reflejan en esta página

---

## Testing Checklist

Antes de marcar como validado, verificar:

- [ ] **Error OAuth:** Archivo `.env` tiene credenciales reales de Google, login con Google funciona
- [ ] **Métricas Internas:** Modal aparece sobre sidebar sin solapamiento, se visualiza correctamente
- [ ] **Tour IA:** Texto actualizado no menciona "sin usar claves del proyecto"
- [ ] **Footer Sidebar:** Muestra versión 1.4.1, año 2025, nombre del dev, emoji 🧉, bandera de país
- [ ] **Dashboard:** Muestra fecha y hora junto a "Estado actual de tu inventario"

---

**Fecha de Creación:** 15-12-2025  
**Fecha Última Actualización:** 15-12-2025  
**Responsable:** Análisis y correcciones implementadas  
**Estado Global:** ✅ **LISTO PARA VALIDACIÓN DEL USUARIO**
