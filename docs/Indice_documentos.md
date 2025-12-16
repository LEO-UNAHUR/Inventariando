# ÐY"s Índice de Documentación - Inventariando

**Última actualización:** 16 de diciembre de 2025

---

## ÐYs? Documentación esencial de releases

1. **[RELEASE_SYSTEM.md](RELEASE_SYSTEM.md)** – guía definitiva con los scripts clásicos (`bump-version`, `create-release`, `release-auto`, `organize-apk`, etc.), los workflows previos y los procedimientos duales (Android + PWA).  
2. **[RELEASE_FLOW.md](RELEASE_FLOW.md)** – nuevo resumen del pipeline actual y explicación de `scripts/release-master.js`.  
3. **[`scripts/release-master.js`](../scripts/release-master.js)** – el orquestador que reemplaza la dispersión de pasos: bump + build + tag + release + upload.

---

## ÐYs? Releases & Roadmap (`docs/releases/`)

- **[PHASE-1-BETA.1.md](releases/PHASE-1-BETA.1.md)** – notas de la beta 1.1.  
- **[PHASE-1-BETA.2.md](releases/PHASE-1-BETA.2.md)** – beta 1.2.  
- **[PHASE-1-BETA.3.md](releases/PHASE-1-BETA.3.md)** – estado actual del Phase 1.  
- **[PHASE-1-HOTFIXES.md](releases/PHASE-1-HOTFIXES.md)** y **[HOTFIXES-SUMMARY.md](releases/HOTFIXES-SUMMARY.md)** – correcciones validadas.  
- **[PHASE-2-ROADMAP.md](releases/PHASE-2-ROADMAP.md)** – visión y backlog de Phase 2.

> Propósito: seguimiento de features, bugs, correcciones y backlog de lanzamientos.

---

## ÐY"Ý Especificaciones históricas (`product beta/`, `product stable/`)

Estas carpetas conservan documentación de versiones anteriores. Úsalas solo como referencia histórica; la narración del lanzamiento activo está en los archivos anteriores.

---

## ÐY"< Otros documentos clave

- **[overview/PROJECT_DOCUMENTATION.md](overview/PROJECT_DOCUMENTATION.md)** – visión general del producto.  
- **[setup/SETUP_FINAL.md](setup/SETUP_FINAL.md)** – pasos de configuración y estrategia de ramas.  
- **[PM_ANALYSIS_V1.1.0.md](PM_ANALYSIS_V1.1.0.md)** – análisis de producto, mercado y roadmap.  
- **[release/](release/)** – instrucciones puntuales de automatización y validación (`AUTOMATION_SETUP.md`, `VALIDATION-GUIDE.md`, etc.).

---

## ÐY"" Notas de mantenimiento

- La información de release ahora se concentra en `RELEASE_SYSTEM.md`, `RELEASE_FLOW.md` y `docs/releases/`.  
- `scripts/release-master.js` centraliza el pipeline, y `.github/workflows/release.yml` invoca ese script.  
- Los demás documentos permanecen para contexto histórico; evita crear duplicados adicionales y apunta siempre a las guías anteriores.

---

**Responsable:** Inventariando Team
