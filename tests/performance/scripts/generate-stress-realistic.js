#!/usr/bin/env node

/**
 * Script para gerar stress test realista e variado
 * - Carga variada (normal, pico, spike)
 * - Métodos variados (MATRICULA, CPF, QR_CODE, BIOMETRIC)
 * - Erros intencionais (capacidade, conflitos, validações)
 * - Distribuição 80/20 de salas
 * - Padrões temporais (picos e vales)
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

const CONFIG = {
  checkinService: process.env.CHECKIN_TARGET || 'http://localhost:3003',
  dataFile: process.env.SEED_DATA_FILE || path.join(__dirname, '../data/seed-data.json'),
  duration: parseInt(process.env.DURATION_SEC || '120'), // 2 minutos por padrão
};

// Distribuição de métodos (realista)
const METHOD_DISTRIBUTION = [
  { method: 'MATRICULA', weight: 0.5 },
  { method: 'CPF', weight: 0.3 },
  { method: 'QR_CODE', weight: 0.15 },
  { method: 'BIOMETRIC', weight: 0.05 }
];

// Cenários de carga
const SCENARIOS = [
  { name: 'Normal', rate: 12, duration: 0.6, errorRate: 0.02 },      // 40% do tempo
  { name: 'Pico', rate: 40, duration: 0.2, errorRate: 0.08 },       // 30% do tempo
  { name: 'Spike', rate: 80, duration: 0.1, errorRate: 0.15 },    // 20% do tempo
  { name: 'Validações', rate: 8, duration: 0.1, errorRate: 0.40 }  // 10% do tempo
];

let seedData = null;
let roomWeights = null;
let studentIndex = 0;
let stats = {
  total: 0,
  success: 0,
  errors: 0,
  byMethod: {},
  byError: {},
  byScenario: {}
};

function loadSeedData() {
  if (seedData) return seedData;
  
  if (!fs.existsSync(CONFIG.dataFile)) {
    throw new Error(`Seed data file not found: ${CONFIG.dataFile}. Run npm run perf:seed first.`);
  }
  
  seedData = JSON.parse(fs.readFileSync(CONFIG.dataFile, 'utf8'));
  
  if (!seedData.students || seedData.students.length === 0) {
    throw new Error('No students found in seed data');
  }
  
  if (!seedData.rooms || seedData.rooms.length === 0) {
    throw new Error('No rooms found in seed data');
  }
  
  // Calcular distribuição 80/20 para salas
  const popularCount = Math.max(1, Math.floor(seedData.rooms.length * 0.2));
  roomWeights = {
    popular: seedData.rooms.slice(0, popularCount),
    others: seedData.rooms.slice(popularCount),
    popularWeight: 0.8
  };
  
  console.log(`📊 Dados carregados: ${seedData.students.length} alunos, ${seedData.rooms.length} salas`);
  console.log(`   Salas populares (20%): ${roomWeights.popular.length}, Outras: ${roomWeights.others.length}\n`);
  
  return seedData;
}

function selectMethod() {
  const random = Math.random();
  let cumulative = 0;
  
  for (const { method, weight } of METHOD_DISTRIBUTION) {
    cumulative += weight;
    if (random <= cumulative) {
      return method;
    }
  }
  
  return 'MATRICULA';
}

function selectRoom(scenario) {
  const data = loadSeedData();
  
  if (!roomWeights) {
    const popularCount = Math.max(1, Math.floor(data.rooms.length * 0.2));
    roomWeights = {
      popular: data.rooms.slice(0, popularCount),
      others: data.rooms.slice(popularCount),
      popularWeight: scenario === 'Spike' ? 0.95 : scenario === 'Pico' ? 0.9 : 0.8
    };
  }
  
  const weight = scenario === 'Spike' ? 0.95 : scenario === 'Pico' ? 0.9 : 0.8;
  
  if (Math.random() < weight) {
    return roomWeights.popular[Math.floor(Math.random() * roomWeights.popular.length)];
  }
  return roomWeights.others[Math.floor(Math.random() * roomWeights.others.length)];
}

function selectStudent(scenario) {
  const data = loadSeedData();
  
  // Para cenário de validações, usar alunos que podem causar erros
  if (scenario === 'Validações') {
    // 30% chance de usar aluno que já fez check-in (conflito)
    if (Math.random() < 0.3) {
      // Retornar aluno aleatório (pode causar conflito)
      return data.students[Math.floor(Math.random() * data.students.length)];
    }
    // 20% chance de tentar sala cheia
    if (Math.random() < 0.2) {
      return data.students[Math.floor(Math.random() * data.students.length)];
    }
  }
  
  // Seleção normal (round-robin)
  const student = data.students[studentIndex % data.students.length];
  studentIndex = (studentIndex + 1) % data.students.length;
  return student;
}

function getIdentificationValue(student, method) {
  switch (method) {
    case 'MATRICULA':
      return student.matricula?.value || student.matricula;
    case 'CPF':
      return student.cpf?.value || student.cpf;
    case 'QR_CODE':
      return `QR-${student.id}`;
    case 'BIOMETRIC':
      return `BIO-${student.id}`;
    default:
      return student.matricula?.value || student.matricula;
  }
}

async function makeCheckin(student, room, method, scenario) {
  const identificationValue = getIdentificationValue(student, method);
  
  // Para cenário de validações, gerar alguns erros intencionais
  if (scenario === 'Validações') {
    // 10% chance de tentar sala inexistente
    if (Math.random() < 0.1) {
      return { status: 404, error: 'room_not_found' };
    }
    // 10% chance de tentar aluno inexistente
    if (Math.random() < 0.1) {
      return { status: 404, error: 'student_not_found' };
    }
  }
  
  try {
    const response = await axios.post(
      `${CONFIG.checkinService}/api/v1/checkin`,
      {
        studentId: student.id,
        roomId: room.id,
        identificationMethod: method,
        identificationValue: identificationValue,
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 5000,
        validateStatus: () => true,
      }
    );
    
    return { status: response.status, error: null };
  } catch (error) {
    const status = error.response?.status || 500;
    const errorType = error.response?.data?.message || 'unknown';
    return { status, error: errorType };
  }
}

function updateStats(status, method, error, scenario) {
  stats.total++;
  
  if (!stats.byMethod[method]) {
    stats.byMethod[method] = 0;
  }
  stats.byMethod[method]++;
  
  if (!stats.byScenario[scenario]) {
    stats.byScenario[scenario] = { total: 0, success: 0, errors: 0 };
  }
  stats.byScenario[scenario].total++;
  
  if (status === 201) {
    stats.success++;
    stats.byScenario[scenario].success++;
  } else {
    stats.errors++;
    stats.byScenario[scenario].errors++;
    
    if (error) {
      const errorKey = error.toLowerCase().includes('capacidade') ? 'capacity' :
                     error.toLowerCase().includes('conflito') ? 'conflict' :
                     error.toLowerCase().includes('não encontrado') ? 'not_found' :
                     error.toLowerCase().includes('inativo') ? 'inactive' : 'other';
      
      if (!stats.byError[errorKey]) {
        stats.byError[errorKey] = 0;
      }
      stats.byError[errorKey]++;
    }
  }
}

function printStats() {
  const errorRate = stats.total > 0 ? (stats.errors / stats.total * 100).toFixed(2) : 0;
  const throughput = stats.total > 0 ? (stats.total / CONFIG.duration).toFixed(2) : 0;
  
  console.log('\n\n📊 Estatísticas Finais:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Total de requisições: ${stats.total}`);
  console.log(`Sucesso: ${stats.success} (${(100 - parseFloat(errorRate)).toFixed(2)}%)`);
  console.log(`Erros: ${stats.errors} (${errorRate}%)`);
  console.log(`Throughput médio: ${throughput} req/s`);
  console.log('\nPor Método:');
  Object.entries(stats.byMethod).forEach(([method, count]) => {
    const pct = (count / stats.total * 100).toFixed(1);
    console.log(`  ${method.padEnd(12)}: ${count.toString().padStart(4)} (${pct}%)`);
  });
  console.log('\nPor Cenário:');
  Object.entries(stats.byScenario).forEach(([scenario, data]) => {
    const pct = (data.total / stats.total * 100).toFixed(1);
    const errPct = data.total > 0 ? (data.errors / data.total * 100).toFixed(1) : 0;
    console.log(`  ${scenario.padEnd(12)}: ${data.total.toString().padStart(4)} req (${pct}%) - ${data.errors} erros (${errPct}%)`);
  });
  if (Object.keys(stats.byError).length > 0) {
    console.log('\nPor Tipo de Erro:');
    Object.entries(stats.byError).forEach(([error, count]) => {
      console.log(`  ${error.padEnd(15)}: ${count}`);
    });
  }
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

async function runScenario(scenario, duration) {
  const interval = 1000 / scenario.rate; // ms entre requisições
  const endTime = Date.now() + (duration * 1000);
  let requestCount = 0;
  
  console.log(`\n🚀 Cenário: ${scenario.name}`);
  console.log(`   Taxa: ${scenario.rate} req/s`);
  console.log(`   Duração: ${duration}s`);
  console.log(`   Erro esperado: ${(scenario.errorRate * 100).toFixed(1)}%`);
  
  const makeRequest = async () => {
    if (Date.now() >= endTime) {
      return false;
    }
    
    const student = selectStudent(scenario.name);
    const room = selectRoom(scenario.name);
    const method = selectMethod();
    
    const result = await makeCheckin(student, room, method, scenario.name);
    updateStats(result.status, method, result.error, scenario.name);
    
    requestCount++;
    
    // Feedback visual
    if (result.status === 201) {
      process.stdout.write('✅');
    } else if (result.status === 409) {
      process.stdout.write('⚠️'); // Conflito (esperado)
    } else if (result.status === 400) {
      process.stdout.write('🔴'); // Erro de validação
    } else {
      process.stdout.write('❌');
    }
    
    if (requestCount % 20 === 0) {
      process.stdout.write(` [${requestCount}]\n`);
    }
    
    return true;
  };
  
  // Executar requisições
  while (Date.now() < endTime) {
    await makeRequest();
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  
  console.log(`\n   ✅ Concluído: ${requestCount} requisições`);
}

async function generateStressRealistic() {
  console.log('🔥 Stress Test Realista e Variado');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Duração total: ${CONFIG.duration}s`);
  console.log(`Serviço: ${CONFIG.checkinService}\n`);
  
  loadSeedData();
  
  const startTime = Date.now();
  
  // Executar cenários sequencialmente
  for (const scenario of SCENARIOS) {
    const scenarioDuration = CONFIG.duration * scenario.duration;
    await runScenario(scenario, scenarioDuration);
  }
  
  const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
  
  printStats();
  
  console.log(`\n⏱️  Tempo total: ${totalTime}s`);
  console.log(`📊 Verifique o Grafana: http://localhost:3005`);
  console.log(`   Dashboard: Stress Test Monitor\n`);
}

// Tratar Ctrl+C
process.on('SIGINT', () => {
  console.log('\n\n⏹️  Interrompido pelo usuário');
  printStats();
  process.exit(0);
});

generateStressRealistic().catch(error => {
  console.error('❌ Erro:', error.message);
  process.exit(1);
});


