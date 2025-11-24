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

  // Ler conteúdo do env.example
  let envContent = fs.readFileSync(envExamplePath, 'utf8');
  
  // Se .env.local já existe, ler e mesclar com env.example
  let existingContent = '';
  if (fs.existsSync(envLocalPath)) {
    existingContent = fs.readFileSync(envLocalPath, 'utf8');
    log(`  ⏭️  ${serviceName}: .env.local já existe`, 'yellow');
  }

  // Garantir que todos os serviços usam o mesmo JWT_SECRET do auth-service
  const authServicePath = path.join(path.resolve(__dirname, '..'), 'services/auth-service');
  const authEnvPath = path.join(authServicePath, '.env.local');
  const authEnvExamplePath = path.join(authServicePath, 'env.example');
  
  let jwtSecret = null;
  
  // Tentar ler do auth-service .env.local primeiro
  if (fs.existsSync(authEnvPath)) {
    const authContent = fs.readFileSync(authEnvPath, 'utf8');
    const jwtMatch = authContent.match(/^JWT_SECRET=(.+)$/m);
    if (jwtMatch) {
      jwtSecret = jwtMatch[1].trim();
    }
  }
  
  // Se não encontrou, tentar do env.example
  if (!jwtSecret && fs.existsSync(authEnvExamplePath)) {
    const authExampleContent = fs.readFileSync(authEnvExamplePath, 'utf8');
    const jwtMatch = authExampleContent.match(/^JWT_SECRET=(.+)$/m);
    if (jwtMatch) {
      jwtSecret = jwtMatch[1].trim();
    }
  }
  
  // Se ainda não encontrou, usar valor padrão
  if (!jwtSecret) {
    jwtSecret = 'your-secret-key-change-in-production';
  }

  // Atualizar ou adicionar JWT_SECRET no conteúdo
  if (envContent.includes('JWT_SECRET=')) {
    // Substituir JWT_SECRET existente
    envContent = envContent.replace(/^JWT_SECRET=.*$/m, `JWT_SECRET=${jwtSecret}`);
  } else {
    // Adicionar JWT_SECRET se não existir
    envContent += `\n# JWT (deve ser o mesmo JWT_SECRET do auth-service)\nJWT_SECRET=${jwtSecret}\n`;
  }

  // Se .env.local já existe, preservar valores customizados
  if (existingContent) {
    // Mesclar: manter valores existentes, adicionar novos do env.example
    const existingLines = existingContent.split('\n');
    const newLines = envContent.split('\n');
    const merged = new Map();
    
    // Primeiro, adicionar todas as linhas do env.example
    newLines.forEach(line => {
      const match = line.match(/^([^#=]+)=(.+)$/);
      if (match) {
        merged.set(match[1].trim(), line);
      }
    });
    
    // Depois, sobrescrever com valores existentes (preservar customizações)
    existingLines.forEach(line => {
      const match = line.match(/^([^#=]+)=(.+)$/);
      if (match) {
        merged.set(match[1].trim(), line);
      }
    });
    
    // Garantir que JWT_SECRET está correto
    merged.set('JWT_SECRET', `JWT_SECRET=${jwtSecret}`);
    
    envContent = Array.from(merged.values()).join('\n');
    
    log(`  🔄 ${serviceName}: .env.local atualizado (JWT_SECRET sincronizado)`, 'cyan');
  } else {
    log(`  ✅ ${serviceName}: .env.local criado`, 'green');
  }

  // Escrever arquivo
  try {
    fs.writeFileSync(envLocalPath, envContent, 'utf8');
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

