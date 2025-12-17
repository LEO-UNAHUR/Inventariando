# Instrucciones rápidas para agentes IA (Copilot)

_Generado / Actualizado automáticamente: 2025-12-17_

Propósito: permitir que un agente IA sea productivo de inmediato en este repo React+Vite + Capacitor (PWA y APK Android).

1) Panorama general
- Arquitectura: aplicación React (TypeScript, Vite) organizada por dominios en `src/features/`. Integraciones y lógica compartida en `services/`.
- Dual targets: web (PWA) y Android (Capacitor). El `base` de `vite.config.ts` se ajusta según destino.

2) Comandos y flujos críticos (ejecutables desde la raiz)
- Desarrollo local: `npm install` y `npm run dev`.
- Build web (producción): `npm run build:web` y para GitHub Pages: `npm run build:web:pages`.
- Build Android (requiere Java 21+): `npm run build:android` (producción + Capacitor/Gradle en `android/`).
- Scripts de release: `scripts/bump-version.js`, `scripts/create-release.js`, `release.ps1` / `release.sh`.

3) Dónde mirar primero (archivos clave)
- Configuraciones: [vite.config.ts](vite.config.ts#L1) y [capacitor.config.ts](capacitor.config.ts#L1).
- Integraciones/IA: `services/` — ejemplos: [services/geminiService.ts](services/geminiService.ts#L1), [services/openaiService.ts](services/openaiService.ts#L1), [services/storageService.ts](services/storageService.ts#L1).
- Android: `android/` contiene Gradle, `local.properties` y configuraciones de build; revisa `android/app/build.gradle`.

4) Patrones y convenciones específicas del proyecto
- Cada usuario tiene su propia API key; los servicios la esperan vía `userSettingsService` / `storageService` (no hardcodear claves).
- Features por dominio: componente + hooks + slices dentro de `src/features/<domain>/`.
- Servicios centralizados (no duplicar lógica): usar `services/*` para llamadas a API, autenticación y adaptadores.

5) Integraciones y riesgos a revisar antes de cambiar
- Cambios en `vite.config.ts` afectan la ruta base para GitHub Pages y la WebView Android — luego actualizar `android/` y `capacitor.config.ts` si cambia.
- Builds Android dependen de Java 21+: la CI y desarrolladores locales deben usar Java 21.
- Evitar commitear claves/keystores: `keystore.b64` existe en repo; trate esto con cuidado y siga las políticas del mantenedor.

6) Tests y debugging
- Tests de ejemplo: `test/services/geminiService.test.ts` (Vitest). Ejecutar con `npm test` si está configurado.
- Para debug Android: usar `npm run build:android` + Android Studio/adb en `android/`.

7) Tareas que un agente IA puede hacer con seguridad
- Añadir/actualizar servicios en `services/` y propagar tipos en `types.ts`.
- Implementar features en `src/features/*` siguiendo el patrón existente (buscar `assistant` y `inventory` como ejemplos).
- Añadir pruebas unitarias en `test/` replicando estilo de `geminiService.test.ts`.

8) Qué cambiar con precaución
- `vite.config.ts`, `capacitor.config.ts`, y cualquier ajuste en `android/` pueden romper builds multiplataforma.
- Scripts de release y `package.json` — revisar `scripts/*` antes de actualizar versiones o pipeline.

9) Preguntas útiles para el mantenedor
- ¿Dónde documentamos la política para `keystore.b64` y claves de producción?
- ¿Desea que los agents creen PRs para cambios menores (tests, refactor) o sólo abrir issues primero?

Si quieres, actualizo esto con referencias línea-a-línea más precisas o incluyo ejemplos de cambios frecuentes (p. ej. añadir un `service` nuevo). Indica qué prefieres.