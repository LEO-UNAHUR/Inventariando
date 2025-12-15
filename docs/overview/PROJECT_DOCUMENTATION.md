# 📘 Inventariando | Documentación Técnica del Proyecto

**Versión:** 1.0.0 (MVP)  
**Fecha de Creación:** 2025-05-20  
**Stack:** React 19, Tailwind CSS, Google Gemini AI

---

## 1. Visión General
**Inventariando** es una aplicación de gestión de inventarios y punto de venta (POS) optimizada para dispositivos móviles (PWA) y diseñada específicamente para el contexto económico de Argentina. Su objetivo es empoderar a pequeños comercios (kioscos, almacenes, ferreterías) con herramientas de nivel empresarial, sin la complejidad ni los costos elevados.

### Versión Actual
- **MVP Baseline:** v1.4.0 (estable, congelado en rama `mvp-freeze`)
- **Desarrollo Activo:** Fase 1 Validación y Analytics (rama `phase-1-validation`)
- **Próximas Fases:** Escalabilidad (v2.0), Monetización (v2.5), Expansión (v3.0)

### Problemas que resuelve:
1.  **Inflación:** Permite actualizaciones masivas de precios en segundos.
2.  **Conectividad:** Funciona offline gracias a su arquitectura PWA y LocalStorage.
3.  **Gestión Inteligente:** Utiliza IA para predecir qué comprar y cuándo.
4.  **Validación de Mercado:** Sistema de analytics, feedback widget y pilotos con usuarios reales.

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

## 4. Estructura de Ramas y Fases

El proyecto utiliza un modelo de desarrollo basado en fases, cada una con su propia rama:

| Rama | Propósito | Version Range | Estado |
| :--- | :--- | :--- | :--- |
| `main` | MVP congelado, releases finales por fase | v1.4.0 | Protegida (sin push directo) |
| `mvp-freeze` | Backup inmutable del MVP v1.4.0 | v1.4.0 | Read-only |
| `phase-1-validation` | Fase 1: Analytics, feedback, piloto | v1.1.x | Activa (desarrollo) |
| `phase-2-scalability` | Fase 2: Backend, sync, tests | v2.0.x | Planeada |
| `phase-3-monetization` | Fase 3: Tiers, IA, facturación | v2.5.x | Planeada |
| `phase-4-expansion` | Fase 4: i18n, API, marketplace | v3.0.x | Planeada |

### Release Strategy
- **Beta:** `vX.Y.Z-beta.N` (aprendizaje y hardening en rama de fase)
- **Stable:** `vX.Y.0` (merge a `main`, tag, despliegue amplio)
- **Hotfix:** rama `hotfix/*` desde `main`, si aplica patch

**Automatización:** Sistema de releases completamente automatizado via scripts (`npm run release:create beta/stable`)

---

## 5. Historial de Cambios (Changelog)

### v1.4.0 - MVP Estable con Release Automation (Actual)
*   **Rebranding Completo:** Cambio de nombre de "StockArg" a "Inventariando".
    *   Actualización de assets, títulos y metadatos.
    *   Migración de claves de almacenamiento local para fresh start.
*   **Módulo de Finanzas:** Agregado simulador de inflación y ajuste de precios masivo.
*   **Módulo de Seguridad:** Implementación de panel de copias de seguridad con restauración "Time-Travel".
*   **Optimización UI:** Modo oscuro nativo y mejoras en la responsividad móvil.
*   **Release Automation:** Sistema completo de releases automáticos con GitHub Actions (beta + stable).
*   **PWA Deployment:** Despliegue automático a GitHub Pages en releases stable.

---

## 6. Guía de Despliegue

### Desarrollo Local
1.  **Variables de Entorno:**
    Crear `.env` con:
    ```env
    VITE_GEMINI_API_KEY=tu_api_key_aqui
    ```

2.  **Instalar y ejecutar:**
    ```bash
    npm install
    npm run dev
    ```
    
3.  **PWA Local:**
    El archivo `service-worker.js` corre automáticamente en builds de producción.

### Releases (Completamente Automatizado)
```bash
# Beta (aprendizaje/validación)
npm run release:create beta

# Stable (despliegue amplio)
npm run release:create stable
```

El sistema:
- ✅ Valida versiones sin conflictos
- ✅ Actualiza package.json automáticamente
- ✅ Commit + push
- ✅ Dispara GitHub Actions workflow
- ✅ Compila APK y genera Release
- ✅ Despliega PWA a GitHub Pages

### Reset de Datos (Desarrollo)
Usa la herramienta "Gestión de Datos" → "Zona de Peligro" o limpia LocalStorage (`inventariando_*`).

---

> **Nota para Desarrolladores:**
> Las ramas de fase (`phase-*`) salen de `main` y tienen su ciclo de betas propias. No mergeas a `main` hasta que cierres la fase (stable tag).
