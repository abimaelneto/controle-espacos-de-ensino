#!/usr/bin/env node

/**
 * Script para executar todos os seeds necessários para testes
 * 
 * Executa:
 * 1. Migrations de todos os serviços (opcional)
 * 2. Seed de observabilidade (usuários, alunos, salas, check-ins)
 * 3. Seed de performance (dados para testes de carga)
 * 
 * Uso: 
 *   npm run seed:all              # Executa tudo incluindo migrations
 *   npm run seed:all -- --skip-migrations  # Pula migrations
 * 
 * Pré-requisitos:
 * - Docker rodando (npm run docker:up)
 * - Serviços rodando (npm run dev) - opcional, mas recomendado
 */

const { execSync } = require('child_process');
const path = require('path');

// Cores para output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function execCommand(command, description, cwd = process.cwd(), timeout = 30000) {
  try {
    log(`\n${description}...`, 'cyan');
    execSync(command, { 
      cwd, 
      stdio: 'inherit',
      env: { ...process.env },
      timeout: timeout
    });
    log(`✅ ${description} concluído`, 'green');
    return true;
  } catch (error) {
    if (error.signal === 'SIGTERM') {
      log(`⏱️  ${description} timeout (pode continuar)`, 'yellow');
      return true; // Timeout não é erro fatal para migrations
    }
    log(`❌ Erro ao executar: ${description}`, 'red');
    log(`   Comando: ${command}`, 'yellow');
    return false;
  }
}

async function runMigrations() {
  log('\n📦 Executando migrations...', 'blue');
  
  const services = [
    { name: 'Auth Service', path: 'services/auth-service', command: 'npm run migration:run' },
    { name: 'Students Service', path: 'services/students-service', command: 'npm run migration:run' },
    { name: 'Rooms Service', path: 'services/rooms-service', command: 'npm run migration:run' },
    { name: 'Check-in Service', path: 'services/checkin-service', command: 'npm run migration:run' },
    { name: 'Analytics Service', path: 'services/analytics-service', command: 'npm run migration:run' },
  ];

  let successCount = 0;
  for (const service of services) {
    // Timeout de 15s por migration (suficiente se já foram executadas)
    const success = execCommand(service.command, `Migration ${service.name}`, service.path, 15000);
    if (success) successCount++;
  }

  log(`\n📊 Migrations: ${successCount}/${services.length} executadas com sucesso`, successCount === services.length ? 'green' : 'yellow');
  return successCount === services.length;
}

async function runSeeds() {
  log('\n🌱 Executando seeds...', 'blue');

  const seeds = [
    {
      name: 'Seed de Observabilidade',
      command: 'node scripts/seed-observability.js',
      description: 'Cria usuários, alunos, salas e check-ins para visualização no Grafana'
    },
    {
      name: 'Seed de Performance',
      command: 'node tests/performance/scripts/seed-data.js',
      description: 'Cria dados para testes de carga/stress'
    }
  ];

  let successCount = 0;
  for (const seed of seeds) {
    log(`\n${seed.description}`, 'magenta');
    const success = execCommand(seed.command, seed.name);
    if (success) successCount++;
  }

  log(`\n📊 Seeds: ${successCount}/${seeds.length} executados com sucesso`, successCount === seeds.length ? 'green' : 'yellow');
  return successCount === seeds.length;
}

async function checkServices() {
  log('\n🔍 Verificando serviços...', 'blue');
  
  const axios = require('axios');
  const services = [
    { name: 'Auth', url: 'http://localhost:3000/api/v1/metrics' },
    { name: 'Students', url: 'http://localhost:3001/metrics' },
    { name: 'Rooms', url: 'http://localhost:3002/metrics' },
    { name: 'Check-in', url: 'http://localhost:3003/metrics' },
    { name: 'Analytics', url: 'http://localhost:3004/metrics' },
  ];

  let availableCount = 0;
  for (const service of services) {
    try {
      const response = await axios.get(service.url, { 
        timeout: 3000,
        validateStatus: () => true // Aceitar qualquer status code
      });
      if (response.status < 500) { // 2xx, 3xx, 4xx = serviço está rodando
        log(`  ✅ ${service.name} Service disponível`, 'green');
        availableCount++;
      } else {
        log(`  ⚠️  ${service.name} Service com erro (status ${response.status})`, 'yellow');
      }
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        log(`  ⚠️  ${service.name} Service não disponível (opcional)`, 'yellow');
      } else {
        log(`  ⚠️  ${service.name} Service: ${error.message}`, 'yellow');
      }
    }
  }

  if (availableCount === 0) {
    log('\n⚠️  Nenhum serviço está rodando. Alguns seeds podem falhar.', 'yellow');
    log('   Execute: npm run dev (em outro terminal)', 'yellow');
  } else {
    log(`\n✅ ${availableCount}/${services.length} serviços disponíveis`, 'green');
  }
}

async function main() {
  log('\n🚀 Iniciando processo completo de seed...\n', 'blue');
  log('═══════════════════════════════════════════════════════════', 'cyan');
  
  // Verificar se deve pular migrations
  const skipMigrations = process.argv.includes('--skip-migrations') || process.argv.includes('-s');
  
  const startTime = Date.now();

  try {
    // Verificar serviços (opcional, mas útil)
    await checkServices();

    // Executar migrations (opcional - pode pular se já foram executadas)
    let migrationsOk = true;
    if (!skipMigrations) {
      log('\n💡 Dica: Use --skip-migrations para pular esta etapa se já foram executadas', 'cyan');
      migrationsOk = await runMigrations();
      
      if (!migrationsOk) {
        log('\n⚠️  Algumas migrations falharam ou foram canceladas. Continuando com seeds...', 'yellow');
        log('   (Isso é normal se as migrations já foram executadas anteriormente)', 'yellow');
      }
    } else {
      log('\n⏭️  Pulando migrations (--skip-migrations)', 'yellow');
    }

    // Executar seeds
    const seedsOk = await runSeeds();

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    log('\n═══════════════════════════════════════════════════════════', 'cyan');
    log('\n📊 Resumo Final:', 'blue');
    if (skipMigrations) {
      log(`  • Migrations: ⏭️  Puladas`, 'yellow');
    } else {
      log(`  • Migrations: ${migrationsOk ? '✅ Todas executadas' : '⚠️  Algumas falharam'}`, migrationsOk ? 'green' : 'yellow');
    }
    log(`  • Seeds: ${seedsOk ? '✅ Todos executados' : '⚠️  Alguns falharam'}`, seedsOk ? 'green' : 'yellow');
    log(`  • Tempo total: ${duration}s`, 'cyan');
    
    if ((skipMigrations || migrationsOk) && seedsOk) {
      log('\n✅ Processo de seed concluído com sucesso!', 'green');
      log('\n💡 Próximos passos:', 'cyan');
      log('   • Acesse o Grafana: http://localhost:3001 (admin/admin)', 'yellow');
      log('   • Execute testes: npm run test', 'yellow');
      log('   • Execute testes de performance: npm run perf:checkin', 'yellow');
    } else {
      log('\n⚠️  Processo concluído com avisos. Verifique os erros acima.', 'yellow');
    }
    
    log('');
    
  } catch (error) {
    log(`\n❌ Erro fatal: ${error.message}`, 'red');
    if (error.stack) {
      log(`\nStack trace:`, 'red');
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Executar
if (require.main === module) {
  main();
}

