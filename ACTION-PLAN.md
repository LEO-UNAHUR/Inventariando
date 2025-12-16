# Plan de acción inmediato

## Objetivo
Aplicar el diagnóstico completo: estabilizar la PWA/Android, reorganizar el código en dominios claros, centralizar la automatización de releases y mantener la documentación limpia sin romper los flujos actuales.

## Pasos prioritarios
1. **Consolidar recursos PWA/Android**
   - Migrar el manifest con shortcuts, capturas e íconos locales a `public/` para que el build empaquete todo offline.  
   - Reemplazar el service worker legado por la versión cacheadora nueva (manteniendo solo la copia que se sirve desde `public/`).  
   - Revisar los permisos y el `versionCode`/`versionName` en `android/app/build.gradle` antes de la subida a Play Store.
2. **Reorganizar el código en `src`**
   - Crear `src/features/*` por dominio, mover los componentes existentes y ajustar `App.tsx` para importar desde la nueva ruta (sin romper importaciones).  
   - Actualizar `tailwind.config.ts` y `tsconfig.json` para indexar `src/features` en lugar de `components`.  
   - Mantener `constants`, `types` y servicios accesibles con alias (`@/services`, `@/types`) para evitar rutas relativas frágiles.
3. **Limpiar documentación**
   - Eliminar referencias duplicadas a la antigua carpeta `components` en `docs/` y concentrar roadmap/historial en carpetas únicas.  
   - Ordenar `docs` (roadmap, releases, setup) para que cada archivo tenga un propósito claro y evitar assets binarios versionados dentro de `docs/`.  
   - Documentar en un solo archivo (`docs/RELEASE_FLOW.md` o similar) el nuevo pipeline (APK, script maestro, GitHub Actions).
4. **Centralizar el pipeline de releases**
   - Crear `scripts/release-master.js` que ejecuta: bump con `RELEASE_TYPE`, `npm run release:build`, `git commit/push`, tag, GitHub release y upload de APK mediante `gh release create`.  
   - Añadir el script a `package.json` (`release:master`) y usarlo desde `.github/workflows/release.yml`, reduciendo los pasos dispersos del workflow actual.  
   - Mantener la generación de keystore y el deployment de GH Pages como pasos independientes (el script no los pisa) para preservar la seguridad.

## Validaciones
- `npm run build:web` y `npm run release:build` deben continuar funcionando después de mover los componentes.  
- `node scripts/release-master.js beta --dry-run` verifica la orquestación nueva sin tocar Git/GitHub.  
- La PWA debe poder instalarse y registrar el service worker nuevo (se puede revisar con Chrome Lighthouse).

## Consideraciones de riesgo
- Reorganizar carpetas requiere actualizar todos los imports y las referencias en scripts/documentos; hay que ejecutar `npm run build:web` cada vez que se mova un módulo.  
- El pipeline de releases ahora depende de `gh` CLI y de que `GITHUB_TOKEN` esté presente en CI; si no está, el paso fallará antes de generar la release.  
- Cambios en `manifest.json` y el service worker deben probarse en un build real antes de subir a Play Store.

## ¿Puedo ejecutar estas tareas?
Sí, puedo aplicar todos los cambios descritos. Si necesito secretos adicionales o validaciones en CI, te lo aviso antes de avanzar.
