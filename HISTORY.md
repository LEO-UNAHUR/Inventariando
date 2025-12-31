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

## Resultado: Verificación de tipos y lint por `@DEV`

- Fecha: 2025-12-28
- Actor: @DEV
- Tarea: `npm run type-check` y `npm run lint`
- Descripción: Ejecuté la verificación de tipos con TypeScript y la verificación estática con ESLint para identificar errores antes de avanzar con optimizaciones.
- Estado: done
- Tiempo reportado: 0.5h
- Notas / resultados relevantes:
  - `npm run type-check`: sin errores (TypeScript `tsc --noEmit` completó correctamente).
  - `npm run lint`: completó sin errores bloqueantes, pero mostró una advertencia de compatibilidad de versiones:

```
WARNING: You are currently running a version of TypeScript which is not officially supported by @typescript-eslint/typescript-estree.
SUPPORTED TYPESCRIPT VERSIONS: >=4.3.5 <5.4.0
YOUR TYPESCRIPT VERSION: 5.8.3
```

- Recomendación: Alinear la versión de `typescript` con las versiones soportadas por `@typescript-eslint` o actualizar `@typescript-eslint/*` a versiones compatibles con TS 5.8+. Preferible: actualizar `@typescript-eslint/parser` y `@typescript-eslint/eslint-plugin` a versiones que soporten TS 5.8, o fijar `typescript` a una versión compatible si no se desea actualizar reglas.

Acciones siguientes sugeridas (priorizar):

1. `@DEV` / `@FRONTEND`: Crear Issue para evaluar la actualización de `@typescript-eslint` vs `typescript` y decidir estrategia (actualizar plugin o downgrading TS). (0.5h)
2. `@FRONTEND`: Ejecutar `npm audit` y priorizar parcheo de vulnerabilidades (ver entrada previa en `HISTORY.md`). (1-2h)

---

## Resultado: Build web ejecutada por `@DEV`

- Comandos ejecutados:

```bash
npm install
npm run build:web
```

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

- Vite mostró una advertencia: "Some chunks are larger than 500 kB after minification". Recomendado: aplicar code-splitting dinámico o `manualChunks` en `vite.config.ts` para reducir el tamaño del bundle principal.
- PWA generado con `vite-plugin-pwa` (v1.2.0), modo `generateSW`, 19 entradas precacheadas (~2.23 MB).
- Husky ejecutó su `prepare` script durante `npm install` y mostró mensaje deprecado, pero la instalación continuó.

1. Analizar `dist/assets/index-Cdao7QhP.js` para identificar módulos que pueden cargarse de forma dinámica y reducir el chunk principal.
2. Ejecutar `npm audit` y priorizar parcheo de vulnerabilidades; abrir Issues para dependencias que requieran actualizaciones mayores.
3. Ejecutar `npm run type-check` y `npm run lint` para detectar problemas de tipado o estilo antes de continuar con optimizaciones.

---

## Acciones realizadas por `@DEV` (28-12-2025)

- Fecha: 2025-12-28
- Actor: @DEV
- Tareas realizadas:

  1. Ejecuté `npm audit` y generé un resumen de vulnerabilidades. (ver `issues/002-npm-audit-vulnerabilities.md`)
  2. Creé un Issue local con la recomendación para alinear `typescript` y `@typescript-eslint`. (ver `issues/001-ts-eslint-version-mismatch.md`)
  3. Implementé `manualChunks` básico en `vite.config.ts` para reducir el tamaño del bundle principal y ejecuté la build de producción para validar.

- Resultados técnicos:
  - `npm audit`: 6 vulnerabilidades de severidad moderada (principalmente `esbuild`, `vitest`, `vite-node`, `lint-staged`, `micromatch`). Recomendado: actualizar `vitest` y `lint-staged` a las versiones sugeridas y correr CI.
  - `vite.config.ts`: añadido `build.rollupOptions.output.manualChunks` para separar `react`, `html2canvas`, `recharts` y un `vendor` general.
  - `npm run build:web`: completado OK. Archivos generados (`dist/assets`):

```
index-DHFHnRQ5.css    61K
index-XKCJDF5N.js    219K
vendor_html2canvas-QH1iLAAe.js 198K
vendor-RaAnqSXP.js   1.3M
vendor_react-Cu1RB3CG.js 230K
vendor_recharts-B835h6Rm.js 241K
```

- Observación: el chunk `vendor-RaAnqSXP.js` sigue siendo grande (~1.3 MB). Se recomienda analizar su contenido (por ejemplo: jspdf, other libs) y aplicar splitting adicional o lazy-loading en componentes que lo requieran.

- Próximas acciones recomendadas (prioridad):
  1. `@DEV`/`@FRONTEND`: Inspeccionar `vendor-RaAnqSXP.js` (source map) para identificar módulos que mover a chunks dinámicos. (1d)
  2. `@DEV`: Crear PR que actualice `vitest` y `lint-staged` (branch `chore/update-vitest-lint-staged`) y ejecutar pruebas en CI. (0.5-1d)
  3. `@FRONTEND`: Decidir sobre la estrategia `typescript` vs `@typescript-eslint` y aplicar la actualización/rollback necesaria. (0.5d)

---

## Entrada: Cambios implementados por `@DEV`

- Fecha: 2025-12-28
- Actor: @DEV
- Tarea: Optimización de bundle — lazy-load de scanner y PDF; actualización de dev-deps
- Descripción: Se implementaron imports dinámicos para `html5-qrcode` y `jspdf` (evitando su inclusión en el vendor principal). Se añadió `manualChunks` en `vite.config.ts` para mejorar el splitting y se creó la rama `chore/update-vitest-lint-staged` con la actualización de `vitest` y `lint-staged`. Archivos modificados: `src/features/inventory/InventoryList.tsx`, `src/features/inventory/ProductForm.tsx`, `services/pdfService.ts`, `src/features/sales/SalesDashboard.tsx`, `vite.config.ts`.
- Estado: done
- Tiempo reportado: 1.5h
- Dependencias: Node >=18; keystore para Android no presente (necesario para builds firmados).
- Notas: Se verificó `npm run build:web` y `npm run type-check`. `npm audit` quedó en 0 tras actualizar dev-deps. Próximo paso recomendado: ejecutar build de producción + visualizador de bundle para cuantificar impacto y aplicar splitting adicional (html2canvas, pdf-utils, recharts).

## Fix: Corrección runtime - `isDark` unmdefined

- Fecha: 2025-12-28
- Actor: @DEV
- Tarea: Corregir ReferenceError en runtime por uso de `isDark`
- Descripción: Durante la ejecución del build de producción en preview apareció un error en consola que impedía renderizar la app: "Cannot read properties of undefined (reading 'useLayoutEffect')" y, tras inspección del código, se identificó que varios componentes destructuraban la prop `isDark` renombrándola a un alias (`_isDark`) pero el JSX seguía usando `isDark`, provocando referencias indefinidas en tiempo de ejecución. Se corrigieron las destructuraciones para conservar el nombre `isDark` y se aplicaron cambios mínimos en los componentes afectados.
- Estado: done
- Tiempo reportado: 0.5h
- Dependencias: Ninguna adicional.
- Notas:
  - Archivos modificados:
    - `src/features/shared/Sidebar.tsx` — `isDark: _isDark` → `isDark`
    - `src/features/security/TeamManagement.tsx` — `isDark: _isDark` → `isDark`, `onToggleTheme: _onToggleTheme` → `onToggleTheme`
    - `src/features/sales/POS.tsx` — `isDark: _isDark` → `isDark`
  - Comandos ejecutados localmente:

```bash
npm run build:web
# verificación en navegador: limpiar SW/cache o abrir en ventana incógnita
```

- Resultado: corrección aplicada y los componentes dejaron de lanzar ReferenceError en pruebas locales de preview. Commit realizado y push al remoto (mensaje: "fix: correct isDark prop destructuring to avoid runtime ReferenceError").

- Próximos pasos: (1) probar en incógnito/limpiar SW para confirmar que no hay SW sirviendo assets viejos; (2) ejecutar visualizador de bundle para seguir optimizando chunking si se detectan librerías pesadas en `vendor`.

---

## Plan de Tareas por Rol (operativo)

**Objetivo:** Alinear acciones para resolver CI/CD, despliegue en GitHub Pages, validación Android y optimización del bundle.

- **Frontend (@FRONTEND / @DEV)**

  - User Story: Como desarrollador frontend, quiero reducir el tamaño del bundle y asegurar builds reproducibles, para mejorar tiempos de carga y facilitar despliegues.
  - Tareas:
    - Ejecutar visualizador de bundle y listar módulos > 100 KB. (Herramientas: `rollup-plugin-visualizer` o `source-map-explorer`).
    - Aplicar splitting adicional (dynamic imports / `manualChunks`) para librerías pesadas detectadas (jspdf, html2canvas, lucide, etc.).
    - Verificar `vite.config.ts` y ajustes de PWA (rutas relativas).
  - Criterios de aceptación: vendor < 800 KB minificado o plan documentado; `npm run build:web` sin errores; PR con cambios y passes CI.
  - Estimación: 2-4d.
  - Dependencias: acceso a `dist/` y mapas de sourcemap; revisión en PR por QA.

- **DevOps (@DEVOPS)**

  - User Story: Como ingeniero DevOps, quiero que los workflows de GitHub Actions construyan y publiquen artefactos (web + Android) sin fallos, para automatizar releases.
  - Tareas:
    - Revisar logs de Actions (releases, deploys) e identificar errores (tokens/secrets, paths, versiones de node/gradle).
    - Corregir workflows YAML (asegurar `actions/checkout`, `setup-node`, `working-directory`, `publish_dir: dist`).
    - Ajustar permisos de `GITHUB_TOKEN` si el deploy requiere push a `gh-pages` o `releases`.
    - Añadir job que genere artefactos Android debug/release y los suba como artifacts en Actions.
  - Criterios de aceptación: workflows verdes en runs de prueba; artefact disponible en Actions; Pages deploy sin 404s.
  - Estimación: 1-2d (investigación) + 0.5-1d (parches).
  - Dependencias: secrets (GH*TOKEN, NPM_TOKEN, ANDROID_KEYSTORE*\*), acceso a repo settings.

- **Mobile (@MOBILE / Android dev)**

  - User Story: Como desarrollador mobile, quiero un APK instalable para validar la app en dispositivo y un job CI que genere el AAB/APK firmado, para pruebas de QA y preparación de release.
  - Tareas:
    - Generar APK debug localmente: `cd android && ./gradlew assembleDebug` y validar `android/app/build/outputs/apk/debug/app-debug.apk`.
    - Preparar keystore (dev o prod), configurar secrets (BASE64 keystore, passwords) y documentar pasos para signing en CI.
    - Crear job en Actions que compile `assembleRelease` y publique artifact (AAB/APK) en run o attach en Release.
  - Criterios de aceptación: APK instalado en dispositivo/emulador y app arranca; CI genera artifact en run.
  - Estimación: 0.5-1d (debug); 1-2d (release + CI) si falta keystore.
  - Dependencias: JDK, Android SDK, Gradle, secrets de keystore.

- **QA (@QA)**

  - User Story: Como QA, quiero verificar que la web en Pages sirve correctamente y que la app Android arranca, para validar entregables Beta.
  - Tareas:
    - Probar GitHub Pages tras deploy (comprobación assets, console errors, PWA/SW behavior).
    - Ejecutar pruebas manuales en la web local y en la APK: login, navegación principal, scanner, exportar PDF.
    - Reportar issues con pasos reproducibles y logs.
  - Criterios de aceptación: Checklist de regresión completado; issues abiertos y asignados.
  - Estimación: 1-2d por ciclo de verificación.
  - Dependencias: builds (dist/ o Pages), APK, acceso a dispositivos/emuladores.

- **Product / CTO (@PRODUCT / @CTO)**
  - User Story: Como Product/CTO, quiero priorizar bloqueadores y aprobar secrets y políticas de release, para que el equipo pueda completar firmas y deploys.
  - Tareas:
    - Proveer keystore y aprobar su almacenamiento en secrets de repo o en vault.
    - Priorizar issues de CI/CD y autorizar accesos necesarios.
    - Validar criterios de salida Beta y aprobar release candidate.
  - Criterios de aceptación: keystore disponible en secrets; lista priorizada y recursos asignados.
  - Estimación: coordinación 0.5-1d.
  - Dependencias: decisión sobre signing y políticas de release.

---

Añade a esta sección si quieres asignaciones concretas (nombres o cuentas) y yo actualizaré y commitearé el `HISTORY.md` con las asignaciones formales.

--

## Asignaciones concretas

- `@DEV` (Frontend): responsable de ejecutar el visualizador de bundle, aplicar splitting adicional y abrir PRs con los cambios en `vite.config.ts` y componentes que requieran lazy-loading. Estimación: 2-4d.
- `@DEVOPS` (DevOps): responsable de revisar y corregir GitHub Actions (releases/deploys), preparar job para Android artifacts y arreglar deploy a GitHub Pages. Estimación: 1-2d.
- `@MOBILE` (Android dev): responsable de generar APK debug localmente, preparar keystore y configurar signing en CI. Entregar APK instalable y guía de signing. Estimación: 0.5-2d.
- `@QA` (QA): responsable de validar Pages y APK, ejecutar checklist de regresión y reportar issues. Estimación: 1-2d por ciclo.
- `@CTO` / `@PRODUCT`: encargado de aprobar secrets/keystore y priorizar issues críticos para release.

He creado issues locales en `issues/` para comenzar el seguimiento operativo y facilitar la creación de issues reales en GitHub si lo deseas.
