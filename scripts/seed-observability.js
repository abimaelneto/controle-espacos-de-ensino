#!/usr/bin/env node

/**
 * Script para popular dados na base para visualização de observabilidade
 * 
 * Cria:
 * - Usuários no Auth Service
 * - Alunos no Students Service
 * - Salas no Rooms Service
 * - Check-ins distribuídos ao longo do tempo no Check-in Service
 * 
 * Uso: node scripts/seed-observability.js
 * 
 * Pré-requisito: npm install axios (no root do projeto)
 */

let axios;
try {
  axios = require('axios');
} catch (error) {
  console.error('❌ Erro: axios não encontrado. Execute: npm install axios');
  process.exit(1);
}

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
const STUDENTS_URL = process.env.STUDENTS_URL || 'http://localhost:3001';
const ROOMS_URL = process.env.ROOMS_URL || 'http://localhost:3002';
const CHECKIN_URL = process.env.CHECKIN_URL || 'http://localhost:3003';

// Cores para output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function generateCPF() {
  const n1 = Math.floor(Math.random() * 9);
  const n2 = Math.floor(Math.random() * 9);
  const n3 = Math.floor(Math.random() * 9);
  const n4 = Math.floor(Math.random() * 9);
  const n5 = Math.floor(Math.random() * 9);
  const n6 = Math.floor(Math.random() * 9);
  const n7 = Math.floor(Math.random() * 9);
  const n8 = Math.floor(Math.random() * 9);
  const n9 = Math.floor(Math.random() * 9);
  
  let d1 = n9 * 2 + n8 * 3 + n7 * 4 + n6 * 5 + n5 * 6 + n4 * 7 + n3 * 8 + n2 * 9 + n1 * 10;
  d1 = 11 - (d1 % 11);
  if (d1 >= 10) d1 = 0;
  
  let d2 = d1 * 2 + n9 * 3 + n8 * 4 + n7 * 5 + n6 * 6 + n5 * 7 + n4 * 8 + n3 * 9 + n2 * 10 + n1 * 11;
  d2 = 11 - (d2 % 11);
  if (d2 >= 10) d2 = 0;
  
  // Retornar sem formatação (apenas números) - o serviço aceita ambos os formatos
  return `${n1}${n2}${n3}${n4}${n5}${n6}${n7}${n8}${n9}${d1}${d2}`;
}

function generateMatricula() {
  const year = 2024;
  const sequence = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
  return `${year}${sequence}`;
}

const firstNames = [
  'João', 'Maria', 'Pedro', 'Ana', 'Carlos', 'Juliana', 'Fernando', 'Patricia',
  'Ricardo', 'Camila', 'Lucas', 'Mariana', 'Gabriel', 'Beatriz', 'Rafael', 'Larissa',
  'Thiago', 'Amanda', 'Bruno', 'Carolina', 'Felipe', 'Isabela', 'Gustavo', 'Renata',
  'André', 'Vanessa', 'Rodrigo', 'Tatiana', 'Marcos', 'Priscila', 'Diego', 'Fernanda',
];

const lastNames = [
  'Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Pereira',
  'Lima', 'Gomes', 'Ribeiro', 'Carvalho', 'Almeida', 'Costa', 'Martins', 'Rocha',
  'Araújo', 'Mendes', 'Nascimento', 'Moreira', 'Barbosa', 'Freitas', 'Cavalcanti', 'Dias',
];

const roomTypes = ['CLASSROOM', 'LABORATORY', 'AUDITORIUM', 'STUDY_ROOM'];
const identificationMethods = ['MATRICULA', 'CPF', 'QR_CODE', 'BIOMETRIC'];

// Armazenar dados criados
let users = [];
let students = [];
let rooms = [];
let adminToken = null;

/**
 * Criar usuário admin
 */
async function createAdminUser() {
  try {
    log('📝 Criando usuário admin...', 'blue');
    const response = await axios.post(`${BASE_URL}/api/v1/auth/register`, {
      email: 'admin@observability.local',
      password: 'Admin123!',
      role: 'ADMIN',
    });
    
    users.push(response.data.user);
    
    // Fazer login
    const loginResponse = await axios.post(`${BASE_URL}/api/v1/auth/login`, {
      email: 'admin@observability.local',
      password: 'Admin123!',
    });
    
    if (!loginResponse.data) {
      throw new Error('Resposta de login vazia');
    }
    
    if (!loginResponse.data.accessToken) {
      log(`   ⚠️  Resposta do login: ${JSON.stringify(loginResponse.data)}`, 'yellow');
      throw new Error('Token não retornado no login');
    }
    
    adminToken = loginResponse.data.accessToken;
    log(`   ✅ Token obtido (${adminToken.length} caracteres)`, 'green');
    log(`✅ Admin criado e autenticado (ID: ${response.data.user.id})`, 'green');
    return response.data.user;
  } catch (error) {
    const status = error.response?.status;
    const errorMessage = error.response?.data?.message || '';
    const isAlreadyExists = 
      status === 400 && errorMessage.includes('already exists') ||
      status === 409 ||
      status === 500;
    
    if (isAlreadyExists) {
      // Usuário já existe, fazer login
      log('⚠️  Admin já existe, fazendo login...', 'yellow');
      try {
        const loginResponse = await axios.post(`${BASE_URL}/api/v1/auth/login`, {
          email: 'admin@observability.local',
          password: 'Admin123!',
        }, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!loginResponse.data) {
          throw new Error('Resposta de login vazia');
        }
        
        if (!loginResponse.data.accessToken) {
          log(`   ⚠️  Resposta do login: ${JSON.stringify(loginResponse.data)}`, 'yellow');
          throw new Error('Token não retornado no login');
        }
        
        adminToken = loginResponse.data.accessToken;
        log(`✅ Login realizado (Token: ${adminToken.length} caracteres)`, 'green');
        return loginResponse.data.user || { id: 'admin-user' };
      } catch (loginError) {
        log(`   ❌ Erro ao fazer login: ${loginError.message}`, 'red');
        if (loginError.response) {
          log(`   Status: ${loginError.response.status}`, 'red');
          log(`   Data: ${JSON.stringify(loginError.response.data)}`, 'red');
        }
        throw loginError;
      }
    }
    log(`❌ Erro ao criar admin: ${error.message}`, 'red');
    if (error.response) {
      log(`   Status: ${error.response.status}`, 'red');
      log(`   Data: ${JSON.stringify(error.response.data)}`, 'red');
    }
    throw error;
  }
}

/**
 * Criar usuários para alunos
 */
async function createUsers(count = 50) {
  log(`👥 Criando ${count} usuários...`, 'blue');
  const created = [];
  
  for (let i = 0; i < count; i++) {
    try {
      const email = `student${i + 1}@observability.local`;
      // Tentar criar usuário
      try {
        const response = await axios.post(`${BASE_URL}/api/v1/auth/register`, {
          email,
          password: 'Student123!',
          role: 'STUDENT',
        }, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (response.data?.user) {
          created.push(response.data.user);
          continue;
        }
      } catch (registerError) {
        const status = registerError.response?.status;
        const errorMessage = registerError.response?.data?.message || '';
        const isAlreadyExists = 
          status === 400 && errorMessage.includes('already exists') ||
          status === 409 ||
          status === 500;
        
        // Se usuário já existe, tentar fazer login para obter os dados
        if (isAlreadyExists) {
          try {
            const loginResponse = await axios.post(`${BASE_URL}/api/v1/auth/login`, {
              email,
              password: 'Student123!',
            }, {
              headers: {
                'Content-Type': 'application/json',
              },
            });
            if (loginResponse.data?.user) {
              created.push(loginResponse.data.user);
              // Não logar como erro, é esperado em re-execuções
              continue;
            }
          } catch (loginError) {
            // Se login falhar, o usuário existe mas senha pode estar errada
            // Continuar sem adicionar à lista (usuário existe mas não podemos usar)
            continue;
          }
        } else {
          // Erro inesperado - mostrar detalhes
          log(`❌ Erro ao criar usuário ${i + 1}: ${registerError.message}`, 'red');
          if (registerError.response) {
            log(`   Status: ${registerError.response.status}`, 'red');
            log(`   Data: ${JSON.stringify(registerError.response.data)}`, 'red');
          }
        }
      }
    } catch (error) {
      log(`❌ Erro inesperado ao criar usuário ${i + 1}: ${error.message}`, 'red');
    }
  }
  
  users.push(...created);
  if (created.length < count) {
    log(`⚠️  ${created.length}/${count} usuários disponíveis (alguns já existiam)`, 'yellow');
  } else {
    log(`✅ ${created.length} usuários criados`, 'green');
  }
  return created;
}

/**
 * Criar alunos
 */
async function createStudents(userIds, count = 50) {
  log(`🎓 Criando ${count} alunos...`, 'blue');
  const created = [];
  
  for (let i = 0; i < Math.min(count, userIds.length); i++) {
    try {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const cpf = generateCPF();
      const matricula = generateMatricula();
      
      if (!userIds[i] || !userIds[i].id) {
        log(`⚠️  Usuário ${i + 1} não tem ID válido, pulando...`, 'yellow');
        continue;
      }
      
      if (!adminToken) {
        log(`⚠️  Token não disponível, fazendo login...`, 'yellow');
        const loginResponse = await axios.post(`${BASE_URL}/api/v1/auth/login`, {
          email: 'admin@observability.local',
          password: 'Admin123!',
        });
        if (!loginResponse.data?.accessToken) {
          log(`❌ Falha ao obter token`, 'red');
          continue;
        }
        adminToken = loginResponse.data.accessToken;
      }
      
      const studentData = {
        userId: userIds[i].id,
        firstName,
        lastName,
        cpf,
        email: `student${i + 1}@observability.local`,
        matricula,
      };
      
      const response = await axios.post(
        `${STUDENTS_URL}/api/v1/students`,
        studentData,
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
            'Content-Type': 'application/json',
          },
          validateStatus: (status) => status < 500, // Aceitar 2xx, 3xx, 4xx
        },
      );
      
      if (response.status === 201 || response.status === 200) {
        created.push(response.data);
      } else if (response.status === 409 || (response.status === 400 && response.data?.message?.includes('already exists'))) {
        // Duplicado, pular silenciosamente (é esperado em re-execuções)
        continue;
      } else {
        throw new Error(`Status ${response.status}: ${JSON.stringify(response.data)}`);
      }
    } catch (error) {
      const status = error.response?.status;
      const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message;
      const isAlreadyExists = 
        status === 409 || 
        (status === 400 && errorMsg.includes('already exists'));
      
      if (isAlreadyExists) {
        // Duplicado, pular silenciosamente (é esperado em re-execuções)
        continue;
      }
      
      const errorCode = error.code || status || 'N/A';
      log(`❌ Erro ao criar aluno ${i + 1}: ${errorMsg} (Code: ${errorCode})`, 'red');
      if (error.code === 'ECONNREFUSED' || error.message?.includes('ECONNREFUSED')) {
        log(`   ⚠️  Students Service não está rodando na porta 3001`, 'yellow');
      }
      if (error.response?.status === 401 || errorMsg.includes('Invalid') || errorMsg.includes('API')) {
        log(`   🔄 Token inválido, renovando...`, 'yellow');
        try {
          const loginResponse = await axios.post(`${BASE_URL}/api/v1/auth/login`, {
            email: 'admin@observability.local',
            password: 'Admin123!',
          });
          if (loginResponse.data?.accessToken) {
            adminToken = loginResponse.data.accessToken;
            log(`   ✅ Token renovado`, 'green');
            i--; // Repetir esta iteração
            continue;
          } else {
            log(`   ❌ Token não retornado no login`, 'red');
          }
        } catch (loginError) {
          log(`   ❌ Erro ao renovar token: ${loginError.message}`, 'red');
        }
      }
    }
  }
  
  students.push(...created);
  if (created.length < count) {
    log(`⚠️  ${created.length}/${count} alunos criados (alguns já existiam)`, 'yellow');
  } else {
    log(`✅ ${created.length} alunos criados`, 'green');
  }
  return created;
}

/**
 * Criar salas
 */
async function createRooms(count = 20) {
  log(`🏫 Criando ${count} salas...`, 'blue');
  const created = [];
  const roomNumbers = new Set();
  
  for (let i = 0; i < count; i++) {
    try {
      let roomNumber;
      do {
        const building = String.fromCharCode(65 + Math.floor(i / 10)); // A, B, C...
        const floor = Math.floor((i % 10) / 3) + 1;
        const room = (i % 10) + 1;
        roomNumber = `${building}${floor}${room.toString().padStart(2, '0')}`;
      } while (roomNumbers.has(roomNumber));
      
      roomNumbers.add(roomNumber);
      
      const type = roomTypes[Math.floor(Math.random() * roomTypes.length)];
      const capacity = type === 'AUDITORIUM' 
        ? Math.floor(Math.random() * 200) + 100 // 100-300
        : type === 'LABORATORY'
        ? Math.floor(Math.random() * 30) + 20 // 20-50
        : Math.floor(Math.random() * 40) + 20; // 20-60
      
      if (!adminToken) {
        log(`⚠️  Token não disponível, fazendo login...`, 'yellow');
        const loginResponse = await axios.post(`${BASE_URL}/api/v1/auth/login`, {
          email: 'admin@observability.local',
          password: 'Admin123!',
        });
        adminToken = loginResponse.data.accessToken;
      }
      
      const roomData = {
        roomNumber,
        capacity,
        type,
        description: `Sala ${type.toLowerCase()} ${roomNumber}`,
        hasEquipment: type === 'LABORATORY' || Math.random() > 0.5,
      };
      
      // Validar dados antes de enviar
      if (!roomNumber || roomNumber.length < 3) {
        log(`⚠️  Número de sala inválido: ${roomNumber}, pulando...`, 'yellow');
        continue;
      }
      
      if (!capacity || capacity < 1) {
        log(`⚠️  Capacidade inválida: ${capacity}, usando padrão 30...`, 'yellow');
        roomData.capacity = 30;
      }
      
      const response = await axios.post(
        `${ROOMS_URL}/api/v1/rooms`,
        roomData,
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
            'Content-Type': 'application/json',
          },
          validateStatus: (status) => status < 500, // Aceitar 2xx, 3xx, 4xx
        },
      );
      
      if (response.status === 201 || response.status === 200) {
        created.push(response.data);
      } else if (response.status === 409 || (response.status === 400 && response.data?.message?.includes('already exists'))) {
        // Duplicado, pular silenciosamente (é esperado em re-execuções)
        continue;
      } else {
        throw new Error(`Status ${response.status}: ${JSON.stringify(response.data)}`);
      }
    } catch (error) {
      const status = error.response?.status;
      const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message;
      const isAlreadyExists = 
        status === 409 || 
        (status === 400 && errorMsg.includes('already exists'));
      
      if (isAlreadyExists) {
        // Duplicado, pular silenciosamente (é esperado em re-execuções)
        continue;
      }
      
      log(`❌ Erro ao criar sala ${i + 1}: ${errorMsg}`, 'red');
      if (error.response?.data) {
        log(`   Detalhes: ${JSON.stringify(error.response.data)}`, 'yellow');
      }
      if (error.response?.status === 401 || errorMsg.includes('Invalid') || errorMsg.includes('API')) {
        log(`   🔄 Token inválido, renovando...`, 'yellow');
        try {
          const loginResponse = await axios.post(`${BASE_URL}/api/v1/auth/login`, {
            email: 'admin@observability.local',
            password: 'Admin123!',
          });
          if (loginResponse.data?.accessToken) {
            adminToken = loginResponse.data.accessToken;
            log(`   ✅ Token renovado`, 'green');
            i--; // Repetir esta iteração
            continue;
          }
        } catch (loginError) {
          log(`   ❌ Erro ao renovar token: ${loginError.message}`, 'red');
        }
      }
      if (error.response?.status === 500) {
        log(`   ⚠️  Erro interno do servidor. Verifique logs do Rooms Service.`, 'yellow');
      }
    }
  }
  
  rooms.push(...created);
  if (created.length < count) {
    log(`⚠️  ${created.length}/${count} salas criadas (algumas já existiam)`, 'yellow');
  } else {
    log(`✅ ${created.length} salas criadas`, 'green');
  }
  return created;
}

/**
 * Criar check-ins distribuídos ao longo do tempo
 */
async function createCheckIns(students, rooms, count = 200) {
  log(`📋 Criando ${count} check-ins distribuídos...`, 'blue');
  let created = 0;
  let failed = 0;
  
  // Distribuir check-ins nas últimas 24 horas
  const now = Date.now();
  const oneDayAgo = now - (24 * 60 * 60 * 1000);
  
  for (let i = 0; i < count; i++) {
    try {
      // Selecionar aluno e sala aleatórios
      const student = students[Math.floor(Math.random() * students.length)];
      const room = rooms[Math.floor(Math.random() * rooms.length)];
      
      // Verificar se aluno está ativo
      if (student.status !== 'ACTIVE') {
        failed++;
        continue;
      }
      
      // Método de identificação aleatório
      const method = identificationMethods[Math.floor(Math.random() * identificationMethods.length)];
      const identificationValue = method === 'MATRICULA' 
        ? student.matricula
        : method === 'CPF'
        ? student.cpf
        : `QR-${student.id.substring(0, 8)}`;
      
      // Criar check-in
      const response = await axios.post(`${CHECKIN_URL}/api/v1/checkin`, {
        studentId: student.id,
        roomId: room.id,
        identificationMethod: method,
        identificationValue,
      }, {
        validateStatus: (status) => status < 500, // Aceitar 2xx, 3xx, 4xx
      });
      
      // Check-in retorna 201 mesmo quando success=false
      if (response.status === 201 && response.data?.success === true) {
        created++;
        
        // Log progresso a cada 20 check-ins
        if (created % 20 === 0) {
          log(`  ✓ ${created} check-ins criados...`, 'yellow');
        }
      } else {
        failed++;
      }
      
      // Pequeno delay para não sobrecarregar
      if (i % 10 === 0) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (error) {
      failed++;
      // Ignorar erros de validação (capacidade, etc.)
      continue;
    }
  }
  
  log(`✅ ${created} check-ins criados, ${failed} falharam`, 'green');
  return created;
}

/**
 * Verificar se serviços estão disponíveis
 */
async function checkServices() {
  log('🔍 Verificando disponibilidade dos serviços...', 'blue');
  
  const services = [
    { name: 'Auth', url: BASE_URL },
    { name: 'Students', url: STUDENTS_URL },
    { name: 'Rooms', url: ROOMS_URL },
    { name: 'Check-in', url: CHECKIN_URL },
  ];
  
  for (const service of services) {
    try {
      // Tentar /metrics primeiro (mais comum)
      await axios.get(`${service.url}/metrics`, { timeout: 5000 });
      log(`  ✓ ${service.name} Service disponível`, 'green');
    } catch (error) {
      try {
        // Tentar /health como fallback
        await axios.get(`${service.url}/health`, { timeout: 5000 });
        log(`  ✓ ${service.name} Service disponível`, 'green');
      } catch (error2) {
        log(`  ⚠️  ${service.name} Service pode não estar disponível (tentará continuar)`, 'yellow');
      }
    }
  }
}

/**
 * Função principal
 */
async function main() {
  log('\n🚀 Iniciando seed de dados para observabilidade...\n', 'blue');
  log('💡 Nota: Se os dados já existirem, o script tentará reutilizá-los.\n', 'yellow');
  
  try {
    // Verificar serviços
    await checkServices();
    log('');
    
    // Criar admin
    await createAdminUser();
    log('');
    
    // Criar usuários e alunos
    const createdUsers = await createUsers(50);
    // Garantir que temos usuários válidos
    if (createdUsers.length === 0) {
      log('⚠️  Nenhum usuário disponível. Tentando criar usuários novamente...', 'yellow');
      const retryUsers = await createUsers(10); // Criar pelo menos 10
      if (retryUsers.length === 0) {
        log('❌ Não foi possível obter usuários. Abortando criação de alunos.', 'red');
        log('   💡 Dica: Limpe o banco de dados ou verifique se o Auth Service está funcionando.', 'yellow');
        return;
      }
      createdUsers.push(...retryUsers);
    }
    
    const userIds = createdUsers;
    log('');
    
    const createdStudents = await createStudents(userIds, 50);
    if (createdStudents.length === 0) {
      log('⚠️  Nenhum aluno criado. Verifique se o Students Service está rodando.', 'yellow');
      return;
    }
    log('');
    
    // Criar salas
    const createdRooms = await createRooms(20);
    if (createdRooms.length === 0) {
      log('⚠️  Nenhuma sala criada. Verifique se o Rooms Service está rodando.', 'yellow');
      return;
    }
    log('');
    
    // Criar check-ins
    await createCheckIns(createdStudents, createdRooms, 200);
    log('');
    
    // Resumo
    log('\n📊 Resumo Final:', 'blue');
    log(`  • Usuários disponíveis: ${users.length}`, users.length > 0 ? 'green' : 'yellow');
    log(`  • Alunos criados: ${createdStudents.length}`, createdStudents.length > 0 ? 'green' : 'yellow');
    log(`  • Salas criadas: ${createdRooms.length}`, createdRooms.length > 0 ? 'green' : 'yellow');
    log(`  • Check-ins: ~200 distribuídos`, 'green');
    
    if (createdUsers.length < 50) {
      log(`\n⚠️  Nota: ${50 - createdUsers.length} usuários já existiam e foram reutilizados.`, 'yellow');
    }
    
    log('\n✅ Seed concluído! Agora você pode visualizar os gráficos no Grafana.', 'green');
    log('   Acesse: http://localhost:3001 (admin/admin)', 'yellow');
    log('');
    
  } catch (error) {
    log(`\n❌ Erro durante seed: ${error.message}`, 'red');
    if (error.response) {
      log(`   Status: ${error.response.status}`, 'red');
      log(`   Data: ${JSON.stringify(error.response.data)}`, 'red');
    }
    process.exit(1);
  }
}

// Executar
if (require.main === module) {
  main();
}

module.exports = { main };

