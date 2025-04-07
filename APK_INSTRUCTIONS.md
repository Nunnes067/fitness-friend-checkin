
# Instruções para Criar um APK do CheckMate Fitness

Este guia explica como criar um APK do seu aplicativo sem precisar abrir o Android Studio.

## Pré-requisitos

Antes de começar, certifique-se de ter instalado:

1. Node.js e NPM
2. JDK (Java Development Kit) versão 11 ou superior
3. Android SDK com as ferramentas de linha de comando
4. Variáveis de ambiente configuradas:
   - ANDROID_HOME ou ANDROID_SDK_ROOT apontando para o diretório do seu Android SDK
   - JAVA_HOME apontando para o diretório do seu JDK

## Passos para Gerar o APK

### 1. Prepare seu ambiente

Se esta é a primeira vez que você está usando o Capacitor com Android:

```bash
# Adicionar a plataforma Android ao projeto
npx cap add android
```

### 2. Execute o script de build

```bash
# Adicionar o script de build ao package.json (só precisa fazer isso uma vez)
node add-build-script.js

# Gerar o APK
npm run build:apk
```

### 3. Localizar o APK

Após a conclusão bem-sucedida, o APK estará disponível em:
```
./android/app/build/outputs/apk/debug/app-debug.apk
```

### 4. Instalar no dispositivo

Para instalar o APK em um dispositivo conectado via USB:

```bash
# Certifique-se que o dispositivo está conectado e com depuração USB ativada
adb install ./android/app/build/outputs/apk/debug/app-debug.apk
```

## Solução de Problemas

Se encontrar algum erro:

1. Verifique se todas as dependências estão instaladas
2. Confirme que as variáveis de ambiente estão configuradas corretamente
3. Execute `npx cap doctor` para verificar seu ambiente Capacitor

## Notas Adicionais

- Este APK de debug não é otimizado para produção
- Para criar um APK de release (assinado), você precisará configurar uma keystore
