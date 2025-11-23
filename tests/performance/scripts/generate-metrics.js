#!/usr/bin/env node

/**
 * Script para gerar algumas métricas e popular o Grafana
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

const CONFIG = {
  checkinService: process.env.CHECKIN_TARGET || 'http://localhost:3003',
  dataFile: process.env.SEED_DATA_FILE || path.join(__dirname, '../data/seed-data.json'),
};

async function loadSeedData() {
  if (!fs.existsSync(CONFIG.dataFile)) {
    throw new Error(`Seed data file not found: ${CONFIG.dataFile}. Run npm run perf:seed first.`);
  }
  return JSON.parse(fs.readFileSync(CONFIG.dataFile, 'utf8'));
}

async function makeCheckin(student, room) {
  try {
    const response = await axios.post(
      `${CONFIG.checkinService}/api/v1/checkin`,
      {
        studentId: student.id,
        roomId: room.id,
        identificationMethod: 'MATRICULA',
        identificationValue: student.matricula?.value || student.matricula,
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 5000,
        validateStatus: () => true, // Aceitar qualquer status
      }
    );
    return response.status;
  } catch (error) {
    return null;
  }
}

async function generateMetrics() {
  console.log('🔄 Gerando métricas para popular o Grafana...\n');
  
  const data = await loadSeedData();
  const students = data.students || [];
  const rooms = data.rooms || [];
  
  if (students.length === 0 || rooms.length === 0) {
    console.error('❌ Não há dados de seed. Execute: npm run perf:seed');
    process.exit(1);
  }
  
  console.log(`📊 Usando ${students.length} alunos e ${rooms.length} salas\n`);
  
  const numRequests = parseInt(process.env.NUM_REQUESTS || '20');
  let success = 0;
  let errors = 0;
  
  console.log(`🚀 Fazendo ${numRequests} requisições...\n`);
  
  for (let i = 0; i < numRequests; i++) {
    const student = students[i % students.length];
    const room = rooms[i % rooms.length];
    
    const status = await makeCheckin(student, room);
    
    if (status === 201) {
      success++;
      process.stdout.write('✅ ');
    } else if (status === 409 || status === 400) {
      // Conflito ou validação - esperado, conta como processado
      success++;
      process.stdout.write('⚠️  ');
    } else {
      errors++;
      process.stdout.write('❌ ');
    }
    
    // Pequeno delay entre requisições
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log(`\n\n✅ Concluído!`);
  console.log(`   Sucesso/Processado: ${success}`);
  console.log(`   Erros: ${errors}`);
  console.log(`\n📊 Verifique o Grafana: http://localhost:3005`);
  console.log(`   Dashboard: Stress Test Monitor`);
}

generateMetrics().catch(error => {
  console.error('❌ Erro:', error.message);
  process.exit(1);
});

