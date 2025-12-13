# 📘 Inventariando | Documentación Técnica del Proyecto

**Versión:** 1.0.0 (MVP)  
**Fecha de Creación:** 2025-05-20  
**Stack:** React 19, Tailwind CSS, Google Gemini AI

---

## 1. Visión General
**Inventariando** es una aplicación de gestión de inventarios y punto de venta (POS) optimizada para dispositivos móviles (PWA) y diseñada específicamente para el contexto económico de Argentina. Su objetivo es empoderar a pequeños comercios (kioscos, almacenes, ferreterías) con herramientas de nivel empresarial, sin la complejidad ni los costos elevados.

### Problemas que resuelve:
1.  **Inflación:** Permite actualizaciones masivas de precios en segundos.
2.  **Conectividad:** Funciona offline gracias a su arquitectura PWA y LocalStorage.
3.  **Gestión Inteligente:** Utiliza IA para predecir qué comprar y cuándo.

---

## 2. Arquitectura del Sistema

La aplicación sigue una arquitectura **Frontend Monolítico Modular** basada en componentes funcionales de React.

### Estructura de Directorios

```
/
├── public/                 # Assets estáticos (iconos, manifest, sw)
├── src/
│   ├── components/         # Componentes UI (Vistas, Modales, Widgets)
│   │   ├── Dashboard.tsx   # Vista principal con métricas
│   │   ├── POS.tsx         # Punto de Venta (Caja)
│   │   ├── ...             # Otros módulos (Clientes, Proveedores, etc.)
│   ├── services/           # Lógica de negocio y comunicación externa
│   │   ├── storageService.ts # Capa de persistencia (LocalStorage Wrapper)
│   │   ├── geminiService.ts  # Integración con Google AI
│   │   ├── notificationService.ts # Motor de alertas
│   ├── types.ts            # Definiciones de TypeScript (Modelos de datos)
│   ├── constants.ts        # Constantes y datos semilla (Seed data)
│   ├── App.tsx             # Enrutador principal y gestor de estado global
│   └── index.tsx           # Punto de entrada
└── ...config files
```

### Gestión de Estado
El estado se maneja principalmente mediante **React Hooks (`useState`, `useEffect`)** a nivel de `App.tsx` y se propaga a los componentes hijos. Para la persistencia, se utiliza un patrón de sincronización con `localStorage` a través de `storageService.ts`, garantizando que los datos sobrevivan a recargas de página.

---

## 3. Características Clave (Detalle Técnico)

### 🤖 Inteligencia Artificial (Gemini API)
*   **Modelo:** `gemini-2.5-flash` (Optimizado para latencia y costo).
*   **Funciones:**
    *   `suggestProductDetails`: Autocompletado de descripciones y categorización.
    *   `generateBusinessInsights`: Análisis de series temporales de ventas para predecir demanda (Stockout prediction).

### 🛒 Punto de Venta (POS)
*   Soporta múltiples métodos de pago (Efectivo, QR, Débito, Fiado).
*   Motor de promociones integrado: Calcula descuentos complejos (2x1, % off, Mayorista) en tiempo real al agregar items al carrito.
*   Integración visual con AFIP: Selectores de tipo de factura (A/B/C) y campo CUIT dinámico.

### 🛡️ Seguridad
*   **RBAC (Role-Based Access Control):** 3 Niveles (Admin, Encargado, Vendedor).
*   **Simulación 2FA:** Flujo de doble autenticación implementado en frontend.
*   **Logs de Auditoría:** Registro inmutable de acciones críticas (Importación/Exportación de datos, movimientos de stock manuales).

---

## 4. Historial de Cambios (Changelog)

### v1.0.0 - Lanzamiento MVP & Rebranding (Actual)
*   **Rebranding Completo:** Cambio de nombre de "StockArg" a "Inventariando".
    *   Actualización de assets, títulos y metadatos.
    *   Migración de claves de almacenamiento local para fresh start.
*   **Módulo de Finanzas:** Agregado simulador de inflación y ajuste de precios masivo.
*   **Módulo de Seguridad:** Implementación de panel de copias de seguridad con restauración "Time-Travel".
*   **Optimización UI:** Modo oscuro nativo y mejoras en la responsividad móvil.

---

## 5. Guía de Despliegue

1.  **Variables de Entorno:**
    Asegurar que `process.env.API_KEY` esté configurado con una clave válida de Google AI Studio.

2.  **Build:**
    Ejecutar el proceso de build de su bundler favorito (Vite/Webpack).
    
3.  **PWA:**
    El archivo `service-worker.js` debe estar en la raíz del servidor público para permitir el cacheo de assets y funcionamiento offline.

---

> **Nota para Desarrolladores:**
> Para resetear la base de datos en desarrollo, utilice la herramienta "Gestión de Datos" -> "Zona de Peligro" dentro de la aplicación, o limpie el LocalStorage del navegador manualmente (Keys que empiezan con `inventariando_`).
