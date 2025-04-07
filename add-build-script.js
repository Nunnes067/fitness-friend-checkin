
const fs = require('fs');
const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));

// Adicionar script para build do APK
if (!packageJson.scripts) {
  packageJson.scripts = {};
}
packageJson.scripts['build:apk'] = 'node build-apk.js';

// Salvar package.json atualizado
fs.writeFileSync('./package.json', JSON.stringify(packageJson, null, 2));
console.log('✅ Script build:apk adicionado ao package.json');
