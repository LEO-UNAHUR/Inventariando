# Flujo de Release Orquestado (release-master)

Este documento resume el pipeline actual para publicar Inventariando tanto en Android (APK) como en web (PWA), y muestra qué hace `scripts/release-master.js`, la nueva entrada que reemplaza las secuencias manuales dispersas.

## 1. Objetivo
Mantener un solo procedimiento reproducible que:
- bumpea la versión según `RELEASE_TYPE` (beta / stable),
- compila la app para web y Android (`npm run release:build`),
- genera tags y releases en GitHub,
- sube el APK a la release y deja disponible el artefacto en `APK/v{version}/`,
- documenta el resultado y respeta el pipeline de GH Actions sin pasos redundantes.

## 2. Pasos del script maestro (`release-master`)
1. **Verifica herramientas**: asegura que `gh` CLI esté instalada y `GITHUB_TOKEN` disponible en el entorno.  
2. **Bump de versión**: ejecuta `npm run release:version` con `RELEASE_TYPE={beta|stable}` para actualizar `package.json`.  
3. **Compila la app**: corre `npm run release:build` (incluye `npm run build:web` + `npx cap sync android` + `./android/gradlew assembleDebug`).  
4. **Commit + Push**: guarda cambios en Git y empuja la rama `main` (se usa `--force-with-lease` igual que antes, pero ahora centralizado).  
5. **Tag y Release**: etiqueta `v{version}`, hace `gh release create` con el APK generado y sube el binario. Para betas se agrega `--prerelease`.  
6. **Resumen**: imprime rutas (`APK/v{version}` y URL del release) y sugiere compilar la PWA para GitHub Pages si se desea.

## 3. Integración con GitHub Actions
- El workflow `.github/workflows/release.yml` ahora ejecuta `node scripts/release-master.js ${{ github.event.inputs.release_type }}`.
- El paso usa el mismo `GITHUB_TOKEN` que el workflow, de modo que `gh release create` funciona sin credenciales adicionales.
- Los pasos anteriores (`generate-keystore`, `chmod +x android/gradlew`, `gh-pages`) se mantienen como dependencias previas, pero el cambio centralizó la lógica en un solo script.

## 4. Cómo probar local
```bash
npm run release:master beta --dry-run
```
El flag `--dry-run` imprime cada paso sin ejecutar comandos destructivos. La versión generada en ese modo (p. ej. `1.7.0-beta`) debe coincidir con `package.json` después de un `git restore package.json` si se quiere revertir.

## 5. Consideraciones
- `release-master` exige que `gh` CLI esté en PATH y que `GITHUB_TOKEN` tenga permisos de `repo` y `workflow`.
- El APK final queda en `APK/v{version}/Inventariando-{version}.apk`; no se borra ni se mueve automáticamente fuera del directorio para mantener el histórico.
- El script no despliega la PWA en `gh-pages`: el workflow ejecuta `npm run build:web:pages` y `peaceiris/actions-gh-pages` como antes, así que deja el paso intacto al final.
