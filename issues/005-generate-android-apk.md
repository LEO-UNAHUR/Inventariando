# ISSUE: Generate Android APK (debug + release pipeline)

- **Tipo**: task / mobile
- **Asignado a**: @MOBILE
- **Prioridad**: high
- **Descripción**: Generar APK debug localmente y preparar CI job que genere APK/AAB firmado para releases.

## Pasos (local)

1. Asegurarse de tener JDK y Android SDK instalados.
2. En la raíz del repo:

```bash
cd android
./gradlew assembleDebug
```

3. Resultado esperado: `android/app/build/outputs/apk/debug/app-debug.apk`.

## Pasos (CI)

1. Proveer keystore como secret (BASE64) y passwords: `ANDROID_KEYSTORE`, `KEYSTORE_PASSWORD`, `KEY_ALIAS`, `KEY_PASSWORD`.
2. Añadir job en workflow que configure Java/Android SDK, decodifique keystore y ejecute `./gradlew assembleRelease`.
3. Subir artifact (APK/AAB) con `actions/upload-artifact`.

## Estimación

- Local debug: 0.5 - 1h
- CI release + signing: 1 - 2d (si falta keystore)

## Notas

- Si no hay keystore, generar temporal para pruebas o solicitar al CTO el keystore de producción.
