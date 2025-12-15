
# 🇦🇷 Inventariando | Gestión de Inventario Inteligente

![Version](https://img.shields.io/badge/version-1.4.1-blue?style=for-the-badge&logo=appveyor)
![Status](https://img.shields.io/badge/status-Phase%201%20Complete-green?style=for-the-badge)
![Tech](https://img.shields.io/badge/stack-React_19_•_Capacitor_•_Gemini_AI-222?style=for-the-badge)

**🌐 [Prueba la PWA en vivo](https://LEO-UNAHUR.github.io/Inventariando/)** | 📱 [Descarga APK](https://github.com/LEO-UNAHUR/Inventariando/releases)

> **La solución definitiva para PyMEs argentinas.**  
> Gestión de stock, punto de venta (POS) y análisis financiero potenciado por Inteligencia Artificial, todo en tu bolsillo.


## 📌 Estado del Proyecto

| Fase | Versión | Estado | Fecha |
|------|---------|--------|-------|
| **Phase 1 - Stable** | 1.4.1 | ✅ **COMPLETADO** | Dec 15, 2025 |
| Phase 2 (Planificado) | TBD | 📋 Planning | Q1 2026 |

---

## 🎉 Phase 1 Completado

### 🔥 Novedades 1.4.1 (2025-12-15)
- Release automático estable operativo (`npm run release:auto -- stable`) con bump + changelog + workflow Actions ✅
- APK y PWA publicadas para 1.4.1 (Releases + GitHub Pages)
- UX afinada: Métricas Internas centrado con pl-64 y z-index 60, footer 2 líneas legible, dashboard muestra fecha/hora, Tour IA con texto claro
- Documentación actualizada (OAuth setup, hotfixes Phase 1, completion report)

### ✅ Phase 1 - Beta.3 (2025-12-15)
- Verificación de WhatsApp con código de 6 dígitos y caducidad
- Gemini por usuario con login token o API Key
- Asistente IA con credencial por usuario
- Detalles en [docs/releases/PHASE-1-BETA.3.md](docs/releases/PHASE-1-BETA.3.md)

### 🏆 Logros de Phase 1
- ✨ 21 componentes React totalmente funcionales
- 🤖 Integración multi-provider IA (Gemini, OpenAI, Anthropic)
- 📊 Dashboard de análisis interno con eventos
- 🛒 Sistema POS completo con múltiples métodos de pago
- 🔐 Autenticación RBAC y 2FA
- ☁️ Backup/Export de datos robusto
- 📱 PWA con soporte offline
- 🎨 Dark mode y diseño responsive

---

## 🚀 Phase 2 Próxima (Q1 2026)
- 🎓 Enhanced Onboarding Tour — 12+ pasos cubriendo todas las secciones
- 🔔 First-Visit Notification — Banner de bienvenida para nuevos usuarios
- 📊 Real-time team notifications
- 📄 Advanced reporting (PDF exports con charts)
- 👥 Multi-user collaboration
- 🔌 API integration (ERP, accounting systems)

[Ver Roadmap Completo](docs/releases/PHASE-2-ROADMAP.md)

---

## 🚀 Sobre el Proyecto

**Inventariando** no es solo una hoja de cálculo glorificada. Es una **Progressive Web App (PWA)** diseñada desde cero para enfrentar los desafíos reales del comercio minorista en Argentina. 

Combina una interfaz móvil fluida ("Mobile-First") con herramientas poderosas como **Google Gemini AI** para predicción de demanda y un módulo financiero adaptado a economías inflacionarias.

### ✨ Características Estrella (MVP 1.0.0)

| Módulo | Funcionalidad Destacada |
| :--- | :--- |
| **🤖 IA Integrada** | Asistente **Gemini** que sugiere precios, descripciones y predice tendencias de compra basándose en tu historial. |
| **📈 Escudo Anti-Inflación** | Herramienta masiva de **re-ajuste de precios** por categoría o global, ideal para actualizaciones rápidas del dólar. |
| **🛒 POS Ágil** | Punto de venta con escáner de **Códigos de Barras**, soporte para **Cuenta Corriente (Fiado)**, QR/Transferencia y selectores fiscales (Factura A/B/C). |
| **📊 Business Intelligence** | Métricas en tiempo real: Ganancia latente, márgenes de remarcación, productos de alta rotación y reportes de caja. |
| **🔐 Seguridad RBAC** | Roles de usuario (Admin, Encargado, Vendedor), simulación de **2FA** y sesiones activas. |
| **☁️ Backup Local** | Sistema robusto de Importación/Exportación (JSON/CSV) con puntos de restauración automáticos. |

---

## 🛠️ Stack Tecnológico

Construido con las últimas tecnologías para garantizar performance, escalabilidad y una experiencia de usuario (UX) superior.

*   **Core:** React 19 (Hooks, Context API).
*   **Estilos:** Tailwind CSS (Diseño responsivo, Dark Mode nativo).
*   **Mobile:** Capacitor (Android APK nativo).
*   **Bundler:** Vite (Desarrollo rápido, builds optimizados).
*   **IA:** Google GenAI SDK (`gemini-2.5-flash`).
*   **Gráficos:** Recharts (Visualización de datos interactiva).
*   **Hardware:** Html5-Qrcode (Uso de cámara como escáner).
*   **Persistencia:** LocalStorage + PWA (Offline-first architecture).
*   **Iconografía:** Lucide React.

---

## 📱 Galería de Funciones

### 1. Dashboard Interactivo
Vista general del negocio con alertas de stock bajo, vencimientos próximos y gráficos de distribución interactivos.

### 2. Finanzas & Estrategia
Calculadora de rentabilidad, análisis de márgenes y simulador de impacto inflacionario en tiempo real.

### 3. Gestión de Equipo
Control total sobre quién accede a qué. Asigna PINs de acceso rápido para vendedores y protege las finanzas con permisos de Administrador.

---

## ⚡ Instalación y Despliegue

Este proyecto utiliza **Vite** o **Create React App** (dependiendo de tu bundler preferido, aquí asumimos estructura estándar).

### Prerrequisitos
*   Node.js (v18 o superior)
*   NPM o Yarn
*   **Google Gemini API Key** (Para las funciones de IA)

### Pasos

1.  **Clonar el repositorio:**
    ```bash
    git clone https://github.com/tu-usuario/inventariando.git
    cd inventariando
    ```

2.  **Instalar dependencias:**
    ```bash
    npm install
    ```

3.  **Configurar Variables de Entorno:**
    Crea un archivo `.env` en la raíz (o configura en tu entorno de despliegue):
    ```env
    VITE_GEMINI_API_KEY=tu_api_key_aqui
    ```

4.  **Iniciar en Desarrollo:**
    ```bash
    npm run dev
    ```
    Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

5.  **Build Web:**
    ```bash
    npm run build:web
    ```
    Genera archivos optimizados en la carpeta `dist/`.

6.  **Desplegar PWA:**
    - La PWA se despliega automáticamente a GitHub Pages en cada **release stable**
    - URL de producción: https://LEO-UNAHUR.github.io/Inventariando/
    - Configuración en `.github/workflows/release.yml`

7.  **Build APK Android (Requiere Java 21+):**
    ```bash
    npm run build:android
    ```
    Genera APK en `android/app/build/outputs/apk/release/`.

---

## 📥 Acceso a la App

### 🌐 PWA (Web App - Recomendado)
**Acceso directo sin instalación:**
- **URL:** https://LEO-UNAHUR.github.io/Inventariando/
- Compatible con cualquier navegador moderno (Chrome, Firefox, Safari, Edge)
- Funciona en escritorio, tablet y móvil
- **Instalable como app nativa:**
  1. Abre la URL en tu navegador
  2. Toca el menú (⋮) > "Instalar app" o "Agregar a pantalla de inicio"
  3. La PWA se instalará como una app independiente

**Ventajas:**
- ✅ Sin descargas, acceso instantáneo
- ✅ Actualizaciones automáticas
- ✅ Funciona offline después de la primera carga
- ✅ Multiplataforma (Android, iOS, Windows, macOS, Linux)

### 📱 APK (Android Nativo)
Descarga la última versión compilada desde:
- **GitHub Releases:** https://github.com/LEO-UNAHUR/Inventariando/releases
- **Carpeta Local:** `APK/v[version]/` en el repositorio

**Requisitos:** Android 6.0+

**Instalación:**
1. Descarga el archivo `.apk`
2. Habilita "Fuentes desconocidas" en Configuración > Seguridad
3. Abre el APK y sigue las instrucciones

---

---

## 🚀 Plan de Fases (Roadmap 2025-2026)

Inventariando evolucionará en 4 fases principales, cada una con betas intermedias y un release stable al cierre.

### 📋 Fase 1 — Validación y Analytics (v1.1.x - Q1 2026)
**Objetivo:** Validar product-market fit con datos reales de usuarios piloto.

**Funcionalidades:**
- ✅ Analytics (PostHog) con eventos críticos
- ✅ Feedback widget in-app (rating + comentarios)
- ✅ Programa piloto con 10 comercios reales
- ✅ Quick wins: Tour guiado, exportar PDF, templates WhatsApp, dark mode, indicador de sync

**Betas:** v1.1.0-beta.1, beta.2, beta.3  
**Stable:** v1.1.0 (si D7 ≥25%, D30 ≥15%, NPS ≥30)

---

### 📊 Fase 2 — Escalabilidad y Sincronización (v2.0.x - Q2 2026)
**Objetivo:** Superar límites de LocalStorage y habilitar multi-dispositivo.

**Funcionalidades:**
- ✅ Backend (Supabase free-tier) + sincronización automática cada 5 min
- ✅ Autenticación real (owner + equipo)
- ✅ Migrador LocalStorage → nube (seguro)
- ✅ Tests + CI/CD (Vitest + GitHub Actions)
- ✅ Offline mode robusto

**Betas:** v2.0.0-beta.1, beta.2, beta.3  
**Stable:** v2.0.0 (sync estable 95%, tests 60% cobertura, LCP <2.5s)

---

### 💰 Fase 3 — Monetización e IA Segura (v2.5.x - Q3 2026)
**Objetivo:** Activar ingresos y controlar costos de IA.

**Funcionalidades:**
- ✅ Tiers: FREE, PRO ($5 USD/mes), ENTERPRISE ($13 USD/mes)
- ✅ Selector de modelos IA: Gemini (login Google), ChatGPT (OpenAI), Anthropic
- ✅ Cada usuario trae su propia API key (no gestionamos credenciales)
- ✅ Facturación AFIP via proveedor certificado
- ✅ Billing (Mercado Pago)

**Betas:** v2.5.0-beta.1, beta.2, beta.3  
**Stable:** v2.5.0 (conversión 5%, costos IA controlados, AFIP sandbox validada)

---

### 🌍 Fase 4 — Expansión e Internacionalización (v3.0.x - Q4 2026)
**Objetivo:** Crecer a 500+ usuarios y expandir a LATAM.

**Funcionalidades:**
- ✅ i18n (ES/PT) y multi-moneda
- ✅ API pública + webhooks
- ✅ Marketplace de plugins
- ✅ Reportes avanzados (PDF/Excel) y automatizaciones
- ✅ Performance hardening (Lighthouse >90)

**Betas:** v3.0.0-beta.1, beta.2, beta.3  
**Stable:** v3.0.0 (500+ usuarios activos, DAU/MAU ≥30%, API estable)

---

## 🚀 Release Process (Completamente Automatizado)

### 📋 Resumen Rápido
El sistema de releases automatizado maneja **versiones beta y stable** con estrategia de correlatividad:

```bash
# Beta (aprendizaje/validación)
npm run release:create beta

# Stable (despliegue amplio)
npm run release:create stable
```

**El sistema hace automáticamente:**
- ✅ Calcula y valida la siguiente versión (sin conflictos)
- ✅ Actualiza `package.json` 
- ✅ Commit + push automático
- ✅ Dispara GitHub Actions workflow
- ✅ Compila APK (Java 21 + Gradle 8.14)
- ✅ Crea GitHub Release con assets
- ✅ Despliega PWA a GitHub Pages (stable)

### 🔧 Estrategia de Versiones
```
1.4.0 (MVP stable, congelado)
  ↓
1.1.0-beta.1 (Fase 1, Beta 1)
  ↓
1.1.0-beta.2 (Fase 1, Beta 2)
  ↓
1.1.0-beta.3 (Fase 1, Beta 3)
  ↓
1.1.0 (Fase 1 stable)
  ↓
2.0.0-beta.1 (Fase 2, Beta 1)
  ... y así sucesivamente
```

**Ramas correspondientes:**
- `main`: v1.4.0 (MVP congelado, protegido)
- `phase-1-validation`: v1.1.x (betas + stable de Fase 1)
- `phase-2-scalability`: v2.0.x (betas + stable de Fase 2)
- etc.

### 📖 Documentación Completa
Ver [RELEASE_AUTO_GUIDE.md](./RELEASE_AUTO_GUIDE.md) y [Fases de la App/Roadmap-app.md](./Fases%20de%20la%20App/Roadmap-app.md) para:
- Configuración detallada
- Troubleshooting
- Validaciones de seguridad
- Flujos de hotfix

---

## 🤝 Contribución

¡Las contribuciones son bienvenidas! Inventariando es un proyecto pensado para la comunidad.

1.  Haz un Fork del proyecto.
2.  Crea tu rama de funcionalidad (`git checkout -b feature/AmazingFeature`).
3.  Commit a tus cambios (`git commit -m 'Add some AmazingFeature'`).
4.  Push a la rama (`git push origin feature/AmazingFeature`).
5.  Abre un Pull Request.

---

## 📄 Licencia

Distribuido bajo la licencia MIT. Ver `LICENSE` para más información.

---

<div align="center">
  <p>Desarrollado por Leonardo Esteves con ❤️ y 🧉 en Argentina.</p>
  <p>2023 - 2025 Inventariando</p>
</div>
