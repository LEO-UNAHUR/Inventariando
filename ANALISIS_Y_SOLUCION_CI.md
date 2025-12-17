# Análisis y Solución de Fallos en CI para Releases

## 1. Diagnóstico del Problema Central

Tras analizar el informe de errores, los scripts de release (`scripts/release-auto.js`) y el workflow de GitHub Actions (`.github/workflows/release.yml`), he identificado la causa raíz de los fallos y la confusión en el proceso de release.

**El problema fundamental es la existencia de dos lógicas de release paralelas y conflictivas:**

1.  **Lógica Local (Correcta y Completa):** Encapsulada en el script `scripts/release-auto.js`, que está diseñado para ser ejecutado por un desarrollador en su máquina. Este script maneja todo el ciclo de vida: calcula la nueva versión, la escribe en `package.json`, actualiza el `CHANGELOG.md`, hace commit, empuja los cambios y el nuevo tag, y finalmente, **dispara remotamente** el workflow de CI en GitHub Actions.

2.  **Lógica de CI (Incompleta y Conflictiva):** El workflow `release.yml` intentaba replicar esta lógica de forma autónoma. Se activaba con cada `push` a `main` y trataba de calcular la versión y crear un release. Esto generaba dos problemas críticos:
    *   **Fallo por duplicación:** Al no incrementar la versión en el `package.json` en un `push` normal, el workflow fallaba al intentar crear un tag de release que ya existía.
    *   **Condición de carrera:** Cuando se usaba el script `release-auto.js`, este empujaba un commit (activando el workflow por `push`) y simultáneamente lo activaba de nuevo por `workflow_dispatch`, creando ejecuciones duplicadas.

En resumen, el workflow de CI no estaba diseñado para ser autónomo, sino para ser **un sirviente del script local `release-auto.js`**. Su única tarea debería ser construir el artefacto (APK) una vez que el script local ha preparado y empujado la nueva versión.

## 2. Solución Propuesta

La solución es realinear el workflow de CI con su propósito original, centralizando toda la lógica de orquestación en los scripts de Node.js y simplificando drásticamente el archivo `.github/workflows/release.yml`.

Esto no solo solucionará los fallos, sino que creará un proceso de release más robusto, predecible y fácil de mantener (principio DRY - Don't Repeat Yourself).

### Paso 1: Reemplazar el contenido de `.github/workflows/release.yml`

Este es el nuevo workflow, simplificado y corregido. Su única responsabilidad es **construir el APK firmado y publicarlo en un release de GitHub existente**.

```yaml
name: Release APK & Build

on:
  workflow_dispatch:
    inputs:
      release_type:
        description: 'Tipo de release (usado por el script local)'
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
      contents: write # Permiso para crear y subir assets a un release

    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0 # Necesario para que actions/create-release encuentre el tag correcto

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'

      - name: Setup Java (Android build)
        uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '21'

      - name: Install dependencies
        run: npm ci

      - name: Fix Gradle permissions
        run: chmod +x ./android/gradlew

      - name: Prepare keystore (from secret)
        id: prepare_keystore
        run: |
          if [ -z "${{ secrets.ANDROID_KEYSTORE_BASE64 }}" ]; then
            echo "::warning::El secreto ANDROID_KEYSTORE_BASE64 no está configurado. El APK no será firmado."
            echo "is_signed=false" >> $GITHUB_OUTPUT
          else
            echo "Keystore secret presente — decodificando a android/app/inventariando.keystore"
            echo "${{ secrets.ANDROID_KEYSTORE_BASE64 }}" | base64 --decode > android/app/inventariando.keystore
            echo "is_signed=true" >> $GITHUB_OUTPUT
          fi

      - name: Ensure cordova variables file exists
        run: |
          dir=android/capacitor-cordova-android-plugins
          file="$dir/cordova.variables.gradle"
          if [ ! -f "$file" ]; then
            echo "Creando $file (generado por CI)"
            mkdir -p "$dir"
            # Contenido mínimo para que Gradle no falle
            echo "ext { cdvMinSdkVersion = project.hasProperty('minSdkVersion') ? rootProject.ext.minSdkVersion : 24; cdvPluginPostBuildExtras = []; cordovaConfig = [:] }" > "$file"
          fi

      - name: Build Android Release
        working-directory: android
        run: |
          if [ "${{ steps.prepare_keystore.outputs.is_signed }}" == "true" ]; then
            echo "Construyendo APK firmado..."
            ./gradlew assembleRelease \
              -Pandroid.injected.signing.store.file=app/inventariando.keystore \
              -Pandroid.injected.signing.store.password=${{ secrets.ANDROID_KEYSTORE_PASSWORD }} \
              -Pandroid.injected.signing.key.alias=${{ secrets.ANDROID_KEY_ALIAS }} \
              -Pandroid.injected.signing.key.password=${{ secrets.ANDROID_KEY_PASSWORD }}
          else
            echo "Construyendo APK de depuración (sin firmar)..."
            ./gradlew assembleDebug
          fi

      - name: Find built APK
        id: find_apk
        run: |
          # Prioriza el APK de release, si no, busca el de debug
          apk_path=$(find android/app/build/outputs/apk/release -name "*.apk" | head -n 1)
          if [ -z "$apk_path" ]; then
            apk_path=$(find android/app/build/outputs/apk/debug -name "*.apk" | head -n 1)
          fi
          if [ -z "$apk_path" ]; then
            echo "::error::No se encontró ningún APK generado."
            exit 1
          fi
          echo "apk_path=$apk_path" >> $GITHUB_OUTPUT
          echo "Found APK at $apk_path"

      - name: Read package.json version
        id: pkg
        run: echo "version=$(node -p \"require('./package.json').version\")" >> $GITHUB_OUTPUT

      - name: Create or Update GitHub Release
        id: create_release
        uses: actions/create-release@v1
        with:
          tag_name: v${{ steps.pkg.outputs.version }}
          release_name: Release ${{ steps.pkg.outputs.version }}
          body: |
            Release automático para la versión ${{ steps.pkg.outputs.version }}.
            APK generado por GitHub Actions.
          draft: false
          prerelease: ${{ contains(steps.pkg.outputs.version, '-beta') }}
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Upload APK to Release
        uses: actions/upload-release-asset@v1
        with:
          upload_url: ${{ steps.create_release.outputs.upload_url }}
          asset_path: ${{ steps.find_apk.outputs.apk_path }}
          asset_name: Inventariando-v${{ steps.pkg.outputs.version }}.apk
          asset_content_type: application/vnd.android.package-archive

      - name: Build PWA for GitHub Pages (stable only)
        if: github.event.inputs.release_type == 'stable'
        run: npm run build -- --mode pages

      - name: Deploy to GitHub Pages (stable only)
        if: github.event.inputs.release_type == 'stable'
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
          publish_branch: gh-pages
          force_orphan: true
```

### Paso 2: Configurar los Secretos del Repositorio (Acción Requerida)

Este es el paso más crítico que **debes realizar manualmente**. Sin estos secretos, el workflow construirá un APK de depuración, pero no uno firmado y listo para la Play Store.

1.  Ve a la configuración de tu repositorio en GitHub: `https://github.com/LEO-UNAHUR/Inventariando/settings/secrets/actions`
2.  Crea los siguientes cuatro "Repository secrets":

    | Nombre del Secreto            | Descripción y Cómo Obtener el Valor                                                                                                         |
    | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
    | `ANDROID_KEYSTORE_BASE64`     | Tu archivo `inventariando.keystore` codificado en Base64. Ejecuta este comando en tu terminal: `base64 -w 0 inventariando.keystore` y copia el resultado. |
    | `ANDROID_KEYSTORE_PASSWORD`   | La contraseña de tu keystore (la que usaste al crearlo).                                                                                    |
    | `ANDROID_KEY_ALIAS`           | El alias de tu clave dentro del keystore (ej: `inventariando`).                                                                                |
    | `ANDROID_KEY_PASSWORD`        | La contraseña de la clave específica (puede ser la misma que la del keystore).                                                               |

### Paso 3: Adoptar el Nuevo Flujo de Trabajo para Releases

A partir de ahora, la única forma de generar un release es la siguiente:

1.  Asegúrate de tener los últimos cambios de `main` en tu máquina local (`git pull origin main`).
2.  Asegúrate de no tener cambios sin guardar (`git status` debe estar limpio).
3.  Ejecuta el comando para el tipo de release que deseas desde la raíz de tu proyecto:
    *   **Para un release beta:**
        ```bash
        npm run release:beta
        ```
    *   **Para un release estable:**
        ```bash
        npm run release:stable
        ```
4.  El script se encargará de todo: actualizará la versión, hará commit, push y disparará el workflow en GitHub Actions.
5.  Puedes monitorear el progreso en la pestaña "Actions" de tu repositorio. Cuando termine, el APK firmado estará adjunto al nuevo release en la sección "Releases" de GitHub.

Este enfoque centralizado elimina la ambigüedad, previene errores y asegura que cada release sea consistente y reproducible.
