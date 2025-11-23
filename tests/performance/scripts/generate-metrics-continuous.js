#!/usr/bin/env node

/**
 * Script para gerar métricas continuamente (útil para popular Grafana)
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

const CONFIG = {
  checkinService: process.env.CHECKIN_TARGET || 'http://localhost:3003',
  dataFile: process.env.SEED_DATA_FILE || path.join(__dirname, '../data/seed-data.json'),
  interval: parseInt(process.env.INTERVAL_MS || '2000'), // 2 segundos
  duration: parseInt(process.env.DURATION_SEC || '60'), // 1 minuto
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
        validateStatus: () => true,
      }
    );
    return response.status;
  } catch (error) {
    return null;
  }
}

async function generateMetricsContinuous() {
  console.log('🔄 Gerando métricas continuamente...\n');
  console.log(`Configuração:`);
  console.log(`  Intervalo: ${CONFIG.interval}ms`);
  console.log(`  Duração: ${CONFIG.duration}s`);
  console.log(`  Total de requisições: ~${Math.floor((CONFIG.duration * 1000) / CONFIG.interval)}\n`);
  
  const data = await loadSeedData();
  const students = data.students || [];
  const rooms = data.rooms || [];
  
  if (students.length === 0 || rooms.length === 0) {
    console.error('❌ Não há dados de seed. Execute: npm run perf:seed');
    process.exit(1);
  }
  
  let requestCount = 0;
  let successCount = 0;
  let errorCount = 0;
  
  const startTime = Date.now();
  const endTime = startTime + (CONFIG.duration * 1000);
  
  console.log('🚀 Iniciando geração de métricas...\n');
  console.log('Pressione Ctrl+C para parar antes do tempo\n');
  
  const interval = setInterval(async () => {
    if (Date.now() >= endTime) {
      clearInterval(interval);
      console.log(`\n\n✅ Concluído!`);
      console.log(`   Total de requisições: ${requestCount}`);
      console.log(`   Sucesso: ${successCount}`);
      console.log(`   Erros: ${errorCount}`);
      console.log(`\n📊 Verifique o Grafana: http://localhost:3005`);
      process.exit(0);
    }
    
    const student = students[requestCount % students.length];
    const room = rooms[requestCount % rooms.length];
    
    const status = await makeCheckin(student, room);
    requestCount++;
    
    if (status === 201) {
      successCount++;
      process.stdout.write('✅ ');
    } else if (status === 409 || status === 400) {
      successCount++;
      process.stdout.write('⚠️  ');
    } else {
      errorCount++;
      process.stdout.write('❌ ');
    }
    
    // Quebra de linha a cada 20 requisições
    if (requestCount % 20 === 0) {
      process.stdout.write(`\n[${requestCount} req] `);
    }
  }, CONFIG.interval);
  
  // Tratar Ctrl+C
  process.on('SIGINT', () => {
    clearInterval(interval);
    console.log(`\n\n⏹️  Interrompido pelo usuário`);
    console.log(`   Total de requisições: ${requestCount}`);
    console.log(`   Sucesso: ${successCount}`);
    console.log(`   Erros: ${errorCount}`);
    process.exit(0);
  });
}

generateMetricsContinuous().catch(error => {
  console.error('❌ Erro:', error.message);
  process.exit(1);
});

