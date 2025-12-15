# Phase 1 — Beta.1

Fecha: 2025-12-15
Rama: phase-1-validation
Tag sugerido: phase-1-beta.1

## Entregables
- Feedback in-app: botón flotante + modal con rating y comentario (persistencia local) — components/FeedbackWidget.tsx
- Onboarding Tour: guía de 4 pasos desde el Dashboard (botón “Guía Rápida”) — components/OnboardingTour.tsx + components/Dashboard.tsx
- Analytics base (opt-in con env):
  - `feature_accessed` al navegar entre vistas
  - `sale_completed` al finalizar una venta
  - `product_added` en alta de producto
  - `inventory_updated` al editar un producto existente (diff de stock, cambios de precio/costo)
  - `feedback_submitted` al enviar feedback
  - Gestión de datos: `data_exported`, `backup_created`, `data_imported`, `data_cleared`
  - Exportación por categoría: `export_category`
- Documentación actualizada (Roadmap Fase 1 y alcance de Beta.1)

## Cómo validar
1) Configurar analytics (opcional):
   - Variables: `VITE_ANALYTICS_ENDPOINT`, `VITE_ANALYTICS_API_KEY`
   - Levantar: `npm install && npm run dev`
2) Navegación: cambiar entre vistas para disparar `feature_accessed`.
3) POS: completar una venta para `sale_completed`.
4) Productos: crear (`product_added`) y editar (`inventory_updated`).
5) Feedback: abrir el botón flotante y enviar comentario (`feedback_submitted`).
6) Gestión de datos: exportar (CSV/JSON), importar y limpiar para verificar `data_exported`, `backup_created`, `data_imported`, `data_cleared`.
7) Dashboard → Categorías: exportar una categoría (`export_category`).

## Notas
- Analytics es “best-effort”: si no hay endpoint/apiKey, no envía.
- Sin dependencias pagas agregadas; todo por `fetch` configurable.
- PWA y build Android no cambiaron en esta beta.

## Cambios relevantes
- App.tsx: init analytics, `feature_accessed`, `sale_completed`, `inventory_updated`, integra FeedbackWidget.
- components/Dashboard.tsx: botón Guía, exportación por categoría + `export_category`.
- components/FeedbackWidget.tsx: `feedback_submitted`.
- components/DataManagement.tsx: eventos de export/import/backup/clear.
- services/analyticsService.ts: nuevos tipos de evento.

## Riesgos/conocidos
- Falta de panel interno de métricas (se difiere a Betas siguientes).
- Landing/demo y PDF/WhatsApp se movieron a Beta.2.

