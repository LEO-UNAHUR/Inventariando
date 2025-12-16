import { readFile, writeFile, readdir } from 'fs/promises';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.join(__dirname, '..');
const outPath = path.join(repoRoot, '.github', 'copilot-instructions.md');

async function listDirNames(relPath) {
  try {
    const full = path.join(repoRoot, relPath);
    const items = await readdir(full, { withFileTypes: true });
    return items.filter(d => d.isDirectory()).map(d => d.name).slice(0, 20);
  } catch (e) {
    return [];
  }
}

function nowISO() {
  return new Date().toISOString();
}

async function buildContent() {
  const pkgRaw = await readFile(path.join(repoRoot, 'package.json'), 'utf8').catch(()=>'{}');
  const pkg = JSON.parse(pkgRaw);
  const readme = await readFile(path.join(repoRoot, 'README.md'), 'utf8').catch(()=>'');

  const services = await listDirNames('services');
  const features = await listDirNames('src/features');

  const lines = [];
  lines.push('# Instrucciones rápidas para agentes IA (Copilot)');
  lines.push('');
  lines.push(`_Generado automáticamente: ${nowISO()}_`);
  lines.push('');
  lines.push('Propósito: ayudar a un agente a ser productivo rápidamente en este repo React + Capacitor (PWA + APK).');
  lines.push('');
  lines.push('1) Gran panorama');
  lines.push('- Arquitectura: app React (Vite, TypeScript) organizada por dominios en `src/features/` y lógica de integración en `services/`.');
  lines.push('- Dual build: PWA (GitHub Pages, base `/Inventariando/`) y APK Android (Capacitor + Gradle).');
  lines.push('');
  lines.push('2) Dónde empezar (archivos clave)');
  const scripts = pkg.scripts ? Object.keys(pkg.scripts).slice(0,6) : [];
  if (scripts.length) lines.push(`- \'package.json\': scripts útiles — ${scripts.join(', ')}`);
  lines.push('- `README.md`: flujo de release, ubicación de builds (`APK/`, `BUILDS/web-pages/`) y requisitos (Java 21 para Android).');
  lines.push('- `vite.config.ts`: detection del `base` para GitHub Pages vs Android WebView.');
  lines.push('- `services/`: integraciones externas (ej. geminiService.ts, openaiService.ts).');
  lines.push('- `src/features/`: módulos por dominio (inventory, sales, customers, assistant).');
  lines.push('');
  lines.push('3) Workflows y comandos esenciales');
  lines.push('- Desarrollo: `npm install` → `npm run dev`.');
  lines.push('- Build web: `npm run build:web` / `npm run build:web:pages`.');
  lines.push('- Build Android: `npm run build:android` (requiere Java 21+).');
  lines.push('');
  lines.push('4) Patrones y convenciones específicas');
  lines.push('- IA por usuario: cada usuario trae su propia API key (ver `services/*`).');
  lines.push('- Servicios externos centralizados en `services/`.');
  lines.push('- Persistencia: PWA + LocalStorage (`storageService.ts`).');
  lines.push('');
  lines.push('5) Integraciones y puntos de atención');
  lines.push('- Si modificas `vite.config.ts` coordina con `android/` y `capacitor.config.ts`.');
  lines.push('- Revisa `scripts/create-release.js` y `scripts/bump-version.js` antes de tocar releases.');
  lines.push('');
  lines.push('6) Ejemplos del repo');
  if (services.length) lines.push(`- Servicios (muestra): ${services.join(', ')}`);
  if (features.length) lines.push(`- Features (muestra): ${features.join(', ')}`);
  lines.push('');
  lines.push('7) Preguntas para el mantenedor');
  lines.push('- ¿Dónde documentar la política de storage de API keys?');
  lines.push('- ¿Quiere tests ejemplo para `services/` (Vitest)?');

  return lines.join('\n');
}

async function main(){
  const content = await buildContent();
  const existing = await readFile(outPath, 'utf8').catch(()=>null);
  if (existing === content) {
    console.log('No changes to copilot-instructions.md');
    return 0;
  }
  await writeFile(outPath, content, 'utf8');
  console.log('Updated', outPath);

  // try to commit changes
  try {
    execSync('git add -A .github/copilot-instructions.md', { stdio: 'inherit' });
    execSync('git commit -m "chore: update copilot instructions (auto)"', { stdio: 'inherit' });
    execSync('git push', { stdio: 'inherit' });
    console.log('Committed and pushed changes');
  } catch (e) {
    console.log('Could not commit/push automatically:', e.message);
  }
  return 0;
}

main().catch(err=>{ console.error(err); process.exit(1); });
