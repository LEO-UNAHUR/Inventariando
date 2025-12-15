# Roadmap de Inventariando

## Propósito
Documento vivo para guiar releases con betas intermedias y stable al cierre de cada fase. Prioriza riesgos, valor de negocio y time-to-learn.

## Principios
- Betas frecuentes para validar (vX.Y.Z-beta.N); stable al cerrar cada fase (vX.Y.0).
- Data-driven: decisiones con métricas (retención, DAU/MAU, NPS, costos IA).
- Offline-first y mobile-first como requisitos no negociables.
- Seguridad y costos IA gestionados por backend/proxy.
- Actualizar este archivo en cada entrega parcial o cambio de alcance.

## Estructura de versiones y ramas
- **MVP Baseline (v1.4.0):** congelado en `main` y rama `mvp-freeze` (read-only).
- **Beta:** `vX.Y.Z-beta.N` (desarrollo en rama de fase, aprendizaje y hardening).
- **Stable:** `vX.Y.0` (merge a `main` con PR, tag, despliegue amplio).
- **Hotfix:** rama `hotfix/*` desde `main`, si aplica patch crítico.

| Rama | Propósito | Versión Range | Estado |
| :--- | :--- | :--- | :--- |
| `main` | MVP congelado, merges de fases cerradas | v1.4.0 | Protegida |
| `mvp-freeze` | Backup inmutable del MVP | v1.4.0 | Read-only |
| `phase-1-validation` | Desarrollo Fase 1 | v1.1.x | 🟢 Activa |
| `phase-2-scalability` | Desarrollo Fase 2 | v2.0.x | 🔴 Planeada |
| `phase-3-monetization` | Desarrollo Fase 3 | v2.5.x | 🔴 Planeada |
| `phase-4-expansion` | Desarrollo Fase 4 | v3.0.x | 🔴 Planeada |

**Release Automation:** Sistema `npm run release:create beta/stable` maneja todo (validaciones, commits, workflow, APK, PWA).

---
## Fase 1 — Validación y Analytics (v1.1.x)
**Objetivo:** validar product-market fit con datos reales y pilotos controlados.

**Funcionalidades nuevas**
- Analytics (PostHog/Mixpanel) con eventos críticos (registro, producto añadido, inventario actualizado, exportación de categoría, venta completada, IA usada, backup creado, vistas clave).
- Feedback widget in-app (rating + texto + contexto de vista).
- Programa piloto 10 comercios (onboarding guiado, canal de soporte, seguimiento semanal).
- Quick wins: landing simple con demo, tour guiado, exportar factura PDF, templates WhatsApp, toggle dark mode visible, indicador de sync/backup.
- IA (base gratis): Gemini accesible solo si el usuario inicia sesión con su cuenta de Google; nosotros no proveemos ni gestionamos la key. Dropdown limitado a Gemini en esta fase para controlar UX y costos.

**Cambios técnicos**
- Instrumentación de eventos + dashboard interno.
- Instrumentación de gestión de datos con eventos específicos: `data_exported`, `data_imported`, `data_cleared`, `backup_created`.
- Alertas básicas de errores (Sentry/LogRocket opcional en beta tardía).

**Betas**
- Beta.1: eventos mínimos + tour guiado + feedback widget + instrumentación Gestión de Datos (export/import/backup/clear) + exportación por categoría + edición de inventario.
  - ✅ Completada: 2025-12-15
  - Tag: `phase-1-beta.1`
- Beta.2: PDF/WhatsApp + indicador de sync.
  - ✅ Completada: 2025-12-15
  - Tag: `phase-1-beta.2`
  - Notas: SyncIndicator, PDF export (jsPDF), WhatsApp templates integrados en ventas/productos
- Beta.3: piloto activo (10 cuentas) + monitoreo de métricas + IA con Gemini usando login del usuario (Google); sin keys gestionadas por nosotros.
  - ✅ Completada: 2025-12-15
  - Tag: `phase-1-beta.3`
  - Notas de release: ver `docs/releases/PHASE-1-BETA.3.md`
  - Tareas completadas:
    1. User Settings Panel (WhatsApp, IA provider selection, notifications, dark mode)
    2. Multi-Provider IA Selection (Gemini/OpenAI/Anthropic con credenciales del usuario)
    3. Analytics Internal Dashboard (métricas de eventos, visualización con Recharts)

### Estado Beta.3 (completada)
- Fecha: 2025-12-15
- Rama: `phase-1-validation`
- Tag: `phase-1-beta.3`
- Notas de release: ver `docs/releases/PHASE-1-BETA.3.md`

### Estado Beta.1 (completada)
- Fecha: 2025-12-15
- Rama: `phase-1-validation`
- Tag: `phase-1-beta.1`
- Notas de release: ver `docs/releases/PHASE-1-BETA.1.md`

**Criterios stable (v1.1.0)**
- D7 ≥ 25%, D30 ≥ 15% en piloto; NPS ≥ 30.
- Errores críticos conocidos resueltos o mitigados.
- Guía de uso y landing actualizada con enlaces PWA.

**Riesgos a vigilar**
- Falta de adopción → iterar onboarding/tour.
- Costos IA si uso crece → monitoreo preliminar, rate limit lato en frontend.

---
## Fase 2 — Escalabilidad y Sincronización (v2.0.x)
**Objetivo:** superar límites de LocalStorage y habilitar multi-dispositivo.

**Funcionalidades nuevas**
- Backend (Supabase/Firebase) + sync automática cada 5 min con fallback offline.
- Estado de sincronización visible (synced/pending/offline, último backup).
- Autenticación real (owner + equipo) y gestión de sesiones.
- Migrador LocalStorage → nube (una sola pasada segura).

**Cambios técnicos**
- Migrar persistencia a IndexedDB + caché; backend como fuente de verdad.
- Test suite mínima (Vitest + Testing Library); CI en GitHub Actions.
- Hardening PWA offline (service worker, caching strategy revisada).

**Betas**
- Beta.1: backend conectado para inventario/ventas, sync unidireccional.
- Beta.2: sync bidireccional + migrador + auth básica.
- Beta.3: pruebas multi-dispositivo + tests y CI activos.

**Criterios stable (v2.0.0)**
- Sin pérdida de datos en migración piloto; zero known data-loss bugs.
- Sync estable en 95% de sesiones piloto; cobertura de tests ≥ 60% en servicios.
- Rendimiento: LCP < 2.5s en PWA, offline funcional.

**Riesgos a vigilar**
- Conflictos de datos → estrategia last-write-wins + logs de auditoría mínima.
- Límite de costos backend → uso de RLS y cuotas básicas por proyecto.

---
## Fase 3 — Monetización e IA Segura (v2.5.x)
**Objetivo:** activar ingresos y controlar costos de IA.

**Funcionalidades nuevas**
- Tiers: FREE, PRO ($5 USD/mes), ENTERPRISE ($13 USD/mes) con límites por plan.
- Facturación AFIP via proveedor certificado (plug-in desacoplado).
- Billing/checkout (Mercado Pago primero; Stripe opcional para internacional).
- Pricing page y flujo de upgrade in-app.
- Selector de modelos IA (solo en sección “Inteligencia Artificial”): opciones Gemini (Google), ChatGPT (OpenAI), Anthropic. Cada proveedor requiere login/credenciales del usuario (no aportamos keys propias). Guardar keys cifradas en backend; no exponer al frontend.

**Cambios técnicos**
- Modelado de suscripciones y límites (productos, usuarios, IA requests, cloud sync).
- Métricas de monetización: conversión Free→PRO, MRR, LTV, CAC.

**Betas**
- Beta.1: tiers visibles + límites soft en frontend.
- Beta.2: cobro PRO activo (Mercado Pago) + AFIP sandbox + selector IA con login/keys del usuario (Gemini vía Google login; ChatGPT/Anthropic vía API key del usuario) y validaciones.
- Beta.3: enforcement de límites server-side + dashboards de uso y costos IA.

**Criterios stable (v2.5.0)**
- Conversión Free→PRO ≥ 5% en cohorte piloto de pago.
- Costos IA bajo control: alertas si costo diario > $5; sin exposición de API key.
- AFIP: emisión sandbox validada; plan de soporte si falla proveedor.

**Riesgos a vigilar**
- Rechazos de pago → fallback/retry + soporte humano.
- Abuso de IA → bloqueos automáticos + degradación graciosa.

---
## Fase 4 — Expansión e Internacionalización (v3.0.x)
**Objetivo:** crecer a 500+ usuarios y abrir LATAM.

**Funcionalidades nuevas**
- i18n (ES/PT) y multi-moneda.
- API pública + webhooks para integraciones.
- Marketplace de plugins (beta), comenzando con integraciones clave.
- Reportes avanzados (PDF/Excel) y automatizaciones.

**Cambios técnicos**
- Harden de performance (Lighthouse > 90); observabilidad (traces básicos).
- Seguridad: roles extendidos, auditoría de cambios sensibles.

**Betas**
- Beta.1: i18n + multi-moneda; performance pass.
- Beta.2: API/webhooks + 1-2 integraciones.
- Beta.3: marketplace beta + reportes avanzados.

**Criterios stable (v3.0.0)**
- 500 usuarios activos con DAU/MAU ≥ 30% y errores críticos < 0.5% sesiones.
- API estable con versionado y límites.

**Riesgos a vigilar**
- Soporte multi-país (impuestos/regulación) → modularizar reglas locales.

---
## Lista priorizada de problemas a resolver (según riesgo/impacto)
1) Persistencia limitada (LocalStorage) → Fase 2.
2) Gemini expuesto/sin límites → Fase 3 (proxy + cuotas).
3) Falta de validación real de mercado → Fase 1 (piloto + métricas).
4) Sin tests/CI → Fase 2.
5) Monetización ausente → Fase 3.

---
## Prácticas de mantenimiento de este documento
- **Por cada entrega (beta o stable):**
  1. Actualizar sección correspondiente con fecha de release (ej: "Beta.1: 2026-01-15")
  2. Registrar métricas alcanzadas (D7/D30, NPS, errores críticos, etc.)
  3. Documentar nuevos riesgos identificados y cómo se mitigan
  4. Reflejar cualquier desvío de alcance o prioridades cambiadas
- **Antes de cerrar una fase (stable):**
  1. Verificar que todos los criterios de stable se cumplan
  2. Documentar aprendizajes clave y feedback de usuarios
  3. Preparar notas para el siguiente fase sobre dependencias/blockers
- **Enlace a releases:** Mantener referencias a GitHub Release tags, APK, PWA y resultados de piloto
- **Branching:** Reflejar el estado de cada rama (activa/planeada/finalizada)
