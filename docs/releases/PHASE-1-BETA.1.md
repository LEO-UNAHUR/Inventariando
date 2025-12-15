# Phase 1 — Beta.1

Fecha: 2025-12-15
Rama: phase-1-validation
Tag sugerido: phase-1-beta.1

## Entregables
- Feedback in-app: botón flotante + modal con rating y comentario (persistencia local) — components/FeedbackWidget.tsx
- **Onboarding Tour mejorado:** guía interactiva con 4 pasos que navega automáticamente entre vistas, resalta elementos clave con spotlight, muestra punteros visuales y posiciona dinámicamente el tooltip para mantenerlo visible en pantalla — components/OnboardingTour.tsx + data-tour attributes en Dashboard, Sidebar, SalesDashboard, AIAssistant
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
2) **Tour interactivo:** 
   - Abrir el Dashboard y hacer clic en el botón "Guía Rápida" (icono de salvavidas).
   - El tour navegará automáticamente a Dashboard → Stock → Ventas → Análisis.
   - Cada paso resaltará (spotlight) y señalará un elemento clave (borde pulsante + flecha).
   - Pasos adelante/atrás para explorar.
3) Navegación: cambiar entre vistas para disparar `feature_accessed`.
4) POS: completar una venta para `sale_completed`.
5) Productos: crear (`product_added`) y editar (`inventory_updated`).
6) Feedback: abrir el botón flotante y enviar comentario (`feedback_submitted`).
7) Gestión de datos: exportar (CSV/JSON), importar y limpiar para verificar `data_exported`, `backup_created`, `data_imported`, `data_cleared`.
8) Dashboard → Categorías: exportar una categoría (`export_category`).

## Notas
- Analytics es “best-effort”: si no hay endpoint/apiKey, no envía.
- Sin dependencias pagas agregadas; todo por `fetch` configurable.
- PWA y build Android no cambiaron en esta beta.

## Cambios relevantes
- **components/OnboardingTour.tsx:** tour interactivo con spotlight, navegación automática entre vistas (View enum), detección de elementos (data-tour), y posicionamiento dinámico de tooltip que verifica límites de pantalla.
- **App.tsx:** 
  - Agrega estado `showTour` al nivel global (junto con otros modales).
  - Renderiza `<OnboardingTour>` de forma global (persiste a través de todas las vistas).
  - Pasa `onShowTour` y `onHideTour` a Dashboard para control de tour.
  - Pasa `onNavigate={setCurrentView}` a Dashboard para que tour pueda cambiar vistas.
- **components/Dashboard.tsx:**
  - Recibe `onShowTour` y `onHideTour` como props.
  - Botón "Guía Rápida" llama `onShowTour?.()` para abrir tour globalizado.
  - Ya no renderiza `<OnboardingTour>` (movido a App.tsx).
- components/Sidebar.tsx: `data-tour="sidebar"` para detección en Paso 2.
- components/SalesDashboard.tsx: `data-tour="new-sale-btn"` en botón de Nueva Venta para Paso 3.
- components/AIAssistant.tsx: `data-tour="ai-section"` en contenedor principal para Paso 4.
- services/analyticsService.ts: extendido con tipos de evento adicionales (`inventory_updated`, `export_category`).
- Evento `feature_accessed`: se emite automáticamente al cambiar de vista en App.tsx.
- Evento `export_category`: se emite en Dashboard al exportar una categoría.
- Evento `inventory_updated`: se emite en App.tsx al editar un producto existente.

## Riesgos/conocidos
- Falta de panel interno de métricas (se difiere a Betas siguientes).
- Landing/demo y PDF/WhatsApp se movieron a Beta.2.

