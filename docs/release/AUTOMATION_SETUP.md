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
[3] Genera el APK firmado (Inventariando-1.0.1-beta.apk)
    ↓
[4] Guarda en APK/v1.0.1-beta/
    ↓
[5] Crea release en GitHub
    ↓
[6] Sube APK como asset
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
├── Inventariando-1.0.1-beta.apk     ← El APK para instalar
├── INFO.txt                           ← Instrucciones
└── CHECKSUMS.txt                      ← Verificación
```

El APK está disponible en:
- **Local**: `APK/v{version}/`
- **GitHub**: https://github.com/LEO-UNAHUR/Inventariando/releases

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

- **Script**: `scripts/create-release.js`
- **Workflow**: `.github/workflows/release.yml`
- **Plataforma**: Android (Capacitor 8.0)
- **Firma**: Keystore generado dinámicamente en GitHub Actions
- **Almacenamiento**: GitHub Releases + Carpeta local APK/

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
✅ **No tienes que hacer nada excepto ejecutar UN comando**

Solo:
```bash
npm run release:create beta
```
o
```bash
npm run release:create stable
```

¡Y listo!
