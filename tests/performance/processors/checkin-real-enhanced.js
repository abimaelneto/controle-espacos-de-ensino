/**
 * Processor aprimorado para testes de check-in com serviços reais
 * Inclui métricas granulares e distribuição de carga realista (80/20)
 */

const fs = require('fs');
const path = require('path');

let seedData = null;
let studentIndex = 0;
let roomIndex = 0;
let roomWeights = null; // Para distribuição 80/20

/**
 * Carrega dados de seed do arquivo
 */
function loadSeedData() {
  if (seedData) {
    return seedData;
  }

  const dataFile = process.env.SEED_DATA_FILE || path.join(__dirname, '../data/seed-data.json');
  
  if (!fs.existsSync(dataFile)) {
    throw new Error(`Seed data file not found: ${dataFile}. Run seed-data.js first.`);
  }

  seedData = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
  
  if (!seedData.students || seedData.students.length === 0) {
    throw new Error('No students found in seed data');
  }
  
  if (!seedData.rooms || seedData.rooms.length === 0) {
    throw new Error('No rooms found in seed data');
  }

  // Calcular pesos para distribuição 80/20
  calculateRoomWeights(seedData.rooms);

  console.log(`Loaded ${seedData.students.length} students and ${seedData.rooms.length} rooms`);
  console.log(`Popular rooms (20%): ${roomWeights.popular.length}, Others: ${roomWeights.others.length}`);
  
  return seedData;
}

/**
 * Calcula pesos para distribuição 80/20 das salas
 * 20% das salas recebem 80% da carga
 */
function calculateRoomWeights(rooms) {
  const popularCount = Math.max(1, Math.floor(rooms.length * 0.2));
  roomWeights = {
    popular: rooms.slice(0, popularCount),
    others: rooms.slice(popularCount),
    popularWeight: 0.8
  };
}

/**
 * Seleciona sala usando distribuição 80/20
 */
function selectRoom(rooms) {
  if (!roomWeights) {
    calculateRoomWeights(rooms);
  }

  if (Math.random() < roomWeights.popularWeight) {
    return roomWeights.popular[Math.floor(Math.random() * roomWeights.popular.length)];
  }
  return roomWeights.others[Math.floor(Math.random() * roomWeights.others.length)];
}

/**
 * Seleciona método de identificação com distribuição realista
 */
function selectIdentificationMethod() {
  const methods = [
    { method: 'MATRICULA', weight: 0.5 },
    { method: 'CPF', weight: 0.3 },
    { method: 'QR_CODE', weight: 0.15 },
    { method: 'BIOMETRIC', weight: 0.05 }
  ];

  const random = Math.random();
  let cumulative = 0;
  
  for (const { method, weight } of methods) {
    cumulative += weight;
    if (random <= cumulative) {
      return method;
    }
  }
  
  return 'MATRICULA'; // Fallback
}

/**
 * Gera payload de check-in usando dados reais
 */
function generateCheckinPayload(context, events, done) {
  try {
    const data = loadSeedData();
    
    // Selecionar aluno (round-robin)
    const studentIdx = studentIndex % data.students.length;
    const student = data.students[studentIdx];
    studentIndex = (studentIndex + 1) % data.students.length;
    
    // Selecionar sala (distribuição 80/20)
    const room = selectRoom(data.rooms);
    
    // Selecionar método de identificação
    const method = selectIdentificationMethod();
    
    if (!student || !room) {
      return done(new Error('Invalid student or room data'));
    }
    
    // Configurar variáveis para o Artillery
    context.vars.studentId = student.id;
    context.vars.roomId = room.id;
    context.vars.identificationMethod = method;
    
    // Valor de identificação baseado no método
    switch (method) {
      case 'MATRICULA':
        context.vars.identificationValue = student.matricula;
        break;
      case 'CPF':
        context.vars.identificationValue = student.cpf;
        break;
      case 'QR_CODE':
        context.vars.identificationValue = `QR-${student.id}`;
        break;
      case 'BIOMETRIC':
        context.vars.identificationValue = `BIO-${student.id}`;
        break;
      default:
        context.vars.identificationValue = student.matricula;
    }
    
    // Armazenar dados para métricas
    context.vars._roomNumber = room.roomNumber;
    context.vars._roomCapacity = room.capacity;
    context.vars._method = method;
    
    return done();
  } catch (error) {
    return done(error);
  }
}

/**
 * Extrai motivo do erro da mensagem
 */
function extractErrorReason(message) {
  if (!message || typeof message !== 'string') {
    return 'unknown';
  }
  
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('capacidade') || lowerMessage.includes('capacity')) {
    return 'capacity_exceeded';
  }
  if (lowerMessage.includes('não encontrado') || lowerMessage.includes('not found')) {
    return 'not_found';
  }
  if (lowerMessage.includes('inativo') || lowerMessage.includes('inactive')) {
    return 'inactive';
  }
  if (lowerMessage.includes('outra sala') || lowerMessage.includes('other room')) {
    return 'other_room_active';
  }
  
  return 'unknown';
}

/**
 * Valida resposta de check-in com métricas granulares
 */
function validateCheckinResponse(requestParams, response, context, events, done) {
  const duration = response.timings?.response || 0; // ms
  const durationSeconds = duration / 1000;
  
  const roomId = context.vars.roomId;
  const roomNumber = context.vars._roomNumber || 'unknown';
  const method = context.vars._method || 'unknown';
  
  // Métricas gerais de latência
  if (durationSeconds > 0) {
    events.emit('histogram', 'checkin.latency.total', durationSeconds);
    events.emit('histogram', `checkin.latency.method.${method}`, durationSeconds);
    events.emit('histogram', `checkin.latency.room.${roomNumber}`, durationSeconds);
  }
  
  if (response.statusCode === 201) {
    // Sucesso
    events.emit('counter', 'checkin.success', 1);
    events.emit('counter', `checkin.success.method.${method}`, 1);
    events.emit('counter', `checkin.success.room.${roomNumber}`, 1);
    if (durationSeconds > 0) {
      events.emit('histogram', 'checkin.latency.success', durationSeconds);
    }
    
    // Validar resposta
    if (response.body && typeof response.body === 'object') {
      if (!response.body.checkInId) {
        events.emit('counter', 'checkin.response.invalid', 1);
      }
    }
  } else if (response.statusCode === 400) {
    // Erro de validação
    events.emit('counter', 'checkin.validation_error', 1);
    events.emit('counter', `checkin.error.method.${method}`, 1);
    if (durationSeconds > 0) {
      events.emit('histogram', 'checkin.latency.validation_error', durationSeconds);
    }
    
    // Extrair motivo do erro se disponível
    if (response.body && response.body.message) {
      const reason = extractErrorReason(response.body.message);
      events.emit('counter', `checkin.error.reason.${reason}`, 1);
    }
  } else if (response.statusCode === 409) {
    // Conflito (já tem check-in)
    events.emit('counter', 'checkin.conflict', 1);
    events.emit('counter', `checkin.conflict.room.${roomNumber}`, 1);
    if (durationSeconds > 0) {
      events.emit('histogram', 'checkin.latency.conflict', durationSeconds);
    }
  } else if (response.statusCode >= 500) {
    // Erro do servidor
    events.emit('counter', 'checkin.server_error', 1);
    events.emit('counter', `checkin.server_error.status.${response.statusCode}`, 1);
    if (durationSeconds > 0) {
      events.emit('histogram', 'checkin.latency.server_error', durationSeconds);
    }
  } else {
    // Outros erros
    events.emit('counter', 'checkin.error', 1);
    events.emit('counter', `checkin.error.status.${response.statusCode}`, 1);
  }
  
  // Métricas de timeout
  if (response.timings && response.timings.timeout) {
    events.emit('counter', 'checkin.timeout', 1);
  }
  
  return done();
}

module.exports = {
  generateCheckinPayload,
  validateCheckinResponse,
};

