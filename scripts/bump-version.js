#!/usr/bin/env node

/**
 * Script para bumpeador automático de versión
 * Actualiza package.json según RELEASE_TYPE (beta|stable)
 * 
 * Uso: 
 *   RELEASE_TYPE=beta npm run release:version
 *   RELEASE_TYPE=stable npm run release:version
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const packagePath = path.join(__dirname, '../package.json');

function parseVersion(versionString) {
  const match = versionString.match(/^(\d+)\.(\d+)\.(\d+)(?:-(.+))?$/);
  if (!match) {
    throw new Error(`Invalid version format: ${versionString}`);
  }
  return {
    major: parseInt(match[1], 10),
    minor: parseInt(match[2], 10),
    patch: parseInt(match[3], 10),
    prerelease: match[4] || null,
  };
}

function bumpVersion() {
  try {
    const releaseType = process.env.RELEASE_TYPE || 'beta';
    
    // 1. Leer versión actual
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    const currentVersion = packageJson.version;
    
    console.log(`📦 Versión actual: ${currentVersion}`);
    console.log(`📌 Tipo de release: ${releaseType}`);
    
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
      // Para beta: bumpar minor y añadir -beta
      newVersion = `${parsed.major}.${parsed.minor + 1}.0-beta`;
    } else {
      throw new Error(`Invalid RELEASE_TYPE: ${releaseType}`);
    }
    
    console.log(`✨ Nueva versión: ${newVersion}`);
    
    // 2. Actualizar package.json
    packageJson.version = newVersion;
    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n', 'utf8');
    console.log(`✅ package.json actualizado`);
    
    // 3. No hacer commit aquí - el workflow lo hace
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

bumpVersion();
