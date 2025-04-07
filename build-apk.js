
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('✨ Iniciando processo de geração do APK...');

// Passo 1: Build do projeto web
console.log('📦 Compilando projeto web...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build do projeto web concluído com sucesso!');
} catch (error) {
  console.error('❌ Erro ao compilar o projeto web:', error);
  process.exit(1);
}

// Passo 2: Sincronizar com Capacitor
console.log('🔄 Sincronizando com Capacitor...');
try {
  execSync('npx cap sync android', { stdio: 'inherit' });
  console.log('✅ Sincronização com Capacitor concluída com sucesso!');
} catch (error) {
  console.error('❌ Erro ao sincronizar com Capacitor:', error);
  process.exit(1);
}

// Passo 3: Construir o APK usando Gradle
console.log('🛠️ Construindo APK usando Gradle...');
try {
  // Verificar sistema operacional para ajustar o comando
  const isWindows = process.platform === 'win32';
  const gradlewPath = path.join(process.cwd(), 'android', isWindows ? 'gradlew.bat' : 'gradlew');
  
  // Garantir que gradlew tenha permissões de execução no Linux/Mac
  if (!isWindows) {
    execSync(`chmod +x ${gradlewPath}`, { stdio: 'inherit' });
  }
  
  // Construir o APK de depuração
  const buildCommand = isWindows 
    ? `cd android && .\\gradlew.bat assembleDebug` 
    : `cd android && ./gradlew assembleDebug`;
  
  execSync(buildCommand, { stdio: 'inherit' });
  console.log('✅ APK construído com sucesso!');
} catch (error) {
  console.error('❌ Erro ao construir o APK:', error);
  process.exit(1);
}

// Passo 4: Localizar e informar o caminho do APK
const apkPath = path.join(process.cwd(), 'android', 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');
if (fs.existsSync(apkPath)) {
  console.log(`\n🎉 APK gerado com sucesso!\n📱 Caminho do APK: ${apkPath}\n`);
} else {
  console.log('\n⚠️ APK gerado, mas não foi possível localizar o arquivo no caminho esperado.');
  console.log('📁 Procure na pasta: android/app/build/outputs/apk/');
}
