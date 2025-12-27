# Agents — Equipo IA para desarrollo

Resumen
- Esta carpeta contiene agentes por rol (PM, DEV, DESIGN, DEVOPS, QA) para uso como equipo de desarrollo virtual.
- Cada archivo define el prompt de sistema, responsabilidades, salidas esperadas e instrucciones de invocación.

Convenciones
- Archivo por rol: `PM.md`, `DEV.md`, `UX-UI.md`, `DEVOPS.md`, `QA.md`.
- Front-matter YAML mínimo opcional: `name`, `version`, `tools`, `required_context`.
- Schema de salida recomendado (ejemplo para `PM`): JSON con keys `user_stories`, `tasks`, `estimates`.
- Siempre proporcionar: contexto del proyecto, timeline, recursos, restricciones.

Flujo de trabajo resumido
1. CTO describe requerimiento y lo envía a `@PM`.
2. `@PM` desglosa en user stories y tareas, asigna roles y estima.
3. `@DESIGN`, `@DEV`, `@DEVOPS`, `@QA` reciben subtareas y entregan artefactos.
4. Integración, pruebas y despliegue.

Dónde colocar plantillas
- Las plantillas y ejemplos están en `templates.md`.

Preguntas frecuentes
- ¿Mantener `.github/agents`? Puedes conservarla como referencia; recomiendo usar `agents/` como fuente canónica para automatización.

---
