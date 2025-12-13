# APK Releases

Carpeta para almacenar releases de APK versionados de Inventariando.

## Estructura

```
APK/
├── v1.1.0-beta/
│   ├── Inventariando-1.1.0-beta.apk
│   ├── Inventariando-1.1.0-beta.aab
│   ├── INFO.txt
│   └── CHECKSUMS.txt
├── v1.1.0/
│   ├── Inventariando-1.1.0.apk
│   ├── INFO.txt
│   └── CHECKSUMS.txt
└── README.md
```

## Descarga

Los APK se generan automáticamente en cada release y están disponibles en:
- **GitHub Releases**: https://github.com/LEO-UNAHUR/Inventariando/releases
- **Carpeta local**: `APK/v[version]/`

## Verificación de Integridad

Cada APK incluye un archivo `CHECKSUMS.txt` con el hash SHA256. Para verificar:

```bash
sha256sum Inventariando-1.1.0.apk
# Comparar con el valor en CHECKSUMS.txt
```

## Instalación

1. Descarga el `.apk` más reciente
2. Habilita "Fuentes desconocidas" en tu teléfono
3. Abre el archivo y sigue las instrucciones

---

*Los APK se generan automáticamente mediante GitHub Actions*
