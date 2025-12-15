# 📚 Índice de Documentación - Inventariando

**Última Actualización:** 15 de diciembre de 2025

---

## 🚀 DOCUMENTO MAESTRO DE RELEASES

### **[RELEASE_SYSTEM.md](RELEASE_SYSTEM.md)** - ⭐ DOCUMENTO ÚNICO Y COMPLETO
**Sistema Completo de Releases, Scripts, Workflows y Builds Duales**

Este documento consolida TODA la información sobre:
- ✅ Cómo hacer releases (beta y stable)
- ✅ Arquitectura del sistema de releases
- ✅ Scripts y herramientas (create-release.js, bump-version.js, etc.)
- ✅ GitHub Actions workflow completo
- ✅ Builds duales (Android APK + Web PWA)
- ✅ Versionado automático (semver)
- ✅ Despliegue a GitHub Pages
- ✅ Troubleshooting completo

**📖 Lee este documento para entender el sistema de releases completo.**

---

## 📄 Estructura de Documentación

Este directorio contiene toda la documentación del proyecto Inventariando, organizada por propósito:

### 🚀 **Releases & Roadmap** (`releases/`)
Documentos oficiales de cada fase y versión del proyecto:
- **Phase 1 - Beta.1:** [Release Notes](releases/PHASE-1-BETA.1.md)
- **Phase 1 - Beta.2:** [Release Notes](releases/PHASE-1-BETA.2.md)
- **Phase 1 - Beta.3:** [Release Notes](releases/PHASE-1-BETA.3.md) ✅ *Actual*
- **Phase 2 (Q1 2026):** [Roadmap & Planning](releases/PHASE-2-ROADMAP.md)

**Propósito:** Tracking de features, bugs, cambios y estado de cada fase de desarrollo.

---

### 📦 **Especificaciones de Producto**

#### **Beta Versions** (`product beta/`)
Documentos de especificación técnica y features para versiones beta:
- `v1.2.0-beta.md` - Especificación de Beta 1.2.0
- `v1.4.0-beta.md` - Especificación de Beta 1.4.0

**Propósito:** Detalles técnicos, features, cambios y estado de versiones en prueba.

#### **Stable Versions** (`product stable/`)
Documentos oficiales de especificación para versiones estables:
- `v1.4.0.md` - Especificación estable de versión 1.4.0

**Propósito:** Documentación oficial de características confirmadas y estables.

---

### 📋 **Otros Documentos**

#### **General Documentation**
- **Visión general:** [overview/PROJECT_DOCUMENTATION.md](overview/PROJECT_DOCUMENTATION.md)
- **Configuración y setup:** [setup/SETUP_FINAL.md](setup/SETUP_FINAL.md)
- **Análisis de producto:** [PM_ANALYSIS_V1.1.0.md](PM_ANALYSIS_V1.1.0.md)

#### **Release Automation** (`release/`)
- **Guía de automatización:** [release/AUTOMATION_SETUP.md](release/AUTOMATION_SETUP.md)

**Propósito:** Procesos y scripts de automatización para crear releases.

---

## 🔄 Diferencia: `releases/` vs `product beta/stable/`

| Aspecto | `releases/` | `product beta/stable/` |
|---------|-------------|------------------------|
| **Contenido** | Release Notes de Fases | Especificaciones técnicas |
| **Enfoque** | Cambios, features, bugs | Features detalladas, stack |
| **Versión** | Por Phase (Beta.1, Beta.2, etc.) | Por versión semántica (1.2.0, 1.4.0) |
| **Uso** | Tracking del desarrollo | Documentación de producto |
| **Actualización** | Al finalizar cada fase | Al hacer release de versión |

---

## 📄 README.md
Este archivo (guía de estructura).

---

**Última actualización:** 15 de Diciembre de 2025  
**Responsable:** Inventariando Team
