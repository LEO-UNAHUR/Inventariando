# 🚀 GUÍA RÁPIDA - RELEASE AUTOMÁTICO

## Resumen Ejecutivo

Cuando quieras hacer un release, simplemente dime:
```
"quiero hacer un release beta" 
o 
"release stable"
```

Yo haré todo automáticamente:
1. ✅ Validaré la versión contra GitHub (sin conflictos)
2. ✅ Actualizaré `package.json` con la nueva versión
3. ✅ Generaré CHANGELOG automático
4. ✅ Haré commit y push a GitHub
5. ✅ Dispararé el GitHub Actions workflow
6. ✅ Te daré links para monitorear el progreso

---

## Cómo Funciona (Técnico)

### El Script `scripts/release-auto.js`

Valida **correlatividad de versiones**:
- **Beta → Beta**: Mantiene versión (refresh)
- **Beta → Stable**: Quita `-beta` 
- **Stable → Beta**: Bumpea minor a siguiente y agrega `-beta`
- **Stable → Stable**: Bumpea patch

### Ejemplos de Progresión Válida:

```
1.0.0 (stable)
  ↓
1.1.0-beta (beta)
  ↓
1.1.0 (stable)
  ↓
1.2.0-beta (beta)
```

### Validación Contra GitHub

Antes de hacer el release:
1. Consulta el API de GitHub para saber qué fue la última versión
2. Valida que la nueva versión sea mayor (no se "pise")
3. Valida secuencia (no puede haber jumps)

---

## Configuración Requerida (Una Sola Vez)

### 1. Generar Personal Access Token en GitHub

Ve a: https://github.com/settings/tokens

Crea un "new token (classic)" con permisos:
- ✅ `repo` (full repo access)
- ✅ `workflow` (disparar workflows)

Copia el token (ejemplo): `ghp_aBcDeFgHiJkLmNoPqRsTuVwXyZ...`

### 2. Guardar Token Localmente

En **PowerShell** (Windows):
```powershell
# Agrega esta línea a tu perfil de PowerShell
# (o ejecuta en cada sesión)
$env:GITHUB_TOKEN = "ghp_tu_token_aqui"

# Luego verifica que funcione:
echo $env:GITHUB_TOKEN
```

Para hacerlo permanente, edita tu perfil de PowerShell:
```powershell
# Abre el editor
notepad $PROFILE

# Agrega esta línea y guarda
$env:GITHUB_TOKEN = "ghp_tu_token_aqui"
```

En **Bash/Linux/Mac**:
```bash
export GITHUB_TOKEN="ghp_tu_token_aqui"
# Hacer permanente: agrega a ~/.bashrc o ~/.zshrc
```

---

## El Flujo Completo (Mi Perspectiva)

Cuando tú digas "release beta", yo:

### 1️⃣ Verifico Versión Actual
```bash
# Lee package.json
"version": "1.1.0-beta"
```

### 2️⃣ Consulto GitHub API
```bash
GET /repos/LEO-UNAHUR/Inventariando/releases/latest
# Respuesta: última versión fue 1.0.0 (stable)
```

### 3️⃣ Calculo Nueva Versión
```
Si actual=1.1.0-beta y type=beta
→ Nueva versión: 1.1.0-beta (mantener)

Si actual=1.1.0 y type=stable
→ Nueva versión: 1.1.1
```

### 4️⃣ Valido Correlatividad
```
¿1.1.0-beta es mayor que última (1.0.0)? SÍ ✅
¿No hay jumps? SÍ ✅
¿Es una transición válida? SÍ ✅
→ Proceder
```

### 5️⃣ Ejecuto Cambios
```bash
# Actualiza package.json
# Agrega entrada a CHANGELOG.md
# Hace commit: "chore(release): v1.1.0-beta"
# Push a main
```

### 6️⃣ Disparo GitHub Actions
```bash
# API call a:
POST /repos/LEO-UNAHUR/Inventariando/actions/workflows/release.yml/dispatches

# Con inputs:
{
  "ref": "main",
  "inputs": {
    "release_type": "beta"
  }
}
```

### 7️⃣ Reporto Resultado
```
✅ Release completado
📊 Versión: 1.1.0-beta
🔗 Monitorea aquí: https://github.com/LEO-UNAHUR/Inventariando/actions
📥 APK estará en: https://github.com/LEO-UNAHUR/Inventariando/releases
```

---

## Monitoreo del Workflow

Después de que ejecute el release automático:

1. Ve a **GitHub Actions**:
   https://github.com/LEO-UNAHUR/Inventariando/actions

2. Busca el workflow "Release APK & Build"

3. Espera a que pase por estos pasos:
   - ✅ Checkout code
   - ✅ Setup Java 17
   - ✅ Build web (Vite)
   - ✅ Sync Capacitor
   - ✅ Build Android (genera APK)
   - ✅ Create GitHub Release (con tags)

4. Cuando termine, el APK estará en **Releases**:
   https://github.com/LEO-UNAHUR/Inventariando/releases

---

## Troubleshooting

### "GITHUB_TOKEN no configurado"
**Solución**: Configura el token según instrucciones arriba.

### "Conflicto de versiones"
**Causa**: Intentaste hacer un release que es menor que la última.  
**Ejemplo**: Si GitHub tiene 1.1.0 y quieres hacer 1.0.5  
**Solución**: Usa una versión más alta (1.1.1, 1.2.0, etc.)

### "No se puede conectar a GitHub"
**Causa**: Sin internet o GitHub API está caído.  
**Solución**: El script continúa offline. Verifica después que el push funcionó.

### "El workflow falló en Android build"
**Causa**: Problema al compilar Android (Java, SDK, etc.)  
**Solución**: Revisa los logs en GitHub Actions. Puede ser:
- Android SDK desactualizado
- Java version mismatch
- Certificado signing expirado

---

## Ejemplos de Uso Real

### Scenario 1: Beta a Beta (refresh)
```
Actual: 1.1.0-beta
Comando: "release beta"
Resultado: 1.1.0-beta (mismo pero actualizado)
```

### Scenario 2: Beta a Stable
```
Actual: 1.1.0-beta  
Comando: "release stable"
Resultado: 1.1.0 (quita -beta)
```

### Scenario 3: Stable a Beta
```
Actual: 1.1.0
Comando: "release beta"
Resultado: 1.2.0-beta (nueva versión menor)
```

### Scenario 4: Stable a Stable
```
Actual: 1.1.0
Comando: "release stable"
Resultado: 1.1.1 (bumpea patch)
```

---

## Validaciones de Seguridad

El script automático previene:

❌ **Versiones duplicadas**  
→ Valida contra GitHub releases

❌ **Versiones hacia atrás**  
→ Calcula incrementos válidos

❌ **Jumps de versión**  
→ Mantiene correlatividad (1.0.0 → 1.1.0, no 1.0.0 → 2.0.0)

❌ **Commits sin código**  
→ Solo actualiza versión/changelog

❌ **Fallos silenciosos**  
→ Reporta cada paso y errores claros

---

## Ambiente: Cómo Yo Ejecuto El Release

Desde mi perspectiva (dentro de VS Code):

```powershell
# 1. Obtengo token del usuario
$env:GITHUB_TOKEN = "ghp_..."

# 2. Ejecuto el script
npm run release:auto beta

# 3. Monitoreo output:
# ✅ package.json actualizado
# ✅ Changelog generado
# ✅ Git commit exitoso
# ✅ Push a GitHub completado
# ✅ Workflow disparado

# 4. Reporto resultado con links
```

---

## Diferencias vs Manual

### ❌ Manual (viejo)
1. Editar package.json a mano
2. Editar CHANGELOG.md
3. Hacer git commit manual
4. Git push manual
5. Ir a GitHub Actions UI
6. Hacer click en "Run workflow"
7. Seleccionar "beta" o "stable"
8. Esperar compilación
9. Ir a Releases para descargar

### ✅ Automático (nuevo)
1. Dime: "release beta"
2. Yo hago TODO
3. Te reporto con links
4. Monitorea en GitHub Actions si quieres

---

## Preguntas Frecuentes

**P: ¿Puedo hacer release sin internet?**  
R: No. Necesitas conectividad para push a GitHub y disparar Actions.

**P: ¿Qué pasa si el workflow falla?**  
R: El release está en GitHub pero el APK no se compiló. Ve a Actions para ver el error.

**P: ¿Puedo hacer rollback?**  
R: Sí, manualmente en GitHub. Elimina el tag y la versión en package.json, haz push.

**P: ¿Dónde se guarda el APK?**  
R: En dos lugares:
1. GitHub Releases (descarga directa)
2. Carpeta local `APK/v[version]/` (si compilaste localmente)

**P: ¿Puedo hacer un release de una rama diferente?**  
R: No. El script usa `main`. Para feature branches, hazlo manual.

---

## Próximos Pasos

1. ✅ Guarda tu Personal Access Token de GitHub
2. ✅ Configura `$env:GITHUB_TOKEN` en tu PowerShell
3. ✅ Cuando quieras hacer release, avísame
4. ✅ Yo ejecuto todo automáticamente

¡Listo! El sistema está configurado.

---

**Creado**: 2025-01-16  
**Última actualización**: 2025-01-16  
**Script**: `scripts/release-auto.js`  
**Comando**: `npm run release:auto [beta|stable]`
