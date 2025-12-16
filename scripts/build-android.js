#!/usr/bin/env node

import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

// Este script compila el APK Android en modo Release por defecto.
// Para builds locales firmados asegúrate de tener configurado:
// - android/app/keystore.jks (o proveer ANDROID_KEYSTORE_BASE64)
// - local.properties con sdk.dir o tener ANDROID_SDK_ROOT en el entorno
// En CI se usan secretos: ANDROID_KEYSTORE_BASE64, ANDROID_KEYSTORE_PASSWORD,
// ANDROID_KEY_ALIAS, ANDROID_KEY_PASSWORD. El workflow decodifica el keystore
// y pasa propiedades a Gradle para firmar el APK.

const androidDir = path.resolve(process.cwd(), 'android');
const isWindows = process.platform === 'win32';
const gradleCommand = isWindows ? 'gradlew.bat' : './gradlew';

const buildType = process.env.BUILD_TYPE || 'Release'; // 'Debug' or 'Release'
const task = `assemble${buildType}`; // assembleRelease or assembleDebug

console.log(`Ejecutando ${gradleCommand} ${task} en ${androidDir}`);

try {
  execSync(`${gradleCommand} ${task}`, {
    cwd: androidDir,
    stdio: 'inherit'
  });
  console.log('APK compilado correctamente. Revisa android/app/build/outputs/apk/');
} catch (err) {
  console.error('Error compilando APK:', err.message);
  process.exit(1);
}
