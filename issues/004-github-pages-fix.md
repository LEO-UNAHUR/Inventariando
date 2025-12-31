# ISSUE: GitHub Pages - site not serving correctly

- **Tipo**: bug / deploy
- **Asignado a**: @DEVOPS
- **Prioridad**: high
- **Descripción**: GitHub Pages no está sirviendo la web correctamente (404s o assets rotos). Verificar configuración y workflow de deploy.

## Pasos para reproducir / investigar

1. Revisar Page settings (branch/source) en repo settings → Pages.
2. Verificar que `dist` contiene `index.html` y que el workflow publica a la rama/config correcta.
3. Revisar `index.html` para rutas de assets (relativas vs absolutas) y `vite-plugin-pwa` configuración.

## Output esperado

- GitHub Pages debe devolver HTTP 200 y servir la app sin errores de assets.

## Estimación

- 0.5 - 1 día

## Notas

- Si Pages usa base path, asegurar `vite.config.ts` o `index.html` usan rutas relativas o `base` configurada.
