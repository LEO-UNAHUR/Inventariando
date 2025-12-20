#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 Iniciando build BETA...\n');

try {
  // Leer versión actual
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const currentVersion = packageJson.version;
  
  // Incrementar patch
  const [major, minor, patch] = currentVersion.split('.').map(Number);
  const newVersion = `${major}.${minor}.${patch + 1}`;
  
  console.log(`📦 Versión: ${currentVersion} → ${newVersion}`);
  
  // Actualizar package.json
  packageJson.version = newVersion;
  fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2) + '\n');
  
  // Verificar que estemos en develop
  const currentBranch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
  if (currentBranch !== 'develop' && currentBranch !== 'main') {
    console.warn(`⚠️  Advertencia: No estás en develop ni main (estás en ${currentBranch})`);
  }
  
  // Commit y push
  console.log('📝 Creando commit...');
  execSync('git add package.json', { stdio: 'inherit' });
  execSync(`git commit -m "chore: bump version to ${newVersion} [skip ci]"`, { stdio: 'inherit' });
  
  console.log('⬆️  Pusheando a develop...');
  execSync('git push origin develop', { stdio: 'inherit' });
  
  console.log('\n✅ Build BETA disparado en GitHub Actions!');
  console.log(`🔗 Ver en: https://github.com/LEO-UNAHUR/Inventariando/actions`);
  console.log(`📦 Versión: v${newVersion}`);
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
