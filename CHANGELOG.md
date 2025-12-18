## [1.8.15] - 2025-12-18

### Added
- Release automático

## [1.8.14] - 2025-12-18

### Added
- Release automático

## [1.8.13] - 2025-12-18

### Added
- Release automático

## [1.8.12] - 2025-12-18

### Added
- Release automático

## [1.8.11] - 2025-12-18

### Added
- Release automático

## [1.8.10] - 2025-12-18

### Added
- Release automático

## [1.8.9] - 2025-12-18

### Added
- Release automático

## [1.8.8] - 2025-12-18

### Added
- Release automático

## [1.8.7] - 2025-12-18

### Added
- Release automático

## [1.8.6] - 2025-12-17

### Added
- Release automático

## [1.8.5] - 2025-12-17

### Added
- Release automático

## [1.8.4] - 2025-12-17

### Added
- Release automático

## [1.8.3] - 2025-12-17

### Added
- Release automático

## [1.8.2] - 2025-12-16

### Added
- Release automático

## [1.8.1] - 2025-12-16

### Added
- Release stable

## [1.6.1-beta] - 2025-12-16

### Changed
- Release beta

## [1.6.0-beta] - 2025-12-16

### Changed
- Release beta

## [1.5.1] - 2025-12-16

### Added
- Release stable

## [1.5.1-beta] - 2025-12-15

### Changed
- Release beta

## [1.5.0-beta] - 2025-12-15

### Changed
- Release beta

## [Unreleased]

### Fixed
- GitHub Actions workflow: Corregido deployment a GitHub Pages para usar `build:web:pages`
- El workflow ahora compila correctamente con base: '/Inventariando/' para Pages
- APK continúa usando base: '/' correctamente

## [1.4.4] - 2025-12-15

### Added
- Arquitectura de Builds Duales (PWA + Android)
- Soporte dual para vite.config.ts (base: / para Android, base: /Inventariando/ para GitHub Pages)
- Script automatizado build:web:pages para compilación independiente de Web App
- Compilación automática de Web App en cada release
- Nueva sección de documentación sobre arquitectura dual

### Fixed
- Pantalla blanca en Android - Solución de ruta base incorrecta en Capacitor
- Service Worker básico agregado para compatibilidad

### Documentation
- README.md: Nueva sección sobre arquitectura de builds duales
- AUTOMATION_SETUP.md: Actualizado con paso [7] de compilación Web App
- BRANCH_STRATEGY.md: Menciona builds duales en release automático
- PROJECT_DOCUMENTATION.md: Nueva sección 5.1 "Arquitectura de Builds Duales"
- DUAL_BUILDS_IMPLEMENTATION.md: Documento detallado de implementación

## [1.4.3] - 2025-12-15

### Added
- Release stable

## [1.4.2] - 2025-12-15

### Added
- Release estable publicado (APK + PWA)
- README actualizado a 1.4.2

## [1.4.1] - 2025-12-15

### Added
- Release automático

# Changelog

Todos los cambios notables en Inventariando serán documentados en este archivo.

## 🏆 [Phase 1 - STABLE] - 2025-12-15

**Versión:** 1.5.0-beta  
**Estado:** ✅ **COMPLETADO Y ESTABLE**  
**Rama:** `main`  
**Tag:** `phase-1-stable`

### Phase 1 Summary
Phase 1 ha sido completado exitosamente con todas las características principales implementadas:
- ✨ MVP completo con 21 componentes React
- 🤖 Multi-provider IA (Gemini, OpenAI, Anthropic)
- 📊 Analytics dashboard interno
- 🛒 Sistema POS avanzado
- 🔐 Autenticación y autorización (RBAC)
- ☁️ Backup y data management
- 📱 PWA offline-first
- 🎨 UI/UX completo con Dark Mode

### Features Finales (Beta.3)
- ✅ WhatsApp verification (6-digit code, 10min expiry)
- ✅ Gemini multi-auth (token o API key)
- ✅ User-specific IA credentials
- ✅ System Config modal
- ✅ Analytics internal dashboard
- ✅ Scroll system fixes
- ✅ Tour functionality
- ✅ Auto-close overlays

### Documentation
- ✅ Phase 1 - Beta.1, Beta.2, Beta.3 release notes
- ✅ Phase 2 Roadmap (Q1 2026)
- ✅ Complete structure documentation
- ✅ Product specifications

**Próximo:** Phase 2 (Q1 2026) - Enhanced UX & Team Collaboration

---

## [1.4.0-beta] - 2025-12-15

### Added
- ✅ **Layout & Scroll System**: Scroll independiente para sidebar, auto-reset de contenido al cambiar secciones
- ✅ **Tour Fixes**: Tour ahora avanza correctamente entre pasos sin cerrarse automáticamente
- ✅ **Auto-Close Overlays**: Sistema de cierre automático de modales al navegar (excepto Tour)
- ✅ **Phase 2 Roadmap**: Documentación de mejoras futuras (Enhanced Tour, First-Visit Banner)
- ✅ **Bug Fixes en UI**: Corrección de stacking de pantallas, scroll bloqueado, scroll position reset

### Changed
- 🔄 **App Layout**: Container raíz cambió de overflow-hidden a min-h-screen para permitir scroll
- 🔄 **Main Content**: Ahora con overflow-y-auto y anclado al inicio para mejor UX
- 🔄 **Documentation Structure**: Fase 2 movida a docs/releases/PHASE-2-ROADMAP.md (respetando estructura)
- 🔄 **Release Notes**: PHASE-1-BETA.3.md actualizado con referencias a Phase 2

### Fixed
- 🐛 **Scroll Issue**: Secciones ahora completamente scrolleables sin contenido flotante
- 🐛 **Modal Stacking**: Abriendo una opción de Sistema cierra automáticamente las anteriores
- 🐛 **Tour Progression**: Tour avanza sin interrupción cuando el usuario navega pasos

### Documentation
- 📚 **Phase 2 Planning**: [docs/releases/PHASE-2-ROADMAP.md](docs/releases/PHASE-2-ROADMAP.md) con plan detallado
- 📚 **Structure Update**: docs/README.md actualizado con referencias correctas a releases
- 📚 **README Principal**: Sección "Próxima: Phase 2" añadida

---

## [1.3.0-beta] - 2025-12-14

### Added
- ✅ **Capacitor Integration**: Soporte para APK Android nativo
- ✅ **GitHub Actions**: Workflow automático de release y build
- ✅ **Tailwind Build System**: Migración de CDN a compilación local
- ✅ **Responsive Design**: Sidebar dinámico, hamburguesa en móviles
- ✅ **Versionado Automático**: Scripts para bump version y organizar APK
- ✅ **APK Distribution**: Estructura de carpetas versionadas y releases

### Changed
- 🔄 **PostCSS Config**: Cambio a CommonJS para compatibilidad con Vite
- 🔄 **Package.json**: Metadata completa, scripts de build optimizados
- 🔄 **README**: Documentación actualizada con instrucciones de descargas

### Fixed
- 🐛 **Estilos Tailwind**: Restaurados colores y diseños tras migración
- 🐛 **Responsive Breakpoints**: Corrección de breakpoints lg/md para tablets
- 🐛 **HTML Meta Tags**: Eliminadas deprecadas, añadido favicon

### Documentation
- 📚 **PM Analysis**: Documento completo de análisis y roadmap v1.1.0
- 📚 **APK README**: Guía de descarga e instalación
- 📚 **Workflow Guide**: Instrucciones de release automático

---

## [1.0.0-MVP] - 2025-11-20

### Initial Release
- ✨ MVP completo con 21 componentes
- 🤖 Integración Google Gemini AI
- 🛒 Sistema POS con múltiples métodos de pago
- 📊 Dashboard con análisis de datos
- 🔐 RBAC y autenticación 2FA
- ☁️ Backup y exportación de datos
- 📱 PWA con soporte offline
- 🎨 Dark mode nativo
- 🌐 Diseño mobile-first responsivo

---

## Formato

Este changelog sigue [Keep a Changelog](https://keepachangelog.com/es-ES/).

### Categorías
- **Added**: Funcionalidades nuevas
- **Changed**: Cambios en funcionalidades existentes
- **Deprecated**: Funcionalidades que serán removidas pronto
- **Removed**: Funcionalidades removidas
- **Fixed**: Bugs corregidos
- **Security**: Fixes de seguridad
- **Documentation**: Cambios en documentación

---

*Última actualización: 15 de Diciembre de 2025*
