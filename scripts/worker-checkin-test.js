#!/usr/bin/env node

/**
 * Worker de Teste - Check-ins Automáticos
 * 
 * Simula check-ins em tempo real para testar gráficos e monitoramento
 * 
 * Uso: node scripts/worker-checkin-test.js [opções]
 * 
 * Opções:
 *   --interval=2000    Intervalo entre check-ins em ms (padrão: 2000 = 2s)
 *   --duration=300000  Duração total em ms (padrão: 300000 = 5min)
 *   --rooms=5          Número de salas para usar (padrão: todas)
 *   --students=10      Número de alunos para usar (padrão: todos)
 *   --max-concurrent=3 Máximo de check-ins simultâneos (padrão: 3)
 * 
 * Exemplo:
 *   node scripts/worker-checkin-test.js --interval=3000 --duration=600000
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

// Configuração do axios com timeout
const axiosConfig = {
  timeout: 10000, // 10 segundos
  headers: {
    'Content-Type': 'application/json',
  },
};

// Parse argumentos
const args = process.argv.slice(2);
const config = {
  interval: parseInt(args.find(arg => arg.startsWith('--interval='))?.split('=')[1] || '2000'),
  duration: parseInt(args.find(arg => arg.startsWith('--duration='))?.split('=')[1] || '300000'),
  maxRooms: parseInt(args.find(arg => arg.startsWith('--rooms='))?.split('=')[1] || '0'), // 0 = todas
  maxStudents: parseInt(args.find(arg => arg.startsWith('--students='))?.split('=')[1] || '0'), // 0 = todos
  maxConcurrent: parseInt(args.find(arg => arg.startsWith('--max-concurrent='))?.split('=')[1] || '3'),
};

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
  const timestamp = new Date().toLocaleTimeString('pt-BR');
  console.log(`${colors[color]}[${timestamp}] ${message}${colors.reset}`);
}

let students = [];
let rooms = [];
let activeCheckIns = new Map(); // roomId -> Set<studentId>
let studentActiveCheckIns = new Map(); // studentId -> { roomId, attendanceId }
let stats = {
  total: 0,
  success: 0,
  errors: 0,
  skipped: 0, // Check-ins pulados por já ter check-in ativo
  checkouts: 0, // Check-outs realizados
  startTime: null,
};

/**
 * Verificar saúde do serviço
 * Tenta múltiplos endpoints e aceita qualquer resposta < 500 como "serviço rodando"
 */
async function checkServiceHealth(url, serviceName, healthEndpoints = ['/metrics', '/health']) {
  // Endpoints específicos por serviço
  const serviceEndpoints = {
    'Students Service': ['/api/v1/students', '/metrics', '/health'],
    'Rooms Service': ['/api/v1/rooms', '/metrics', '/health'],
    'Check-in Service': ['/metrics', '/api', '/health'],
  };
  
  const endpoints = serviceEndpoints[serviceName] || healthEndpoints;
  
  for (const endpoint of endpoints) {
    try {
      const response = await axios.get(`${url}${endpoint}`, { 
        ...axiosConfig, 
        timeout: 5000,
        validateStatus: (status) => status < 500, // Aceitar 2xx, 3xx, 4xx
      });
      
      // Qualquer resposta < 500 significa que o serviço está rodando
      if (response.status < 500) {
        return true;
      }
    } catch (error) {
      // ECONNREFUSED ou timeout = serviço não está rodando
      if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
        log(`⚠️  ${serviceName} não está respondendo: ${error.code || error.message}`, 'yellow');
        return false;
      }
      // Outros erros (404, etc.) = serviço está rodando mas endpoint não existe
      // Continuar tentando outros endpoints
      continue;
    }
  }
  
  // Se chegou aqui, nenhum endpoint funcionou mas não foi ECONNREFUSED
  // Provavelmente o serviço está rodando mas sem endpoints de health
  // Vamos considerar como "ok" se não foi ECONNREFUSED
  return true;
}

/**
 * Buscar alunos disponíveis
 * Filtra apenas alunos ativos (mesma lógica do seed)
 */
async function fetchStudents() {
  try {
    log('📚 Buscando alunos...', 'blue');
    const response = await axios.get(`${STUDENTS_URL}/api/v1/students`, axiosConfig);
    
    let allStudents = response.data || [];
    
    // Filtrar apenas alunos ativos (mesma validação do seed)
    allStudents = allStudents.filter(s => s.status === 'ACTIVE');
    
    if (config.maxStudents > 0) {
      allStudents = allStudents.slice(0, config.maxStudents);
    }
    
    students = allStudents;
    log(`✅ ${students.length} alunos ativos encontrados`, 'green');
    
    if (students.length === 0) {
      log('⚠️  Nenhum aluno ativo encontrado!', 'yellow');
    }
    
    return students;
  } catch (error) {
    log(`❌ Erro ao buscar alunos: ${error.message}`, 'red');
    return [];
  }
}

/**
 * Buscar salas disponíveis
 * Filtra apenas salas ativas (mesma lógica do seed)
 */
async function fetchRooms() {
  try {
    log('🏢 Buscando salas...', 'blue');
    const response = await axios.get(`${ROOMS_URL}/api/v1/rooms`, axiosConfig);
    
    let allRooms = response.data || [];
    
    // Filtrar apenas salas ativas (mesma validação do seed)
    allRooms = allRooms.filter(r => r.status === 'ACTIVE');
    
    if (config.maxRooms > 0) {
      allRooms = allRooms.slice(0, config.maxRooms);
    }
    
    rooms = allRooms;
    log(`✅ ${rooms.length} salas ativas encontradas`, 'green');
    
    if (rooms.length === 0) {
      log('⚠️  Nenhuma sala ativa encontrada!', 'yellow');
    } else {
      // Log de exemplo para debug
      log(`   Exemplo: ${rooms[0].roomNumber} (ID: ${rooms[0].id.substring(0, 8)}...)`, 'cyan');
    }
    
    return rooms;
  } catch (error) {
    log(`❌ Erro ao buscar salas: ${error.message}`, 'red');
    if (error.response) {
      log(`   Status: ${error.response.status}`, 'red');
      log(`   Data: ${JSON.stringify(error.response.data)}`, 'red');
    }
    return [];
  }
}

// Removida função generateIdempotencyKey - não é mais necessária
// O backend gera automaticamente o idempotencyKey se não fornecido

/**
 * Fazer check-in
 * 
 * Segue a mesma lógica do seed-observability.js para garantir consistência
 */
async function performCheckIn(student, room) {
  // Validações pré-check-in
  if (!student || !student.id) {
    stats.errors++;
    log(`⚠️  Aluno inválido, pulando...`, 'yellow');
    return false;
  }

  if (!room || !room.id) {
    stats.errors++;
    log(`⚠️  Sala inválida, pulando...`, 'yellow');
    return false;
  }

  // Verificar se aluno está ativo (mesma validação do seed)
  if (student.status !== 'ACTIVE') {
    stats.errors++;
    log(`⚠️  Aluno ${student.firstName || student.id} não está ativo, pulando...`, 'yellow');
    return false;
  }

  // Verificar se sala está ativa (mesma validação do seed)
  if (room.status !== 'ACTIVE') {
    stats.errors++;
    log(`⚠️  Sala ${room.roomNumber || room.id} não está ativa, pulando...`, 'yellow');
    return false;
  }

  // Verificar se aluno já tem check-in ativo em outra sala
  const activeCheckIn = studentActiveCheckIns.get(student.id);
  if (activeCheckIn && activeCheckIn.roomId !== room.id) {
    // Aluno já tem check-in em outra sala, pular
    stats.skipped++;
    if (stats.skipped <= 3) {
      log(`⏭️  Aluno já tem check-in ativo em outra sala, pulando...`, 'cyan');
    }
    return false;
  }

  // Se já tem check-in na mesma sala, permitir (pode ser novo check-in do mesmo dia)
  // Mas vamos tentar evitar para não gerar muitos erros

  // Método de identificação aleatório (mesma lógica do seed)
  // Usar apenas MATRICULA e CPF para maior compatibilidade
  const identificationMethods = ['MATRICULA', 'CPF'];
  const method = identificationMethods[Math.floor(Math.random() * identificationMethods.length)];
  
  // Determinar valor de identificação (mesma lógica do seed)
  let identificationValue;
  if (method === 'MATRICULA') {
    identificationValue = student.matricula;
    if (!identificationValue) {
      stats.errors++;
      log(`⚠️  Aluno ${student.id} não tem matrícula, pulando...`, 'yellow');
      return false;
    }
  } else if (method === 'CPF') {
    identificationValue = student.cpf ? student.cpf.replace(/\D/g, '') : null;
    if (!identificationValue) {
      stats.errors++;
      log(`⚠️  Aluno ${student.id} não tem CPF, pulando...`, 'yellow');
      return false;
    }
  } else {
    // QR_CODE ou BIOMETRIC: usar ID do aluno como base
    identificationValue = `QR-${student.id.substring(0, 8)}`;
  }

  try {
    // Payload seguindo exatamente o padrão do seed (linha 478-485)
    // O seed envia studentId, roomId, identificationMethod, identificationValue
    // NÃO envia idempotencyKey (deixa o backend gerar automaticamente)
    const payload = {
      studentId: student.id,
      roomId: room.id,
      identificationMethod: method,
      identificationValue: identificationValue,
    };

    // Log de debug (apenas para primeiros check-ins)
    if (stats.total < 3) {
      log(`   Debug: studentId=${student.id.substring(0, 8)}..., roomId=${room.id.substring(0, 8)}..., method=${method}`, 'cyan');
    }

    const response = await axios.post(
      `${CHECKIN_URL}/api/v1/checkin`,
      payload,
      {
        ...axiosConfig,
        // Usar validateStatus como no seed para aceitar 2xx, 3xx, 4xx
        validateStatus: (status) => status < 500,
      }
    );

    // Verificar sucesso seguindo a mesma lógica do seed (linha 488)
    // Check-in retorna 201 mesmo quando success=false
    if (response.status === 201 && response.data?.success === true) {
      stats.success++;
      
      // Registrar check-in ativo
      if (!activeCheckIns.has(room.id)) {
        activeCheckIns.set(room.id, new Set());
      }
      activeCheckIns.get(room.id).add(student.id);
      
      // Registrar check-in ativo do aluno (substitui qualquer check-in anterior)
      studentActiveCheckIns.set(student.id, {
        roomId: room.id,
        attendanceId: response.data.checkInId || 'unknown',
      });
      
      const studentName = student.firstName && student.lastName 
        ? `${student.firstName} ${student.lastName}`
        : student.id.substring(0, 8);
      log(
        `✅ Check-in: ${studentName} → ${room.roomNumber || room.id} (${method})`,
        'green'
      );
      return true;
    } else {
      // Status 201 mas success=false ou outro status (409 conflict, etc.)
      const message = response.data?.message || 'Erro desconhecido';
      
      // Se o erro for "já possui check-in em outra sala", atualizar nosso cache
      if (message.includes('já possui um check-in ativo em outra sala') || 
          message.includes('já possui um check-in registrado hoje')) {
        // Não contar como erro, apenas como skip
        stats.skipped++;
        // Tentar descobrir em qual sala o aluno está
        // Não temos essa info na resposta, mas podemos tentar buscar depois
        if (stats.skipped <= 3) {
          log(
            `⏭️  Check-in pulado: ${message} (studentId: ${student.id.substring(0, 8)}...)`,
            'cyan'
          );
        }
        return false;
      }
      
      stats.errors++;
      // Log mais detalhado para debug
      if (stats.errors <= 5) {
        log(
          `⚠️  Check-in falhou: ${message} (Status: ${response.status}, studentId: ${student.id.substring(0, 8)}..., roomId: ${room.id.substring(0, 8)}...)`,
          'yellow'
        );
      } else {
        log(
          `⚠️  Check-in falhou: ${message} (Status: ${response.status})`,
          'yellow'
        );
      }
      return false;
    }
  } catch (error) {
    // Erros de rede ou 5xx
    stats.errors++;
    
    // Determinar tipo de erro e mensagem
    let errorMsg = 'Erro desconhecido';
    let errorDetails = '';
    
    if (error.code === 'ECONNREFUSED') {
      errorMsg = 'Conexão recusada - Check-in Service não está rodando';
      errorDetails = `Verifique se o serviço está rodando em ${CHECKIN_URL}`;
    } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
      errorMsg = 'Timeout na requisição';
      errorDetails = 'O serviço demorou muito para responder (>10s)';
    } else if (error.code === 'ENOTFOUND') {
      errorMsg = 'Servidor não encontrado';
      errorDetails = `Não foi possível resolver o host: ${CHECKIN_URL}`;
    } else if (error.response) {
      // Erro HTTP (5xx)
      errorMsg = error.response.data?.message || `Erro HTTP ${error.response.status}`;
      errorDetails = `Status: ${error.response.status}, URL: ${error.config?.url}`;
    } else if (error.message) {
      errorMsg = error.message;
      errorDetails = `Código: ${error.code || 'N/A'}`;
    }
    
    // Log mais detalhado para primeiros erros ou erros críticos
    const isCriticalError = error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND';
    const shouldLogDetails = stats.errors <= 10 || isCriticalError;
    
    if (shouldLogDetails) {
      log(`❌ Erro no check-in: ${errorMsg}`, 'red');
      if (errorDetails) {
        log(`   ${errorDetails}`, 'red');
      }
      if (error.response?.data && stats.errors <= 5) {
        log(`   Response: ${JSON.stringify(error.response.data)}`, 'red');
      }
      if (isCriticalError) {
        log(`   ⚠️  ERRO CRÍTICO: Verifique se o Check-in Service está rodando!`, 'red');
      }
    } else if (stats.errors % 10 === 0) {
      // Log resumido a cada 10 erros
      log(`❌ ${stats.errors} erros acumulados. Último: ${errorMsg}`, 'red');
    }
    
    return false;
  }
}

/**
 * Fazer check-out
 */
async function performCheckOut(student, method = 'MATRICULA') {
  if (!student || !student.id) {
    return false;
  }

  // Determinar valor de identificação
  let identificationValue;
  if (method === 'MATRICULA') {
    identificationValue = student.matricula;
    if (!identificationValue) {
      return false;
    }
  } else if (method === 'CPF') {
    identificationValue = student.cpf ? student.cpf.replace(/\D/g, '') : null;
    if (!identificationValue) {
      return false;
    }
  } else {
    identificationValue = `QR-${student.id.substring(0, 8)}`;
  }

  try {
    const payload = {
      identificationMethod: method,
      identificationValue: identificationValue,
    };

    const response = await axios.post(
      `${CHECKIN_URL}/api/v1/checkin/checkout`,
      payload,
      {
        ...axiosConfig,
        validateStatus: (status) => status < 500,
      }
    );

    if (response.status === 200 && response.data?.success === true) {
      // Remover do cache de check-ins ativos
      studentActiveCheckIns.delete(student.id);
      
      // Remover de todas as salas
      for (const [roomId, studentSet] of activeCheckIns.entries()) {
        studentSet.delete(student.id);
        if (studentSet.size === 0) {
          activeCheckIns.delete(roomId);
        }
      }

      const studentName = student.firstName && student.lastName 
        ? `${student.firstName} ${student.lastName}`
        : student.id.substring(0, 8);
      log(
        `✅ Check-out: ${studentName} (${method})`,
        'green'
      );
      return true;
    } else {
      const message = response.data?.message || 'Erro desconhecido';
      if (stats.errors <= 5) {
        log(
          `⚠️  Check-out falhou: ${message} (Status: ${response.status})`,
          'yellow'
        );
      }
      return false;
    }
  } catch (error) {
    if (stats.errors <= 5) {
      log(`⚠️  Erro no check-out: ${error.message}`, 'yellow');
    }
    return false;
  }
}

/**
 * Selecionar aluno e sala aleatórios
 * Evita alunos que já têm check-in ativo em outra sala
 */
function selectRandomStudentAndRoom() {
  if (students.length === 0 || rooms.length === 0) {
    return null;
  }

  // Filtrar alunos que já têm check-in ativo em outra sala
  const availableStudents = students.filter((student) => {
    const activeCheckIn = studentActiveCheckIns.get(student.id);
    // Se não tem check-in ativo, ou se tem na mesma sala que vamos tentar, permitir
    // Mas vamos tentar evitar alunos com check-in ativo para reduzir erros
    return !activeCheckIn;
  });

  // Se não há alunos disponíveis, usar todos (pode tentar mesmo com check-in ativo)
  const studentsToUse = availableStudents.length > 0 ? availableStudents : students;
  
  const student = studentsToUse[Math.floor(Math.random() * studentsToUse.length)];
  const room = rooms[Math.floor(Math.random() * rooms.length)];

  return { student, room };
}

/**
 * Selecionar aluno aleatório com check-in ativo para checkout
 */
function selectRandomStudentWithCheckIn() {
  if (studentActiveCheckIns.size === 0) {
    return null;
  }

  const studentIds = Array.from(studentActiveCheckIns.keys());
  const randomStudentId = studentIds[Math.floor(Math.random() * studentIds.length)];
  const student = students.find(s => s.id === randomStudentId);
  
  return student || null;
}

/**
 * Processar um lote de check-ins
 */
async function processBatch() {
  const batchSize = Math.min(
    config.maxConcurrent,
    Math.floor(Math.random() * config.maxConcurrent) + 1
  );
  
  const promises = [];
  
  for (let i = 0; i < batchSize; i++) {
    const selection = selectRandomStudentAndRoom();
    if (selection) {
      promises.push(performCheckIn(selection.student, selection.room));
    }
  }
  
  await Promise.all(promises);
  stats.total += batchSize;
}

/**
 * Processar check-outs (30% de chance a cada ciclo)
 */
async function processCheckouts() {
  // 30% de chance de fazer checkout de algum aluno
  if (Math.random() < 0.3 && studentActiveCheckIns.size > 0) {
    const student = selectRandomStudentWithCheckIn();
    if (student) {
      const methods = ['MATRICULA', 'CPF'];
      const method = methods[Math.floor(Math.random() * methods.length)];
      const success = await performCheckOut(student, method);
      if (success) {
        stats.checkouts++;
      }
    }
  }
}

/**
 * Exibir estatísticas
 */
function displayStats() {
  const elapsed = Date.now() - stats.startTime;
  const elapsedSeconds = Math.floor(elapsed / 1000);
  const rate = elapsedSeconds > 0 ? (stats.total / elapsedSeconds).toFixed(2) : 0;
  
  log('', 'cyan');
  log('═══════════════════════════════════════', 'cyan');
  log('📊 ESTATÍSTICAS DO WORKER', 'cyan');
  log('═══════════════════════════════════════', 'cyan');
  log(`⏱️  Tempo decorrido: ${elapsedSeconds}s`, 'cyan');
  log(`📈 Total de tentativas: ${stats.total}`, 'cyan');
  log(`✅ Sucessos: ${stats.success}`, 'green');
  log(`🚪 Check-outs: ${stats.checkouts}`, 'green');
  log(`⏭️  Pulados: ${stats.skipped}`, stats.skipped > 0 ? 'cyan' : 'reset');
  log(`❌ Erros: ${stats.errors}`, stats.errors > 0 ? 'red' : 'cyan');
  log(`⚡ Taxa: ${rate} check-ins/segundo`, 'cyan');
  log(`🏢 Salas ativas: ${activeCheckIns.size}`, 'cyan');
  log(`👥 Alunos com check-in ativo: ${studentActiveCheckIns.size}`, 'cyan');
  log('═══════════════════════════════════════', 'cyan');
  log('', 'cyan');
}

/**
 * Main
 */
async function main() {
  log('🚀 Iniciando Worker de Check-ins de Teste', 'magenta');
  log('', 'reset');
  log('⚙️  Configuração:', 'blue');
  log(`   Intervalo: ${config.interval}ms`, 'blue');
  log(`   Duração: ${config.duration}ms (${Math.floor(config.duration / 1000)}s)`, 'blue');
  log(`   Salas: ${config.maxRooms === 0 ? 'Todas' : config.maxRooms}`, 'blue');
  log(`   Alunos: ${config.maxStudents === 0 ? 'Todos' : config.maxStudents}`, 'blue');
  log(`   Máximo simultâneo: ${config.maxConcurrent}`, 'blue');
  log('', 'reset');

  // Verificar saúde dos serviços
  log('🔍 Verificando saúde dos serviços...', 'blue');
  const studentsHealth = await checkServiceHealth(STUDENTS_URL, 'Students Service');
  const roomsHealth = await checkServiceHealth(ROOMS_URL, 'Rooms Service');
  const checkinHealth = await checkServiceHealth(CHECKIN_URL, 'Check-in Service');
  
  if (!studentsHealth || !roomsHealth || !checkinHealth) {
    log('', 'reset');
    log('❌ Um ou mais serviços não estão respondendo!', 'red');
    log('   Certifique-se de que todos os serviços estão rodando:', 'yellow');
    log('   npm run dev', 'yellow');
    log('', 'reset');
    process.exit(1);
  }
  
  log('✅ Todos os serviços estão respondendo', 'green');
  log('', 'reset');

  // Buscar dados
  await fetchStudents();
  await fetchRooms();

  if (students.length === 0) {
    log('❌ Nenhum aluno encontrado. Execute o seed primeiro!', 'red');
    process.exit(1);
  }

  if (rooms.length === 0) {
    log('❌ Nenhuma sala encontrada. Execute o seed primeiro!', 'red');
    process.exit(1);
  }

  log('', 'reset');
  log('▶️  Iniciando check-ins...', 'green');
  log('   Pressione Ctrl+C para parar', 'yellow');
  log('', 'reset');

  stats.startTime = Date.now();
  const endTime = stats.startTime + config.duration;

  // Exibir estatísticas periodicamente
  const statsInterval = setInterval(() => {
    displayStats();
  }, 10000); // A cada 10 segundos

  // Loop principal
  const checkInInterval = setInterval(async () => {
    if (Date.now() >= endTime) {
      log('⏹️  Duração máxima atingida. Parando...', 'yellow');
      clearInterval(checkInInterval);
      clearInterval(statsInterval);
      displayStats();
      process.exit(0);
    }

    await processBatch();
    // Processar check-outs periodicamente (30% de chance)
    await processCheckouts();
  }, config.interval);

  // Handler para Ctrl+C
  process.on('SIGINT', () => {
    log('', 'reset');
    log('⏹️  Parando worker...', 'yellow');
    clearInterval(checkInInterval);
    clearInterval(statsInterval);
    displayStats();
    log('👋 Worker finalizado', 'green');
    process.exit(0);
  });
}

// Executar
main().catch((error) => {
  log(`❌ Erro fatal: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
