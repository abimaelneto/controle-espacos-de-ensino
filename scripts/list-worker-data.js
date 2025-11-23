#!/usr/bin/env node

/**
 * Script para listar salas e alunos usados pelo worker e demo
 * 
 * Este script lista todos os dados que serão usados pelos scripts de teste:
 * - worker-checkin-test.js
 * - demo-case-completo.js
 * 
 * Uso: node scripts/list-worker-data.js
 * 
 * Pré-requisitos:
 *   - Serviços rodando (npm run dev)
 *   - Dados seedados (npm run seed:all)
 */

const axios = require('axios');

const STUDENTS_URL = process.env.STUDENTS_URL || 'http://localhost:3001';
const ROOMS_URL = process.env.ROOMS_URL || 'http://localhost:3002';

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

async function fetchStudents() {
  try {
    const response = await axios.get(`${STUDENTS_URL}/api/v1/students`, axiosConfig);
    const allStudents = response.data || [];
    // Filtrar apenas alunos ativos (mesma lógica do worker)
    const students = allStudents.filter(s => s.status === 'ACTIVE');
    return students;
  } catch (error) {
    log(`❌ Erro ao buscar estudantes: ${error.message}`, 'red');
    return [];
  }
}

async function fetchRooms() {
  try {
    const response = await axios.get(`${ROOMS_URL}/api/v1/rooms`, axiosConfig);
    const allRooms = response.data || [];
    // Filtrar apenas salas ativas (mesma lógica do worker)
    const rooms = allRooms.filter(r => r.status === 'ACTIVE');
    return rooms;
  } catch (error) {
    log(`❌ Erro ao buscar salas: ${error.message}`, 'red');
    return [];
  }
}

function formatDate(dateString) {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('pt-BR');
}

async function main() {
  console.clear();
  
  log('═══════════════════════════════════════════════════════════════', 'cyan');
  log('  📋 DADOS USADOS PELO WORKER E DEMO', 'bold');
  log('═══════════════════════════════════════════════════════════════', 'cyan');
  console.log('');

  log('🔍 Buscando dados do banco...', 'blue');
  console.log('');

  const students = await fetchStudents();
  const rooms = await fetchRooms();

  if (students.length === 0) {
    log('⚠️  Nenhum estudante ativo encontrado!', 'yellow');
    log('   Execute: npm run seed:all', 'yellow');
    console.log('');
  }

  if (rooms.length === 0) {
    log('⚠️  Nenhuma sala ativa encontrada!', 'yellow');
    log('   Execute: npm run seed:all', 'yellow');
    console.log('');
  }

  if (students.length === 0 || rooms.length === 0) {
    process.exit(1);
  }

  // ========================================================================
  // SALAS
  // ========================================================================
  log('═══════════════════════════════════════════════════════════════', 'cyan');
  log(`  🏢 SALAS ATIVAS (${rooms.length})`, 'bold');
  log('═══════════════════════════════════════════════════════════════', 'cyan');
  console.log('');

  // Agrupar por tipo
  const roomsByType = rooms.reduce((acc, room) => {
    const type = room.type || 'UNKNOWN';
    if (!acc[type]) acc[type] = [];
    acc[type].push(room);
    return acc;
  }, {});

  Object.keys(roomsByType).sort().forEach(type => {
    log(`📚 ${type} (${roomsByType[type].length} salas):`, 'yellow');
    roomsByType[type].forEach((room, index) => {
      const capacity = room.capacity || 0;
      const hasEquipment = room.hasEquipment ? '✅' : '❌';
      log(`   ${index + 1}. ${room.roomNumber.padEnd(10)} | ID: ${room.id.substring(0, 8)}... | Capacidade: ${capacity.toString().padStart(3)} | Equipamentos: ${hasEquipment}`, 'cyan');
    });
    console.log('');
  });

  // Lista completa para referência
  log('📋 Lista Completa de Salas (para referência):', 'yellow');
  rooms.forEach((room, index) => {
    const roomNumber = (room.roomNumber || 'N/A').padEnd(10);
    const type = (room.type || 'UNKNOWN').padEnd(15);
    const roomId = room.id || 'N/A';
    log(`   ${(index + 1).toString().padStart(3)}. ${roomNumber} | ${type} | ID: ${roomId}`, 'cyan');
  });
  console.log('');

  // ========================================================================
  // ESTUDANTES
  // ========================================================================
  log('═══════════════════════════════════════════════════════════════', 'cyan');
  log(`  🎓 ESTUDANTES ATIVOS (${students.length})`, 'bold');
  log('═══════════════════════════════════════════════════════════════', 'cyan');
  console.log('');

  // Mostrar primeiros 20 em detalhes
  const studentsToShow = students.slice(0, 20);
  
  log('📋 Primeiros 20 Estudantes (detalhado):', 'yellow');
  studentsToShow.forEach((student, index) => {
    const name = `${student.firstName} ${student.lastName}`.padEnd(30);
    const matricula = (student.matricula || 'N/A').padEnd(12);
    const cpf = (student.cpf || 'N/A').padEnd(15);
    log(`   ${(index + 1).toString().padStart(3)}. ${name} | Matrícula: ${matricula} | CPF: ${cpf} | ID: ${student.id.substring(0, 8)}...`, 'cyan');
  });
  console.log('');

  if (students.length > 20) {
    log(`   ... e mais ${students.length - 20} estudantes`, 'cyan');
    console.log('');
  }

  // Lista completa para referência
  log('📋 Lista Completa de Estudantes (para referência):', 'yellow');
  students.forEach((student, index) => {
    const firstName = student.firstName || 'N/A';
    const lastName = student.lastName || '';
    const name = `${firstName} ${lastName}`.trim().padEnd(30);
    const matricula = (student.matricula || 'N/A').padEnd(12);
    const studentId = student.id || 'N/A';
    log(`   ${(index + 1).toString().padStart(3)}. ${name} | ${matricula} | ID: ${studentId}`, 'cyan');
  });
  console.log('');

  // ========================================================================
  // RESUMO PARA TESTES
  // ========================================================================
  log('═══════════════════════════════════════════════════════════════', 'cyan');
  log('  📊 RESUMO PARA TESTES', 'bold');
  log('═══════════════════════════════════════════════════════════════', 'cyan');
  console.log('');

  log('🎯 Para testar Analytics (Histórico de Sala):', 'yellow');
  if (rooms.length > 0) {
    const firstRoom = rooms[0];
    log(`   • Selecione a sala: ${firstRoom.roomNumber} (ID: ${firstRoom.id.substring(0, 8)}...)`, 'cyan');
    log(`   • Tipo: ${firstRoom.type}`, 'cyan');
    log(`   • Capacidade: ${firstRoom.capacity}`, 'cyan');
  }
  console.log('');

  log('🎯 Para testar Analytics (Histórico de Estudante):', 'yellow');
  if (students.length > 0) {
    const firstStudent = students[0];
    log(`   • Selecione o estudante: ${firstStudent.firstName} ${firstStudent.lastName}`, 'cyan');
    log(`   • Matrícula: ${firstStudent.matricula}`, 'cyan');
    log(`   • ID: ${firstStudent.id.substring(0, 8)}...`, 'cyan');
  }
  console.log('');

  log('🎯 Para testar Realtime (Tempo Real):', 'yellow');
  log('   • Execute: npm run worker:checkin', 'cyan');
  log('   • Acesse: http://localhost:5173/realtime', 'cyan');
  log('   • Observe as salas sendo atualizadas em tempo real', 'cyan');
  console.log('');

  log('🎯 Para testar Demo Completa:', 'yellow');
  log('   • Execute: npm run demo:case', 'cyan');
  log('   • O script usará os dados listados acima', 'cyan');
  console.log('');

  // ========================================================================
  // ESTATÍSTICAS
  // ========================================================================
  log('═══════════════════════════════════════════════════════════════', 'cyan');
  log('  📈 ESTATÍSTICAS', 'bold');
  log('═══════════════════════════════════════════════════════════════', 'cyan');
  console.log('');

  // Estatísticas de salas
  const totalCapacity = rooms.reduce((sum, r) => sum + (r.capacity || 0), 0);
  const avgCapacity = rooms.length > 0 ? (totalCapacity / rooms.length).toFixed(1) : 0;
  const roomsWithEquipment = rooms.filter(r => r.hasEquipment).length;

  log('🏢 Salas:', 'yellow');
  log(`   • Total: ${rooms.length}`, 'cyan');
  log(`   • Capacidade total: ${totalCapacity} lugares`, 'cyan');
  log(`   • Capacidade média: ${avgCapacity} lugares/sala`, 'cyan');
  log(`   • Com equipamentos: ${roomsWithEquipment} (${((roomsWithEquipment / rooms.length) * 100).toFixed(1)}%)`, 'cyan');
  console.log('');

  // Estatísticas de estudantes
  const studentsWithCPF = students.filter(s => s.cpf).length;
  const studentsWithMatricula = students.filter(s => s.matricula).length;

  log('🎓 Estudantes:', 'yellow');
  log(`   • Total: ${students.length}`, 'cyan');
  log(`   • Com CPF: ${studentsWithCPF} (${((studentsWithCPF / students.length) * 100).toFixed(1)}%)`, 'cyan');
  log(`   • Com Matrícula: ${studentsWithMatricula} (${((studentsWithMatricula / students.length) * 100).toFixed(1)}%)`, 'cyan');
  console.log('');

  log('═══════════════════════════════════════════════════════════════', 'green');
  log('  ✅ Listagem concluída!', 'bold');
  log('═══════════════════════════════════════════════════════════════', 'green');
  console.log('');
}

main().catch((error) => {
  log(`❌ Erro fatal: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});

