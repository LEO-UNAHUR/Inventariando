#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.join(__dirname, '..');
const README_PATH = path.join(PROJECT_ROOT, 'README.md');
const RELEASES_DOC_PATH = path.join(PROJECT_ROOT, 'docs', 'releases', 'RELEASES.md');

const RELEASE_TYPES = ['beta', 'stable'];

const args = process.argv.slice(2);
const releaseTypeArg = args.find((arg) => !arg.startsWith('-'));
const releaseType = releaseTypeArg && RELEASE_TYPES.includes(releaseTypeArg)
  ? releaseTypeArg
  : 'beta';
const dryRun = args.includes('--dry-run') || args.includes('--dry');

function logStep(step, description) {
  console.log(`\n=== [${step}] ${description} ===`);
}

function runCommand(command, options = {}) {
  const { label, allowFail = false, env = {} } = options;
  const displayLabel = label ? `${label}: ` : '';
  if (dryRun) {
    console.log(`[dry-run] ${displayLabel}${command}`);
    return;
  }

  try {
    execSync(command, {
      stdio: 'inherit',
      env: { ...process.env, ...env },
    });
  } catch (error) {
    if (allowFail) {
      console.warn(`⚠️  ${displayLabel}comando opcional falló pero se ignora (${error.message})`);
      return;
    }
    throw error;
  }
}

function readPackageVersion() {
  const pkgPath = path.join(__dirname, '..', 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  return pkg.version;
}

function formatReleaseDateLabel(date) {
  return date.toLocaleDateString('es-AR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function updateReadmeLatestRelease(version, releaseType, releaseDateLabel) {
  if (dryRun) {
    console.log(`[dry-run] Actualizar README.md con release ${version}`);
    return;
  }
  const raw = fs.readFileSync(README_PATH, 'utf8');
  const badgeColor = releaseType === 'stable' ? 'blue' : 'orange';
  const versionBadge = `![Version](https://img.shields.io/badge/version-${version}-${badgeColor}?style=for-the-badge&logo=appveyor)`;
  const updatedBadge = raw.replace(/!\[Version\]\(https:\/\/img\.shields\.io\/badge\/version-[^\)]+\)/, versionBadge);
  let content = updatedBadge;

  if (releaseType === 'stable') {
    const stableRow = `| **Phase 1 - Stable** | ${version} | ✅ Publicado | ${releaseDateLabel} |`;
    content = content.replace(
      /\| \*\*Phase 1 - Stable\*\* \|.*\n/,
      `${stableRow}\n`
    );
  }

  const releaseSection = `<!-- LATEST_RELEASE_START -->
## ÐYs? Último Release
- **Versión:** v${version}
- **Tipo:** ${releaseType === 'stable' ? 'Stable' : 'Beta'}
- **Fecha:** ${releaseDateLabel}
- **Notas:** [GitHub Release](https://github.com/LEO-UNAHUR/Inventariando/releases/tag/v${version})
<!-- LATEST_RELEASE_END -->`;

  if (content.includes('<!-- LATEST_RELEASE_START -->')) {
    content = content.replace(
      /<!-- LATEST_RELEASE_START -->[\s\S]*?<!-- LATEST_RELEASE_END -->/,
      releaseSection
    );
  } else if (content.includes('---')) {
    const idx = content.indexOf('---');
    content = `${content.slice(0, idx)}${releaseSection}\n\n${content.slice(idx)}`;
  } else {
    content = `${releaseSection}\n\n${content}`;
  }

  fs.writeFileSync(README_PATH, content, 'utf8');
}

function appendReleaseLog(version, releaseType, releaseDateIso) {
  if (dryRun) {
    console.log(`[dry-run] Actualizar docs/releases/RELEASES.md con ${version}`);
    return;
  }

  const header = '# Historial de Releases (Inventariando)';
  let previous = '';
  if (fs.existsSync(RELEASES_DOC_PATH)) {
    previous = fs.readFileSync(RELEASES_DOC_PATH, 'utf8');
  }
  const existingBody = previous.startsWith(header)
    ? previous.slice(header.length).trimStart()
    : previous.trimStart();

  const entry = `## v${version} (${releaseType.toUpperCase()}) - ${releaseDateIso}
- Tipo: ${releaseType === 'stable' ? 'Stable' : 'Beta'}
- GitHub Release: https://github.com/LEO-UNAHUR/Inventariando/releases/tag/v${version}
- Notas principales: [CHANGELOG.md](../CHANGELOG.md)

`;

  const combined = `${header}\n\n${entry}${existingBody}`.trimEnd() + '\n';
  fs.writeFileSync(RELEASES_DOC_PATH, combined, 'utf8');
}

function updateReleaseDocumentation(version, releaseType, releaseDateIso, releaseDateLabel) {
  updateReadmeLatestRelease(version, releaseType, releaseDateLabel);
  appendReleaseLog(version, releaseType, releaseDateIso);
}

function ensureGhCli() {
  try {
    execSync('gh --version', { stdio: 'ignore' });
  } catch (error) {
    throw new Error('GitHub CLI (gh) no está instalado o no está en PATH. Instálalo antes de correr este script.');
  }
}

function getReleaseNotes(version) {
  const body = `
# Inventariando v${version}

**Tipo de release:** ${releaseType}

## Cambios
- Consulta el archivo CHANGELOG.md para el listado completo.

## Instalación APK
1. Descarga el APK desde el release.
2. Activa "Fuentes desconocidas" en Android > Seguridad.
3. Ejecuta el instalador y sigue los pasos.

## Enlaces
- Repositorio: https://github.com/LEO-UNAHUR/Inventariando
- Documentación: https://github.com/LEO-UNAHUR/Inventariando/blob/main/README.md
`;
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'inventariando-release-'));
  const notesPath = path.join(tmpDir, `release-notes-${version}.md`);
  fs.writeFileSync(notesPath, body.trimStart(), 'utf8');
  return notesPath;
}

function removeReleaseNotes(pathToFile) {
  try {
    fs.rmSync(pathToFile, { force: true });
    const parentDir = path.dirname(pathToFile);
    fs.rmSync(parentDir, { recursive: true, force: true });
  } catch {
    // Ignorar errores de limpieza
  }
}

async function main() {
  console.log('\n🚀 Inventariando - Release Orchestrator\n');
  console.log(`Tipo de release: ${releaseType}`);
  if (dryRun) {
    console.log('Modo dry-run activado (no se ejecutarán comandos destructivos).\n');
  }

  logStep('01', 'Verificar herramientas necesarias');
  ensureGhCli();

  logStep('02', 'Bump de versión');
  runCommand('npm run release:version', {
    env: { RELEASE_TYPE: releaseType },
  });

  const version = readPackageVersion();
  const now = new Date();
  const releaseDateIso = now.toISOString().split('T')[0];
  const releaseDateLabel = formatReleaseDateLabel(now);
  logStep('03', `Versión detectada -> ${version}`);

  logStep('04', 'Compilando APK y web (release:build)');
  runCommand('npm run release:build');
  logStep('04b', 'Actualizando documentación vinculada (README + docs/releases)');
  updateReleaseDocumentation(version, releaseType, releaseDateIso, releaseDateLabel);

  logStep('05', 'Commit y push del release (git)');
  runCommand('git add -A');
  runCommand(`git commit -m "chore: Release v${version}"`, { allowFail: true });
  runCommand('git push origin main --force-with-lease', { allowFail: true });

  logStep('06', 'Etiquetar release');
  runCommand(`git tag -a "v${version}" -m "Release v${version}"`, { allowFail: true });
  runCommand(`git push origin "v${version}"`, { allowFail: true });

  logStep('07', 'Crear release en GitHub');
  const releaseNotes = getReleaseNotes(version);
  const apkPath = path.join('android', 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');
  if (!dryRun && !fs.existsSync(apkPath)) {
    throw new Error(`APK no encontrado en ${apkPath}. Asegurate de que npm run release:build termine correctamente.`);
  }
  const extraFlag = releaseType === 'beta' ? '--prerelease' : '';
  const baseCommandParts = [
    `gh release create "v${version}"`,
    `"${apkPath}"`,
    `--repo LEO-UNAHUR/Inventariando`,
    `--target main`,
  ];
  if (extraFlag) {
    baseCommandParts.push(extraFlag);
  }
  baseCommandParts.push(`--notes-file "${releaseNotes}"`);
  const baseCommand = baseCommandParts.join(' ');
  runCommand(baseCommand);
  removeReleaseNotes(releaseNotes);

  logStep('08', 'Resumen final');
  console.log(`
✅ Release generado:
   - Etiqueta: v${version}
   - APK: ${apkPath}
   - GitHub Release: https://github.com/LEO-UNAHUR/Inventariando/releases/tag/v${version}
`);

}

main().catch((error) => {
  console.error('❌ Error en el release:', error.message);
  process.exit(1);
});
