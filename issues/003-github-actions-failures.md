# ISSUE: GitHub Actions - releases & deploys failing

- **Tipo**: bug / infra
- **Asignado a**: @DEVOPS
- **Prioridad**: high
- **Descripción**: Los workflows de GitHub Actions relacionados con releases y deploys están fallando. Necesitamos revisar logs, identificar causas (tokens, permisos, paths, versiones) y aplicar parches.

## Pasos para reproducir / investigar

1. Abrir GitHub → Actions → seleccionar el workflow de release/deploy fallido.
2. Revisar logs completos (build, upload, deploy steps).
3. Verificar que los secrets necesarios (`GITHUB_TOKEN`, `NPM_TOKEN`, `ANDROID_KEYSTORE_*`) estén configurados.
4. Confirmar que `publish_dir` apunta a `dist` y que `build` step se ejecuta antes del deploy.

## Output esperado

- Workflow que falla ahora debe quedar con run verde tras cambios.

## Estimación

- 0.5 - 1.5 días

## Notas

- Logs y fragmentos relevantes deben pegarse en la issue real en GitHub.
