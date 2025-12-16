# Índice de Documentación - Inventariando

**Última actualización:** 16 de diciembre de 2025

---

## Documentación esencial para releases

1. **[RELEASE_FLOW.md](RELEASE_FLOW.md)** – nueva guía del pipeline `release-master` que centraliza bump/version, build, tag y release sobre GitHub.  
2. **[`scripts/release-master.js`](../scripts/release-master.js)** – el orquestador actual que ejecuta todo el flujo y mantiene el README + `docs/releases/RELEASES.md` actualizados automáticamente.  
3. **[docs/releases/RELEASES.md](releases/RELEASES.md)** – historial ligero con cada versión y enlaces directos a la release correspondiente.  
4. **[docs/archived/RELEASE_SYSTEM_LEGACY.md](archived/RELEASE_SYSTEM_LEGACY.md)** – referencia histórica de la infraestructura previa (copias locales `APK/`, `BUILDS/`, scripts legacy).

---

## Releases & roadmap (`docs/releases/`)

- **[PHASE-1-BETA.1.md](releases/PHASE-1-BETA.1.md)** – notas de la beta 1.1.  
- **[PHASE-1-BETA.2.md](releases/PHASE-1-BETA.2.md)** – beta 1.2.  
- **[PHASE-1-BETA.3.md](releases/PHASE-1-BETA.3.md)** – resumen actual de Phase 1.  
- **[PHASE-1-HOTFIXES.md](releases/PHASE-1-HOTFIXES.md)** y **[HOTFIXES-SUMMARY.md](releases/HOTFIXES-SUMMARY.md)** – correcciones documentadas.  
- **[PHASE-2-ROADMAP.md](releases/PHASE-2-ROADMAP.md)** – visión del próximo ciclo.

> Propósito: registrar features, bugs, correcciones y acuerdos de ejecución.

---

## Otros documentos clave

- **[overview/PROJECT_DOCUMENTATION.md](overview/PROJECT_DOCUMENTATION.md)** – visión general del producto.  
- **[setup/SETUP_FINAL.md](setup/SETUP_FINAL.md)** – pasos de configuración final y estrategia de ramas.  
- **[PM_ANALYSIS_V1.1.0.md](PM_ANALYSIS_V1.1.0.md)** – análisis estratégico y de producto.  
- **[release/](release/)** – guías puntuales de automatización (por ejemplo `AUTOMATION_SETUP.md`, `VALIDATION-GUIDE.md`).

---

## Notas de mantenimiento

- El pipeline moderno de releases se documenta en `RELEASE_FLOW.md` y `docs/releases/RELEASES.md`; el sistema antiguo está archivado en `docs/archived/RELEASE_SYSTEM_LEGACY.md`.  
- `scripts/release-master.js` actualiza automáticamente `README.md` y el historial de releases en cada ejecución.  
- Evita crear nuevas carpetas de `APK/` o `BUILDS/`; todas las descargas deben ocurrir desde los GitHub Releases publicados.

---

**Responsable:** Inventariando Team
