# Instrucciones rápidas para agentes IA (Copilot)

Propósito: ayudar a un agente a ser productivo rápidamente en este repo React + Capacitor (PWA + APK).

1) Gran panorama
- Arquitectura: app React (Vite, TypeScript) organizada por dominios en `src/features/` y lógica de integración en `services/`.
- Dual build: se produce una PWA (GitHub Pages, base `/Inventariando/`) y un APK Android (Capacitor + Gradle). Scripts en `package.json` orquestan ambos builds.

2) Dónde empezar (archivos clave)
- `package.json`: comandos principales (`npm run dev`, `build:web`, `build:android`, `release:*`).
- `README.md`: flujo de release, ubicación de builds (`APK/`, `BUILDS/web-pages/`) y requisitos (Java 21 para Android).
- `vite.config.ts`: detección del `base` para GitHub Pages vs Android WebView.
- `services/`: envoltorios a proveedores externos (ej.: `geminiService.ts`, `openaiService.ts`, `anthropicService.ts`) — todas las integraciones externas van aquí.
- `src/features/`: módulos por dominio (inventory, sales, customers, assistant). Ej.: `src/features/assistant/AIAssistant.tsx`.
- `scripts/`: scripts de release y build personalizado (p. ej. `scripts/build-android.js`, `create-release.js`, `bump-version.js`).

3) Workflows y comandos esenciales
- Desarrollo web: `npm install` → `npm run dev` (Vite).
- Build web optimizado: `npm run build:web` o para pages `npm run build:web:pages`.
- Android / Capacitor: `npm run build:android` (ejecuta build web + `npx cap sync android` + script de gradle). Requiere Java 21+ y Android SDK configurado (`local.properties`).
- Releases automáticos: `npm run release:beta` / `npm run release:stable` (scripts en `scripts/` + GH Actions).
- Capacitor helpers: `npm run cap:sync`, `npm run cap:open`.

4) Patrones y convenciones específicas del proyecto
- IA por usuario: los usuarios proveen su propia API key (no se almacenan credenciales globales). Busca referencias a `VITE_GEMINI_API_KEY` y en `services/*`.
- Servicios externos centralizados: toda lógica de llamadas externas y manejo de modelos IA está en `services/`. Evita duplicar lógica fuera de esta carpeta.
- Persistencia: PWA + LocalStorage (modo offline-first). Busca código que use `storageService.ts` para consistencia.
- Estilo: Tailwind (config en `tailwind.config.js`) y CSS global en `index.css` / `styles/`.
- Estructura UI: componentes y pantallas organizadas bajo `src/features/{domain}/`.

5) Integraciones y puntos de atención
- Capacitor/Android: cambios en web (base path) pueden romper WebView; si cambias `vite.config.ts` coordina con `android/app/src/main/AndroidManifest.xml` y `capacitor.config.ts`.
- Releases: `scripts/create-release.js` y `scripts/bump-version.js` actualizan `package.json` y generan artefactos en `APK/` y `BUILDS/`.
- IA: revisa `services/googleOAuthService.ts` y `services/*Service.ts` para requisitos de credenciales y límites de uso.

6) Qué pedir y ejemplos útiles para PRs
- Pide modificar un `service`: incluir tests unitarios para la capa de `services/` y documentar la nueva env var en `README.md`.
- UI: si cambias rutas o `base` asegúrate de indicar cómo generar la PWA para GitHub Pages (`npm run build:web:pages`).
- Android: cuando toques `android/` agrega notas sobre la versión de Java/Gradle y pasos para firmar el APK.

7) Restricciones y supuestos detectables
- No hay backend central: el diseño asume cliente-first y que cada usuario aporta su API key para IA.
- CI/CD y workflows están integrados (ver `docs/` y `.github/workflows`), no intentes modificar releases automáticos sin revisar `scripts/`.

8) Preguntas para el mantenedor (si necesitas más contexto)
- ¿Dónde quieres la política de storage de API keys (documentación, no en repo)?
- ¿Puedo añadir tests ejemplo para `services/` (Vitest)?

Si algo no queda claro, dime qué sección quieres ampliar y lo detallo con ejemplos de código o rutas específicas.
