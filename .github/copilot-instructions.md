# Instrucciones rápidas para agentes IA (Copilot)

_Generado automáticamente: 2025-12-16T20:57:50.476Z_

Propósito: ayudar a un agente a ser productivo rápidamente en este repo React + Capacitor (PWA + APK).

1) Gran panorama
- Arquitectura: app React (Vite, TypeScript) organizada por dominios en `src/features/` y lógica de integración en `services/`.
- Dual build: PWA (GitHub Pages, base `/Inventariando/`) y APK Android (Capacitor + Gradle).

2) Dónde empezar (archivos clave)
- 'package.json': scripts útiles — dev, build, build:web, build:web:pages, build:android, preview
- `README.md`: flujo de release, ubicación de builds (`APK/`, `BUILDS/web-pages/`) y requisitos (Java 21 para Android).
- `vite.config.ts`: detection del `base` para GitHub Pages vs Android WebView.
- `services/`: integraciones externas (ej. geminiService.ts, openaiService.ts).
- `src/features/`: módulos por dominio (inventory, sales, customers, assistant).

3) Workflows y comandos esenciales
- Desarrollo: `npm install` → `npm run dev`.
- Build web: `npm run build:web` / `npm run build:web:pages`.
- Build Android: `npm run build:android` (requiere Java 21+).

4) Patrones y convenciones específicas
- IA por usuario: cada usuario trae su propia API key (ver `services/*`).
- Servicios externos centralizados en `services/`.
- Persistencia: PWA + LocalStorage (`storageService.ts`).

5) Integraciones y puntos de atención
- Si modificas `vite.config.ts` coordina con `android/` y `capacitor.config.ts`.
- Revisa `scripts/create-release.js` y `scripts/bump-version.js` antes de tocar releases.

6) Ejemplos del repo
- Features (muestra): assistant, auth, customers, dashboard, data, finance, inventory, marketing, onboarding, sales, security, shared, suppliers

7) Preguntas para el mantenedor
- ¿Dónde documentar la política de storage de API keys?
- ¿Quiere tests ejemplo para `services/` (Vitest)?