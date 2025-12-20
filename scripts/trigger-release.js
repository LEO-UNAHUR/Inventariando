#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('📦 Preparando RELEASE estable...\n');

// Verificar que estemos en main
try {
  const currentBranch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
  if (currentBranch !== 'main') {
    console.error('❌ Error: Debes estar en la rama "main" para crear un release');
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Error al verificar rama:', error.message);
  process.exit(1);
}

rl.question('¿Tipo de versión? (patch/minor/major) [patch]: ', (type) => {
  const versionType = type.trim() || 'patch';
  
  if (!['patch', 'minor', 'major'].includes(versionType)) {
    console.error('❌ Tipo de versión inválido. Usa: patch, minor o major');
    process.exit(1);
  }
  
  try {
    // Leer versión actual
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const currentVersion = packageJson.version;
    
    // Calcular nueva versión
    const [major, minor, patch] = currentVersion.split('.').map(Number);
    let newVersion;
    
    switch(versionType) {
      case 'major':
        newVersion = `${major + 1}.0.0`;
        break;
      case 'minor':
        newVersion = `${major}.${minor + 1}.0`;
        break;
      case 'patch':
      default:
        newVersion = `${major}.${minor}.${patch + 1}`;
    }
    
    console.log(`\n📦 Versión: ${currentVersion} → ${newVersion}`);
    console.log(`🏷️  Tag: v${newVersion}`);
    
    rl.question('\n¿Continuar con el release? (s/n) [s]: ', (answer) => {
      if (answer.toLowerCase() === 'n') {
        console.log('❌ Release cancelado');
        process.exit(0);
      }
      
      try {
        // Actualizar package.json
        packageJson.version = newVersion;
        fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2) + '\n');
        
        // Commit, tag y push
        console.log('\n📝 Creando commit y tag...');
        execSync('git add package.json', { stdio: 'inherit' });
        execSync(`git commit -m "chore: release v${newVersion}"`, { stdio: 'inherit' });
        execSync(`git tag -a v${newVersion} -m "Release v${newVersion}"`, { stdio: 'inherit' });
        
        console.log('⬆️  Pusheando con tags...');
        execSync('git push origin main --follow-tags', { stdio: 'inherit' });
        
        console.log('\n✅ Release v' + newVersion + ' disparado en GitHub Actions!');
        console.log(`🔗 Ver en: https://github.com/LEO-UNAHUR/Inventariando/actions`);
        console.log(`📦 Release: https://github.com/LEO-UNAHUR/Inventariando/releases/tag/v${newVersion}`);
        
      } catch (error) {
        console.error('❌ Error al crear release:', error.message);
        process.exit(1);
      }
      
      rl.close();
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
});
