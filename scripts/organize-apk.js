#!/usr/bin/env node

/**
 * Script para organizar APK generados en estructura versionada
 * Crea carpeta APK/v[version]/ y copia archivos
 * 
 * Uso: npm run release:build (llamado automáticamente)
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function organizeAPK() {
  try {
    // 1. Leer versión del package.json
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8')
    );
    const version = packageJson.version;
    
    console.log(`📦 Organizando APK para versión: ${version}`);
    
    // 2. Paths
    const projectRoot = path.join(__dirname, '..');
    const apkDir = path.join(projectRoot, 'APK');
    const versionDir = path.join(apkDir, `v${version}`);
    const androidReleaseDir = path.join(
      projectRoot,
      'android/app/build/outputs/bundle/release'
    );
    
    // 3. Crear carpeta de versión si no existe
    if (!fs.existsSync(apkDir)) {
      fs.mkdirSync(apkDir, { recursive: true });
      console.log(`📁 Carpeta APK creada`);
    }
    
    if (!fs.existsSync(versionDir)) {
      fs.mkdirSync(versionDir, { recursive: true });
      console.log(`📁 Carpeta v${version} creada`);
    }
    
    // 4. Buscar APK/AAB generado
    let apkPath = null;
    let aabPath = null;
    
    // Buscar en la estructura de Android
    const searchPaths = [
      path.join(projectRoot, 'android/app/build/outputs/apk/release'),
      path.join(projectRoot, 'android/app/build/outputs/bundle/release'),
      androidReleaseDir
    ];
    
    for (const searchPath of searchPaths) {
      if (fs.existsSync(searchPath)) {
        const files = fs.readdirSync(searchPath);
        
        const apk = files.find(f => f.endsWith('.apk'));
        if (apk) {
          apkPath = path.join(searchPath, apk);
          console.log(`✓ APK encontrado: ${apk}`);
        }
        
        const aab = files.find(f => f.endsWith('.aab'));
        if (aab) {
          aabPath = path.join(searchPath, aab);
          console.log(`✓ AAB encontrado: ${aab}`);
        }
        
        if (apkPath || aabPath) break;
      }
    }
    
    if (!apkPath && !aabPath) {
      console.warn('⚠️  No se encontró APK/AAB. Puede ser primera build o ruta diferente.');
      console.log('   Los archivos se buscarían manualmente en android/app/build/outputs/');
      process.exit(0);
    }
    
    // 5. Copiar archivos a la carpeta versionada
    if (apkPath) {
      const destFileName = `Inventariando-${version}.apk`;
      const destPath = path.join(versionDir, destFileName);
      fs.copyFileSync(apkPath, destPath);
      console.log(`📦 APK copiado a: ${destPath}`);
    }
    
    if (aabPath) {
      const destFileName = `Inventariando-${version}.aab`;
      const destPath = path.join(versionDir, destFileName);
      fs.copyFileSync(aabPath, destPath);
      console.log(`📦 AAB copiado a: ${destPath}`);
    }
    
    // 6. Crear archivo INFO.txt con metadata
    const infoContent = `Inventariando v${version}
=====================================
Fecha de Build: ${new Date().toISOString()}
Descripción: Gestión de inventario y POS inteligente para PyMEs argentinas

INSTRUCCIONES DE INSTALACIÓN (Android):
1. Descarga el archivo .apk
2. Permite instalaciones desde fuentes desconocidas en Configuración > Seguridad
3. Abre el archivo APK y sigue las instrucciones

COMPATIBILIDAD:
- Android 6.0+
- Requiere conexión a internet (sincronización) pero funciona offline

CAMBIOS EN ESTA VERSIÓN:
- Consulta el CHANGELOG.md o releases en GitHub

=====================================
Repositorio: https://github.com/LEO-UNAHUR/Inventariando
`;
    
    fs.writeFileSync(path.join(versionDir, 'INFO.txt'), infoContent, 'utf8');
    console.log(`📝 INFO.txt creado`);
    
    // 7. Crear archivo CHECKSUMS.txt para verificación
    if (apkPath) {
      const fileBuffer = fs.readFileSync(path.join(versionDir, `Inventariando-${version}.apk`));
      const hashSum = crypto.createHash('sha256');
      hashSum.update(fileBuffer);
      const sha256 = hashSum.digest('hex');
      
      const checksumContent = `SHA256: ${sha256}`;
      fs.writeFileSync(path.join(versionDir, 'CHECKSUMS.txt'), checksumContent, 'utf8');
      console.log(`🔐 CHECKSUMS.txt creado`);
    }
    
    console.log(`✅ APK organizado exitosamente en: APK/v${version}/`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

organizeAPK();
