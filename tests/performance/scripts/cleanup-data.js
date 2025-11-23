#!/usr/bin/env node

/**
 * Script para limpar dados de teste após testes de stress
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

const CONFIG = {
  studentsService: process.env.STUDENTS_SERVICE_URL || 'http://localhost:3001',
  roomsService: process.env.ROOMS_SERVICE_URL || 'http://localhost:3002',
  checkinService: process.env.CHECKIN_SERVICE_URL || 'http://localhost:3003',
  dataFile: process.env.SEED_DATA_FILE || path.join(__dirname, '../data/seed-data.json'),
};

/**
 * Deleta um aluno
 */
async function deleteStudent(studentId) {
  try {
    await axios.delete(`${CONFIG.studentsService}/api/v1/students/${studentId}`, {
      timeout: 5000,
    });
    return true;
  } catch (error) {
    if (error.response?.status === 404) {
      return true; // Já foi deletado
    }
    throw error;
  }
}

/**
 * Deleta uma sala
 */
async function deleteRoom(roomId) {
  try {
    await axios.delete(`${CONFIG.roomsService}/api/v1/rooms/${roomId}`, {
      timeout: 5000,
    });
    return true;
  } catch (error) {
    if (error.response?.status === 404) {
      return true; // Já foi deletado
    }
    throw error;
  }
}

/**
 * Limpa check-ins de teste
 */
async function cleanupCheckins() {
  console.log('Cleaning up check-ins...');
  
  // Nota: O Check-in Service não tem endpoint de listagem/deleção em massa
  // Por enquanto, apenas logamos que seria necessário limpar manualmente
  // ou implementar um endpoint de cleanup no serviço
  console.log('⚠️  Check-ins cleanup requires manual database cleanup or service endpoint');
}

/**
 * Carrega dados do arquivo de seed
 */
function loadSeedData() {
  if (!fs.existsSync(CONFIG.dataFile)) {
    console.warn(`⚠️  Seed data file not found: ${CONFIG.dataFile}`);
    console.warn('   Skipping cleanup based on seed data');
    return null;
  }

  const data = JSON.parse(fs.readFileSync(CONFIG.dataFile, 'utf8'));
  return data;
}

/**
 * Limpa todos os alunos
 */
async function cleanupStudents(students) {
  if (!students || students.length === 0) {
    console.log('No students to cleanup');
    return;
  }

  console.log(`Deleting ${students.length} students...`);
  let deleted = 0;
  let errors = 0;

  for (const student of students) {
    try {
      await deleteStudent(student.id);
      deleted++;
      if (deleted % 10 === 0) {
        process.stdout.write(`\rDeleted ${deleted}/${students.length} students...`);
      }
    } catch (error) {
      errors++;
      console.error(`\nError deleting student ${student.id}:`, error.message);
    }
  }

  console.log(`\n✅ Deleted ${deleted} students`);
  if (errors > 0) {
    console.warn(`⚠️  ${errors} errors occurred`);
  }
}

/**
 * Limpa todas as salas
 */
async function cleanupRooms(rooms) {
  if (!rooms || rooms.length === 0) {
    console.log('No rooms to cleanup');
    return;
  }

  console.log(`Deleting ${rooms.length} rooms...`);
  let deleted = 0;
  let errors = 0;

  for (const room of rooms) {
    try {
      await deleteRoom(room.id);
      deleted++;
      if (deleted % 5 === 0) {
        process.stdout.write(`\rDeleted ${deleted}/${rooms.length} rooms...`);
      }
    } catch (error) {
      errors++;
      console.error(`\nError deleting room ${room.id}:`, error.message);
    }
  }

  console.log(`\n✅ Deleted ${deleted} rooms`);
  if (errors > 0) {
    console.warn(`⚠️  ${errors} errors occurred`);
  }
}

/**
 * Limpa todos os dados de stress (prefixo STRESS-)
 */
async function cleanupByPrefix() {
  console.log('Cleaning up data with STRESS- prefix...');

  try {
    // Buscar alunos
    const studentsResponse = await axios.get(`${CONFIG.studentsService}/api/v1/students`);
    const stressStudents = studentsResponse.data.filter((s) =>
      s.email?.includes('stress.student') || s.matricula?.startsWith('2024')
    );

    // Buscar salas
    const roomsResponse = await axios.get(`${CONFIG.roomsService}/api/v1/rooms`);
    const stressRooms = roomsResponse.data.filter((r) =>
      r.roomNumber?.startsWith('STRESS-')
    );

    if (stressStudents.length > 0) {
      await cleanupStudents(stressStudents);
    }

    if (stressRooms.length > 0) {
      await cleanupRooms(stressRooms);
    }
  } catch (error) {
    console.error('Error during prefix-based cleanup:', error.message);
  }
}

/**
 * Main
 */
async function main() {
  console.log('🧹 Starting cleanup process...\n');
  console.log(`Configuration:`);
  console.log(`  Students Service: ${CONFIG.studentsService}`);
  console.log(`  Rooms Service: ${CONFIG.roomsService}`);
  console.log(`  Check-in Service: ${CONFIG.checkinService}`);
  console.log(`  Data File: ${CONFIG.dataFile}\n`);

  const startTime = Date.now();

  // Tentar carregar dados do arquivo de seed
  const seedData = loadSeedData();

  if (seedData) {
    console.log('Using seed data file for cleanup...\n');
    await cleanupStudents(seedData.students);
    await cleanupRooms(seedData.rooms);
  } else {
    console.log('Using prefix-based cleanup...\n');
    await cleanupByPrefix();
  }

  // Limpar check-ins
  await cleanupCheckins();

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`\n✨ Cleanup completed in ${duration}s`);
}

if (require.main === module) {
  main().catch((error) => {
    console.error('❌ Cleanup failed:', error.message);
    process.exit(1);
  });
}

module.exports = { cleanupStudents, cleanupRooms, cleanupCheckins };

