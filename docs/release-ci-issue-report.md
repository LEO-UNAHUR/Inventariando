# Informe técnico: Fallos en CI / workflows de release

## Resumen ejecutivo

- Problema principal: las ejecuciones automáticas de release (CI vía GitHub Actions) fallan y no generan APKs ni artefactos. Esto impide un proceso de release reproducible desde el repositorio.
- Impacto: no es posible automatizar la construcción/firma/subida del APK ni el despliegue PWA hasta resolver discrepancias del workflow y dependencias en el entorno CI.

## Síntomas observados

- Runs fallan con HTTP 422 al intentar dispatch mediante la API (error: "Workflow does not have 'workflow_dispatch' trigger").
- Ejecuciones por push/dispatch terminan inmediatamente con `conclusion = failure` y sin logs descargables.
- Errores de Gradle durante builds: inicialmente "Directory ... does not contain a Gradle build" (solucionado con `working-directory: android`). Más tarde: falta de script requerido `android/capacitor-cordova-android-plugins/cordova.variables.gradle`.
- Problemas previos de dependencia: `npm ci` falló por `package-lock.json` desactualizado.
- Keystore ausente / secret vacío: el workflow salta la preparación del keystore ("No keystore secret provided"), por lo que los builds no se firman en CI.

## Evidencias / referencias

- Workflow principal: `.github/workflows/release.yml` — contiene pasos de setup Node/Java, `npm ci`, Gradle build y upload-release-asset.
- Mensajes de run (extractos relevantes):
  - Invalid workflow dispatch: "Unrecognized named-value: 'secrets'..." (corregido moviendo checks dentro del shell).
  - `npm ci`: "package.json and package-lock.json are not in sync" (resuelto actualizando `package-lock.json`).
  - Gradle: "Directory ... does not contain a Gradle build" → invocación cambiada para usar `working-directory: android`.
  - Gradle: "Could not read script '.../cordova.variables.gradle' as it does not exist" → agregado paso para generar `cordova.variables.gradle` en CI cuando falta.
- Artefactos de diagnóstico subidos tras fallos: `workflow-logs-<run_id>.zip` (ej.: https://github.com/LEO-UNAHUR/Inventariando/actions/runs/20306711145/artifacts/4891351678).

## Causas raíz identificadas

1. Workflow dispatch y caché de Actions: cambios en workflows pueden tardar en indexarse; uso inválido de `if: ${{ secrets... }}` provocó validación YAML fallida.
2. Paths y directorio de ejecución incorrectos: el wrapper Gradle se invocaba desde la raíz en lugar de `android/`.
3. Dependencias y lockfile fuera de sincronía en CI: `npm ci` falló hasta actualizar `package-lock.json`.
4. Faltantes generados por herramientas locales (Capacitor/Cordova): archivos generados localmente (por ejemplo `cordova.variables.gradle`) no estaban presentes en CI.
5. Ausencia de keystore y secrets: sin secretos el CI no puede producir un APK firmado.

## Acciones ya realizadas

- Corregido uso inválido de `secrets` en `if:` moviendo el check dentro del step (evita validación YAML fallida).
- Cambiado el step de Build Android para usar `working-directory: android`.
- Añadido paso para crear `android/capacitor-cordova-android-plugins/cordova.variables.gradle` si falta (contenido mínimo generado por CI).
- Añadida lógica para detectar APK generado (`Find built APK`) y subir solo si existe.
- Corregidos paths de guardado en `Save build outputs and reports`.
- Regenerado y commiteado `package-lock.json` para que `npm ci` funcione en CI.
- Añadido trigger `push` y `workflow_dispatch` en `release.yml`.
- Implementado upload incondicional de `workflow-logs` artifact para depuración.

## Estado actual (bloqueadores pendientes)

- CI runs siguen fallando en ejecución rápida (algunas runs creadas por dispatch/push terminan con `failure` sin logs visibles desde la API). Requiere inspección de la run en la UI o re-dispatch controlado.
- Keystore: no hay keystore válido en secrets (el fichero `keystore.b64` en el repo estaba vacío). Sin secrets no hay APK firmado.
- Posible contenido faltante adicional (plugins/librerías que se generan localmente) — aunque `cordova.variables.gradle` ahora se genera, otros assets dinámicos podrían faltar y generar nuevas fallas.

---

Documento generado automáticamente por el equipo de ingeniería. Para más detalles técnicos, consultar los logs de GitHub Actions y los commits recientes en la rama `main`.
