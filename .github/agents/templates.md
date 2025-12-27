# Plantillas y ejemplos

## Plantilla rápida para `@PM`
```
@PM: [Descripción]
Context: [Stack, recursos, restricciones]
Target: [fecha]
Necesito: [backlog|breakdown|estimación]
```

## Plantilla de salida (PM) - JSON
```
{
  "user_stories": [],
  "tasks": [],
  "estimates": [],
  "dependencies": []
}
```

## Ejemplo: Caso FCM (extraído del maestro)
- User Stories: recibir notificaciones de ofertas, estado de pedido, envío
- Tareas DEV: integración FCM, endpoints backend
- Tareas DESIGN: UI de notificaciones
- Tareas DEVOPS: configurar credenciales y monitoreo
- Tareas QA: testing en dispositivos reales

## Snippet recomendado (GitHub Actions) - build web (ejemplo)
```yaml
name: CI
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm build
```
