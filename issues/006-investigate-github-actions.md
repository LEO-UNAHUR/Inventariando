# ISSUE: Investigate failing GitHub Actions (releases/deploys)

- **Tipo**: task / devops
- **Asignado a**: @DEVOPS
- **Prioridad**: critical
- **Descripción**: Revisar los workflows fallidos, obtener logs completos y corregir configuraciones (secrets, publish_dir, permissions).

## Pasos

1. Ir a Actions en GitHub y abrir el workflow fallido.
2. Descargar o copiar logs completos.
3. Verificar que los secrets (`GH_TOKEN`, `PAGES_TOKEN`, etc.) existen en repo/org.
4. Revisar `publish_dir` y paths en workflow, y `base` if site is served under subpath.
5. Ejecutar job localmente con `act` si es necesario para reproducir.

## Estimación

- Inspección inicial: 2 - 4h
- Fix + PR: 0.5 - 1d

## Notas

- Priorizar fixes que permitan publicar en GitHub Pages y/o subir release artifacts.
