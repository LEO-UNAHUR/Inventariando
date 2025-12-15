
# 🇦🇷 Inventariando | Gestión de Inventario Inteligente

![Version](https://img.shields.io/badge/version-1.4.0-blue?style=for-the-badge&logo=appveyor)
![Status](https://img.shields.io/badge/status-Active%20Development-cyan?style=for-the-badge)
![Tech](https://img.shields.io/badge/stack-React_19_•_Capacitor_•_Gemini_AI-222?style=for-the-badge)

**🌐 [Prueba la PWA en vivo](https://LEO-UNAHUR.github.io/Inventariando/)** | 📱 [Descarga APK](https://github.com/LEO-UNAHUR/Inventariando/releases)

> **La solución definitiva para PyMEs argentinas.**  
> Gestión de stock, punto de venta (POS) y análisis financiero potenciado por Inteligencia Artificial, todo en tu bolsillo.


## [1.4.0] - 2025-12-14

### Changed
- Release automático via GitHub Actions (MVP)
- Nuevo panel de Configuración del Sistema (tema por defecto, idioma, moneda y backup automático) separado de la sección de IA.
- Sidebar con botón de reapertura en escritorio para evitar quedar sin menú.

## 🆕 Novedad: Phase 1 Beta.3 (2025-12-15)
- Verificación de WhatsApp con código de 6 dígitos y caducidad; el usuario se envía el código vía WhatsApp (sin gateway externo).
- Gemini por usuario ahora acepta login con token o API Key, con validación y almacenamiento cifrado local.
- El asistente IA usa la credencial de Gemini por usuario; las preferencias de usuario permanecen en el Perfil y la configuración de IA solo en el panel de IA.
- Detalles completos en [docs/releases/PHASE-1-BETA.3.md](docs/releases/PHASE-1-BETA.3.md).

## 🚀 Próxima: Phase 2 (Q1 2026)
- 🎓 Enhanced Onboarding Tour — Expand to 12+ steps covering all sections
- 🔔 First-Visit Notification — Welcome banner for new users
- Real-time team notifications, advanced reporting, API integration
- [Ver Roadmap](docs/releases/PHASE-2-ROADMAP.md)

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

## 🔮 Roadmap v1.1.0 Beta (Validación)

*   [ ] Implementar analytics (PostHog/Mixpanel)
*   [ ] Programa piloto con 10 comercios reales
*   [ ] Feedback loop y mejoras UX
*   [ ] Exportar facturas a PDF
*   [ ] Sincronización multi-dispositivo (Cloud)

Ver [PM_ANALYSIS_V1.1.0.md](./PM_ANALYSIS_V1.1.0.md) para análisis completo del roadmap.

---

## 🚀 Release Process (Completamente Automatizado)

### 📋 Resumen Rápido
Cuando quieras hacer un release, solo pide:
> "Quiero hacer un release **beta**" o "Release **stable**"

**Yo haré automáticamente:**
- ✅ Validar versión contra GitHub (sin conflictos)
- ✅ Actualizar `package.json` 
- ✅ Generar CHANGELOG
- ✅ Commit y push automático
- ✅ Disparar GitHub Actions workflow
- ✅ Compilar APK
- ✅ Crear GitHub Release con assets

### 🔧 Detalles Técnicos

El script `scripts/release-auto.js` maneja:

```bash
# Opción 1: Automático (sin token)
npm run release:auto beta      # Calcula version, commits, push
npm run release:auto stable

# Opción 2: Con GitHub Actions (requiere GITHUB_TOKEN)
export GITHUB_TOKEN="ghp_..."
npm run release:auto beta      # + dispara workflow automáticamente
```

**Validación de Correlatividad:**
- Beta → Beta: Mantiene versión (refresh)
- Beta → Stable: Quita `-beta`
- Stable → Beta: Bumpea minor + agrega `-beta`
- Stable → Stable: Bumpea patch

**Ejemplo de Progresión:**
```
1.0.0 (stable)
  ↓
1.1.0-beta (beta)
  ↓
1.1.0 (stable)
  ↓
1.2.0-beta (beta)
```

### 📖 Documentación Completa
Ver [RELEASE_AUTO_GUIDE.md](./RELEASE_AUTO_GUIDE.md) para:
- Configuración del Personal Access Token
- Troubleshooting
- Ejemplos de uso
- Validaciones de seguridad

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
