#!/usr/bin/env node

import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

// Este script compila el APK Android en modo Release por defecto.
// Antes de ejecutar Gradle parcheamos el módulo capacitor-cordova-android-plugins
// para asegurarnos de que expone una variante `release` consumible por AGP 8.

const androidDir = path.resolve(process.cwd(), 'android');
const pluginsGradlePath = path.resolve(
  androidDir,
  'capacitor-cordova-android-plugins',
  'build.gradle'
);
const isWindows = process.platform === 'win32';
const gradleCommand = isWindows ? 'gradlew.bat' : './gradlew';

const buildType = process.env.BUILD_TYPE || 'Release'; // 'Debug' or 'Release'
const task = `assemble${buildType}`; // assembleRelease or assembleDebug

ensureCordovaPluginsGradle();

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

function ensureCordovaPluginsGradle() {
  if (!fs.existsSync(pluginsGradlePath)) {
    console.warn(
      `No se encontró ${pluginsGradlePath}. Si el directorio no existe, ejecuta npx cap sync android.`
    );
    return;
  }

  const expected = `apply plugin: 'com.android.library'
apply plugin: 'maven-publish'

android {
    namespace "com.inventariando.capacitorcordova"
    compileSdkVersion rootProject.ext.compileSdkVersion
    defaultConfig {
        minSdkVersion rootProject.ext.minSdkVersion
        targetSdkVersion rootProject.ext.targetSdkVersion
    }
    lintOptions {
        abortOnError false
    }
    buildTypes {
        debug {
        }
        release {
        }
    }
    // no publishing block here; publications will be declared afterEvaluate
}

  // Crear publicación Maven consumible para la variante release (AGP compatible)
  publishing {
    publications {
      release(MavenPublication) {
        afterEvaluate {
          from components.release
        }
      }
    }
  }

dependencies {
    implementation fileTree(dir: 'src/main/libs', include: ['*.jar'])
}
`;

  const current = fs.readFileSync(pluginsGradlePath, 'utf8');
  if (current.trim() === expected.trim()) {
    return;
  }

  fs.writeFileSync(pluginsGradlePath, expected, 'utf8');
  console.log('Patcheado capacitor-cordova-android-plugins/build.gradle para exponer variante release.');
}
