# Issue: Reporte de vulnerabilidades `npm audit` — acciones recomendadas

**Descripción**

Se ejecutó `npm audit` y se detectaron 6 vulnerabilidades de severidad moderada que afectan principalmente a dependencias de desarrollo (`vitest`, `vite-node`, `esbuild`, `lint-staged` y `micromatch`).

**Resumen (extraído de `npm audit`)**

- Paquetes afectados: `esbuild`, `lint-staged`, `micromatch`, `vite`, `vite-node`, `vitest`.
- Severidad: 6 moderadas, 0 altas/criticas.

**Recomendaciones**

1. Actualizar `vitest` a `4.0.16` (fix disponible; es SemVer major). Esto además actualiza transitive deps (`vite`, `vite-node`, `esbuild`) según reporte.
2. Actualizar `lint-staged` a `16.2.7` (fix disponible; SemVer major). Esto también actualiza transitive `micromatch`.
3. Ejecutar pruebas completas en CI tras actualización; fijar versiones en `package.json` si es necesario.

**Pasos sugeridos**

1. Crear branch `chore/update-vitest-lint-staged`.
2. Actualizar `package.json` con las versiones recomendadas y ejecutar `npm install`.
3. Ejecutar `npm run build:web`, `npm run type-check` y `npm run lint` y `npm test`.
4. Revisar cambios en bundle y tests; si todo OK, abrir PR con changelog y run CI.

**Impacto / prioridad**: High (evitar acumulación y riesgos en herramientas de desarrollo).

**Asignado**: @DEV / DevOps

**Adjunto**: salida completa de `npm audit` (local) añadida en `HISTORY.md`.
