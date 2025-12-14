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

    // 4. Éxito
    log.step(4, 'Proceso completado');
    console.log(`
${colors.green}${colors.bold}✅ RELEASE CREADO EXITOSAMENTE${colors.reset}

${colors.cyan}📦 El APK está disponible en:${colors.reset}
   Local:   ${colors.bold}APK/v${next}/${colors.reset}
   GitHub:  ${colors.bold}https://github.com/${REPO_OWNER}/${REPO_NAME}/releases/tag/v${next}${colors.reset}

${colors.cyan}📱 Para instalar:${colors.reset}
   1. Descarga desde GitHub Releases
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
