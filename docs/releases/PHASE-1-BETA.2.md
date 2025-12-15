# Phase 1 — Beta.2

Fecha: 2025-12-15
Rama: phase-1-validation
Tag sugerido: phase-1-beta.2

## Entregables

### 1. Indicador de Sincronización (SyncIndicator)
- Componente que muestra estado del backup: "Sincronizado", "Sin sincronizar" u "Sin conexión"
- Detecta estado de conectividad (online/offline) automáticamente
- Muestra tiempo desde último backup (hace unos segundos, hace 5m, hace 1h, hace 2d, etc.)
- Dos modos: compacto (para Sidebar) y completo (para Dashboard/modales)
- Soporte para tema oscuro/claro
- Se actualiza automáticamente cada minuto
- Almacena timestamp de último backup en localStorage

### 2. Exportación a PDF de Ventas
- Función `generateSalePDF()` para exportar factura de venta
- Función `generateProductLabelPDF()` para imprimir etiquetas de producto
- Utiliza jsPDF para generación de PDF
- Incluye detalles de venta: productos, cantidades, precios, totales
- Soporta método de pago y tipo fiscal (AFIP A/B/C/X)
- Integrado en SalesDashboard con botón de descarga en últimas 5 ventas
- Archivo se descarga automáticamente con nombre: `factura_{id}_{fecha}.pdf`

### 3. Plantillas de WhatsApp
- Función `generateSaleWhatsAppMessage()` para crear mensaje de venta con detalles
- Función `generateProductWhatsAppMessage()` para compartir producto con precio y stock
- Generación de links: `whatsapp://send` (app mobile) y `https://wa.me/` (Web)
- Fallback automático: intenta abrir app, si falla abre Web
- Integrado en:
  - **SalesDashboard**: botón verde "Compartir" en últimas 5 ventas
  - **ProductForm**: botón verde "Compartir" para productos existentes
- Mensajes formateados con emoji y estructura clara

## Cómo validar

1) **Indicador de Sincronización:**
   - Abrir Dashboard
   - Verificar SyncIndicator en la parte superior mostrando "Sincronizado"
   - Hacer clic en "Copia de Seguridad" (Database icon) y exportar JSON
   - SyncIndicator debería actualizar a "Sincronizado — hace unos segundos"
   - Esperar 30+ minutos sin hacer backup: debería cambiar a "Sin sincronizar"

2) **Exportación a PDF:**
   - Navegar a Ventas (SalesDashboard)
   - Si hay ventas registradas, ver tabla "Últimas Ventas"
   - Hacer clic en botón azul (icono de descarga) en cualquier venta
   - Se descargará PDF con factura de esa venta
   - Abrir PDF y verificar detalles (productos, cantidades, total)

3) **WhatsApp:**
   - En SalesDashboard, hacer clic en botón verde (WhatsApp) de una venta
   - Debería abrir WhatsApp Web (o app si está disponible) con mensaje preformulado
   - Mensaje debe incluir: productos, cantidades, precios y total formateado
   - Probar también con producto: ir a Productos, editar uno, botón "Compartir" (verde)
   - Debería generar mensaje con nombre, precio, stock y descripción

## Cambios técnicos

### Nuevos archivos:
- **components/SyncIndicator.tsx**: Componente visual del estado de sincronización
- **services/pdfService.ts**: Funciones para generar PDFs (generateSalePDF, generateProductLabelPDF)
- **services/whatsappService.ts**: Funciones para generar mensajes y links de WhatsApp

### Modificaciones:
- **components/Dashboard.tsx**:
  - Import de SyncIndicator
  - Render de SyncIndicator después del header (antes de KPI Cards)

- **components/DataManagement.tsx**:
  - `handleExportJSON()`: Guarda `localStorage.setItem('lastBackupTime', timestamp)` después de exportar JSON

- **components/SalesDashboard.tsx**:
  - Imports de pdfService y whatsappService
  - Nueva sección "Últimas Ventas" con botones PDF/WhatsApp
  - Botones integrados debajo del "Nueva Venta" CTA

- **components/ProductForm.tsx**:
  - Import de whatsappService
  - Botón "Compartir" verde en footer (solo aparece si es edición de producto existente)

### Dependencias añadidas:
- **jspdf**: Para generación de PDFs

## Diferencias respecto a Beta.1

| Feature | Beta.1 | Beta.2 |
|---------|--------|--------|
| Analytics | ✅ | ✅ |
| Feedback Widget | ✅ | ✅ |
| Onboarding Tour | ✅ | ✅ |
| Sync Indicator | ❌ | ✅ |
| PDF Export | ❌ | ✅ |
| WhatsApp Templates | ❌ | ✅ |

## Notas

- El número de teléfono para WhatsApp está hardcodeado a `5491234567890` como placeholder. En producción, debería ser configurable por usuario.
- PDF se genera en memoria sin servidor (todo client-side).
- SyncIndicator se resetea al refrescar la página (localStorage persiste pero componente se reinicia).
- Timestamp de backup se guarda solo cuando se exporta JSON (no en importar/limpiar datos).

## Testing checklist

- [ ] Dashboard carga y muestra SyncIndicator correctamente
- [ ] SyncIndicator cambia estado al exportar backup (JSON)
- [ ] PDF de venta se descarga y abre correctamente
- [ ] Mensaje WhatsApp para venta incluye todos los datos
- [ ] Mensaje WhatsApp para producto incluye precio y stock
- [ ] Links WhatsApp funcionan (abren Web o app)
- [ ] Dark mode: SyncIndicator, botones PDF/WhatsApp se ven correctamente
- [ ] Responsive: Componentes se adaptan a pantallas pequeñas

## Riesgos conocidos

- Dependencia jsPDF agrega ~200KB al bundle (minificado ~60KB)
- WhatsApp Web puede estar bloqueado en algunos navegadores/dispositivos
- Timestamp de backup solo persiste en localStorage (se pierde si se borran datos del navegador)

## Próximos pasos (Beta.3)

- Piloto activo con 10 comercios
- Monitoreo de métricas (uso de PDF/WhatsApp)
- Integración de Gemini IA con login del usuario (sin keys gestionadas por nosotros)
- Dashboard interno de métricas
- Panel de usuario configuración
