#!/usr/bin/env node

import { execSync } from 'child_process';
import path from 'path';

const androidDir = path.resolve(process.cwd(), 'android');
const isWindows = process.platform === 'win32';
const gradleCommand = isWindows ? 'gradlew.bat' : './gradlew';

console.log(`Ejecutando ${gradleCommand} assembleDebug en ${androidDir}`);

execSync(`${gradleCommand} assembleDebug`, {
  cwd: androidDir,
  stdio: 'inherit'
});
