# 🎯 CONFIGURACIÓN FINAL - RELEASE AUTOMÁTICO

## Estado Actual

✅ **Sistema completamente implementado**  
Todos los archivos están en GitHub:
- `scripts/release-auto.js` - Motor de automatización
- `RELEASE_AUTO_GUIDE.md` - Documentación completa
- `.env.example` - Template de configuración
- `release.sh`, `release.ps1` - Wrappers cross-platform
- `package.json` actualizado con `npm run release:auto`

---

## 🔑 PASO CRÍTICO: Generar Personal Access Token

Este es el ÚNICO paso manual que necesitas hacer una sola vez.

### Instrucciones (5 minutos)

1. **Ve a GitHub Settings:**
   https://github.com/settings/tokens

2. **Click en "Generate new token" → "Generate new token (classic)"**

3. **Completa el formulario:**
   - **Token name:** `Inventariando Release Agent`
   - **Expiration:** `No expiration` (o 1 año si prefieres)
   
4. **Selecciona estos permisos:**
   ```
   ✅ repo (Full control of private repositories)
   ✅ workflow (Update GitHub Action workflows)
   ```

5. **Click "Generate token"**

6. **⚠️ COPIAR el token inmediatamente** (no se mostrará de nuevo):
   ```
   ghp_aBcDeFgHiJkLmNoPqRsTuVwXyZ1234567890...
   ```

### Guardar el Token (Windows PowerShell)

**Opción 1: Temporal (solo esta sesión)**
```powershell
$env:GITHUB_TOKEN = "ghp_tu_token_aqui"

# Verifica que funcionó
echo $env:GITHUB_TOKEN
```

**Opción 2: Permanente (recomendado)**

Edita tu PowerShell Profile:
```powershell
# Abre el editor
notepad $PROFILE

# Agrega esta línea y guarda:
$env:GITHUB_TOKEN = "ghp_tu_token_aqui"

# Cierra y reabre PowerShell
```

O una sola línea:
```powershell
Add-Content $PROFILE "`n`$env:GITHUB_TOKEN = 'ghp_tu_token_aqui'"
```

---

## 🧪 Prueba Rápida

```powershell
# 1. Verifica que el token esté configurado
echo $env:GITHUB_TOKEN
# Deberías ver: ghp_aBcDefGHIJKlmnoPqrStUVwxyz...

# 2. Verifica que el script existe
Test-Path "scripts/release-auto.js"
# Deberías ver: True

# 3. Ejecuta una prueba (sin hacer release real)
node scripts/release-auto.js beta
# Deberías ver: Validación de versiones + resumen
```

---

## 🚀 CUANDO QUIERAS HACER UN RELEASE

Usa el nuevo comando simplificado:

- Beta: `npm run release:create beta`
- Stable: `npm run release:create stable`

Esto calcula la versión, dispara el workflow y genera/sube el APK automáticamente.

---

## ✨ Flujo automático

Con `release:create` el sistema:

1. Calcula la versión (beta o stable)
2. Dispara el workflow en GitHub
3. Genera y firma el APK
4. Organiza el APK en `APK/v{version}/`
5. Crea la release y sube el asset

---

## 📋 Checklist de Configuración

Marca cuando completes cada paso:

- [ ] **Genéré Personal Access Token en GitHub**
  - Permisos: `repo` + `workflow`
  - Token copiado: `ghp_...`

- [ ] **Configuré GITHUB_TOKEN en PowerShell**
  - ```powershell
    $env:GITHUB_TOKEN = "ghp_..."
    ```
  - Verificado: `echo $env:GITHUB_TOKEN` → muestra el token

- [ ] **Descargué los archivos de GitHub**
  - `scripts/release-auto.js` ✓
  - `RELEASE_AUTO_GUIDE.md` ✓
  - `.env.example` ✓

- [ ] **Leí RELEASE_AUTO_GUIDE.md**
  - Entiendo el flujo de versiones
  - Sé qué es "correlatividad"
  - Conozco los escenarios de uso

---

## 🎓 Conceptos Clave

### Semántica de Versiones (Semver)
```
MAJOR.MINOR.PATCH[-prerelease]

1.1.0-beta   → Versión 1, menor 1, patch 0, prerelease beta
1.1.0        → Versión 1, menor 1, patch 0, stable

Incrementos:
  Mayor: cambios incompatibles
  Menor: nuevas características compatibles
  Patch: fixes de bugs
```

### Correlatividad
Significa que cada versión es secuencial y válida:
```
✅ Válido:
   1.0.0 → 1.1.0 → 1.2.0 → 2.0.0

❌ Inválido (saltos):
   1.0.0 → 1.5.0 (¿dónde está 1.1.0-1.4.0?)
   1.0.0 → 2.0.0 (¿dónde está 1.1.0?)
```

### Beta vs Stable
```
1.0.0-beta   → Versión de prueba (puede tener bugs)
1.0.0        → Versión lista para producción
```

---

## 🔒 Seguridad & Validaciones

El script automático previene:

| Riesgo | Prevención |
| :--- | :--- |
| **Versión duplicada** | Consulta GitHub API |
| **Versión hacia atrás** | Valida incrementos |
| **Jumps sin sentido** | Mantiene correlatividad |
| **Token expuesto** | Lee del env, no lo guarda |
| **Fallos silenciosos** | Reporta cada paso |

---

## 📞 Troubleshooting Rápido

### "GITHUB_TOKEN no está configurado"
```powershell
$env:GITHUB_TOKEN = "ghp_tu_token"
```

### "No se puede conectar a GitHub"
- Verifica internet
- Verifica que GitHub API esté disponible
- El script continúa offline (pero sin validación)

### "Conflicto de versiones"
- Significa que intentaste crear una versión menor que la última
- Solución: espera a que se libere la siguiente versión válida

### "El workflow falló"
- Ve a GitHub Actions para ver logs detallados
- Puede ser: Java missing, Android SDK, certificado expirado

---

## 🎯 Resumen Final

**Status:** ✅ Sistema completamente automático listo

**Próximo Paso:** 
1. Genera Personal Access Token en GitHub
2. Configura `$env:GITHUB_TOKEN` en PowerShell
3. Dime cuando quieras hacer un release (beta/stable)

**Resultado:**
- Yo ejecuto todo automáticamente
- Cero pasos manuales
- Reporte completo con links

---

**Sistema configurado:** 2025-01-16  
**Scripts:** `scripts/release-auto.js`  
**Documentación:** `RELEASE_AUTO_GUIDE.md`  
**Commit:** `aaec06f`
