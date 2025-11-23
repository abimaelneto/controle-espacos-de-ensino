#!/usr/bin/env node

/**
 * Script de Demonstração Completa do Case
 * 
 * Este script demonstra o fluxo completo do sistema de controle de espaços de ensino:
 * 1. Busca dados reais (estudantes e salas)
 * 2. Simula check-ins de estudantes
 * 3. Demonstra como verificar resultados no admin
 * 4. Testa edge cases importantes
 * 5. Apresenta possíveis expansões futuras
 * 
 * Uso: node scripts/demo-case-completo.js
 * 
 * Pré-requisitos:
 *   - Serviços rodando (npm run dev)
 *   - Dados seedados (npm run seed:all)
 *   - Frontend admin aberto em http://localhost:5173
 *   - Frontend estudante aberto em http://localhost:5174
 */

const axios = require('axios');
const readline = require('readline');

// URLs dos serviços
const STUDENTS_URL = process.env.STUDENTS_URL || 'http://localhost:3001';
const ROOMS_URL = process.env.ROOMS_URL || 'http://localhost:3002';
const CHECKIN_URL = process.env.CHECKIN_URL || 'http://localhost:3003';
const ANALYTICS_URL = process.env.ANALYTICS_URL || 'http://localhost:3004';
const ADMIN_FRONTEND_URL = 'http://localhost:5173';
const STUDENT_FRONTEND_URL = 'http://localhost:5174';

// Configuração do axios
const axiosConfig = {
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  validateStatus: (status) => status < 500,
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
  bold: '\x1b[1m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('');
  log('═══════════════════════════════════════════════════════════════', 'cyan');
  log(`  ${title}`, 'bold');
  log('═══════════════════════════════════════════════════════════════', 'cyan');
  console.log('');
}

function logStep(step, message) {
  log(`[${step}] ${message}`, 'blue');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'cyan');
}

function logExpansion(message) {
  log(`💡 EXPANSÃO FUTURA: ${message}`, 'magenta');
}

// Interface readline para pausas
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function waitForEnter(message = 'Pressione ENTER para continuar...') {
  return new Promise((resolve) => {
    rl.question(`\n${message}`, () => {
      resolve();
    });
  });
}

// ============================================================================
// FUNÇÕES DE BUSCA DE DADOS
// ============================================================================

async function fetchStudents() {
  try {
    const response = await axios.get(`${STUDENTS_URL}/api/v1/students`, axiosConfig);
    const students = (response.data || []).filter(s => s.status === 'ACTIVE');
    return students;
  } catch (error) {
    logError(`Erro ao buscar estudantes: ${error.message}`);
    return [];
  }
}

async function fetchRooms() {
  try {
    const response = await axios.get(`${ROOMS_URL}/api/v1/rooms`, axiosConfig);
    const rooms = (response.data || []).filter(r => r.status === 'ACTIVE');
    return rooms;
  } catch (error) {
    logError(`Erro ao buscar salas: ${error.message}`);
    return [];
  }
}

async function fetchRealtimeOccupancy() {
  try {
    const response = await axios.get(`${ANALYTICS_URL}/api/v1/analytics/rooms/realtime`, axiosConfig);
    return response.data || [];
  } catch (error) {
    logError(`Erro ao buscar ocupação em tempo real: ${error.message}`);
    return [];
  }
}

// ============================================================================
// FUNÇÕES DE CHECK-IN
// ============================================================================

async function performCheckOut(student, method = 'MATRICULA') {
  let identificationValue;
  
  if (method === 'MATRICULA') {
    identificationValue = student.matricula;
  } else if (method === 'CPF') {
    identificationValue = student.cpf ? student.cpf.replace(/\D/g, '') : null;
  } else {
    identificationValue = `QR-${student.id.substring(0, 8)}`;
  }

  if (!identificationValue) {
    return { success: false, error: 'Método de identificação inválido' };
  }

  try {
    const payload = {
      identificationMethod: method,
      identificationValue: identificationValue,
    };

    const response = await axios.post(
      `${CHECKIN_URL}/api/v1/checkin/checkout`,
      payload,
      axiosConfig
    );

    if (response.status === 200 && response.data?.success === true) {
      return {
        success: true,
        data: response.data,
        attendanceId: response.data.attendanceId,
      };
    } else {
      return {
        success: false,
        error: response.data?.message || 'Check-out falhou',
        status: response.status,
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message,
      status: error.response?.status,
    };
  }
}

async function performCheckIn(student, room, method = 'MATRICULA') {
  let identificationValue;
  
  if (method === 'MATRICULA') {
    identificationValue = student.matricula;
  } else if (method === 'CPF') {
    identificationValue = student.cpf ? student.cpf.replace(/\D/g, '') : null;
  } else {
    identificationValue = `QR-${student.id.substring(0, 8)}`;
  }

  if (!identificationValue) {
    return { success: false, error: 'Método de identificação inválido' };
  }

  try {
    const payload = {
      studentId: student.id,
      roomId: room.id,
      identificationMethod: method,
      identificationValue: identificationValue,
    };

    const response = await axios.post(
      `${CHECKIN_URL}/api/v1/checkin`,
      payload,
      axiosConfig
    );

    if (response.status === 201 && response.data?.success === true) {
      return {
        success: true,
        data: response.data,
        attendanceId: response.data.checkInId,
      };
    } else {
      return {
        success: false,
        error: response.data?.message || 'Check-in falhou',
        status: response.status,
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message,
      status: error.response?.status,
    };
  }
}

// ============================================================================
// CENÁRIOS DE DEMONSTRAÇÃO
// ============================================================================

async function cenario1_CheckInBasico(students, rooms) {
  logSection('CENÁRIO 1: Check-in Básico');
  
  if (students.length === 0 || rooms.length === 0) {
    logError('Não há estudantes ou salas disponíveis');
    return;
  }

  const student = students[0];
  const room = rooms[0];

  logStep('1.1', 'Preparando check-in básico');
  logInfo(`Estudante: ${student.firstName} ${student.lastName} (${student.matricula})`);
  logInfo(`Sala: ${room.roomNumber} (${room.type}, capacidade: ${room.capacity})`);
  logInfo(`Método: MATRICULA`);
  
  await waitForEnter('Pressione ENTER para realizar o check-in...');

  logStep('1.2', 'Realizando check-in');
  const result = await performCheckIn(student, room, 'MATRICULA');

  if (result.success) {
    logSuccess(`Check-in realizado com sucesso!`);
    logInfo(`Attendance ID: ${result.attendanceId}`);
    logInfo(`Horário: ${new Date().toLocaleString('pt-BR')}`);
    
    logExpansion('Reconhecimento Facial: Aqui poderia capturar uma foto do estudante e validar com biometria');
    logExpansion('Armazenamento S3: Salvar imagem do check-in no S3 para auditoria e segurança');
  } else {
    logError(`Check-in falhou: ${result.error}`);
  }

  logStep('1.3', 'Verificando no Admin');
  logInfo(`Acesse: ${ADMIN_FRONTEND_URL}/realtime`);
  logInfo('Você deve ver a ocupação atualizada em tempo real');
  logInfo(`Sala ${room.roomNumber} deve mostrar 1 pessoa`);
  
  await waitForEnter('Verifique no admin e pressione ENTER para continuar...');
}

async function cenario2_CheckInComCPF(students, rooms) {
  logSection('CENÁRIO 2: Check-in com CPF');
  
  if (students.length < 2 || rooms.length === 0) {
    logWarning('Cenário 2 pulado: não há estudantes suficientes');
    return;
  }

  const student = students[1];
  const room = rooms[0];

  logStep('2.1', 'Check-in usando CPF como identificação');
  logInfo(`Estudante: ${student.firstName} ${student.lastName}`);
  logInfo(`CPF: ${student.cpf}`);
  logInfo(`Sala: ${room.roomNumber}`);

  await waitForEnter('Pressione ENTER para realizar o check-in com CPF...');

  const result = await performCheckIn(student, room, 'CPF');

  if (result.success) {
    logSuccess('Check-in com CPF realizado com sucesso!');
    logInfo('O sistema aceita múltiplos métodos de identificação');
    
    logExpansion('QR Code: Estudante poderia escanear QR code do celular');
    logExpansion('Biometria: Leitura de impressão digital ou reconhecimento facial');
    logExpansion('NFC/RFID: Cartão de proximidade para acesso rápido');
  } else {
    logError(`Check-in falhou: ${result.error}`);
  }

  await waitForEnter('Pressione ENTER para continuar...');
}

async function cenario3_CheckInDuplicado(students, rooms) {
  logSection('CENÁRIO 3: Edge Case - Check-in Duplicado');
  
  if (students.length === 0 || rooms.length < 2) {
    logWarning('Cenário 3 pulado: não há dados suficientes');
    return;
  }

  const student = students[0];
  const room1 = rooms[0];
  const room2 = rooms[1];

  logStep('3.1', 'Realizando primeiro check-in');
  logInfo(`Estudante: ${student.firstName} ${student.lastName}`);
  logInfo(`Sala 1: ${room1.roomNumber}`);

  const result1 = await performCheckIn(student, room1, 'MATRICULA');
  
  if (result1.success) {
    logSuccess('Primeiro check-in realizado');
  } else {
    logWarning(`Primeiro check-in: ${result1.error}`);
  }

  await waitForEnter('Pressione ENTER para tentar check-in em outra sala...');

  logStep('3.2', 'Tentando check-in em outra sala (deve falhar)');
  logInfo(`Sala 2: ${room2.roomNumber}`);
  logWarning('Regra de negócio: Estudante não pode ter check-in ativo em múltiplas salas');

  const result2 = await performCheckIn(student, room2, 'MATRICULA');

  if (!result2.success) {
    logSuccess('✅ Validação funcionou corretamente!');
    logInfo(`Erro esperado: ${result2.error}`);
    logInfo('O sistema impede check-in duplicado em salas diferentes');
    
    logExpansion('Check-out Automático: Sistema poderia fazer checkout automático da sala anterior');
    logExpansion('Notificação: Enviar notificação ao estudante sobre check-in ativo');
  } else {
    logError('❌ Validação falhou - check-in duplicado foi permitido!');
  }

  await waitForEnter('Pressione ENTER para continuar...');
}

async function cenario4_CapacidadeMaxima(students, rooms) {
  logSection('CENÁRIO 4: Edge Case - Capacidade Máxima');
  
  if (students.length < 3 || rooms.length === 0) {
    logWarning('Cenário 4 pulado: não há estudantes suficientes');
    return;
  }

  const room = rooms.find(r => r.capacity <= 3) || rooms[0];
  
  logStep('4.1', 'Preparando teste de capacidade máxima');
  logInfo(`Sala: ${room.roomNumber}`);
  logInfo(`Capacidade: ${room.capacity}`);
  logInfo(`Vamos fazer ${room.capacity + 1} check-ins para testar o limite`);

  await waitForEnter('Pressione ENTER para começar...');

  logStep('4.2', 'Realizando check-ins até atingir capacidade');
  
  const checkInResults = [];
  for (let i = 0; i < room.capacity; i++) {
    if (i >= students.length) break;
    
    const student = students[i];
    const result = await performCheckIn(student, room, 'MATRICULA');
    checkInResults.push({ student, result });
    
    if (result.success) {
      logSuccess(`${i + 1}/${room.capacity}: ${student.firstName} fez check-in`);
    } else {
      logWarning(`${i + 1}/${room.capacity}: ${result.error}`);
    }
    
    // Pequena pausa entre check-ins
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  logStep('4.3', 'Tentando check-in além da capacidade (deve falhar)');
  
  if (students.length > room.capacity) {
    const extraStudent = students[room.capacity];
    logInfo(`Tentando check-in do estudante: ${extraStudent.firstName}`);
    logWarning('Sala já está na capacidade máxima');

    const result = await performCheckIn(extraStudent, room, 'MATRICULA');

    if (!result.success) {
      logSuccess('✅ Validação de capacidade funcionou!');
      logInfo(`Erro esperado: ${result.error}`);
      
      logExpansion('Lista de Espera: Sistema poderia adicionar estudante em fila de espera');
      logExpansion('Notificação: Avisar quando vaga ficar disponível');
      logExpansion('Reserva: Permitir reserva antecipada de vaga');
    } else {
      logError('❌ Validação falhou - check-in além da capacidade foi permitido!');
    }
  }

  await waitForEnter('Pressione ENTER para continuar...');
}

async function cenario5_MultiplasSalas(students, rooms) {
  logSection('CENÁRIO 5: Múltiplas Salas Simultâneas');
  
  if (students.length < 3 || rooms.length < 3) {
    logWarning('Cenário 5 pulado: não há dados suficientes');
    return;
  }

  logStep('5.1', 'Simulando check-ins em múltiplas salas');
  logInfo('Este cenário demonstra a capacidade do sistema de gerenciar múltiplas salas');

  const scenarios = [
    { student: students[0], room: rooms[0], method: 'MATRICULA' },
    { student: students[1], room: rooms[1], method: 'CPF' },
    { student: students[2], room: rooms[2], method: 'MATRICULA' },
  ];

  for (const scenario of scenarios) {
    const result = await performCheckIn(scenario.student, scenario.room, scenario.method);
    
    if (result.success) {
      logSuccess(`${scenario.student.firstName} → ${scenario.room.roomNumber} (${scenario.method})`);
    } else {
      logWarning(`${scenario.student.firstName} → ${scenario.room.roomNumber}: ${result.error}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  logStep('5.2', 'Verificando ocupação em tempo real');
  const occupancy = await fetchRealtimeOccupancy();
  
  logInfo('Ocupação atual por sala:');
  occupancy.forEach(occ => {
    const room = rooms.find(r => r.id === occ.roomId);
    const roomName = room ? room.roomNumber : occ.roomId.substring(0, 8);
    logInfo(`  ${roomName}: ${occ.currentOccupancy} pessoas`);
  });

  logStep('5.3', 'Verificando no Dashboard Admin');
  logInfo(`Acesse: ${ADMIN_FRONTEND_URL}/realtime`);
  logInfo('Você deve ver múltiplas salas com ocupação atualizada');
  logInfo('Gráficos devem refletir a distribuição de ocupação');
  
  logExpansion('Mapa de Calor: Visualização geográfica das salas mais ocupadas');
  logExpansion('Previsão: IA para prever ocupação futura baseada em histórico');
  logExpansion('Otimização: Sugerir realocação de estudantes para melhor distribuição');

  await waitForEnter('Verifique no admin e pressione ENTER para continuar...');
}

async function cenario6_AnalyticsEmTempoReal(students, rooms) {
  logSection('CENÁRIO 6: Analytics em Tempo Real');
  
  logStep('6.1', 'Verificando analytics em tempo real');
  logInfo('O sistema atualiza analytics automaticamente via Kafka + WebSocket');

  const occupancy = await fetchRealtimeOccupancy();
  
  if (occupancy.length > 0) {
    logSuccess('Dados de ocupação em tempo real:');
    occupancy.slice(0, 5).forEach(occ => {
      const room = rooms.find(r => r.id === occ.roomId);
      const roomName = room ? room.roomNumber : occ.roomId.substring(0, 8);
      
      console.log(`\n  📊 ${roomName}:`);
      console.log(`     Ocupação atual: ${occ.currentOccupancy}`);
      console.log(`     Check-ins (15min): ${occ.checkInsLast15Minutes}`);
      console.log(`     Check-ins (1h): ${occ.checkInsLastHour}`);
      console.log(`     Alunos únicos (1h): ${occ.uniqueStudentsLastHour}`);
      console.log(`     Taxa de ocupação: ${occ.occupancyRate.toFixed(1)}%`);
    });
  }

  logStep('6.2', 'Acessando Analytics no Admin');
  logInfo(`Dashboard: ${ADMIN_FRONTEND_URL}/realtime`);
  logInfo('Você pode:');
  logInfo('  - Ver ocupação em tempo real');
  logInfo('  - Buscar salas específicas');
  logInfo('  - Ver analytics individuais de cada sala');
  logInfo('  - Observar atualização automática a cada 2 segundos');
  
  logExpansion('Relatórios PDF: Gerar relatórios de ocupação para gestão');
  logExpansion('Exportação CSV: Exportar dados para análise externa');
  logExpansion('Alertas: Notificações quando ocupação ultrapassar limites');
  logExpansion('Dashboard Executivo: Visão consolidada para direção');

  await waitForEnter('Pressione ENTER para continuar...');
}

async function cenario7_CheckOut(students, rooms) {
  logSection('CENÁRIO 7: Check-out');
  
  if (students.length === 0 || rooms.length === 0) {
    logWarning('Cenário 7 pulado: não há dados suficientes');
    return;
  }

  const student = students[0];
  const room = rooms[0];

  logStep('7.1', 'Realizando check-in primeiro');
  logInfo(`Estudante: ${student.firstName} ${student.lastName}`);
  logInfo(`Sala: ${room.roomNumber}`);

  const checkInResult = await performCheckIn(student, room, 'MATRICULA');
  
  if (!checkInResult.success) {
    logWarning('Check-in falhou, tentando continuar mesmo assim...');
  } else {
    logSuccess('Check-in realizado com sucesso!');
  }

  await waitForEnter('Pressione ENTER para fazer checkout...');

  logStep('7.2', 'Realizando check-out');
  logInfo('O checkout remove o registro de check-in ativo');
  logInfo('Permite que o estudante faça novo check-in em outra sala');

  const checkOutResult = await performCheckOut(student, 'MATRICULA');

  if (checkOutResult.success) {
    logSuccess('Check-out realizado com sucesso!');
    logInfo('Ocupação da sala foi atualizada em tempo real');
    logInfo('Estudante agora pode fazer check-in em qualquer sala');
    
    logExpansion('Tempo de Permanência: Calcular e armazenar tempo total na sala');
    logExpansion('Check-out Automático: Fazer checkout automático após X horas');
    logExpansion('Notificação: Avisar estudante sobre checkout bem-sucedido');
  } else {
    logError(`Check-out falhou: ${checkOutResult.error}`);
  }

  await waitForEnter('Pressione ENTER para continuar...');
}

async function cenario8_FrontendEstudante(students, rooms) {
  logSection('CENÁRIO 8: Frontend do Estudante');
  
  if (rooms.length === 0) {
    logWarning('Cenário 8 pulado: não há salas disponíveis');
    return;
  }

  const room = rooms[0];
  const student = students[0];

  logStep('8.1', 'Acessando Frontend do Estudante');
  const studentUrl = `${STUDENT_FRONTEND_URL}?roomId=${room.id}`;
  logInfo(`URL: ${studentUrl}`);
  logInfo(`Sala: ${room.roomNumber} (${room.type})`);
  logInfo(`Estudante: ${student.firstName} ${student.lastName}`);
  
  logInfo('\nNo frontend do estudante você pode:');
  logInfo('  - Ver informações da sala');
  logInfo('  - Fazer check-in usando matrícula ou CPF');
  logInfo('  - Fazer check-out quando sair da sala');
  logInfo('  - Ver histórico de check-ins');
  logInfo('  - Ver status atual (dentro/fora da sala)');

  logExpansion('App Mobile: Aplicativo nativo para iOS/Android');
  logExpansion('Geolocalização: Validar que estudante está próximo da sala');
  logExpansion('QR Code Dinâmico: Gerar QR code único por check-in');
  logExpansion('Push Notifications: Notificar sobre eventos da sala');

  await waitForEnter('Abra o frontend do estudante e pressione ENTER para continuar...');
}

// ============================================================================
// RESUMO E CONCLUSÃO
// ============================================================================

async function mostrarResumo(students, rooms) {
  logSection('RESUMO DA DEMONSTRAÇÃO');
  
  logInfo('Funcionalidades Demonstradas:');
  logSuccess('  ✅ Check-in básico com matrícula');
  logSuccess('  ✅ Check-in com CPF');
  logSuccess('  ✅ Check-out completo');
  logSuccess('  ✅ Validação de check-in duplicado');
  logSuccess('  ✅ Validação de capacidade máxima');
  logSuccess('  ✅ Múltiplas salas simultâneas');
  logSuccess('  ✅ Analytics em tempo real');
  logSuccess('  ✅ Frontend do estudante');
  
  logInfo('\nEdge Cases Testados:');
  logSuccess('  ✅ Check-in duplicado em salas diferentes');
  logSuccess('  ✅ Capacidade máxima da sala');
  logSuccess('  ✅ Múltiplos métodos de identificação');
  
  logInfo('\nTecnologias Utilizadas:');
  logInfo('  - Microserviços (NestJS)');
  logInfo('  - Kafka para comunicação assíncrona');
  logInfo('  - WebSocket para tempo real no frontend');
  logInfo('  - MySQL para persistência');
  logInfo('  - Redis para cache');
  logInfo('  - Prometheus para métricas');
  
  logSection('POSSÍVEIS EXPANSÕES FUTURAS');
  
  logExpansion('Reconhecimento Facial: Integração com serviços de IA (AWS Rekognition, Azure Face API)');
  logExpansion('Armazenamento S3: Salvar fotos de check-in para auditoria e segurança');
  logExpansion('App Mobile: Aplicativo nativo com notificações push');
  logExpansion('Geolocalização: Validar proximidade do estudante à sala');
  logExpansion('QR Code Dinâmico: Gerar códigos únicos e temporários');
  logExpansion('Biometria: Integração com leitores de impressão digital');
  logExpansion('NFC/RFID: Cartões de proximidade para acesso rápido');
  logExpansion('Lista de Espera: Sistema de fila quando sala está cheia');
  logExpansion('Reservas: Permitir reserva antecipada de salas');
  logExpansion('IA Preditiva: Prever ocupação futura baseada em histórico');
  logExpansion('Mapa de Calor: Visualização geográfica de ocupação');
  logExpansion('Relatórios: Exportação PDF/CSV para gestão');
  logExpansion('Dashboard Executivo: Visão consolidada para direção');
  logExpansion('Alertas: Notificações quando ocupação ultrapassar limites');
  logExpansion('Integração Acadêmica: Sincronizar com sistema acadêmico');
  logExpansion('Controle de Acesso: Integração com catracas e portas automáticas');
  
  console.log('');
  log('═══════════════════════════════════════════════════════════════', 'green');
  log('  ✅ Demonstração Concluída!', 'bold');
  log('═══════════════════════════════════════════════════════════════', 'green');
  console.log('');
  
  logInfo('Próximos Passos:');
  logInfo('  1. Explore o dashboard admin: ' + ADMIN_FRONTEND_URL);
  logInfo('  2. Teste o frontend estudante: ' + STUDENT_FRONTEND_URL);
  logInfo('  3. Execute o worker de check-ins: npm run worker:checkin');
  logInfo('  4. Verifique métricas no Prometheus: http://localhost:9090');
  logInfo('  5. Visualize no Grafana: http://localhost:3000');
  console.log('');
}

// ============================================================================
// FUNÇÃO PRINCIPAL
// ============================================================================

async function main() {
  console.clear();
  
  log('═══════════════════════════════════════════════════════════════', 'cyan');
  log('  🎓 DEMONSTRAÇÃO COMPLETA DO CASE', 'bold');
  log('  Controle de Espaços de Ensino', 'bold');
  log('═══════════════════════════════════════════════════════════════', 'cyan');
  console.log('');

  logInfo('Verificando serviços...');
  
  // Buscar dados
  logStep('1', 'Buscando estudantes e salas...');
  const students = await fetchStudents();
  const rooms = await fetchRooms();

  if (students.length === 0) {
    logError('Nenhum estudante encontrado. Execute: npm run seed:all');
    process.exit(1);
  }

  if (rooms.length === 0) {
    logError('Nenhuma sala encontrada. Execute: npm run seed:all');
    process.exit(1);
  }

  logSuccess(`${students.length} estudantes encontrados`);
  logSuccess(`${rooms.length} salas encontradas`);
  
  console.log('');
  logInfo('Dados que serão usados na demonstração:');
  console.log('');
  logInfo('Estudantes:');
  students.slice(0, 5).forEach((s, i) => {
    console.log(`  ${i + 1}. ${s.firstName} ${s.lastName} (${s.matricula}) - ${s.cpf}`);
  });
  if (students.length > 5) {
    logInfo(`  ... e mais ${students.length - 5} estudantes`);
  }
  
  console.log('');
  logInfo('Salas:');
  rooms.slice(0, 5).forEach((r, i) => {
    console.log(`  ${i + 1}. ${r.roomNumber} (${r.type}) - Capacidade: ${r.capacity}`);
  });
  if (rooms.length > 5) {
    logInfo(`  ... e mais ${rooms.length - 5} salas`);
  }

  await waitForEnter('\nPressione ENTER para começar a demonstração...');

  // Executar cenários
  await cenario1_CheckInBasico(students, rooms);
  await cenario2_CheckInComCPF(students, rooms);
  await cenario3_CheckInDuplicado(students, rooms);
  await cenario4_CapacidadeMaxima(students, rooms);
  await cenario5_MultiplasSalas(students, rooms);
  await cenario6_AnalyticsEmTempoReal(students, rooms);
  await cenario7_CheckOut(students, rooms);
  await cenario8_FrontendEstudante(students, rooms);

  // Mostrar resumo
  await mostrarResumo(students, rooms);

  rl.close();
}

// Executar
main().catch((error) => {
  logError(`Erro fatal: ${error.message}`);
  console.error(error);
  rl.close();
  process.exit(1);
});

