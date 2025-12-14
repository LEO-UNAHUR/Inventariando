# Automatización de Releases - Guía SIMPLE

## 🚀 TL;DR (Todo lo que necesitas saber)

### Para crear un release, solo ejecuta:

```bash
# Beta
npm run release:create beta

# Stable
npm run release:create stable
```

**¡Eso es todo!** El resto ocurre automáticamente.

---

## ¿Qué pasa cuando ejecutas el comando?

```
npm run release:create beta
    ↓
[1] Calcula versión automáticamente (1.0.0 → 1.0.1-beta)
    ↓
[2] Dispara el workflow en GitHub
    ↓
[3] Compila el APK (Java 21, Gradle, Capacitor 8)
    ↓
[4] Descarga APK desde GitHub Releases
    ↓
[5] Guarda en APK/v{version}/ (local)
    ↓
[6] Actualiza README.md con nueva versión
    ↓
[7] Actualiza README_APK.md con estructura
    ↓
[8] Crea release en GitHub con assets
    ↓
✅ COMPLETADO (3-5 minutos)
```

---

## Versionación Automática (No tienes que pensar en esto)

### Beta Release
```
1.0.0        → 1.0.1-beta  (primera beta)
1.0.1-beta   → 1.0.2-beta  (siguiente beta)
```

### Stable Release
```
1.0.1-beta   → 1.0.1       (quita -beta)
1.0.1        → 1.0.2       (siguiente stable)
```

**Resumen**: 
- Dices "beta" y se calcula automáticamente
- Dices "stable" y se calcula automáticamente
- Tú solo seleccionas el TIPO (beta o stable)

---

## Archivos Generados

```
APK/v1.0.1-beta/
├── Inventariando-1.0.1-beta.apk     ← El APK para instalar (descargado automáticamente)
├── INFO.txt                           ← Instrucciones y metadatos
├── CHECKSUMS.txt                      ← Hash SHA256 para verificación
└── README_APK.md                      ← Actualizado automáticamente
```

**Ubicaciones del APK:**
- **Local**: `APK/v{version}/` (descargado automáticamente del release)
- **GitHub**: https://github.com/LEO-UNAHUR/Inventariando/releases
- **Documentación**: `README_APK.md` (actualizado automáticamente)

### Automatizaciones Incluidas

✅ **Descarga automática del APK**
- Tras completar el workflow, el script descarga el APK desde GitHub Releases
- Lo guarda en `APK/v{version}/`
- Genera automáticamente `INFO.txt` con metadatos

✅ **Actualización automática de README.md**
- Badge de versión se actualiza automáticamente
- Se agrega sección de changelog con fecha
- Visible al abrir el README principal

✅ **Actualización automática de README_APK.md**
- Estructura de carpetas se actualiza
- Información de descarga siempre actual

✅ **Metadata generado automáticamente**
- `INFO.txt`: Instrucciones, requisitos, fecha de release
- `CHECKSUMS.txt`: Verificación de integridad SHA256

---

## Instalación en Android

1. Descarga el `.apk` desde GitHub Releases
2. En tu teléfono:
   - Configuración → Seguridad → Permitir fuentes desconocidas
   - Abre el archivo APK
   - Sigue las instrucciones

---

## Troubleshooting

### "Command not found: npm run release:create"
- Asegúrate de estar en la carpeta del proyecto
- Verifica que `node_modules` existe (ejecuta `npm install`)

### "El APK no aparece después de 5 minutos"
- Ve a GitHub Actions → Workflow execution
- Revisa los logs para errores
- Busca errores en "Build Android & APK"

### "No se puede ejecutar el comando"
- Verifica que tienes `gh` CLI instalado: `gh --version`
- Autentica con GitHub: `gh auth login`

---

## Información Técnica (Para referencia)

- **Script Maestro**: `scripts/create-release.js` (gestiona todo el pipeline)
- **GitHub Workflow**: `.github/workflows/release.yml` (compila APK en Ubuntu)
- **Plataforma**: Android (Capacitor 8.0 + Gradle 8.14)
- **Java**: OpenJDK 21 (requerido para Capacitor 8)
- **Firma**: Keystore generado dinámicamente en GitHub Actions
- **Compilación**: `./gradlew assembleRelease` (genera APK firmado)
- **Descargas**: Automático via GitHub API (fetch desde release assets)
- **Almacenamiento**: 
  - GitHub Releases (oficial, con assets)
  - Carpeta local `APK/v{version}/` (copia de respaldo)

### Flujo Detallado del Release

```
[LOCAL] npm run release:create beta
  ↓
[LOCAL] Calcula: 1.0.0 → 1.0.1-beta
  ↓
[LOCAL] Bump package.json + git push
  ↓
[GITHUB] Dispara workflow `.github/workflows/release.yml`
  ↓
[GITHUB] Setup: Java 21 + Android SDK + Gradle
  ↓
[GITHUB] Build: vite build (React) → npx cap sync → ./gradlew assembleRelease
  ↓
[GITHUB] Firma: APK automáticamente (keystore en secrets)
  ↓
[GITHUB] Crea tag v1.0.1-beta + release con APK
  ↓
[LOCAL] Script monitorea workflow (15 min timeout)
  ↓
[LOCAL] Descarga APK desde release assets via GitHub API
  ↓
[LOCAL] Guarda en APK/v1.0.1-beta/
  ↓
[LOCAL] Crea INFO.txt + CHECKSUMS.txt
  ↓
[LOCAL] Actualiza README.md (badge + changelog)
  ↓
[LOCAL] Actualiza README_APK.md
  ↓
[LOCAL] Done ✅
```

---

## Ejemplo Paso a Paso

### Escenario: Primera release beta

```bash
$ npm run release:create beta

═══════════════════════════════════════
🚀 CREANDO RELEASE BETA
═══════════════════════════════════════

[1] Calculando versión...
    1.0.0 → 1.0.1-beta

[2] Confirmando...
    Tipo:     BETA
    Versión:  1.0.1-beta
    Archivo:  Inventariando-1.0.1-beta.apk
    Ubicación: APK/v1.0.1-beta/

[3] Disparando workflow en GitHub...
    ✅ Workflow disparado

[4] Monitoreando ejecución...
    Estado: queued...
    Estado: in_progress...
    Estado: in_progress...
    ✅ Workflow completado exitosamente

[RESULTADO]
✅ RELEASE CREADO EXITOSAMENTE

📦 El APK está disponible en:
   Local:   APK/v1.0.1-beta/
   GitHub:  https://github.com/LEO-UNAHUR/Inventariando/releases/tag/v1.0.1-beta

📱 Para instalar:
   1. Descarga desde GitHub Releases
   2. En Android: Configuración > Seguridad > Fuentes desconocidas
   3. Abre el APK

🎉 ¡Listo!
```

---

## Lo Importante

✅ **No tienes que recordar números de versión**
✅ **No tienes que hacer commits manualmente**
✅ **No tienes que crear tags**
✅ **No tienes que subir a GitHub**
✅ **No tienes que descargar APK manualmente desde web**
✅ **No tienes que actualizar documentación manualmente**
✅ **No tienes que nada excepto ejecutar UN comando**

Solo:
```bash
npm run release:create beta
```
o
```bash
npm run release:create stable
```

¡Y el sistema se encarga de TODO automáticamente!

---

## Cambios Recientes (Diciembre 2025)

### v1.1.0 - Release Automation Complete

**Nuevas Automatizaciones Agregadas:**

1. **✅ Descarga automática de APK desde GitHub Releases**
   - El script descarga el APK al completarse el workflow
   - Se guarda en `APK/v{version}/` para respaldo local
   - Incluye INFO.txt y CHECKSUMS.txt generados automáticamente

2. **✅ Actualización automática de README.md**
   - Badge de versión se actualiza tras cada release
   - Se agrega entrada de changelog con fecha
   - No requiere edición manual

3. **✅ Actualización automática de README_APK.md**
   - Estructura de directorios siempre actualizada
   - Información de descargas siempre correcta
   - Ideal para usuarios que instalan desde repos locales

4. **✅ Configuración correcta de autor en commits**
   - Todos los commits usan: `Leonardo Esteves <leoeze83@gmail.com>`
   - Configurado a nivel global y local de git
   - Los futuros commits respetarán esta configuración

**Resultado:** Sistema de release completamente autónomo sin intervención manual
