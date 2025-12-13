#!/usr/bin/env node

/**
 * Script para bumpeador automático de versión
 * Actualiza package.json y crea commit
 * 
 * Uso: npm run release:version
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');

const execPromise = util.promisify(exec);

const packagePath = path.join(__dirname, '../package.json');

async function bumpVersion() {
  try {
    // 1. Leer versión actual
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    const currentVersion = packageJson.version;
    
    console.log(`📦 Versión actual: ${currentVersion}`);
    
    // 2. Parsear y bumpar (beta -> release)
    let newVersion = currentVersion;
    if (currentVersion.includes('-beta')) {
      newVersion = currentVersion.replace('-beta', '');
    } else {
      // Si no hay -beta, bumpar minor
      const parts = currentVersion.split('.');
      parts[1] = parseInt(parts[1]) + 1;
      newVersion = parts.join('.') + '-beta';
    }
    
    console.log(`✨ Nueva versión: ${newVersion}`);
    
    // 3. Actualizar package.json
    packageJson.version = newVersion;
    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n', 'utf8');
    
    // 4. Actualizar README con fecha y versión
    const readmePath = path.join(__dirname, '../README.md');
    if (fs.existsSync(readmePath)) {
      let readme = fs.readFileSync(readmePath, 'utf8');
      
      // Reemplazar versión en el badge o descripción
      readme = readme.replace(
        /version-[\d.]+-[\w]+/g,
        `version-${newVersion}-blue`
      );
      
      // Agregar changelog entry
      const date = new Date().toISOString().split('T')[0];
      const changelogEntry = `\n## [${newVersion}] - ${date}\n\n### Changed\n- Release automático via GitHub Actions\n\n---\n`;
      readme = readme.replace('---\n', changelogEntry);
      
      fs.writeFileSync(readmePath, readme, 'utf8');
      console.log('📝 README.md actualizado');
    }
    
    // 5. Git commit
    await execPromise(`git add -A`);
    await execPromise(`git commit -m "chore: Bump version to ${newVersion}"`);
    
    console.log(`✅ Versión bumpeada y commiteada`);
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

bumpVersion();
