# Roadmap de Inventariando

## Propósito
Documento vivo para guiar releases con betas intermedias y stable al cierre de cada fase. Prioriza riesgos, valor de negocio y time-to-learn.

## Principios
- Betas frecuentes para validar (vX.Y.Z-beta.N); stable al cerrar cada fase (vX.Y.0).
- Data-driven: decisiones con métricas (retención, DAU/MAU, NPS, costos IA).
- Offline-first y mobile-first como requisitos no negociables.
- Seguridad y costos IA gestionados por backend/proxy.
- Actualizar este archivo en cada entrega parcial o cambio de alcance.

## Estructura de versiones
- Beta: v1.1.0-beta.1, v1.1.0-beta.2, etc. → aprendizaje y hardening.
- Stable: v1.1.0 (cierre de fase) → despliegue amplio.

---
## Fase 1 — Validación y Analytics (v1.1.x)
**Objetivo:** validar product-market fit con datos reales y pilotos controlados.

**Funcionalidades nuevas**
- Analytics (PostHog/Mixpanel) con eventos críticos (registro, producto añadido, venta completada, IA usada, backup creado, vistas clave).
- Feedback widget in-app (rating + texto + contexto de vista).
- Programa piloto 10 comercios (onboarding guiado, canal de soporte, seguimiento semanal).
- Quick wins: landing simple con demo, tour guiado, exportar factura PDF, templates WhatsApp, toggle dark mode visible, indicador de sync/backup.

**Cambios técnicos**
- Instrumentación de eventos + dashboard interno.
- Alertas básicas de errores (Sentry/LogRocket opcional en beta tardía).

**Betas**
- Beta.1: eventos mínimos + landing + tour guiado.
- Beta.2: feedback widget + PDF/WhatsApp + indicador de sync.
- Beta.3: piloto activo (10 cuentas) + monitoreo de métricas.

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
- Proxy backend para Gemini: api key oculta, rate limiting y cuotas por usuario/plan.
- Facturación AFIP via proveedor certificado (plug-in desacoplado).
- Billing/checkout (Mercado Pago primero; Stripe opcional para internacional).
- Pricing page y flujo de upgrade in-app.

**Cambios técnicos**
- Modelado de suscripciones y límites (productos, usuarios, IA requests, cloud sync).
- Métricas de monetización: conversión Free→PRO, MRR, LTV, CAC.

**Betas**
- Beta.1: tiers visibles + límites soft en frontend; proxy IA operativo.
- Beta.2: cobro PRO activo (Mercado Pago) + AFIP sandbox.
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
- Actualizar al cerrar cada beta y stable con: fecha, build/tag, métricas clave y riesgos nuevos.
- Registrar desvíos de alcance y nuevas dependencias críticas.
- Mantener enlace a releases (APK y PWA) y resultados de piloto.
