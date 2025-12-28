# HISTORY - Inventariando

Este documento centraliza el historial de trabajo, decisiones y tareas realizadas para la versión Beta de Inventariando.
Cada rol debe agregar entradas claras por fecha para mantener trazabilidad.

Formato de entrada (agregar al final del fichero):

- Fecha: YYYY-MM-DD
- Actor: Nombre / Rol (CTO / Frontend / Mobile / DevOps / QA / Product)
- Tarea: Título breve
- Descripción: Qué se hizo o por qué se abrió la tarea
- Estado: not-started / in-progress / done
- Tiempo reportado: Xh / Xd
- Dependencias: lista de issues/archivos/entornos
- Notas: links, comandos, resultados, problemas abiertos

---

## Entrada inicial: Auditoría del estado del proyecto

- Fecha: 2025-12-27
- Actor: CTO
- Tarea: Auditoría inicial para Beta (PWA + Android)
- Descripción: Revisión rápida de archivos clave (`package.json`, `README.md`, `android/app/build.gradle`, `App.tsx`) para validar estado y detectar bloqueos antes de continuar con la Beta.
- Estado: done
- Tiempo reportado: 2h
- Dependencias:
  - Variables de entorno: `VITE_GEMINI_API_KEY`, `KEYSTORE_*` para builds firmados
  - Keystore para firma Android (no presente en repo)
  - Google Services (opcional): `android/app/google-services.json` (no presente)
- Notas:
  - `package.json` tiene scripts para `dev`, `build:web`, `build:android` y utilidades de release, pero las automatizaciones de release fueron eliminadas (ver `README.md`).
  - El `android/app/build.gradle` usa variables de `rootProject.ext.*`; revisar `android/gradle.properties` y compatibilidad de Gradle/AGP en entorno CI.
  - `App.tsx` es el punto de entrada principal y usa persistencia local vía `services/storageService`.
  - Bloqueadores esperables: versiones de Node/Java/Gradle, ausencia de keystore, configuración de API keys.

---

## Recomendación inmediata (entrada operativa)

- Fecha: 2025-12-27
- Actor: CTO
- Tarea: Ejecutar build web en local y documentar errores
- Descripción: Objetivo: validar que `npm install` + `npm run build:web` completan correctamente. Corregir errores que aparezcan y documentarlos en una nueva entrada de `HISTORY.md` indicando commit y responsable.
- Estado: in-progress
- Tiempo estimado: 1-2 días (Frontend)
- Dependencias: Node >=18, npm, variables `VITE_*` mínimas si la build requiere (el build debe poder correr en modo sin keys, documentar fallos).
- Notas: Frontend debe abrir issues por cada bug de build o de tipado.

---

## Cómo actualizar este archivo

- Cada persona que complete una tarea debe añadir una nueva entrada al final del archivo siguiendo el formato. Si la tarea está asociada a un issue/GitHub PR, pegar el link en Notas.
- Para tareas de equipo, indicar subtareas con roles y tiempo estimado.

---

## Registro de cambios rápido

- 2025-12-27: Auditoría inicial creada por CTO (esta entrada).

---

## Asignación Operativa: Ejecución de build web

- Fecha: 2025-12-27
- Actor: CTO (asigna a @DEV)
- Tarea: Ejecutar y validar `npm install` + `npm run build:web` en local
- Descripción: `@DEV` debe ejecutar la instalación de dependencias y la build web, capturar logs completos, documentar cualquier error en un nuevo issue y añadir una entrada en este `HISTORY.md` con resultados.
- Estado: in-progress (assigned: @DEV)
- Tiempo estimado: 4-8h
- Dependencias: Node >=18, npm, acceso a la máquina de desarrollo con internet; si aparecen errores relacionados con variables de entorno, documentarlas bajo Notas.
- Notas / checklist para `@DEV`:
  1. En la raíz del repo ejecutar:

```bash
npm install
npm run build:web
```

2. Si `npm run build:web` falla, ejecutar y copiar el log completo (stdout/stderr) y crear un Issue en GitHub con: título, pasos para reproducir, fragmento de log relevante y archivo(s) implicados. En el Issue asignar a `@DEV` y etiquetar `bug`.

3. Añadir una nueva entrada en `HISTORY.md` al final con: fecha, Actor=`@DEV`, Tarea=`Build web local`, Descripción=resultado (ok / errores), Estado, Tiempo reportado y link al Issue si existe.

4. Si la build termina OK, añadir capture de tamaño del `dist/` y subir un artefacto ZIP a la sección de Releases o adjuntar en el Issue para revisión.

5. Si hay errores de tipo/ESLint/TypeScript, intentar ejecutar `npm run type-check` y `npm run lint` localmente y documentar resultados.

---

## Resultado: Build web ejecutada por `@DEV`

- Fecha: 2025-12-27
- Actor: @DEV
- Tarea: Build web local (`npm install` + `npm run build:web`)
- Descripción: Ejecuté la instalación de dependencias y la compilación de producción con Vite para validar generación de la PWA y artefactos `dist/`.
- Estado: done
- Tiempo reportado: 1.5h
- Dependencias: Node.js instalado localmente (instalado vía paquete del sistema), acceso a internet para descargar paquetes.
- Notas / resultados relevantes:
  - Comandos ejecutados:

```bash
npm install
npm run build:web
```

- `npm install` devolvió advertencias de paquetes deprecated y reportó 6 vulnerabilidades de severidad moderada. Recomiendo ejecutar `npm audit` y evaluar correcciones no rompientes (`npm audit fix`) o planificar actualizaciones de dependencias.
- Build Vite: completada correctamente. Artefactos generados en `dist/`.
- Salida relevante de la build (resumen):

```
dist/registerSW.js                           0.13 kB
dist/manifest.webmanifest                    0.49 kB
dist/index.html                              2.12 kB │ gzip:   0.93 kB
dist/assets/index-DHFHnRQ5.css              61.45 kB │ gzip:  10.69 kB
dist/assets/purify.es-B9ZVCkUG.js           22.64 kB │ gzip:   8.75 kB
dist/assets/index.es-ikTJoE_N.js           159.35 kB │ gzip:  53.40 kB
dist/assets/html2canvas.esm-QH1iLAAe.js    202.38 kB │ gzip:  48.04 kB
dist/assets/index-Cdao7QhP.js            1,878.84 kB │ gzip: 529.43 kB
```

- Observaciones:

  - Vite mostró una advertencia: "Some chunks are larger than 500 kB after minification". Recomendado: aplicar code-splitting dinámico o `manualChunks` en `vite.config.ts` para reducir el tamaño del bundle principal.
  - PWA generado con `vite-plugin-pwa` (v1.2.0), modo `generateSW`, 19 entradas precacheadas (~2.23 MB).
  - Husky ejecutó su `prepare` script durante `npm install` y mostró mensaje deprecado, pero la instalación continuó.

- Acciones recomendadas inmediatas (asignar a `@FRONTEND`):
  1. Analizar `dist/assets/index-Cdao7QhP.js` para identificar módulos que pueden cargarse de forma dinámica y reducir el chunk principal.
  2. Ejecutar `npm audit` y priorizar parcheo de vulnerabilidades; abrir Issues para dependencias que requieran actualizaciones mayores.
  3. Ejecutar `npm run type-check` y `npm run lint` para detectar problemas de tipado o estilo antes de continuar con optimizaciones.
