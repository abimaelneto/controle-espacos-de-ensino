/**
 * Processor para testes de check-in com serviços reais
 * Carrega dados de seed (alunos e salas) e distribui entre VUs
 */

const fs = require('fs');
const path = require('path');

let seedData = null;
let studentIndex = 0;
let roomIndex = 0;

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

  console.log(`Loaded ${seedData.students.length} students and ${seedData.rooms.length} rooms`);
  
  return seedData;
}

/**
 * Gera payload de check-in usando dados reais
 */
function generateCheckinPayload(context, events, done) {
  try {
    const data = loadSeedData();
    
    // Distribuir alunos e salas de forma round-robin entre VUs
    // Usar timestamp + random para garantir distribuição única por requisição
    const requestId = Date.now() + Math.floor(Math.random() * 10000);
    
    const studentIdx = (requestId + studentIndex) % data.students.length;
    const roomIdx = (requestId + roomIndex) % data.rooms.length;
    
    const student = data.students[studentIdx];
    const room = data.rooms[roomIdx];
    
    if (!student || !room) {
      return done(new Error('Invalid student or room data'));
    }
    
    // Incrementar índices para próxima requisição
    studentIndex = (studentIndex + 1) % data.students.length;
    roomIndex = (roomIndex + 1) % data.rooms.length;
    
    // Configurar variáveis para o Artillery
    context.vars.studentId = student.id;
    context.vars.roomId = room.id;
    context.vars.identificationMethod = 'MATRICULA';
    context.vars.identificationValue = student.matricula;
    
    // Também disponibilizar CPF como alternativa
    context.vars.cpf = student.cpf;
    
    return done();
  } catch (error) {
    return done(error);
  }
}

/**
 * Valida resposta de check-in
 */
function validateCheckinResponse(requestParams, response, context, events, done) {
  if (response.statusCode === 201) {
    events.emit('counter', 'checkin.success', 1);
  } else if (response.statusCode === 400) {
    events.emit('counter', 'checkin.validation_error', 1);
  } else if (response.statusCode === 409) {
    events.emit('counter', 'checkin.conflict', 1);
  } else {
    events.emit('counter', 'checkin.error', 1);
  }
  
  return done();
}

module.exports = {
  generateCheckinPayload,
  validateCheckinResponse,
};

