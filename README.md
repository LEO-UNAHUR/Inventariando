
# 🇦🇷 Inventariando | Gestión de Inventario Inteligente

![Version](https://img.shields.io/badge/version-1.0.0_MVP-blue?style=for-the-badge&logo=appveyor)
![Status](https://img.shields.io/badge/status-Stable-success?style=for-the-badge)
![Tech](https://img.shields.io/badge/stack-React_19_•_Gemini_AI_•_Tailwind-222?style=for-the-badge)

> **La solución definitiva para PyMEs argentinas.**  
> Gestión de stock, punto de venta (POS) y análisis financiero potenciado por Inteligencia Artificial, todo en tu bolsillo.

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
*   **IA:** Google GenAI SDK (`gemini-2.5-flash`).
*   **Gráficos:** Recharts (Visualización de datos interactiva).
*   **Hardware:** Html5-Qrcode (Uso de cámara como escáner).
*   **Persistencia:** LocalStorage Service Layer (Offline-first architecture).
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
    Crea un archivo `.env` en la raíz (o configura tu entorno de despliegue):
    ```env
    REACT_APP_GEMINI_API_KEY=tu_api_key_aqui
    ```
    *(Nota: En la versión actual del código, la key se inyecta o se maneja vía process.env.API_KEY según el bundler).*

4.  **Iniciar en Desarrollo:**
    ```bash
    npm start
    ```
    Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## 🔮 Roadmap (Próximos Pasos)

*   [ ] Integración real con AFIP (Facturación Electrónica).
*   [ ] Sincronización en la nube (Firebase/Supabase) para multi-dispositivo real.
*   [ ] Generación de PDFs para comprobantes de venta.
*   [ ] Modo "Kiosco" para auto-atención.

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
  <p>Desarrollado con ❤️ y 🧉 en Argentina.</p>
  <p>2023 - 2025 Inventariando Team</p>
</div>
