#!/usr/bin/env node

/**
 * SCRIPT MAESTRO DE RELEASES
 * 
 * Uso simple:
 *   node scripts/create-release.js beta
 *   node scripts/create-release.js stable
 * 
 * Hace TODO automáticamente:
 * 1. Calcula versión automáticamente
 * 2. Bumpa versión
 * 3. Dispara workflow en GitHub
 * 4. Espera a que termine
 * 5. Descarga APK
 * 6. Lo guarda en APK/{version}/
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

const log = {
  header: (msg) => console.log(`\n${colors.cyan}${colors.bold}═══════════════════════════════════════${colors.reset}\n${colors.blue}${msg}${colors.reset}\n${colors.cyan}═══════════════════════════════════════${colors.reset}\n`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ  ${msg}${colors.reset}`),
  step: (num, msg) => console.log(`${colors.cyan}[${num}]${colors.reset} ${msg}`),
};

const REPO_OWNER = 'LEO-UNAHUR';
const REPO_NAME = 'Inventariando';
const PROJECT_ROOT = path.join(__dirname, '..');
const PACKAGE_JSON = path.join(PROJECT_ROOT, 'package.json');

function parseVersion(versionString) {
  const match = versionString.match(/^(\d+)\.(\d+)\.(\d+)(?:-(.+))?$/);
  if (!match) {
    throw new Error(`Versión inválida: ${versionString}`);
  }
  return {
    major: parseInt(match[1], 10),
    minor: parseInt(match[2], 10),
    patch: parseInt(match[3], 10),
    prerelease: match[4] || null,
  };
}

function calculateNextVersion(releaseType) {
  const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf8'));
  const current = pkg.version;
  const parsed = parseVersion(current);

  let next;
  if (releaseType === 'beta') {
    // Si ya es beta, bumpa patch
    if (parsed.prerelease === 'beta') {
      next = `${parsed.major}.${parsed.minor}.${parsed.patch + 1}-beta`;
    } else {
      // Si es stable, bumpa minor
      next = `${parsed.major}.${parsed.minor + 1}.0-beta`;
    }
  } else if (releaseType === 'stable') {
    // Si es beta, quita el sufijo
    if (parsed.prerelease === 'beta') {
      next = `${parsed.major}.${parsed.minor}.${parsed.patch}`;
    } else {
      // Si ya es stable, bumpa patch
      next = `${parsed.major}.${parsed.minor}.${parsed.patch + 1}`;
    }
  } else {
    throw new Error(`Tipo de release inválido: ${releaseType}`);
  }

  return { current, next };
}

async function getGithubToken() {
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN;
  try {
    const ghToken = execSync('gh auth token', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    if (ghToken) return ghToken;
  } catch (err) {
    // fallthrough
  }
  return null;
}

async function triggerWorkflow(releaseType) {
  const token = await getGithubToken();
  if (!token) {
    log.error('No se pudo obtener token de GitHub');
    log.info('Solución: ejecuta "gh auth login"');
    process.exit(1);
  }

  const base = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`;
  const headers = {
    'Authorization': `token ${token}`,
    'Accept': 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
  };

  try {
    log.info('Obteniendo ID del workflow...');
    const wfResp = await fetch(`${base}/actions/workflows`, { headers });
    const wfJson = await wfResp.json();
    const wf = wfJson.workflows.find(w => w.path === '.github/workflows/release.yml');
    const workflowId = wf?.id || 'release.yml';

    log.info('Disparando workflow...');
    const payload = { ref: 'main', inputs: { release_type: releaseType } };
    const dispatchResp = await fetch(`${base}/actions/workflows/${workflowId}/dispatches`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!dispatchResp.ok) {
      throw new Error(`Dispatch failed: ${dispatchResp.status}`);
    }

    log.success('Workflow disparado');

    // Esperar y monitorear
    await new Promise(r => setTimeout(r, 5000));

    let runId = null;
    const start = Date.now();
    while (Date.now() - start < 90000 && !runId) {
      const runsResp = await fetch(`${base}/actions/workflows/${workflowId}/runs?per_page=1`, { headers });
      if (runsResp.ok) {
        const runsJson = await runsResp.json();
        const runs = runsJson.workflow_runs || [];
        if (runs.length > 0) {
          runId = runs[0].id;
          break;
        }
      }
      await new Promise(r => setTimeout(r, 5000));
    }

    if (!runId) {
      log.warning('No se detectó el workflow, pero fue disparado');
      return true;
    }

    log.info(`Monitoreando ejecución (Run #${runId})...`);

    // Esperar a que termine
    const timeoutMs = 15 * 60_000; // 15 minutos
    const startTime = Date.now();
    while (Date.now() - startTime < timeoutMs) {
      const runResp = await fetch(`${base}/actions/runs/${runId}`, { headers });
      if (runResp.ok) {
        const run = await runResp.json();
        if (run.status === 'completed') {
          if (run.conclusion === 'success') {
            log.success('✅ Workflow completado exitosamente');
            return true;
          } else {
            log.error(`Workflow finalizó con estado: ${run.conclusion}`);
            return false;
          }
        }
        log.info(`Estado: ${run.status}...`);
      }
      await new Promise(r => setTimeout(r, 10000));
    }

    log.error('Tiempo de espera agotado');
    return false;
  } catch (error) {
    log.error(`Error: ${error.message}`);
    return false;
  }
}

async function downloadAndCopyAPK(version) {
  try {
    const token = await getGithubToken();
    const headers = token ? { 'Authorization': `token ${token}` } : {};

    const base = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`;
    const releaseResp = await fetch(`${base}/releases/tags/v${version}`, { headers });

    if (!releaseResp.ok) {
      log.warning(`No se pudo descargar el APK automáticamente (Release no encontrada aún)`);
      return;
    }

    const release = await releaseResp.json();
    const apkAsset = release.assets?.find(a => a.name.endsWith('.apk'));

    if (!apkAsset) {
      log.warning('No se encontró APK en los assets del release');
      return;
    }

    // Crear carpeta local
    const apkDir = path.join(PROJECT_ROOT, 'APK', `v${version}`);
    if (!fs.existsSync(apkDir)) {
      fs.mkdirSync(apkDir, { recursive: true });
    }

    // Descargar APK
    const apkPath = path.join(apkDir, apkAsset.name);
    log.info(`Descargando ${apkAsset.name}...`);

    const fileResp = await fetch(apkAsset.browser_download_url);
    const buffer = await fileResp.arrayBuffer();
    fs.writeFileSync(apkPath, Buffer.from(buffer));

    log.success(`APK guardado en: ${apkDir}`);

    // Generar CHECKSUMS.txt con SHA256 para integridad
    const hash = crypto.createHash('sha256');
    hash.update(fs.readFileSync(apkPath));
    const checksum = hash.digest('hex');
    const checksumPath = path.join(apkDir, 'CHECKSUMS.txt');
    fs.writeFileSync(checksumPath, `${checksum}  ${apkAsset.name}\n`);
    log.success('CHECKSUMS.txt generado');

    // Crear archivo INFO.txt
    const infoPath = path.join(apkDir, 'INFO.txt');
    const infoContent = `Inventariando v${version}
Fecha: ${new Date().toISOString().split('T')[0]}
Archivo: ${apkAsset.name}
Tamaño: ${(apkAsset.size / 1024 / 1024).toFixed(2)} MB
Descargado desde: https://github.com/${REPO_OWNER}/${REPO_NAME}/releases/tag/v${version}

Requisitos:
- Android 6.0 o superior
- Mínimo 100 MB de espacio libre

Instalación:
1. Habilita "Fuentes desconocidas" en Configuración > Seguridad
2. Abre el archivo APK
3. Sigue las instrucciones en pantalla

Verificación:
- Ejecuta: sha256sum ${apkAsset.name}
- Compara con CHECKSUMS.txt
`;
    fs.writeFileSync(infoPath, infoContent);
    log.success('INFO.txt creado');
  } catch (error) {
    log.warning(`Error descargando APK: ${error.message}`);
  }
}

function updateReadme(releaseType, version) {
  try {
    const readmePath = path.join(PROJECT_ROOT, 'README.md');
    let content = fs.readFileSync(readmePath, 'utf8');

    // Encontrar la sección de versión y actualizar
    const versionRegex = /## \[\d+\.\d+\.\d+(-\w+)?\] - \d{4}-\d{2}-\d{2}/;
    const today = new Date().toISOString().split('T')[0];
    const newVersionEntry = `## [${version}] - ${today}`;

    // Si existe una sección de versión, actualizar la más reciente
    if (versionRegex.test(content)) {
      content = content.replace(versionRegex, newVersionEntry);
    } else {
      // Insertar después del título del proyecto
      const insertPoint = content.indexOf('\n---\n');
      if (insertPoint > 0) {
        content = content.slice(0, insertPoint + 5) + `\n\n${newVersionEntry}\n\n### Changed\n- Release automático via GitHub Actions\n- APK generado y firmado correctamente\n- Documentación actualizada automáticamente\n` + content.slice(insertPoint + 5);
      }
    }

    // Actualizar la versión del badge
    content = content.replace(
      /!\[Version\]\(.*?\)/,
      `![Version](https://img.shields.io/badge/version-${version}-blue?style=for-the-badge&logo=appveyor)`
    );

    fs.writeFileSync(readmePath, content);
    log.success('README.md actualizado');
  } catch (error) {
    log.warning(`Error actualizando README: ${error.message}`);
  }
}

function updateAPKReadme(version) {
  try {
    const apkReadmePath = path.join(PROJECT_ROOT, 'APK', 'README_APK.md');
    let content = fs.readFileSync(apkReadmePath, 'utf8');

    // Actualizar la tabla de estructura
    const newEntry = `├── v${version}/
│   ├── Inventariando-${version}.apk
│   ├── INFO.txt
│   └── CHECKSUMS.txt`;

    const structureRegex = /├── v[\d.]+-?[\w]*\/[\s\S]*?(?=├──|└──|\n\n)/;

    if (structureRegex.test(content)) {
      content = content.replace(structureRegex, newEntry + '\n');
    }

    // Agregar nota de última versión
    const noteRegex = /## Descarga[\s\S]*?(?=## Verificación)/;
    const newNote = `## Descarga

Los APK se generan automáticamente en cada release y están disponibles en:
- **GitHub Releases**: https://github.com/${REPO_OWNER}/${REPO_NAME}/releases
- **Carpeta local**: \`APK/v${version}/\`

## Verificación`;

    if (noteRegex.test(content)) {
      content = content.replace(noteRegex, newNote + '\n\n');
    }

    fs.writeFileSync(apkReadmePath, content);
    log.success('README_APK.md actualizado');
  } catch (error) {
    log.warning(`Error actualizando README_APK: ${error.message}`);
  }
}

function updatePackageJsonVersion(version) {
  try {
    const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf8'));
    pkg.version = version;
    fs.writeFileSync(PACKAGE_JSON, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
    log.success(`package.json actualizado a ${version}`);
  } catch (error) {
    log.warning(`Error actualizando package.json: ${error.message}`);
  }
}

function updateChangelog(version, releaseType) {
  try {
    const changelogPath = path.join(PROJECT_ROOT, 'CHANGELOG.md');
    const today = new Date().toISOString().split('T')[0];
    const entry = `## [${version}] - ${today}\n\n### ${releaseType === 'beta' ? 'Changed' : 'Added'}\n- Release ${releaseType}\n\n`;

    let content = '';
    if (fs.existsSync(changelogPath)) {
      content = fs.readFileSync(changelogPath, 'utf8');
    }

    // Prepend nueva entrada si no existe
    if (!content.startsWith(entry)) {
      content = entry + content;
    }

    fs.writeFileSync(changelogPath, content, 'utf8');
    log.success('CHANGELOG.md actualizado');
  } catch (error) {
    log.warning(`Error actualizando CHANGELOG: ${error.message}`);
  }
}

function commitAndPushDocs(version) {
  try {
    execSync('git add README.md CHANGELOG.md package.json docs APK', { stdio: 'inherit' });
    execSync(`git commit -m "chore: docs for v${version}"`, { stdio: 'inherit' });
    execSync('git push origin main', { stdio: 'inherit' });
    log.success('Documentación commiteada y pusheada');
  } catch (error) {
    log.warning(`No se pudo commitear/pushear automáticamente: ${error.message}`);
  }
}

function generateVersionDocument(version, releaseType) {
  try {
    const pkgJson = JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf8'));
    const today = new Date().toISOString().split('T')[0];
    
    // Información del stack
    const stack = {
      react: pkgJson.dependencies.react || 'N/A',
      vite: pkgJson.devDependencies.vite || 'N/A',
      capacitor: pkgJson.dependencies['@capacitor/core'] || 'N/A',
      tailwind: pkgJson.devDependencies.tailwindcss || 'N/A',
      gemini: pkgJson.dependencies['@google/generative-ai'] || 'N/A',
    };

    const content = `# Inventariando v${version} - ${releaseType === 'beta' ? 'BETA' : 'STABLE'}

**Fecha**: ${today}  
**Tipo**: ${releaseType === 'beta' ? 'Beta (Pre-release)' : 'Stable (Release)'}  
**Desarrollador**: Leonardo Esteves

---

## 📊 Información General

| Propiedad | Valor |
|-----------|-------|
| **Versión** | ${version} |
| **Estado** | ${releaseType === 'beta' ? '🧪 En pruebas' : '✅ Estable'} |
| **Plataforma** | Android 6.0+ |
| **Descarga** | [GitHub Releases](https://github.com/${REPO_OWNER}/${REPO_NAME}/releases/tag/v${version}) |

---

## 🛠️ Stack Tecnológico

\`\`\`
Frontend:
  • React ${stack.react}
  • Vite ${stack.vite}
  • Tailwind CSS ${stack.tailwind}

Mobile:
  • Capacitor ${stack.capacitor}
  • Gradle 8.14
  • Android SDK (Nivel 36)

IA:
  • Google Gemini AI ${stack.gemini}

Base de Datos:
  • LocalStorage (Almacenamiento local)
  • PWA (Offline-first)
\`\`\`

---

## ✨ Características Principales

### 🤖 Inteligencia Artificial
- Asistente Gemini integrado
- Sugerencias automáticas de precios
- Predicción de tendencias de compra
- Análisis de inventario inteligente

### 📈 Gestión Financiera
- Escudo anti-inflación (re-ajuste masivo de precios)
- Cálculo de márgenes de rentabilidad
- Análisis de ganancia latente
- Reportes de caja en tiempo real

### 🛒 Punto de Venta (POS)
- Escaneo de códigos de barras
- Soporte para cuenta corriente (Fiado)
- Múltiples métodos de pago (Efectivo, QR, Transferencia)
- Selectores fiscales (Factura A/B/C)

### 📊 Inteligencia de Negocio
- Dashboard interactivo
- Métricas en tiempo real
- Productos de alta rotación
- Alertas de stock bajo

### 🔐 Seguridad
- RBAC (Admin, Encargado, Vendedor)
- PINs de acceso rápido
- Simulación de 2FA
- Control de sesiones activas

### ☁️ Almacenamiento
- Importación/Exportación (JSON/CSV)
- Puntos de restauración automáticos
- Sincronización local

---

## 🔄 Cambios en Esta Versión

${releaseType === 'beta' ? `
### Beta v${version}
- Primera versión beta del ciclo ${version.split('.')[0]}.${version.split('.')[1]}
- Enfoque en validación con usuarios finales
- Reporte de bugs y mejoras de UX
- Pruebas de estabilidad en ambiente real
` : `
### Stable v${version}
- Release estable completamente testeada
- Fixes de bugs encontrados en beta
- Optimizaciones de performance
- Documentación actualizada
`}

---

## 📱 Instalación

### Android
1. Descarga el APK desde [GitHub Releases](https://github.com/${REPO_OWNER}/${REPO_NAME}/releases/tag/v${version})
2. Habilita "Fuentes desconocidas" en Configuración > Seguridad
3. Abre el archivo y sigue las instrucciones

### Web (PWA)
- Compatible con cualquier navegador moderno
- Instalable como app nativa en Android

---

## 📋 Requisitos Técnicos

- **Android**: 6.0 o superior
- **RAM**: Mínimo 2 GB (recomendado 4 GB)
- **Espacio**: 100 MB libres
- **Internet**: Requerido para funciones de IA (Gemini)

---

## 🚀 Roadmap Próximas Versiones

- [ ] Sincronización multi-dispositivo (Cloud)
- [ ] Exportación de facturas a PDF
- [ ] Analytics avanzado
- [ ] Programa piloto con comercios reales
- [ ] Integración con sistemas bancarios

---

## 🐛 Reporte de Bugs

Si encuentras algún problema, reporta en:
- **GitHub Issues**: https://github.com/${REPO_OWNER}/${REPO_NAME}/issues
- **Email**: leonardo@inventariando.app

---

## 📝 Licencia

Distribuido bajo licencia MIT. Ver [LICENSE](https://github.com/${REPO_OWNER}/${REPO_NAME}/blob/main/LICENSE) para detalles.

---

**Desarrollado con ❤️ y 🧉 en Argentina**
`;

    // Guardar en la carpeta correspondiente
    const folder = releaseType === 'beta' ? 'product beta' : 'product stable';
    const docDir = path.join(PROJECT_ROOT, 'docs', folder);
    
    if (!fs.existsSync(docDir)) {
      fs.mkdirSync(docDir, { recursive: true });
    }

    const docPath = path.join(docDir, `v${version}.md`);
    fs.writeFileSync(docPath, content);
    
    log.success(`Documento de versión generado: docs/${folder}/v${version}.md`);
  } catch (error) {
    log.warning(`Error generando documento de versión: ${error.message}`);
  }
}

async function main() {
  const releaseType = process.argv[2];

  if (!releaseType || !['beta', 'stable'].includes(releaseType)) {
    log.error('Uso: node scripts/create-release.js [beta|stable]');
    log.info('Ejemplo: node scripts/create-release.js beta');
    process.exit(1);
  }

  log.header(`🚀 CREANDO RELEASE ${releaseType.toUpperCase()}`);

  try {
    // 1. Calcular versión
    log.step(1, 'Calculando versión...');
    const { current, next } = calculateNextVersion(releaseType);
    log.info(`${current} → ${next}`);

    // 2. Confirmar
    log.step(2, 'Confirmando...');
    console.log(`
${colors.bold}Resumen:${colors.reset}
  Tipo:     ${colors.yellow}${releaseType.toUpperCase()}${colors.reset}
  Versión:  ${colors.green}${next}${colors.reset}
  Archivo:  ${colors.cyan}Inventariando-${next}.apk${colors.reset}
  Ubicación: ${colors.cyan}APK/v${next}/${colors.reset}
    `);

    // 3. Disparar workflow
    log.step(3, 'Disparando workflow en GitHub...');
    const success = await triggerWorkflow(releaseType);

    if (!success) {
      log.error('El workflow no se completó correctamente');
      process.exit(1);
    }

    // 4. Descargar APK desde GitHub Releases y copiar a carpeta local
    log.step(4, 'Descargando APK desde GitHub Releases...');
    await downloadAndCopyAPK(next);

    // 5. Sincronizar versión y changelog locales
    log.step(5, 'Sincronizando versión local y changelog...');
    updatePackageJsonVersion(next);
    updateChangelog(next, releaseType);

    // 6. Actualizar documentación
    log.step(6, 'Actualizando documentación...');
    updateReadme(releaseType, next);
    updateAPKReadme(next);
    generateVersionDocument(next, releaseType);

    // 7. Commit y push de la documentación
    log.step(7, 'Publicando documentación...');
    commitAndPushDocs(next);

     // 8. Éxito
     log.step(8, 'Proceso completado');
     console.log(`
  ${colors.green}${colors.bold}✅ RELEASE CREADO EXITOSAMENTE${colors.reset}

  ${colors.cyan}📦 El APK está disponible en:${colors.reset}
    Local:   ${colors.bold}APK/v${next}/${colors.reset}
    GitHub:  ${colors.bold}https://github.com/${REPO_OWNER}/${REPO_NAME}/releases/tag/v${next}${colors.reset}

  ${colors.cyan}📚 Documentación de versión:${colors.reset}
    ${colors.bold}docs/${releaseType === 'beta' ? 'product beta' : 'product stable'}/v${next}.md${colors.reset}

  ${colors.cyan}📱 Para instalar:${colors.reset}
    1. Descarga desde GitHub Releases o carpeta local APK/v${next}/
    2. En Android: Configuración > Seguridad > Fuentes desconocidas
    3. Abre el APK

  ${colors.cyan}🎉 ¡Listo!${colors.reset}
     `);

    process.exit(0);
  } catch (error) {
    log.error(error.message);
    process.exit(1);
  }
}

main();
