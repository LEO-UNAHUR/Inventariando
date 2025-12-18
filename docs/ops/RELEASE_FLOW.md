
# Flujo de Release Orquestado (release estable)

Este documento resume el pipeline actual para publicar Inventariando tanto en Android (APK) como en web (PWA), y muestra el procedimiento correcto para ejecutar un release estable, tanto para humanos como para agentes IA.

## 1. Objetivo
Mantener un solo procedimiento reproducible que:
- bumpea la versión según `RELEASE_TYPE` (beta / stable),
- compila la app para web y Android (`npm run release:build`),
- genera tags y releases en GitHub,
- sube el APK a la release (sin dejar copias locales) y documenta el resultado,
- respeta el pipeline de GH Actions sin pasos redundantes.

## 2. Procedimiento actual de releases

### 1. Crear un tag semántico
El pipeline ya no se dispara desde la rama `main`. Crea directamente un nuevo tag y púshalo:

```bash
git tag vMAJOR.MINOR.PATCH
git push origin vMAJOR.MINOR.PATCH
```

Ejemplo: `git tag v1.8.13 && git push origin v1.8.13`.

### 2. Qué hace el workflow `Release`
El tag crea un workflow que:
- instala dependencias (`npm ci`),
- genera el build web y valida `dist/`,
- sincroniza Capacitor, crea el módulo `capacitor-cordova-android-plugins` con `build.gradle` válido y expone el `shadow` release,
- decodifica `ANDROID_KEYSTORE_BASE64` en `android/release.keystore`,
- ejecuta Gradle desde `android/` con `-Pandroid.injected.signing.store.file=release.keystore`,
- verifica la existencia del APK, lo renombra a `inventariando-${TAG}.apk`,
- crea automáticamente la Release en GitHub y sube el asset firmado,
- opcionalmente genera y despliega docs si existen y limpia archivos sensibles.

### 3. Qué monitorear
1. Ve a: https://github.com/LEO-UNAHUR/Inventariando/actions
2. El workflow se llama `Release` y se dispara por cada tag `v*.*.*`.
3. Revisa los pasos de configuración del keystore y el build Android (imprime el working dir y el keystore usado).
4. Si finaliza con `failure`, la terminal que ejecutó `npm run release:stable` ya habrá mostrado la URL del run (para verificar el log).
5. Cuando termine correctamente, el APK firmado aparecerá en el Release correspondiente.

### 4. Notas para agentes IA
- No hagas pushes directos: crea tags para cumplir el disparador del workflow.
- Asegúrate de que los secrets (`ANDROID_KEYSTORE_BASE64`, `KEYSTORE_PASSWORD`, `KEY_ALIAS`, `KEY_PASSWORD`) existen antes de ejecutar el release.
- Si es necesario un release de documento o docs, usa los outputs del summary (número de build, versión, APK generado) para documentar el resultado.

## 3. Integración con GitHub Actions
- El workflow `.github/workflows/release.yml` ahora ejecuta `node scripts/release-master.js ${{ github.event.inputs.release_type }}`.
- El paso usa el mismo `GITHUB_TOKEN` que el workflow, de modo que `gh release create` funciona sin credenciales adicionales.
- Los pasos anteriores (`generate-keystore`, `chmod +x android/gradlew`, `gh-pages`) se mantienen como dependencias previas, pero el cambio centralizó la lógica en un solo script.

## 4. Cómo probar local
Para pruebas de beta, usa:
```bash
npm run release:beta -- --dry-run
```
El flag `--dry-run` imprime cada paso sin ejecutar comandos destructivos. La versión generada en ese modo (p. ej. `1.7.0-beta`) debe coincidir con `package.json` después de un `git restore package.json` si se quiere revertir.

## 5. Consideraciones
- `release-master` exige que `gh` CLI esté en PATH y que `GITHUB_TOKEN` tenga permisos de `repo` y `workflow`.
- El APK final solo existe dentro del GitHub Release correspondiente; no se almacena en carpetas locales del repositorio.
- El script no despliega la PWA en `gh-pages`: el workflow ejecuta `npm run build:web:pages` y `peaceiris/actions-gh-pages` como antes, así que deja el paso intacto al final.
