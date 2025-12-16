# 🚀 Sistema Completo de Releases - Inventariando

**Última Actualización:** 15 de diciembre de 2025  
**Versión del Sistema:** 2.0 (Builds Duales)  
**Estado:** ✅ Completamente Automatizado

---

## 📚 Tabla de Contenidos

1. [Inicio Rápido](#inicio-rápido)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Flujo Completo de Release](#flujo-completo-de-release)
4. [Builds Duales (Android + Web)](#builds-duales-android--web)
5. [Scripts y Herramientas](#scripts-y-herramientas)
6. [GitHub Actions Workflow](#github-actions-workflow)
7. [Versionado Automático](#versionado-automático)
8. [Archivos Generados](#archivos-generados)
9. [Despliegue a GitHub Pages](#despliegue-a-github-pages)
10. [Troubleshooting](#troubleshooting)

---

## 🎯 Inicio Rápido

### Comandos Principales

```bash
# Release Beta
npm run release:beta

# Release Stable
npm run release:stable
```

**¡Eso es todo!** El sistema hace el resto automáticamente en 5-6 minutos.

### ¿Qué Obtengo?

Cada release genera automáticamente:

- ✅ **APK Android** en `APK/v{version}/Inventariando-{version}.apk`
- ✅ **Web App PWA** en `BUILDS/web-pages/v{version}/`
- ✅ **Documentación** en `docs/product beta/` o `docs/product stable/`
- ✅ **CHANGELOG** y **README** actualizados automáticamente
- ✅ **GitHub Release** con APK adjunto
- ✅ **Checksums** y archivos INFO para verificación

---

## 🏗️ Arquitectura del Sistema

### Componentes del Sistema

```
┌─────────────────────────────────────────────────────┐
│                  COMANDOS NPM                       │
│   npm run release:beta / release:stable            │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│          scripts/create-release.js                  │
│  (Script Maestro - Orquesta todo el proceso)       │
└────────┬────────────────────────────────────────────┘
         │
         ├─► [1] Calcula versión (semver automático)
         ├─► [2] Bumpa package.json (scripts/bump-version.js)
         ├─► [3] Dispara GitHub Actions workflow
         ├─► [4] Espera completado del workflow (monitora)
         ├─► [5] Descarga APK desde GitHub Releases
         ├─► [6] Actualiza CHANGELOG.md
         ├─► [7] Compila Web App para GitHub Pages
         ├─► [8] Genera documentación de versión
         ├─► [9] Actualiza README.md y README_APK.md
         └─► [10] Commit + Push automático
                 │
                 ▼
         ┌───────────────────┐
         │ GitHub Actions    │
         │ (.github/         │
         │  workflows/       │
         │  release.yml)     │
         └─────┬─────────────┘
               │
               ├─► Setup Node.js + Java 21
               ├─► npm ci (instalar deps)
               ├─► Genera keystore Android
               ├─► Bumpa versión en CI
               ├─► Compila Android (gradlew)
               ├─► Crea GitHub Release
               ├─► Sube APK como asset
               ├─► [Stable] Compila PWA para Pages
               └─► [Stable] Deploy a gh-pages
```

### Tecnologías Involucradas

| Componente | Tecnología | Propósito |
|------------|------------|-----------|
| **Build Android** | Capacitor 8 + Gradle 8.14 + Java 21 | Compila APK nativo |
| **Build Web** | Vite 6 + React 19 | Compila PWA |
| **Scripts** | Node.js (ES Modules) | Automatización |
| **CI/CD** | GitHub Actions | Build en la nube |
| **Hosting Web** | GitHub Pages | Deploy PWA |
| **Versionado** | Semver (Semantic Versioning) | Control de versiones |

---

## 🔄 Flujo Completo de Release

### Diagrama de Flujo Detallado

```mermaid
graph TD
    A[npm run release:beta/stable] --> B{Validar Git Clean}
    B -->|✓| C[Calcular Próxima Versión]
    B -->|✗| FAIL[❌ Error: Commit cambios primero]
    
    C --> D[Actualizar package.json]
    D --> E[Disparar GitHub Actions Workflow]
    
    E --> F[GitHub Actions CI/CD]
    F --> G[Setup Entorno Node + Java]
    G --> H[Instalar Dependencias]
    H --> I[Generar Keystore Android]
    I --> J[Compilar Android APK]
    J --> K[Crear GitHub Release]
    K --> L[Subir APK a Release]
    
    L --> M{Es Stable?}
    M -->|Sí| N[Compilar PWA con base /Inventariando/]
    M -->|No| O[Continuar]
    N --> P[Deploy PWA a gh-pages]
    P --> O
    
    O --> Q[Script Local: Esperar Workflow]
    Q --> R[Descargar APK desde GitHub]
    R --> S[Copiar APK a APK/v{version}/]
    S --> T[Generar CHECKSUMS.txt + INFO.txt]
    T --> U[Actualizar CHANGELOG.md]
    U --> V[Compilar Web App para BUILDS/]
    V --> W[Generar docs/product beta|stable/v{version}.md]
    W --> X[Actualizar README.md]
    X --> Y[Commit + Push Todo]
    Y --> Z[✅ Release Completado]
```

### Pasos del Proceso (Explicación)

#### Fase 1: Preparación Local (Pasos 1-4)

**[1] Calcular Versión Automáticamente**
```javascript
// scripts/create-release.js
function calculateNextVersion(releaseType) {
  // Beta: 1.4.0 → 1.4.1-beta
  // Stable: 1.4.1-beta → 1.4.1
  // Stable: 1.4.1 → 1.4.2
}
```
- Lee `package.json` actual
- Aplica reglas de semver según tipo (beta/stable)
- No requiere intervención manual

**[2] Actualizar package.json**
```bash
node scripts/bump-version.js
```
- Escribe nueva versión en `package.json`
- Mantiene formato JSON intacto

**[3-4] Disparar Workflow en GitHub**
```javascript
// Usa GitHub API con token de gh CLI
await fetch('https://api.github.com/repos/.../actions/workflows/release.yml/dispatches', {
  method: 'POST',
  body: JSON.stringify({ ref: 'main', inputs: { release_type: 'beta' } })
});
```

#### Fase 2: Build en GitHub Actions (Pasos 5-12)

**[5-7] Setup del Entorno**
- Node.js 22 + npm
- Java 21 (Temurin)
- Permisos de ejecución para gradlew

**[8] Generar Keystore (Firma Android)**
```bash
# scripts/generate-keystore.sh
keytool -genkey -v -keystore android/app/inventariando.keystore \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias inventariando -storepass inventariando2024 \
  -dname "CN=Inventariando, OU=IT, O=Inventariando, ..."
```
- Crea keystore temporal para firma
- Válido por 10,000 días

**[9-10] Compilar Android APK**
```bash
npm run release:build
# Ejecuta:
# 1. vite build (web assets con base: '/')
# 2. npx cap sync android (copia a Capacitor)
# 3. cd android && ./gradlew assembleDebug
# 4. node scripts/organize-apk.js (copia APK a APK/v{version}/)
```

**[11-12] Crear GitHub Release + Subir APK**
```bash
# Usa API de GitHub
curl -X POST .../releases -d '{
  "tag_name": "v1.4.5",
  "name": "Inventariando v1.4.5",
  "prerelease": false
}'

gh release upload v1.4.5 APK/v1.4.5/Inventariando-1.4.5.apk
```

**[13-15] Deploy PWA (Solo Stable)**
```yaml
# Solo si release_type == 'stable'
- name: 🌐 Build PWA for GitHub Pages
  run: npm run build:web:pages  # base: /Inventariando/

- name: 🚀 Deploy to GitHub Pages
  uses: peaceiris/actions-gh-pages@v3
  with:
    publish_dir: ./dist
    publish_branch: gh-pages
```

#### Fase 3: Procesamiento Local (Pasos 16-22)

**[16] Esperar y Monitorear Workflow**
```javascript
// Polling cada 10 segundos por máximo 15 minutos
while (!completed) {
  const run = await fetch('.../actions/runs/{runId}');
  if (run.status === 'completed') break;
  await sleep(10000);
}
```

**[17-18] Descargar APK desde GitHub**
```javascript
const release = await fetch('.../releases/tags/v1.4.5');
const asset = release.assets.find(a => a.name.endsWith('.apk'));
const apkData = await fetch(asset.browser_download_url);
fs.writeFileSync(`APK/v1.4.5/Inventariando-1.4.5.apk`, apkData);
```

**[19] Generar Checksums**
```javascript
const sha256 = crypto.createHash('sha256')
  .update(fs.readFileSync(apkPath))
  .digest('hex');
fs.writeFileSync('CHECKSUMS.txt', `${sha256}  Inventariando-1.4.5.apk`);
```

**[20] Actualizar CHANGELOG.md**
```markdown
## [1.4.5] - 2025-12-15

### Added
- Nueva funcionalidad X
- Mejora en componente Y

### Fixed
- Bug en pantalla Z
```

**[21] Compilar Web App para BUILDS/**
```bash
npm run build:web:pages
# Compila con base: /Inventariando/
# Copia dist/ → BUILDS/web-pages/v1.4.5/
```

**[22] Generar Documentación de Versión**
```javascript
// Crea docs/product stable/v1.4.5.md con:
// - Stack tecnológico
// - Características
// - Changelog
// - Instrucciones de instalación
```

**[23-24] Commit y Push**
```bash
git add -A
git commit -m "chore: Release v1.4.5 - Documentación y builds"
git push origin main
```

---

## 🏗️ Builds Duales (Android + Web)

### Problema Resuelto

Antes de la implementación de builds duales:
- ❌ APK y Web App usaban la misma configuración de `base` path
- ❌ `base: '/Inventariando/'` rompía el APK (pantalla blanca)
- ❌ `base: '/'` rompía GitHub Pages (404 en assets)

### Solución: Configuración Dinámica en Vite

**vite.config.ts**
```typescript
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  
  // Detectar modo de compilación
  const isGitHubPagesMode = mode === 'pages';
  const basePath = isGitHubPagesMode ? '/Inventariando/' : '/';
  
  return {
    base: basePath,  // Dinámico según mode
    // ... resto de config
  };
});
```

### Scripts de Build

```json
// package.json
{
  "scripts": {
    "build:web": "vite build",
    // ↑ Compila con mode='production' → base: '/'
    // Usado por: APK Android (Capacitor)
    
    "build:web:pages": "vite build --mode pages",
    // ↑ Compila con mode='pages' → base: '/Inventariando/'
    // Usado por: GitHub Pages deployment
    
    "build:android": "npm run build:web && npx cap sync android && cd android && ./gradlew assembleDebug"
    // ↑ Compila web + sincroniza Capacitor + genera APK
  }
}
```

### Diferencias en Output

#### Build para Android (base: '/')
```html
<!-- dist/index.html -->
<!DOCTYPE html>
<html>
  <head>
    <script type="module" src="/assets/index-abc123.js"></script>
    <link rel="stylesheet" href="/assets/index-abc123.css">
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
```
**Resultado:** Capacitor carga assets desde `https://localhost/assets/` ✅

#### Build para GitHub Pages (base: '/Inventariando/')
```html
<!-- dist/index.html -->
<!DOCTYPE html>
<html>
  <head>
    <script type="module" src="/Inventariando/assets/index-abc123.js"></script>
    <link rel="stylesheet" href="/Inventariando/assets/index-abc123.css">
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
```
**Resultado:** GitHub Pages sirve desde `https://leo-unahur.github.io/Inventariando/assets/` ✅

### Flujo en Release Automático

```
npm run release:stable
  │
  ├─► GitHub Actions
  │   ├─► Compila APK (usa build:web → base: '/')
  │   └─► [Stable] Deploy PWA (usa build:web:pages → base: '/Inventariando/')
  │
  └─► Script Local
      └─► Compila Web App para BUILDS/ (usa build:web:pages)
```

**Resultado Final:**
- `APK/v1.4.5/Inventariando-1.4.5.apk` → Funciona en Android (base: /)
- `BUILDS/web-pages/v1.4.5/` → Listo para gh-pages (base: /Inventariando/)
- `gh-pages` branch → Actualizado automáticamente (solo stable)

---

## 🛠️ Scripts y Herramientas

### scripts/create-release.js

**Propósito:** Script maestro que orquesta todo el proceso de release.

**Funciones Principales:**

```javascript
// 1. Calcular versión
function calculateNextVersion(releaseType)
// Input: 'beta' | 'stable'
// Output: { current: '1.4.4', next: '1.4.5-beta' }

// 2. Disparar workflow en GitHub
async function triggerWorkflow(releaseType)
// - Usa GitHub API con token de gh CLI
// - Dispatch workflow con inputs.release_type
// - Retorna runId para monitoreo

// 3. Descargar APK desde GitHub Release
async function downloadAndCopyAPK(version)
// - Busca release por tag v{version}
// - Descarga asset .apk
// - Copia a APK/v{version}/

// 4. Generar checksums
function generateChecksums(apkPath)
// - Calcula SHA256 del APK
// - Guarda en CHECKSUMS.txt

// 5. Actualizar CHANGELOG
function updateChangelog(version, releaseType)
// - Agrega sección [version] con fecha
// - Mantiene formato Markdown

// 6. Compilar Web App para GitHub Pages
function buildWebAppForPages(version)
// - Ejecuta: npm run build:web:pages
// - Copia dist/ a BUILDS/web-pages/v{version}/

// 7. Generar documentación de versión
function generateVersionDocs(version, releaseType)
// - Crea docs/product beta|stable/v{version}.md
// - Incluye stack, features, changelog

// 8. Actualizar README.md
function updateReadme(version)
// - Badge de versión
// - Sección de novedades

// 9. Commit y push
function commitAndPush(version, releaseType)
// - git add -A
// - git commit -m "chore: Release v{version}"
// - git push origin main
```

**Uso:**
```bash
node scripts/create-release.js beta
node scripts/create-release.js stable

# O via npm:
npm run release:beta
npm run release:stable
```

### scripts/bump-version.js

**Propósito:** Actualiza versión en package.json.

```javascript
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
pkg.version = process.env.NEW_VERSION;
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
```

**Uso:** Ejecutado automáticamente por `create-release.js`.

### scripts/organize-apk.js

**Propósito:** Copia APK desde `android/app/build/outputs/apk/debug/` a `APK/v{version}/`.

```javascript
const version = require('../package.json').version;
const srcApk = 'android/app/build/outputs/apk/debug/app-debug.apk';
const destDir = `APK/v${version}/`;
const destApk = `${destDir}Inventariando-${version}.apk`;

fs.mkdirSync(destDir, { recursive: true });
fs.copyFileSync(srcApk, destApk);
console.log(`✅ APK copiado a ${destApk}`);
```

**Uso:** Ejecutado por `npm run release:build`.

### scripts/generate-keystore.sh

**Propósito:** Genera keystore temporal para firma de APK en CI/CD.

```bash
#!/bin/bash
KEYSTORE_PATH="android/app/inventariando.keystore"
STORE_PASS="inventariando2024"
KEY_ALIAS="inventariando"

if [ ! -f "$KEYSTORE_PATH" ]; then
  keytool -genkey -v \
    -keystore "$KEYSTORE_PATH" \
    -keyalg RSA \
    -keysize 2048 \
    -validity 10000 \
    -alias "$KEY_ALIAS" \
    -storepass "$STORE_PASS" \
    -keypass "$STORE_PASS" \
    -dname "CN=Inventariando, OU=IT, O=Inventariando, L=Buenos Aires, ST=Buenos Aires, C=AR"
fi
```

**Uso:** Ejecutado por GitHub Actions en cada workflow.

---

## ⚙️ GitHub Actions Workflow

**Archivo:** `.github/workflows/release.yml`

### Configuración del Workflow

```yaml
name: Release APK & Build

on:
  workflow_dispatch:
    inputs:
      release_type:
        description: 'Tipo de release'
        required: true
        default: 'beta'
        type: choice
        options:
          - beta
          - stable

jobs:
  release:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      packages: write
```

### Pasos del Workflow

#### 1. Setup del Entorno
```yaml
- name: 📥 Checkout code
  uses: actions/checkout@v4
  with:
    fetch-depth: 0

- name: 🔧 Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '22'
    cache: 'npm'

- name: 🔧 Setup Java (for Android build)
  uses: actions/setup-java@v4
  with:
    distribution: 'temurin'
    java-version: '21'
```

#### 2. Instalación y Preparación
```yaml
- name: 📦 Install dependencies
  run: npm ci

- name: 🔑 Generate Android Keystore
  run: bash scripts/generate-keystore.sh

- name: 🔐 Fix Gradle Permissions
  run: chmod +x ./android/gradlew
```

#### 3. Versionado
```yaml
- name: 📝 Bump version
  run: npm run release:version
  env:
    RELEASE_TYPE: ${{ github.event.inputs.release_type }}

- name: 📖 Extract version
  id: extract_version
  run: |
    VERSION=$(node -p "require('./package.json').version")
    echo "version=$VERSION" >> $GITHUB_OUTPUT
```

#### 4. Build Android
```yaml
- name: 📦 Build Android & APK
  run: npm run release:build
  # Ejecuta:
  # 1. vite build (web assets)
  # 2. npx cap sync android
  # 3. ./gradlew assembleDebug
  # 4. organize-apk.js
```

#### 5. Commit y Push
```yaml
- name: 🔐 Commit changes
  run: |
    git config --local user.email "leonardo@inventariando.app"
    git config --local user.name "Leonardo Esteves"
    git add -A
    git commit -m "chore: Release v${{ steps.extract_version.outputs.version }}" || true

- name: 📤 Push changes
  run: git push origin main --force-with-lease || true

- name: 🏷️ Create Git Tag
  run: |
    git tag -a "v${{ steps.extract_version.outputs.version }}" -m "Release v${{ steps.extract_version.outputs.version }}" || true
    git push origin "v${{ steps.extract_version.outputs.version }}" || true
```

#### 6. Crear GitHub Release
```yaml
- name: 📦 Create GitHub Release (API)
  run: |
    RELEASE_BODY="# 🚀 Inventariando v${{ steps.extract_version.outputs.version }}
    
    **Tipo de Release:** ${{ github.event.inputs.release_type }}
    
    ## 📝 Cambios
    - Consulta el CHANGELOG.md para detalles completos
    
    ## 📥 Instalación (Android)
    1. Descarga el archivo .apk
    2. Habilita instalación de fuentes desconocidas
    3. Instala el APK"
    
    IS_PRERELEASE=$([[ "${{ github.event.inputs.release_type }}" == "beta" ]] && echo "true" || echo "false")
    
    curl -X POST \
      -H "Authorization: token ${{ secrets.GITHUB_TOKEN }}" \
      -H "Content-Type: application/json" \
      -d "{
        \"tag_name\": \"v${{ steps.extract_version.outputs.version }}\",
        \"name\": \"Inventariando v${{ steps.extract_version.outputs.version }}\",
        \"body\": $(echo \"$RELEASE_BODY\" | jq -Rs .),
        \"prerelease\": $IS_PRERELEASE
      }" \
      "https://api.github.com/repos/LEO-UNAHUR/Inventariando/releases"
```

#### 7. Subir APK
```yaml
- name: 📤 Upload APK asset
  run: |
    APK_PATH="APK/v${{ steps.extract_version.outputs.version }}/Inventariando-${{ steps.extract_version.outputs.version }}.apk"
    if [ ! -f "$APK_PATH" ]; then
      echo "❌ APK no encontrado en $APK_PATH"
      exit 1
    fi
    gh release upload "v${{ steps.extract_version.outputs.version }}" "$APK_PATH" --clobber
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

#### 8. Deploy PWA (Solo Stable)
```yaml
- name: 🌐 Build PWA for GitHub Pages (stable only)
  if: ${{ github.event.inputs.release_type == 'stable' }}
  run: npm run build:web:pages

- name: 🚀 Deploy to GitHub Pages (stable only)
  if: ${{ github.event.inputs.release_type == 'stable' }}
  uses: peaceiris/actions-gh-pages@v3
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    publish_dir: ./dist
    publish_branch: gh-pages
    force_orphan: true
```

### Tiempo de Ejecución

- **Beta:** ~4-5 minutos (sin deploy PWA)
- **Stable:** ~5-6 minutos (con deploy PWA)

### Logs del Workflow

Accesibles en:
```
https://github.com/LEO-UNAHUR/Inventariando/actions/workflows/release.yml
```

---

## 📊 Versionado Automático

### Reglas de Semver

El sistema usa **Semantic Versioning 2.0** con extensión para betas.

#### Formato de Versión
```
MAJOR.MINOR.PATCH[-PRERELEASE]

Ejemplos:
  1.4.5         → Stable
  1.4.5-beta    → Beta
```

#### Reglas de Incremento

**Release Beta:**
```javascript
// Caso 1: Desde stable
1.4.0  →  1.5.0-beta   (incrementa MINOR, agrega -beta)

// Caso 2: Desde beta anterior
1.5.0-beta  →  1.5.1-beta   (incrementa PATCH)
1.5.1-beta  →  1.5.2-beta   (incrementa PATCH)
```

**Release Stable:**
```javascript
// Caso 1: Desde beta (quita sufijo)
1.5.2-beta  →  1.5.2   (quita -beta)

// Caso 2: Desde stable anterior
1.5.2  →  1.5.3   (incrementa PATCH)
```

### Tabla de Transiciones

| Versión Actual | Tipo Release | Versión Siguiente |
|----------------|--------------|-------------------|
| `1.4.0` | beta | `1.5.0-beta` |
| `1.5.0-beta` | beta | `1.5.1-beta` |
| `1.5.1-beta` | beta | `1.5.2-beta` |
| `1.5.2-beta` | stable | `1.5.2` |
| `1.5.2` | stable | `1.5.3` |
| `1.5.3` | beta | `1.6.0-beta` |

### Implementación

```javascript
// scripts/create-release.js

function parseVersion(versionString) {
  const match = versionString.match(/^(\d+)\.(\d+)\.(\d+)(?:-(.+))?$/);
  return {
    major: parseInt(match[1]),
    minor: parseInt(match[2]),
    patch: parseInt(match[3]),
    prerelease: match[4] || null
  };
}

function calculateNextVersion(releaseType) {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const current = pkg.version;
  const parsed = parseVersion(current);

  let next;
  if (releaseType === 'beta') {
    if (parsed.prerelease === 'beta') {
      // Ya es beta → incrementa patch
      next = `${parsed.major}.${parsed.minor}.${parsed.patch + 1}-beta`;
    } else {
      // Es stable → incrementa minor + agrega -beta
      next = `${parsed.major}.${parsed.minor + 1}.0-beta`;
    }
  } else if (releaseType === 'stable') {
    if (parsed.prerelease === 'beta') {
      // Es beta → quita sufijo
      next = `${parsed.major}.${parsed.minor}.${parsed.patch}`;
    } else {
      // Ya es stable → incrementa patch
      next = `${parsed.major}.${parsed.minor}.${parsed.patch + 1}`;
    }
  }

  return { current, next };
}
```

### Git Tags

Cada release crea un tag automáticamente:

```bash
# Betas
v1.5.0-beta
v1.5.1-beta
v1.5.2-beta

# Stables
v1.5.2
v1.5.3
```

**Ver todos los tags:**
```bash
git tag -l "v*"
```

**Checkout a versión específica:**
```bash
git checkout v1.5.2
```

---

## 📦 Archivos Generados

### Estructura de Directorios Post-Release

```
Inventariando/
├── APK/
│   └── v1.4.5/
│       ├── Inventariando-1.4.5.apk      (5-7 MB, descargado de GitHub)
│       ├── CHECKSUMS.txt                 (SHA256 del APK)
│       ├── INFO.txt                      (Metadatos, instrucciones)
│       └── README_APK.md                 (Actualizado automáticamente)
│
├── BUILDS/
│   └── web-pages/
│       └── v1.4.5/
│           ├── index.html                (base: /Inventariando/)
│           ├── assets/
│           │   ├── index-abc123.js
│           │   ├── index-abc123.css
│           │   └── ...
│           └── service-worker.js
│
├── docs/
│   ├── product beta/
│   │   └── v1.5.0-beta.md               (Docs de versión beta)
│   │
│   ├── product stable/
│   │   └── v1.4.5.md                    (Docs de versión stable)
│   │
│   └── release/
│       └── RELEASE_SYSTEM.md            (Este documento)
│
├── CHANGELOG.md                          (Actualizado automáticamente)
├── README.md                             (Badge + novedades actualizados)
└── package.json                          (Versión actualizada)
```

### Contenido de Archivos Generados

#### APK/v{version}/CHECKSUMS.txt
```
a1b2c3d4e5f6...  Inventariando-1.4.5.apk
```
Uso:
```bash
cd APK/v1.4.5
sha256sum -c CHECKSUMS.txt
# Output: Inventariando-1.4.5.apk: OK
```

#### APK/v{version}/INFO.txt
```
===========================================
  INVENTARIANDO - APK v1.4.5
===========================================

Tipo de Release: stable
Fecha de Compilación: 2025-12-15
Plataforma: Android (API 34)
Tamaño: 6.2 MB

REQUISITOS:
- Android 7.0 (API 24) o superior
- 50 MB de espacio libre
- Conexión a Internet (para IA)

INSTALACIÓN:
1. Descarga el APK en tu dispositivo Android
2. Ve a Configuración > Seguridad
3. Habilita "Orígenes desconocidos"
4. Abre el archivo APK
5. Sigue las instrucciones en pantalla

VERIFICACIÓN:
SHA256: a1b2c3d4e5f6...
Firma: CN=Inventariando

SOPORTE:
GitHub: https://github.com/LEO-UNAHUR/Inventariando
Email: leonardo@inventariando.app
```

#### docs/product stable/v{version}.md
```markdown
# Inventariando v1.4.5 (Stable)

**Fecha de Release:** 15 de diciembre de 2025  
**Tipo:** Stable  
**Plataformas:** Android, Web (PWA)

## 🛠️ Stack Tecnológico

- **Frontend:** React 19, Vite 6, Tailwind CSS
- **Mobile:** Capacitor 8, Android SDK 34
- **IA:** Google Gemini AI
- **Backend:** IndexedDB (local-first)

## ✨ Características Principales

- ✅ Gestión de inventario offline-first
- ✅ POS integrado
- ✅ Análisis con IA (Gemini)
- ✅ Gestión de clientes y proveedores
- ✅ Reportes financieros

## 🆕 Novedades en v1.4.5

- **Mejora:** Optimización de rendimiento en lista de productos
- **Fix:** Corregido error en cálculo de stock
- **Docs:** Actualización de guías de usuario

## 📥 Descarga e Instalación

### Android APK
1. Descarga desde [GitHub Releases](https://github.com/LEO-UNAHUR/Inventariando/releases/tag/v1.4.5)
2. Habilita instalación de fuentes desconocidas
3. Instala el APK

### Web App (PWA)
Visita: https://leo-unahur.github.io/Inventariando/

## 🐛 Reportar Bugs

GitHub Issues: https://github.com/LEO-UNAHUR/Inventariando/issues
```

---

## 🚀 Despliegue a GitHub Pages

### Automático (Solo Stable Releases)

Cuando ejecutas `npm run release:stable`, el workflow de GitHub Actions:

1. Compila PWA con `npm run build:web:pages` (base: `/Inventariando/`)
2. Usa action `peaceiris/actions-gh-pages@v3`
3. Despliega a rama `gh-pages` automáticamente
4. GitHub Pages sirve desde: `https://leo-unahur.github.io/Inventariando/`

**Configuración en Workflow:**
```yaml
- name: 🚀 Deploy to GitHub Pages (stable only)
  if: ${{ github.event.inputs.release_type == 'stable' }}
  uses: peaceiris/actions-gh-pages@v3
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    publish_dir: ./dist
    publish_branch: gh-pages
    force_orphan: true  # Limpia historial cada deploy
```

### Manual (Si es Necesario)

Si necesitas desplegar manualmente la Web App desde `BUILDS/`:

```bash
# 1. Navegar al directorio del proyecto
cd C:\Users\leoez\Documents\Proyectos VSC\Inventariando

# 2. Compilar Web App para Pages (si no existe)
npm run build:web:pages

# 3. Cambiar a rama gh-pages
git checkout gh-pages

# 4. Copiar archivos de BUILDS/ a raíz
# PowerShell:
Copy-Item -Path "BUILDS/web-pages/v1.4.5/*" -Destination "." -Recurse -Force

# Bash:
cp -r BUILDS/web-pages/v1.4.5/* .

# 5. Commit y push
git add .
git commit -m "deploy: Web App v1.4.5"
git push origin gh-pages

# 6. Volver a main
git checkout main
```

### Verificar Deployment

1. **URL de la App:**
   ```
   https://leo-unahur.github.io/Inventariando/
   ```

2. **Verificar Assets:**
   - Abrir DevTools (F12)
   - Pestaña Network
   - Recargar página
   - Verificar que todos los assets cargan desde `/Inventariando/assets/...`

3. **Verificar Service Worker:**
   ```
   Application > Service Workers
   Should show: "Activated and Running"
   ```

### Troubleshooting Deploy

**Problema: 404 en assets**
```
Solution: Verificar que se usó build:web:pages (no build:web)
Check: dist/index.html debe tener src="/Inventariando/assets/..."
```

**Problema: Página en blanco**
```
Solution: Verificar console de DevTools para errores
Common: CORS errors → verificar API keys en env
```

**Problema: Service Worker no registra**
```
Solution: Verificar que service-worker.js existe en raíz
Check: https://leo-unahur.github.io/Inventariando/service-worker.js
```

---

## 🔧 Troubleshooting

### Problemas Comunes y Soluciones

#### 1. "GitHub token not found"

**Error:**
```
❌ No se pudo obtener token de GitHub
```

**Solución:**
```bash
# Instalar GitHub CLI
winget install GitHub.cli

# Autenticar
gh auth login

# Verificar
gh auth status
```

#### 2. "Workflow failed to complete"

**Error:**
```
❌ Workflow finalizó con estado: failure
```

**Solución:**
1. Ver logs en GitHub Actions:
   ```
   https://github.com/LEO-UNAHUR/Inventariando/actions
   ```
2. Identificar paso que falló
3. Soluciones comunes:
   - **npm ci failed:** Verificar package-lock.json sincronizado
   - **gradlew failed:** Verificar sintaxis en código Android
   - **keystore failed:** Verificar script generate-keystore.sh

#### 3. "APK not found after download"

**Error:**
```
❌ APK no encontrado en APK/v1.4.5/
```

**Solución:**
1. Verificar que el workflow completó exitosamente
2. Verificar que el APK se subió a GitHub Release:
   ```
   https://github.com/LEO-UNAHUR/Inventariando/releases/tag/v1.4.5
   ```
3. Si el asset existe pero no descargó, ejecutar manualmente:
   ```bash
   gh release download v1.4.5 -p "*.apk" -D APK/v1.4.5/
   ```

#### 4. "Pantalla blanca en APK"

**Error:** APK se instala pero muestra pantalla blanca.

**Causa:** APK compilado con `base: '/Inventariando/'` en lugar de `base: '/'`.

**Solución:**
1. Verificar vite.config.ts:
   ```typescript
   const basePath = mode === 'pages' ? '/Inventariando/' : '/';
   ```
2. Verificar que `npm run build:android` usa `build:web` (no `build:web:pages`)
3. Recompilar:
   ```bash
   npm run build:android
   ```

#### 5. "404 en GitHub Pages"

**Error:** Web App carga pero assets dan 404.

**Causa:** Web App compilada con `base: '/'` en lugar de `base: '/Inventariando/'`.

**Solución:**
1. Verificar que se usó `npm run build:web:pages`
2. Inspeccionar `dist/index.html`:
   ```html
   <script src="/Inventariando/assets/..."></script>  ✅ Correcto
   <script src="/assets/..."></script>                 ❌ Incorrecto
   ```
3. Recompilar y redesplegar:
   ```bash
   npm run build:web:pages
   # ... seguir pasos de deploy manual
   ```

#### 6. "Git push rejected (branch protection)"

**Error:**
```
remote: Changes must be made through a pull request
```

**Solución:**
Este es un warning esperado si tienes protección de rama. El push se completa exitosamente.

Si realmente necesitas bypass (no recomendado):
```bash
# Opción 1: Usar --force-with-lease (más seguro)
git push origin main --force-with-lease

# Opción 2: Deshabilitar protección temporalmente en GitHub Settings
```

#### 7. "Version already exists"

**Error:**
```
❌ Tag v1.4.5 already exists
```

**Solución:**
```bash
# Opción 1: Usar próxima versión (automático si vuelves a ejecutar)
npm run release:stable

# Opción 2: Eliminar tag existente (cuidado)
git tag -d v1.4.5
git push origin :refs/tags/v1.4.5
```

#### 8. "Checksums don't match"

**Error:**
```
Inventariando-1.4.5.apk: FAILED
```

**Causa:** APK fue modificado después de generar checksums.

**Solución:**
```bash
# Regenerar checksums
cd APK/v1.4.5
sha256sum Inventariando-1.4.5.apk > CHECKSUMS.txt
```

### Logs y Debugging

**Ver logs del script local:**
```bash
npm run release:stable 2>&1 | tee release.log
```

**Ver logs de GitHub Actions:**
```
https://github.com/LEO-UNAHUR/Inventariando/actions/workflows/release.yml
```

**Verificar estado de Git:**
```bash
git status
git log --oneline -10
git remote -v
```

**Verificar versión actual:**
```bash
node -p "require('./package.json').version"
```

---

## 📋 Checklist Pre-Release

Antes de ejecutar un release, verificar:

- [ ] Git working directory limpio (`git status` no muestra cambios pendientes)
- [ ] Todas las pruebas pasan (`npm test` si aplica)
- [ ] No hay errores de TypeScript (`npm run build:web` exitoso)
- [ ] CHANGELOG.md tiene entrada para próxima versión
- [ ] GitHub CLI autenticado (`gh auth status`)
- [ ] Conexión a Internet estable

---

## 📞 Contacto y Soporte

**GitHub Repository:**  
https://github.com/LEO-UNAHUR/Inventariando

**Issues:**  
https://github.com/LEO-UNAHUR/Inventariando/issues

**Autor:**  
Leonardo Esteves  
leonardo@inventariando.app

---

## 📜 Historial de Cambios del Sistema

### v2.0 - Builds Duales (15 Dic 2025)
- ✅ Implementación de builds duales (Android + Web)
- ✅ vite.config.ts con detección de modo
- ✅ Compilación automática de Web App en releases
- ✅ Deploy automático a GitHub Pages (stable)
- ✅ Documentación consolidada en RELEASE_SYSTEM.md

### v1.0 - Sistema Base (Dic 2025)
- ✅ Script maestro create-release.js
- ✅ GitHub Actions workflow
- ✅ Versionado automático (semver)
- ✅ Descarga automática de APK
- ✅ Generación de checksums
- ✅ Actualización de CHANGELOG y README

---

**Última Actualización:** 15 de diciembre de 2025  
**Versión del Documento:** 1.0  
**Mantenido por:** Leonardo Esteves
