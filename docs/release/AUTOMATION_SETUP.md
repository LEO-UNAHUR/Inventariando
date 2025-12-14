# Automatización de Releases - Guía Completa

## Estado Actual

El proyecto está configurado para automatizar completamente la creación de releases con APKs de Android.

### Cambios Realizados

1. **Reseteo de versión a v1.0.0 (MVP)**
   - package.json versión: 1.0.0
   - Eliminado tag v1.5.0 del repositorio local y remoto
   - Limpiado para empezar desde el MVP

2. **Plataforma Android con Capacitor**
   - Directorio `android/` configurado
   - `capacitor.config.ts` correcto
   - `android/app/build.gradle` con firma de release

3. **Generación de Keystore**
   - Script: `scripts/generate-keystore.sh`
   - Se ejecuta automáticamente en GitHub Actions
   - Credenciales:
     - Alias: `inventariando`
     - Store Password: `inventariando2024`
     - Key Password: `inventariando2024`

4. **Workflow de Release**
   - Archivo: `.github/workflows/release.yml`
   - Disparable manualmente desde Actions
   - Pasos en orden:
     1. Checkout del código
     2. Setup Node.js 22 + Java 17
     3. Instalar dependencias
     4. **Generar keystore** (generate-keystore.sh)
     5. Configurar git identity
     6. **Bumpar versión** (bump-version.js) según RELEASE_TYPE
     7. **Extraer versión** del package.json
     8. **Buildear Android** (npm run release:build)
     9. Organizar APK (organize-apk.js)
     10. Hacer commit
     11. Hacer push
     12. Crear tag
     13. Crear release en GitHub
     14. Subir APK como asset

5. **Scripts de Automatización**
   - `scripts/bump-version.js`: Bumpa versión según RELEASE_TYPE
   - `scripts/build:android`: Compila con Gradle release
   - `scripts/organize-apk.js`: Organiza APK en carpeta versionada
   - `scripts/generate-keystore.sh`: Genera keystore para firma

## Cómo Hacer un Release

### Opción 1: Asignarle a GitHub Copilot (Recomendado - La forma más fácil)

1. Crea una **issue** en el repositorio con:
   - **Título**: `Release v1.X.Y-beta` o `Release v1.X.Y (stable)`
   - **Etiquetas (labels)**: `release`, `automation`
   - **Descripción**: Especifica si es beta o stable

2. Asigna Copilot a la issue:
   - Ve a la issue
   - Click en "Assignees" (derecha)
   - Busca y selecciona "GitHub Copilot"
   - Copilot ejecutará automáticamente todo el flujo

3. Copilot ejecutará:
   - Crear la release directamente
   - Generar el APK
   - Subir a GitHub
   - Cerrar la issue

**Ventaja**: Es la forma más automática. Solo creas la issue, asignas Copilot, y listo.

---

### Opción 2: Desde la interfaz de GitHub (Manual)

1. Ve a: https://github.com/LEO-UNAHUR/Inventariando/actions
2. Click en "Release APK & Build"
3. Click en "Run workflow"
4. Selecciona:
   - **branch**: main
   - **release_type**: beta o stable
5. Click "Run workflow"
6. Monitorea la ejecución

---

### Opción 3: Desde la línea de comandos (CLI)

```bash
# Beta release
RELEASE_TYPE=beta npm run release:auto dispatch

# Stable release  
RELEASE_TYPE=stable npm run release:auto dispatch
```

## Flujo de Versiones

### Beta Release (vX.Y.0-beta)
- Bumpa minor version
- Añade sufijo `-beta`
- Ejemplo: 1.0.0 → 1.1.0-beta

### Stable Release (vX.Y.Z)
- Si tiene `-beta`, lo quita
- Si ya es estable, bumpa patch
- Ejemplo: 1.1.0-beta → 1.1.0
- O: 1.1.0 → 1.1.1

## Archivos Generados

Después de un release exitoso:

```
APK/v1.1.0/
├── Inventariando-1.1.0.apk       # APK para instalar
├── INFO.txt                        # Metadata y instrucciones
└── CHECKSUMS.txt                   # SHA256 del APK
```

El APK se sube automáticamente como asset a la release en GitHub.

## Instalación del APK

1. Descarga el `.apk` desde: https://github.com/LEO-UNAHUR/Inventariando/releases
2. En tu teléfono Android:
   - Configuración > Seguridad > Permitir fuentes desconocidas
   - Abre el archivo APK
   - Sigue las instrucciones

## Troubleshooting

### El APK no aparece en la release
- Revisa el log del workflow en GitHub Actions
- Busca errores en "Build Android & APK"
- Verifica que `npm run release:build` completó sin errores

### Versión no se bumpa correctamente
- Revisa que `RELEASE_TYPE` sea "beta" o "stable"
- Verifica que `scripts/bump-version.js` está ejecutándose
- Revisa el log de la sección "Bump version"

### Keystore generation fails
- GitHub Actions ejecuta `bash scripts/generate-keystore.sh`
- Verifica que el script tiene permisos de ejecución
- El keystore se genera dinámicamente, no está en git

## Configuración Importante

### GitHub Token
- Necesita scopes: `repo`, `workflow`
- Se usa `${{ secrets.GITHUB_TOKEN }}` en el workflow
- No requiere configuración manual (viene con Actions)

### Git Identity
- Email: leonardo@inventariando.app
- Name: Leonardo Esteves
- Configurado en el workflow para commits automáticos

### Capacitor Config
- appId: ar.inventariando.app
- appName: inventariando
- webDir: dist (build output de Vite)

## Próximos Pasos

1. Haz tu primer release de prueba (beta)
2. Verifica que el APK aparece en GitHub Releases
3. Prueba instalar el APK en un teléfono
4. Celebra! 🎉
