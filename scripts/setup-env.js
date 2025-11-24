#!/usr/bin/env node

/**
 * Script para configurar arquivos .env.local a partir dos env.example
 * 
 * Este script copia os arquivos env.example para .env.local em cada serviço,
 * garantindo que o projeto esteja pronto para rodar após o clone.
 * 
 * Uso:
 *   npm run setup:env
 *   node scripts/setup-env.js
 */

const fs = require('fs');
const path = require('path');

// Cores para output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function setupEnvFile(serviceName, servicePath) {
  const envExamplePath = path.join(servicePath, 'env.example');
  const envLocalPath = path.join(servicePath, '.env.local');

  // Verificar se env.example existe
  if (!fs.existsSync(envExamplePath)) {
    log(`  ⚠️  ${serviceName}: env.example não encontrado`, 'yellow');
    return false;
  }

  // Se .env.local já existe, não sobrescrever (a menos que seja forçado)
  if (fs.existsSync(envLocalPath)) {
    log(`  ⏭️  ${serviceName}: .env.local já existe (mantido)`, 'yellow');
    return true;
  }

  // Copiar env.example para .env.local
  try {
    fs.copyFileSync(envExamplePath, envLocalPath);
    log(`  ✅ ${serviceName}: .env.local criado`, 'green');
    return true;
  } catch (error) {
    log(`  ❌ ${serviceName}: Erro ao criar .env.local - ${error.message}`, 'red');
    return false;
  }
}

function main() {
  log('\n🔧 Configurando arquivos de ambiente...\n', 'blue');
  log('═══════════════════════════════════════════════════════════', 'cyan');

  const services = [
    { name: 'Auth Service', path: 'services/auth-service' },
    { name: 'Students Service', path: 'services/students-service' },
    { name: 'Rooms Service', path: 'services/rooms-service' },
    { name: 'Check-in Service', path: 'services/checkin-service' },
    { name: 'Analytics Service', path: 'services/analytics-service' },
  ];

  const rootDir = path.resolve(__dirname, '..');
  let successCount = 0;

  for (const service of services) {
    const servicePath = path.join(rootDir, service.path);
    if (setupEnvFile(service.name, servicePath)) {
      successCount++;
    }
  }

  log('\n═══════════════════════════════════════════════════════════', 'cyan');
  log(`\n📊 Resumo: ${successCount}/${services.length} serviços configurados`, 
      successCount === services.length ? 'green' : 'yellow');

  if (successCount === services.length) {
    log('\n✅ Configuração concluída com sucesso!', 'green');
    log('\n💡 Próximos passos:', 'cyan');
    log('   1. npm run docker:up        # Subir infraestrutura', 'yellow');
    log('   2. npm run seed:all         # Executar migrations e seeds', 'yellow');
    log('   3. npm run dev              # Iniciar todos os serviços', 'yellow');
  } else {
    log('\n⚠️  Alguns serviços não foram configurados. Verifique os erros acima.', 'yellow');
  }

  log('');
}

// Executar
if (require.main === module) {
  main();
}

module.exports = { setupEnvFile };

