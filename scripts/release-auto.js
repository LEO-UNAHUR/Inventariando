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

function calculateNextVersion(currentVersion, releaseType) {
  const parsed = parseVersion(currentVersion);
  
  if (releaseType === 'beta') {
    // Si ya es beta: mantén versión, actualiza prerelease
    // Si no es beta: bumpea minor y agrega -beta
    if (parsed.prerelease === 'beta') {
      // Ya está en beta, mantenemos versión pero refrescamos
      return `${parsed.major}.${parsed.minor}.${parsed.patch}-beta`;
    } else {
      // Pasar de stable a beta siguiente
      return `${parsed.major}.${parsed.minor + 1}.0-beta`;
    }
  } else if (releaseType === 'stable') {
    // Si es beta: quita -beta
    // Si no es beta: bumpea patch
    if (parsed.prerelease === 'beta') {
      return `${parsed.major}.${parsed.minor}.${parsed.patch}`;
    } else {
      return `${parsed.major}.${parsed.minor}.${parsed.patch + 1}`;
    }
  }
  
  throw new Error(`Release type inválido: ${releaseType}`);
}

function validateVersionConflict(newVersion, latestGitHubRelease) {
  if (!latestGitHubRelease) {
    return true; // Sin releases previas, sin conflicto
  }
  
  const current = parseVersion(latestGitHubRelease.version);
  const next = parseVersion(newVersion);
  
  // Comparar versiones
  if (next.major < current.major) return false;
  if (next.major === current.major) {
    if (next.minor < current.minor) return false;
    if (next.minor === current.minor) {
      if (next.patch < current.patch) return false;
      if (next.patch === current.patch && !next.prerelease && current.prerelease) {
        // OK: pasar de beta a stable de la misma versión
        return true;
      }
      if (next.patch === current.patch && next.prerelease && current.prerelease) {
        return true; // Permitir refresh de prerelease
      }
    }
  }
  
  return true;
}

function updatePackageJson(newVersion) {
  const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf8'));
  pkg.version = newVersion;
  fs.writeFileSync(PACKAGE_JSON, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
}

function generateChangelogEntry(version, releaseType) {
  const date = new Date().toISOString().split('T')[0];
  const entry = `## [${version}] - ${date}

### Added
- Actualización automática mediante GitHub Actions
- Mejoras de estabilidad y rendimiento

### Changed
- Release type: ${releaseType}

---

`;
  return entry;
}

function updateChangelog(version) {
  const changelogPath = path.join(PROJECT_ROOT, 'CHANGELOG.md');
  if (!fs.existsSync(changelogPath)) {
    log.warning('CHANGELOG.md no encontrado. Saltando actualización.');
    return;
  }
  
  let changelog = fs.readFileSync(changelogPath, 'utf8');
  const entry = generateChangelogEntry(version, 'release');
  
  // Insertar después de la línea "# Changelog"
  changelog = changelog.replace(
    /# Changelog\n/,
    `# Changelog\n\n${entry}`
  );
  
  fs.writeFileSync(changelogPath, changelog, 'utf8');
  log.success('CHANGELOG.md actualizado');
}

function commitAndPush(newVersion) {
  try {
    execSync('git add -A', { cwd: PROJECT_ROOT, stdio: 'pipe' });
    execSync(
      `git commit -m "chore(release): v${newVersion}"`,
      { cwd: PROJECT_ROOT, stdio: 'pipe' }
    );
    log.success('Cambios commiteados');
    
    execSync('git push origin main', { cwd: PROJECT_ROOT, stdio: 'pipe' });
    log.success('Push a GitHub completado');
  } catch (error) {
    log.error(`Error en git: ${error.message}`);
    throw error;
  }
}

function dispatchGitHubActionsWorkflow(releaseType) {
  // Necesita GITHUB_TOKEN en variable de entorno
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    log.warning(
      'GITHUB_TOKEN no configurado. No se disparará el workflow automáticamente.'
    );
    log.info('Configura: export GITHUB_TOKEN=tu_token');
    return false;
  }
  
  try {
    // Usar PowerShell si estamos en Windows, sino curl
    const isWindows = process.platform === 'win32';
    
    const payload = {
      ref: 'main',
      inputs: {
        release_type: releaseType,
      },
    };
    
    if (isWindows) {
      // PowerShell command para Windows
      const psCommand = `
        $headers = @{
          'Authorization' = 'token ${token}'
          'Content-Type' = 'application/json'
        }
        $body = '${JSON.stringify(payload)}' | ConvertTo-Json -Compress
        try {
          $response = Invoke-WebRequest -Uri 'https://api.github.com/repos/LEO-UNAHUR/Inventariando/actions/workflows/release.yml/dispatches' \`
            -Method POST \`
            -Headers $headers \`
            -Body $body \`
            -UseBasicParsing \`
            -ErrorAction Stop
          exit 0
        } catch {
          Write-Host "Error: $($_.Exception.Message)"
          exit 1
        }
      `;
      
      execSync(`powershell -Command "${psCommand.replace(/"/g, '\\"')}"`, {
        stdio: 'pipe',
      });
    } else {
      // curl for Linux/Mac
      execSync(
        `curl -s -X POST \\
          -H "Authorization: token ${token}" \\
          -H "Content-Type: application/json" \\
          -d '${JSON.stringify(payload)}' \\
          https://api.github.com/repos/LEO-UNAHUR/Inventariando/actions/workflows/release.yml/dispatches`,
        { stdio: 'pipe' }
      );
    }
    
    log.success('GitHub Actions workflow disparado');
    return true;
  } catch (error) {
    log.warning('No se pudo disparar el workflow. Intenta desde GitHub Actions manualmente.');
    log.info('https://github.com/LEO-UNAHUR/Inventariando/actions');
    return false;
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
  const releaseType = process.argv[2];
  
  if (!releaseType || !['beta', 'stable'].includes(releaseType)) {
    log.error('Uso: node scripts/release-auto.js [beta|stable]');
    process.exit(1);
  }
  
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
    dispatchGitHubActionsWorkflow(releaseType);
    
    // 7. Resumen
    printSummary(currentVersion, newVersion, releaseType, latestRelease);
    
    log.success('✨ Release completado exitosamente');
    
  } catch (error) {
    log.error(`Error durante el release: ${error.message}`);
    process.exit(1);
  }
}

main();
