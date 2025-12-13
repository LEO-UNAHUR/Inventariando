# RELEASE_PROCESS.md

## Proceso de Release Automatizado

Este documento explica cómo funcionan los releases automáticos en Inventariando y cómo dispararlos.

---

## 🚀 Flujo Automático de Release

### Componentes

1. **GitHub Actions Workflow** (`.github/workflows/release.yml`)
   - Escucha eventos `workflow_dispatch` (manual)
   - Bumpea versión en `package.json`
   - Compila APK mediante Capacitor
   - Organiza archivos en carpeta `APK/`
   - Crea release en GitHub con assets
   - Push automático de cambios

2. **Scripts Node.js** (`scripts/`)
   - `bump-version.js`: Incrementa versión
   - `organize-apk.js`: Copia y organiza APK versionado

3. **Carpeta APK**
   - Estructura: `APK/v[version]/`
   - Contiene: APK, AAB, checksums, metadatos

---

## 📋 Cómo Disparar un Release

### Opción 1: GitHub Web UI (Recomendado)

1. Ve a tu repositorio: https://github.com/LEO-UNAHUR/Inventariando
2. Haz clic en **Actions**
3. Busca el workflow **"Release APK & Build"**
4. Haz clic en **"Run workflow"**
5. Selecciona:
   - **Branch**: `main` (por defecto)
   - **Release Type**: `beta` o `stable`
6. Haz clic en **"Run workflow"**

### Opción 2: GitHub CLI

```bash
# Beta release
gh workflow run release.yml -f release_type=beta

# Stable release
gh workflow run release.yml -f release_type=stable
```

### Opción 3: cURL

```bash
curl -X POST \
  https://api.github.com/repos/LEO-UNAHUR/Inventariando/actions/workflows/release.yml/dispatches \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "ref": "main",
    "inputs": {
      "release_type": "beta"
    }
  }'
```

---

## 📝 Versioning Scheme

Inventariando usa **Semantic Versioning**: `MAJOR.MINOR.PATCH`

### Ejemplos

- `1.0.0` → `1.1.0-beta` (Minor bump + beta tag)
- `1.1.0-beta` → `1.1.0` (Beta → Stable)
- `1.1.0` → `1.2.0-beta` (Siguiente ciclo)

### Script `bump-version.js`

```bash
npm run release:version
```

**Lógica:**
- Si versión contiene `-beta`: quita el `-beta` (release estable)
- Si no: incrementa minor version y agrega `-beta`

---

## 🏗️ Estructura de Carpetas APK

Después de cada release, se crea:

```
APK/
├── v1.1.0-beta/
│   ├── Inventariando-1.1.0-beta.apk      # APK compilado (instalable)
│   ├── Inventariando-1.1.0-beta.aab      # Android App Bundle (Play Store)
│   ├── INFO.txt                          # Metadatos y guía de instalación
│   └── CHECKSUMS.txt                     # SHA256 para verificación
│
├── v1.1.0/
│   ├── Inventariando-1.1.0.apk
│   ├── INFO.txt
│   └── CHECKSUMS.txt
│
└── README.md                             # Este archivo
```

---

## 📥 Descarga de APK

### Desde GitHub Releases

1. Ve a: https://github.com/LEO-UNAHUR/Inventariando/releases
2. Busca la versión deseada
3. Descarga el archivo `Inventariando-v[version].apk`
4. Instala en tu teléfono

### Desde la Carpeta Local

El archivo `APK/v[version]/Inventariando-[version].apk` está siempre disponible en el repo:

```bash
git clone https://github.com/LEO-UNAHUR/Inventariando.git
cd Inventariando
# Acceder a APK/v1.1.0-beta/Inventariando-1.1.0-beta.apk
```

---

## 🔐 Verificación de Integridad

### Descargar y Verificar

```bash
# 1. Descargar APK
wget https://github.com/LEO-UNAHUR/Inventariando/releases/download/v1.1.0-beta/Inventariando-1.1.0-beta.apk

# 2. Obtener checksum esperado
wget https://github.com/LEO-UNAHUR/Inventariando/releases/download/v1.1.0-beta/CHECKSUMS.txt

# 3. Verificar
sha256sum Inventariando-1.1.0-beta.apk
# Comparar salida con el valor en CHECKSUMS.txt
```

---

## ⚙️ Configuración de GitHub Secrets

El workflow requiere los siguientes secrets (ya preconfigurados en GitHub):

- **GITHUB_TOKEN**: Autogenerado por GitHub Actions (no requiere config manual)

---

## 🔍 Monitoreo de Builds

### Ver Estado del Workflow

1. Ve a **Actions** en GitHub
2. Haz clic en **"Release APK & Build"**
3. Verifica el estado de la última ejecución
4. Haz clic para ver logs detallados

### Errores Comunes

| Error | Causa | Solución |
|-------|-------|----------|
| `Java not found` | Entorno de build sin Java 17 | GitHub Actions usa Java 17 automáticamente |
| `npm ERR!` | Dependencias no instaladas | `npm ci` instala todas las deps |
| `APK not found` | Build falló silenciosamente | Revisar logs del workflow |

---

## 🚨 Troubleshooting

### El workflow no se ejecuta

- [ ] Confirma que el archivo `.github/workflows/release.yml` existe
- [ ] Verifica permisos de escritura en el repo
- [ ] Intenta manualmente en web UI de GitHub

### APK no se genera

- [ ] Revisa que Capacitor esté instalado: `npx cap --version`
- [ ] Verifica que el build web sea exitoso: `npm run build:web`
- [ ] Busca logs en GitHub Actions para errores de Java/Gradle

### Checksums no coinciden

- [ ] Confirma que descargaste desde la ubicación correcta
- [ ] Intenta descargar nuevamente
- [ ] Si persiste, reporta un issue en GitHub

---

## 📚 Referencias

- [Capacitor Docs](https://capacitorjs.com/docs)
- [GitHub Actions](https://docs.github.com/en/actions)
- [Semantic Versioning](https://semver.org)
- [Keep a Changelog](https://keepachangelog.com)

---

*Última actualización: 13 de Diciembre de 2025*
*Para preguntas o problemas, abre un issue en GitHub*
