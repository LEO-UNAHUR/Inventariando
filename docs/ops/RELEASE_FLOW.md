
# Flujo de Release Orquestado (release estable)

Este documento resume el pipeline actual para publicar Inventariando tanto en Android (APK) como en web (PWA), y muestra el procedimiento correcto para ejecutar un release estable, tanto para humanos como para agentes IA.

## 1. Objetivo
Mantener un solo procedimiento reproducible que:
- bumpea la versión según `RELEASE_TYPE` (beta / stable),
- compila la app para web y Android (`npm run release:build`),
- genera tags y releases en GitHub,
- sube el APK a la release (sin dejar copias locales) y documenta el resultado,
- respeta el pipeline de GH Actions sin pasos redundantes.

## 2. Procedimiento para ejecutar un release estable

### 1. Ejecutar el release estable
Desde la raíz del proyecto, corre:

```bash
npm run release:stable
```

Esto ejecuta el script automatizado que:
- Calcula y actualiza la nueva versión (bump),
- Genera el changelog,
- Hace commit y push a main,
- Crea el tag y dispara el workflow de GitHub Actions para compilar y publicar el APK.

### 2. Monitorear el workflow en GitHub Actions
1. Ve a: https://github.com/LEO-UNAHUR/Inventariando/actions
2. Busca el workflow "Release APK & Build" más reciente.
3. Monitorea el proceso (2-5 minutos).
4. Si el build es exitoso, el APK estará disponible en la sección de Releases.
5. Si falla, revisa el log y aplica los parches necesarios.

### 3. Notas para agentes IA
- Siempre usa `npm run release:stable` para releases estables.
- Después de ejecutar el comando, monitorea el workflow y reporta el resultado.

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
