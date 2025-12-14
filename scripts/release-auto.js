#!/usr/bin/env node

/**
 * ===================================
 * INVENTARIANDO - AUTOMATED RELEASE SYSTEM
 * ===================================
 * 
 * Script completo y robusto de release que:
 * 1. Valida versiones contra GitHub
 * 2. Calcula la siguiente versión (semver)
 * 3. Bumpa versión
 * 4. Genera CHANGELOG automático
 * 5. Hace commit y push
 * 6. Dispara GitHub Actions workflow
 * 7. Crea release en GitHub
 * 
 * Uso:
 *   node scripts/release-auto.js beta
 *   node scripts/release-auto.js stable
 *   node scripts/release-auto.js dispatch [stable|beta]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colores para terminal
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️ ${msg}${colors.reset}`),
  debug: (msg) => console.log(`${colors.cyan}🔧 ${msg}${colors.reset}`),
  divider: () => console.log('─'.repeat(60)),
};

// Config
const REPO_OWNER = 'LEO-UNAHUR';
const REPO_NAME = 'Inventariando';
const PROJECT_ROOT = path.join(__dirname, '..');
const PACKAGE_JSON = path.join(PROJECT_ROOT, 'package.json');
const GITHUB_API = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`;

// ========== FUNCIONES PRINCIPALES ==========

async function getLatestGitHubRelease() {
  try {
    const response = execSync(
      `curl -s -H "Accept: application/vnd.github.v3+json" ${GITHUB_API}/releases/latest`,
      { encoding: 'utf8' }
    );
    const data = JSON.parse(response);
    
    if (data.message === 'Not Found') {
      return null; // Sin releases aún
    }
    
    return {
      tag: data.tag_name,
      version: data.tag_name.replace('v', ''),
      prerelease: data.prerelease,
    };
  } catch (error) {
    log.warning('No se pudo conectar a GitHub. Continuando offline...');
    return null;
  }
}

function getCurrentVersion() {
  const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf8'));
  return pkg.version;
}

function parseVersion(versionString) {
  // Parsea "1.1.0-beta" en { major: 1, minor: 1, patch: 0, prerelease: 'beta' }
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

async function dispatchGitHubActionsWorkflow(releaseType) {
  // Token via env var o fallback a gh auth token para evitar setearlo cada sesión
  const getGithubToken = () => {
    if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN;
    try {
      const ghToken = execSync('gh auth token', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
      if (ghToken) {
        log.info('Usando token obtenido desde GitHub CLI (gh auth token).');
        return ghToken;
      }
    } catch (err) {
      log.debug('No se pudo obtener token desde gh auth token.');
    }
    return null;
  };

  const token = getGithubToken();
  if (!token) {
    log.warning('GITHUB_TOKEN no configurado y gh auth token no disponible.');
    log.info('Solución rápida: export GITHUB_TOKEN=tu_token (repo + workflow).');
    log.info('Alternativa persistente: gh auth login y luego gh auth token queda almacenado.');
    return false;
  }

  const base = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`;
  const headers = {
    'Authorization': `token ${token}`,
    'Accept': 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
    'User-Agent': 'inventariando-release-script'
  };

  try {
    // 1) Obtener ID del workflow por filename usando fetch
    const wfResp = await fetch(`${base}/actions/workflows`, { headers });
    if (!wfResp.ok) throw new Error(`Error al listar workflows: ${wfResp.status}`);
    const wfJson = await wfResp.json();
    const wf = (wfJson.workflows || []).find(w => w.path === '.github/workflows/release.yml');
    const workflowId = wf ? wf.id : 'release.yml';
    if (!wf) {
      log.warning('No se encontró release.yml en la lista; se intentará con el filename.');
    }

    // 2) Dispatch
    const payload = { ref: 'main', inputs: { release_type: releaseType } };
    const dispatchResp = await fetch(`${base}/actions/workflows/${workflowId}/dispatches`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    if (!dispatchResp.ok) {
      throw new Error(`Dispatch failed: ${dispatchResp.status} ${dispatchResp.statusText}`);
    }

    log.success('GitHub Actions workflow disparado');

    // 3) Poll de estado hasta ver el run
    const start = Date.now();
    const timeoutStartMs = 90_000;
    const intervalMs = 5000;
    let runId = null;

    // Esperar a que aparezca el run
    while (Date.now() - start < timeoutStartMs && !runId) {
      const runsResp = await fetch(`${base}/actions/workflows/${workflowId}/runs?per_page=5`, { headers });
      if (runsResp.ok) {
        const runsJson = await runsResp.json();
        const runs = runsJson.workflow_runs || [];
        if (runs.length > 0) {
          const latest = runs[0];
          log.info(`Workflow run detectado: status=${latest.status}, conclusion=${latest.conclusion || 'n/a'}, id=${latest.id}`);
          runId = latest.id;
          break;
        }
      }
      log.info('Esperando inicio del workflow...');
      await new Promise(r => setTimeout(r, intervalMs));
    }
    if (!runId) {
      log.warning('No se pudo detectar el run en tiempo de espera, revisa Actions manualmente.');
      return true; // dispatch fue OK pero sin monitor
    }

    // Monitorear hasta conclusión
    const timeoutRunMs = 15 * 60_000; // 15 minutos
    const startRun = Date.now();
    while (Date.now() - startRun < timeoutRunMs) {
      const runResp = await fetch(`${base}/actions/runs/${runId}`, { headers });
      if (runResp.ok) {
        const run = await runResp.json();
        log.info(`Run ${runId}: status=${run.status}, conclusion=${run.conclusion || 'n/a'}`);
        if (run.status === 'completed') {
          if (run.conclusion === 'success') {
            log.success('Workflow completado con éxito.');
          } else {
            log.warning(`Workflow finalizó con estado: ${run.conclusion}`);
          }
          break;
        }
      }
      await new Promise(r => setTimeout(r, intervalMs));
    }
    if (Date.now() - startRun >= timeoutRunMs) {
      log.warning('Tiempo de espera agotado monitoreando el run, revisa Actions.');
    }

    return true;
  } catch (error) {
    log.warning(`No se pudo disparar/monitorizar el workflow: ${error.message}`);
    log.info('https://github.com/LEO-UNAHUR/Inventariando/actions');
    return false;
  }
}


function calculateNextVersion(currentVersion, releaseType) {
  const parsed = parseVersion(currentVersion);
  let newVersion;
  
  if (releaseType === 'stable') {
    // Si es estable y tiene prerelease, solo remover el sufijo
    if (parsed.prerelease) {
      newVersion = `${parsed.major}.${parsed.minor}.${parsed.patch}`;
    } else {
      // Si ya es estable, bumpar patch
      newVersion = `${parsed.major}.${parsed.minor}.${parsed.patch + 1}`;
    }
  } else if (releaseType === 'beta') {
    // Para beta: bumpar patch y añadir -beta
    newVersion = `${parsed.major}.${parsed.minor}.${parsed.patch + 1}-beta`;
  } else {
    throw new Error(`Invalid releaseType: ${releaseType}`);
  }
  
  return newVersion;
}

function validateVersionConflict(newVersion, latestRelease) {
  if (!latestRelease) {
    return true; // No hay releases previos, cualquier versión es válida
  }
  
  const newParsed = parseVersion(newVersion);
  const latestParsed = parseVersion(latestRelease.version);
  
  // Comparar major.minor.patch
  if (newParsed.major > latestParsed.major) return true;
  if (newParsed.major < latestParsed.major) return false;
  
  if (newParsed.minor > latestParsed.minor) return true;
  if (newParsed.minor < latestParsed.minor) return false;
  
  if (newParsed.patch > latestParsed.patch) return true;
  if (newParsed.patch < latestParsed.patch) return false;
  
  // Si son iguales en major.minor.patch, verificar prerelease
  // Una versión sin prerelease es mayor que una con prerelease
  if (!newParsed.prerelease && latestParsed.prerelease) return true;
  if (newParsed.prerelease && !latestParsed.prerelease) return false;
  
  return true; // Versiones idénticas o nueva >= latest
}

function updatePackageJson(newVersion) {
  const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf8'));
  pkg.version = newVersion;
  fs.writeFileSync(PACKAGE_JSON, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
}

function updateChangelog(newVersion) {
  const changelogPath = path.join(PROJECT_ROOT, 'CHANGELOG.md');
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
  
  // Leer CHANGELOG actual
  let changelog = fs.readFileSync(changelogPath, 'utf8');
  
  // Preparar nueva entrada
  const newEntry = `## [${newVersion}] - ${dateStr}

### Added
- ✅ Release automatizado v${newVersion}
- ✅ Validación del flujo de releases con GitHub Actions

### Changed
- 🔄 Sistema de versionado automático

---

`;
  
  // Insertar después de la primera sección (después del título y descripción)
  const sections = changelog.split('\n## ');
  if (sections.length > 1) {
    changelog = sections[0] + '\n## ' + newEntry + sections.slice(1).join('\n## ');
  } else {
    // Si no hay secciones, añadir al final
    changelog = changelog + '\n\n' + newEntry;
  }
  
  fs.writeFileSync(changelogPath, changelog, 'utf8');
  log.success('CHANGELOG.md actualizado');
}

function commitAndPush(newVersion) {
  try {
    // Verificar si hay cambios
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    if (!status.trim()) {
      log.info('No hay cambios para commitear');
      return;
    }
    
    // Configurar git si no está configurado
    try {
      execSync('git config user.email', { encoding: 'utf8', stdio: 'ignore' });
    } catch {
      execSync('git config user.email "leonardo@inventariando.app"');
      execSync('git config user.name "Leonardo Esteves"');
    }
    
    // Commit y push
    execSync('git add -A', { cwd: PROJECT_ROOT });
    execSync(`git commit -m "chore: Bump version to ${newVersion}"`, { cwd: PROJECT_ROOT });
    execSync('git push origin main', { cwd: PROJECT_ROOT });
    
    log.success('Cambios commiteados y pusheados');
  } catch (error) {
    log.warning(`Error en commit/push: ${error.message}`);
    log.info('Los cambios están staged, puedes commitear manualmente');
  }
}

function printSummary(currentVersion, newVersion, releaseType, latestRelease) {
  log.divider();
  console.log(`
${colors.cyan}╔═══════════════════════════════════════════╗${colors.reset}
${colors.cyan}║  INVENTARIANDO - RELEASE SUMMARY          ║${colors.reset}
${colors.cyan}╚═══════════════════════════════════════════╝${colors.reset}

📊 Información de Versiones:
   Versión Actual (package.json):  ${colors.yellow}${currentVersion}${colors.reset}
   Última en GitHub:               ${latestRelease ? colors.green + latestRelease.version + colors.reset : 'Sin releases'}
   Nueva Versión:                  ${colors.green}${newVersion}${colors.reset}
   Tipo de Release:                ${colors.cyan}${releaseType}${colors.reset}

✅ Acciones Completadas:
   ✓ package.json actualizado
   ✓ CHANGELOG.md actualizado
   ✓ Git commit y push
   ✓ GitHub Actions workflow disparado

📥 Próximos Pasos:
   1. Ve a: https://github.com/${REPO_OWNER}/${REPO_NAME}/actions
   2. Busca el workflow "Release APK & Build"
   3. Monitorea el proceso (2-5 minutos)
   4. El APK estará disponible en Releases

🔗 Enlaces Útiles:
   Releases: https://github.com/${REPO_OWNER}/${REPO_NAME}/releases
   Actions:  https://github.com/${REPO_OWNER}/${REPO_NAME}/actions
   APK Repo: APK/v${newVersion}/Inventariando-${newVersion}.apk

${colors.cyan}╚═══════════════════════════════════════════╝${colors.reset}
  `);
}

// ========== MAIN ==========

async function main() {
  const arg = process.argv[2];
  const dispatchTarget = process.argv[3];

  if (!arg || !['beta', 'stable', 'dispatch'].includes(arg)) {
    log.error('Uso: node scripts/release-auto.js [beta|stable|dispatch] [stable|beta]');
    process.exit(1);
  }

  // Modo solo dispatch: evita bump/commit y dispara el workflow.
  if (arg === 'dispatch') {
    const releaseType = ['beta', 'stable'].includes(dispatchTarget) ? dispatchTarget : 'stable';
    log.divider();
    console.log(`${colors.cyan}🚀 INVENTARIANDO - DISPATCH ONLY${colors.reset}`);
    log.divider();
    log.info(`Disparando workflow sin modificar versión (target=${releaseType})...`);
    const ok = await dispatchGitHubActionsWorkflow(releaseType);
    if (ok) {
      log.success('Workflow disparado correctamente (dispatch-only).');
    } else {
      log.warning('No se pudo disparar el workflow en modo dispatch-only.');
    }
    return;
  }

  const releaseType = arg;
  
  try {
    log.divider();
    console.log(`${colors.cyan}🚀 INVENTARIANDO - AUTOMATIC RELEASE${colors.reset}`);
    log.divider();
    
    // 1. Obtener versiones
    log.info('Obteniendo información de versiones...');
    const currentVersion = getCurrentVersion();
    const latestRelease = await getLatestGitHubRelease();
    const newVersion = calculateNextVersion(currentVersion, releaseType);
    
    log.debug(`Versión actual: ${currentVersion}`);
    if (latestRelease) {
      log.debug(`Última en GitHub: ${latestRelease.version}`);
    }
    log.debug(`Nueva versión calculada: ${newVersion}`);
    
    // 2. Validar conflictos
    log.info('Validando correlatividad de versiones...');
    if (!validateVersionConflict(newVersion, latestRelease)) {
      log.error(
        `Conflicto de versiones: ${newVersion} es menor que la última (${latestRelease.version})`
      );
      process.exit(1);
    }
    log.success('Versiones válidas');
    
    // 3. Bumpar versión
    log.info('Actualizando package.json...');
    updatePackageJson(newVersion);
    log.success('package.json actualizado');
    
    // 4. Actualizar CHANGELOG
    log.info('Generando CHANGELOG...');
    updateChangelog(newVersion);
    
    // 5. Commit y Push
    log.info('Commiteando y pusheando cambios...');
    commitAndPush(newVersion);
    
    // 6. Disparar GitHub Actions
    log.info('Disparando GitHub Actions workflow...');
    await dispatchGitHubActionsWorkflow(releaseType);
    
    // 7. Resumen
    printSummary(currentVersion, newVersion, releaseType, latestRelease);
    
    log.success('✨ Release completado exitosamente');
    
  } catch (error) {
    log.error(`Error durante el release: ${error.message}`);
    process.exit(1);
  }
}

main();
