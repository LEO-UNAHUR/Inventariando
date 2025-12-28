# Issue: Alinear versiones `typescript` / `@typescript-eslint`

**Descripción**

Detectamos una advertencia durante `npm run lint` indicando incompatibilidad entre la versión de `typescript` del repo (5.8.3) y la versión soportada por `@typescript-eslint/typescript-estree` (>=4.3.5 <5.4.0).

**Problema**

- Esta incompatibilidad puede provocar falsos positivos/negativos en ESLint y errores en parsing.

**Propuesta de soluciones (evaluar y aplicar)**

1. Actualizar `@typescript-eslint/parser` y `@typescript-eslint/eslint-plugin` a versiones que soporten TypeScript 5.8.x (recomendado si no rompe reglas). Probar en CI.
2. Si migrar `@typescript-eslint/*` no es viable, considerar fijar `typescript` a una versión soportada (p.ej. 5.3.x) hasta que se valide la actualización.

**Pasos a reproducir**

1. `npm install`
2. `npm run lint`

**Impacto / prioridad**: Medium — afecta calidad de linting y experiencia de desarrollo.

**Asignado**: @DEV / @FRONTEND

**Notas**: Añadir en `HISTORY.md` la decisión tomada y resultado de la actualización.
