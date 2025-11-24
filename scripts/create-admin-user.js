#!/usr/bin/env node

/**
 * Script para criar usuário admin no Auth Service
 * 
 * Uso: node scripts/create-admin-user.js
 * 
 * Pré-requisitos:
 * - Auth Service rodando (npm run dev:auth ou npm run dev)
 * - Migrations executadas (npm run seed:all ou npm run migration:run no auth-service)
 */

let axios;
try {
  axios = require('axios');
} catch (error) {
  console.error('❌ Erro: axios não encontrado. Execute: npm install axios');
  process.exit(1);
}

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

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

async function checkAuthService() {
  try {
    // Tentar acessar o endpoint de health ou metrics
    const healthUrl = `${BASE_URL}/health`;
    const metricsUrl = `${BASE_URL}/metrics`;
    
    try {
      const response = await axios.get(healthUrl, { timeout: 3000, validateStatus: () => true });
      if (response.status < 500) {
        log('✅ Auth Service está rodando', 'green');
        return true;
      }
    } catch (healthError) {
      // Se /health não existir, tentar /metrics
      try {
        const metricsResponse = await axios.get(metricsUrl, { timeout: 3000, validateStatus: () => true });
        if (metricsResponse.status < 500) {
          log('✅ Auth Service está rodando', 'green');
          return true;
        }
      } catch (metricsError) {
        // Se ambos falharem, tentar o endpoint de auth diretamente
        try {
          const authResponse = await axios.get(`${BASE_URL}/api/v1/auth/validate`, {
            timeout: 3000,
            validateStatus: () => true,
            headers: { Authorization: 'Bearer test' }
          });
          // Se chegou aqui, o serviço está rodando (mesmo que retorne 401)
          log('✅ Auth Service está rodando', 'green');
          return true;
        } catch (authError) {
          if (authError.code === 'ECONNREFUSED') {
            log('❌ Auth Service não está rodando', 'red');
            log('   Execute: npm run dev:auth (ou npm run dev)', 'yellow');
            return false;
          }
          // Se não for ECONNREFUSED, o serviço pode estar rodando
          log('✅ Auth Service parece estar rodando', 'green');
          return true;
        }
      }
    }
    return false;
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      log('❌ Auth Service não está rodando', 'red');
      log('   Execute: npm run dev:auth (ou npm run dev)', 'yellow');
      return false;
    }
    // Se não for ECONNREFUSED, assumir que o serviço está rodando
    log('✅ Auth Service parece estar rodando', 'green');
    return true;
  }
}

async function createAdminUser() {
  const adminEmail = 'admin@observability.local';
  const adminPassword = 'Admin123!';

  try {
    log('\n📝 Criando usuário admin...', 'blue');
    log(`   Email: ${adminEmail}`, 'cyan');
    log(`   Senha: ${adminPassword}`, 'cyan');

    const response = await axios.post(`${BASE_URL}/api/v1/auth/register`, {
      email: adminEmail,
      password: adminPassword,
      role: 'ADMIN',
    });

    if (response.data && response.data.user) {
      log('\n✅ Usuário admin criado com sucesso!', 'green');
      log(`   ID: ${response.data.user.id}`, 'cyan');
      log(`   Email: ${response.data.user.email}`, 'cyan');
      log(`   Role: ${response.data.user.role}`, 'cyan');
      
      // Testar login imediatamente após criar
      log('\n🔐 Testando login...', 'blue');
      try {
        const loginTest = await axios.post(`${BASE_URL}/api/v1/auth/login`, {
          email: adminEmail,
          password: adminPassword,
        });
        
        if (loginTest.data && loginTest.data.accessToken) {
          log('✅ Login testado com sucesso!', 'green');
          log('\n💡 Credenciais para login:', 'yellow');
          log(`   Email: ${adminEmail}`, 'cyan');
          log(`   Senha: ${adminPassword}`, 'cyan');
          return true;
        }
      } catch (loginError) {
        log('⚠️  Usuário criado, mas login falhou. Tente fazer login manualmente.', 'yellow');
        log(`   Erro: ${loginError.response?.data?.message || loginError.message}`, 'yellow');
        log('\n💡 Credenciais para login:', 'yellow');
        log(`   Email: ${adminEmail}`, 'cyan');
        log(`   Senha: ${adminPassword}`, 'cyan');
        return true; // Usuário foi criado, mesmo que login tenha falhado
      }
      
      log('\n💡 Credenciais para login:', 'yellow');
      log(`   Email: ${adminEmail}`, 'cyan');
      log(`   Senha: ${adminPassword}`, 'cyan');
      return true;
    }
  } catch (error) {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || error.response.statusText;
      const fullError = error.response.data;

      // Se erro 400 ou 500, pode ser que o usuário já existe
      if ((status === 400 || status === 500) && 
          (message.includes('already exists') || 
           message.includes('já existe') || 
           message.includes('duplicate') ||
           (fullError && JSON.stringify(fullError).includes('already exists')))) {
        log('\n⚠️  Usuário admin já existe', 'yellow');
        log('   Tentando fazer login com as credenciais padrão...', 'cyan');
        
        try {
          const loginResponse = await axios.post(`${BASE_URL}/api/v1/auth/login`, {
            email: adminEmail,
            password: adminPassword,
          });

          if (loginResponse.data && loginResponse.data.user) {
            log('\n✅ Login realizado com sucesso!', 'green');
            log(`   Email: ${loginResponse.data.user.email}`, 'cyan');
            log(`   Role: ${loginResponse.data.user.role}`, 'cyan');
            log('\n💡 Credenciais para login:', 'yellow');
            log(`   Email: ${adminEmail}`, 'cyan');
            log(`   Senha: ${adminPassword}`, 'cyan');
            return true;
          }
        } catch (loginError) {
          log('\n❌ Erro ao fazer login:', 'red');
          const errorMsg = loginError.response?.data?.message || loginError.message;
          log(`   ${errorMsg}`, 'red');
          
          if (errorMsg.includes('inválid') || errorMsg.includes('invalid')) {
            log('\n💡 Possíveis causas:', 'yellow');
            log('   • A senha do usuário foi alterada', 'yellow');
            log('   • O usuário foi criado com senha diferente', 'yellow');
            log('\n💡 Soluções:', 'cyan');
            log('   1. Deletar o usuário do banco e executar este script novamente', 'yellow');
            log('   2. Ou usar o endpoint de registro diretamente via API', 'yellow');
            log('   3. Ou verificar a senha correta no banco de dados', 'yellow');
          }
          return false;
        }
      } else {
        log('\n❌ Erro ao criar usuário admin:', 'red');
        log(`   Status: ${status}`, 'red');
        log(`   Mensagem: ${message}`, 'red');
        return false;
      }
    } else {
      log('\n❌ Erro de conexão:', 'red');
      log(`   ${error.message}`, 'red');
      log('\n💡 Verifique se o Auth Service está rodando:', 'yellow');
      log('   npm run dev:auth (ou npm run dev)', 'yellow');
      return false;
    }
  }
}

async function main() {
  log('\n🚀 Criando usuário admin...\n', 'blue');
  log('═══════════════════════════════════════════════════════════', 'cyan');

  // Verificar se Auth Service está rodando
  const serviceRunning = await checkAuthService();
  if (!serviceRunning) {
    log('\n❌ Não foi possível criar usuário admin', 'red');
    process.exit(1);
  }

  // Criar usuário admin
  const success = await createAdminUser();

  log('\n═══════════════════════════════════════════════════════════', 'cyan');
  
  if (success) {
    log('\n✅ Processo concluído com sucesso!', 'green');
    log('\n💡 Próximos passos:', 'cyan');
    log('   • Acesse o frontend admin: http://localhost:5173', 'yellow');
    log('   • Faça login com as credenciais acima', 'yellow');
  } else {
    log('\n❌ Falha ao criar usuário admin', 'red');
    log('\n💡 Alternativas:', 'cyan');
    log('   • Execute: npm run seed:all (cria usuário admin automaticamente)', 'yellow');
    log('   • Ou use o endpoint diretamente: POST /api/v1/auth/register', 'yellow');
    process.exit(1);
  }

  log('');
}

// Executar
if (require.main === module) {
  main().catch((error) => {
    log(`\n❌ Erro fatal: ${error.message}`, 'red');
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  });
}

