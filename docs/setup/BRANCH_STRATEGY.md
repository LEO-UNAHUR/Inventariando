# 🌳 Estrategia de Ramas - Inventariando

## Resumen Ejecutivo

El proyecto usa un modelo **phase-based branching** para desarrollo seguro de fases sin arriesgar el MVP baseline.

**Estado Actual (15 de Diciembre 2025):**
- ✅ MVP v1.4.0 congelado en `main` (protegido)
- ✅ Rama `mvp-freeze` creada como backup read-only
- ✅ Rama `phase-1-validation` lista para desarrollo
- ✅ Todas las protecciones configuradas en GitHub

---

## Estructura de Ramas

### 🔴 `main` — MVP Congelado
- **Versión:** v1.4.0 (estable, no cambia)
- **Propósito:** Punto de partida inmutable para todas las fases
- **Protección:** Requerida PR, 1 aprobación, CI verde, bloqueo force-push
- **Operaciones permitidas:**
  - Merge de rama de fase (cuando cierra) con PR revisada
  - Merge de hotfix/* si aplica patch crítico
- **Operaciones prohibidas:**
  - Commits directos
  - Force-push
  - Borrado

### 🟢 `mvp-freeze` — Backup Inmutable
- **Versión:** v1.4.0 (igual a `main`)
- **Propósito:** Espejo de seguridad del MVP, nunca se toca
- **Protección:** Read-only (sin push, sin merge)
- **Uso:** Recuperación de emergencia si `main` se corrompe
- **Sincronización:** Automática con `main` (tag `v1.4.0-mvp`)

### 🟡 `phase-1-validation` — Desarrollo Activo
- **Versión:** v1.1.x (betas + stable)
- **Propósito:** Desarrollo de Fase 1 (Analytics, feedback, piloto)
- **Protección:** Requerida PR para features, bloqueo force-push
- **Flujo:**
  1. Feature branches (`feat/analytics`, `feat/tour`, etc.) salen de esta rama
  2. Betas: `v1.1.0-beta.1, beta.2, beta.3` (tags desde commits en la rama)
  3. Al cerrar fase: PR `phase-1-validation` → `main`, merge, tag `v1.1.0` stable
- **Merge a Main:** Solo cuando cierra fase (stable tag) con PR revisada

### 🔵 `phase-2-scalability`, `phase-3-monetization`, `phase-4-expansion`
- **Creadas cuando:** La fase anterior alcanza stable
- **Propósito:** Igual que phase-1, pero para sus respectivas fases
- **Versión Range:** v2.0.x, v2.5.x, v3.0.x
- **Estado actual:** Planeadas (no creadas aún)

### 🔶 `hotfix/*` — Parches de Emergencia
- **Creada desde:** `main` (si aplica patch crítico)
- **Versión:** `v1.4.1, v2.0.1`, etc. (patch bump)
- **Ciclo:**
  1. `git checkout -b hotfix/nombre main`
  2. Fix, commit, push
  3. PR a `main` + merge
  4. Tag `vX.Y.Z` estable
  5. Borrar rama local y remota
- **Ejemplo:** `hotfix/critical-pwa-bug` → `v1.4.1`

---

## Feature Branches (Dentro de Fases)

Dentro de cada rama de fase, los features salen de la rama de fase y mergean via PR:

```
phase-1-validation
  ├── feat/analytics
  │   └── PR → phase-1-validation
  ├── feat/feedback-widget
  │   └── PR → phase-1-validation
  ├── feat/tour-onboarding
  │   └── PR → phase-1-validation
  └── (cuando cierra, PR → main)
```

**Nomenclatura:**
- `feat/`: Nueva funcionalidad
- `fix/`: Bug fix
- `chore/`: Cambios técnicos (tests, CI, deps)
- `docs/`: Documentación

---

## Release Workflow

### Beta (dentro de fase)
```bash
# En rama phase-1-validation (u otra fase)
npm run release:create beta

# Resultado:
# 1. Calcula v1.1.0-beta.N (incrementa N si ya existe)
# 2. Updates package.json
# 3. Commit + push a phase-1-validation
# 4. GitHub Actions compila APK, despliega PWA draft
# 5. Tag v1.1.0-beta.N creado
```

### Stable (cierre de fase)
```bash
# En rama phase-1-validation
npm run release:create stable

# Resultado:
# 1. Calcula v1.1.0 (quita -beta)
# 2. Updates package.json
# 3. Commit + push a phase-1-validation
# 4. Tag v1.1.0 creado
# 5. Crear PR: phase-1-validation → main
# 6. Aprobación + merge a main
# 7. GitHub Pages actualiza PWA
```

### Hotfix (desde main)
```bash
# Si hay bug crítico en main (v1.4.0)
git checkout -b hotfix/critical-bug main
# Fix code...
npm run release:create stable  # Calcula v1.4.1

# Resultado:
# v1.4.1 tag creado
# GitHub Actions genera APK/PWA
# Merge automático a main
```

---

## Validaciones Automáticas

**GitHub Actions protege cada rama:**

| Rama | CI/CD | Requisito | Bloquea |
| :--- | :--- | :--- | :--- |
| `main` | ✅ Build + Tests | PR, 1 review, CI verde | ❌ Force-push |
| `mvp-freeze` | ✅ Read-only | N/A | ✅ Todo |
| `phase-*` | ✅ Build | Recomendado PR, CI verde | ❌ Force-push |
| `hotfix/*` | ✅ Build | PR a main | ❌ N/A |

**Release automation (`npm run release:create`):**
- ✅ Valida versión no duplicada (consulta GitHub API)
- ✅ Valida incrementos correlatividad (ej: no saltea versiones)
- ✅ Valida rama de origen (dev desde rama de fase, stable desde phase-*→main)
- ✅ Encripta credenciales (no expone GITHUB_TOKEN)
- ✅ Rollback si falla workflow (limpia tag si AP falla)

---

## Checklist de Configuración

- [x] **Rama `mvp-freeze` creada** (read-only backup)
- [x] **Tag `v1.4.0-mvp` creado** (marcador de baseline)
- [x] **Rama `phase-1-validation` creada** (lista para dev)
- [ ] **Protección de `main` en GitHub** (requirera PR, bloquear force-push):
  - Ve a: Settings → Branches → Add rule
  - Pattern: `main`
  - Require pull request reviews: ✅
  - Require status checks: ✅ (CI/CD)
  - Restrict who can push: ✅ (solo maintainers)
  - Dismiss stale pull request approvals: ✅
  - Require branches to be up to date: ✅
- [ ] **Protección de `mvp-freeze` en GitHub** (read-only):
  - Pattern: `mvp-freeze`
  - Restrict who can push: ✅ (nadie, even maintainers)
  - Require pull request reviews: ✅ (pero nadie puede pushear, así que solo read)
- [ ] **CI/CD workflow funcionando** (.github/workflows/release.yml):
  - Verifica que GitHub Actions ejecute en cada PR/push
  - Valida compilación APK y build web

---

## FAQ

### ¿Cómo bajo los cambios de `phase-1-validation` a `main`?
Al cierre de Fase 1 (cuando tienes v1.1.0 stable):
```bash
# En fase-1-validation:
npm run release:create stable  # Genera v1.1.0 tag

# Luego creas PR:
git push origin phase-1-validation
# Abre GitHub → New Pull Request → phase-1-validation → main

# Después de revisar y mergear:
# main automáticamente sube a v1.1.0
```

### ¿Y si necesito hacer un fix rápido en `main` ahora?
Si es un bug crítico de v1.4.0:
```bash
git checkout -b hotfix/nombre main
# Fix...
npm run release:create stable  # Genera v1.4.1
```

### ¿Qué pasa si alguien pushea directo a `main`?
- ❌ **Bloqueado:** GitHub rechaza el push
- ✅ **Forzado a usar PR:** Debe abrir PR desde su rama
- ✅ **Requisito de review:** Alguien debe aprobar

### ¿Puedo deletar ramas antiguas?
Sí, después de mergear a `main`:
```bash
git branch -D phase-1-validation  # local
git push origin --delete phase-1-validation  # remoto
```

---

## Sincronización Manual (si aplica)

Si necesitas sincronizar una rama de fase con cambios recientes de `main`:

```bash
# En la rama de fase
git fetch origin
git rebase origin/main
git push --force-with-lease origin phase-1-validation
```

⚠️ **Usar `--force-with-lease`** (no `--force`) para evitar sobrescribir cambios de otros.

---

## Ejemplo de Ciclo Completo: Fase 1

```bash
# 1. START: En main (v1.4.0)
git checkout phase-1-validation

# 2. FEATURE: Crear feature branch
git checkout -b feat/analytics
# ... code ...
git commit -m "feat: add analytics with PostHog"
git push origin feat/analytics

# 3. PULL REQUEST: Analytics → phase-1-validation
# En GitHub, creas PR feat/analytics → phase-1-validation
# Review + merge

# 4. REPEAT: Más features (tour, PDF, etc.)
# feat/tour-onboarding → phase-1-validation
# feat/pdf-export → phase-1-validation
# ... etc

# 5. BETA: Cuando features están listos
git checkout phase-1-validation
npm run release:create beta
# → v1.1.0-beta.1 tag creado

# 6. TEST & ITERATE: Más betas si aplica
# ... usuarios testan beta.1 ...
npm run release:create beta
# → v1.1.0-beta.2 tag creado

# 7. STABLE: Al cerrar fase
npm run release:create stable
# → v1.1.0 tag creado, PR phase-1-validation → main

# 8. MERGE to Main: PR aprobado y mergeado
# main = v1.1.0
# phase-1-validation = phase-1-validation (sigue con v1.1.0+)

# 9. NEXT PHASE: Crear phase-2-scalability
git checkout -b phase-2-scalability main
git push -u origin phase-2-scalability
# (Repite ciclo para Fase 2)
```

---

**Última Actualización:** 15 de Diciembre 2025  
**Responsable:** CTO / PM Senior  
**Referencia:** Roadmap-app.md, PROJECT_DOCUMENTATION.md
