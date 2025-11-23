#!/usr/bin/env node

/**
 * Script para criar dados de teste (seed) para testes de stress
 * Cria alunos e salas reais nos serviços
 */

const axios = require('axios');

const CONFIG = {
  authService: process.env.AUTH_SERVICE_URL || 'http://localhost:3000',
  studentsService: process.env.STUDENTS_SERVICE_URL || 'http://localhost:3001',
  roomsService: process.env.ROOMS_SERVICE_URL || 'http://localhost:3002',
  numStudents: parseInt(process.env.NUM_STUDENTS || '100'),
  numRooms: parseInt(process.env.NUM_ROOMS || '10'),
};

let adminToken = null;

/**
 * Obtém token de autenticação
 */
async function getAuthToken() {
  if (adminToken) {
    return adminToken;
  }
  
  try {
    const response = await axios.post(
      `${CONFIG.authService}/api/v1/auth/login`,
      {
        email: 'admin@observability.local',
        password: 'Admin123!',
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 5000,
      }
    );
    
    if (response.data?.accessToken) {
      adminToken = response.data.accessToken;
      return adminToken;
    }
    
    throw new Error('Token não retornado no login');
  } catch (error) {
    console.error('Erro ao obter token:', error.message);
    throw error;
  }
}

/**
 * Cria um usuário para o aluno
 */
async function createUserForStudent(index) {
  const email = `stress.student${index}@pucpr.br`;
  
  try {
    const response = await axios.post(
      `${CONFIG.authService}/api/v1/auth/register`,
      {
        email,
        password: 'Student123!',
        role: 'STUDENT',
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 5000,
      }
    );
    return response.data.user;
  } catch (error) {
    if (error.response?.status === 409 || error.response?.status === 500) {
      // Usuário já existe, tentar fazer login
      try {
        const loginResponse = await axios.post(
          `${CONFIG.authService}/api/v1/auth/login`,
          {
            email,
            password: 'Student123!',
          },
          {
            headers: { 'Content-Type': 'application/json' },
            timeout: 5000,
          }
        );
        return loginResponse.data.user;
      } catch (loginError) {
        return null;
      }
    }
    return null;
  }
}

/**
 * Gera CPF válido para testes (apenas números, sem formatação)
 * Usa o mesmo algoritmo de validação do value object CPF
 */
function generateCPF() {
  // Gerar 9 primeiros dígitos aleatórios (evitar todos iguais)
  let digits = [];
  for (let i = 0; i < 9; i++) {
    digits.push(Math.floor(Math.random() * 10));
  }
  
  // Garantir que não são todos iguais
  if (digits.every(d => d === digits[0])) {
    digits[0] = (digits[0] + 1) % 10;
  }

  // Calcular primeiro dígito verificador
  let sum = 0;
  for (let i = 1; i <= 9; i++) {
    sum += digits[i - 1] * (11 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  digits.push(remainder);

  // Calcular segundo dígito verificador
  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += digits[i - 1] * (12 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  digits.push(remainder);

  // Retornar apenas números (sem formatação)
  return digits.join('');
}

/**
 * Cria um aluno
 */
async function createStudent(index) {
  const firstName = `Stress${index}`;
  const lastName = `Student${index}`;
  const cpf = generateCPF(); // Já retorna apenas números
  const email = `stress.student${index}@pucpr.br`;
  const matricula = `2024${String(index).padStart(6, '0')}`;

  // Criar usuário primeiro
  const user = await createUserForStudent(index);
  if (!user || !user.id) {
    throw new Error(`Não foi possível criar usuário para aluno ${index}`);
  }

  // Obter token de autenticação
  const token = await getAuthToken();

  try {
    const response = await axios.post(
      `${CONFIG.studentsService}/api/v1/students`,
      {
        userId: user.id,
        firstName,
        lastName,
        cpf,
        email,
        matricula,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        timeout: 5000,
      }
    );
    return response.data;
  } catch (error) {
    if (error.response?.status === 409) {
      // Já existe, tentar buscar
      console.warn(`Student ${matricula} already exists, skipping...`);
      return null;
    }
    throw error;
  }
}

/**
 * Cria uma sala
 */
async function createRoom(index) {
  const roomNumber = `STRESS-${String(index).padStart(3, '0')}`;
  const capacity = 50 + (index % 50); // Capacidade variada entre 50-99

  // Obter token de autenticação
  const token = await getAuthToken();

  try {
    const response = await axios.post(
      `${CONFIG.roomsService}/api/v1/rooms`,
      {
        roomNumber,
        type: 'CLASSROOM',
        capacity,
        hasEquipment: index % 2 === 0,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        timeout: 5000,
      }
    );
    return response.data;
  } catch (error) {
    if (error.response?.status === 409) {
      // Já existe, tentar buscar
      console.warn(`Room ${roomNumber} already exists, skipping...`);
      return null;
    }
    throw error;
  }
}

/**
 * Cria todos os alunos
 */
async function seedStudents() {
  console.log(`Creating ${CONFIG.numStudents} students...`);
  const students = [];
  const errors = [];

  for (let i = 1; i <= CONFIG.numStudents; i++) {
    try {
      const student = await createStudent(i);
      if (student) {
        students.push(student);
        if (i % 10 === 0) {
          process.stdout.write(`\rCreated ${i}/${CONFIG.numStudents} students...`);
        }
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message;
      const errorStatus = error.response?.status || error.code || 'N/A';
      const errorDetails = error.response?.data ? JSON.stringify(error.response.data) : '';
      errors.push({ index: i, error: errorMsg, status: errorStatus });
      console.error(`\nError creating student ${i}: ${errorMsg} (Status: ${errorStatus})`);
      if (errorDetails && errorDetails.length < 200) {
        console.error(`  Details: ${errorDetails}`);
      }
    }
  }

  console.log(`\n✅ Created ${students.length} students`);
  if (errors.length > 0) {
    console.warn(`⚠️  ${errors.length} errors occurred`);
  }

  return students;
}

/**
 * Cria todas as salas
 */
async function seedRooms() {
  console.log(`Creating ${CONFIG.numRooms} rooms...`);
  const rooms = [];
  const errors = [];

  for (let i = 1; i <= CONFIG.numRooms; i++) {
    try {
      const room = await createRoom(i);
      if (room) {
        rooms.push(room);
        if (i % 5 === 0) {
          process.stdout.write(`\rCreated ${i}/${CONFIG.numRooms} rooms...`);
        }
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message;
      const errorStatus = error.response?.status || error.code || 'N/A';
      const errorDetails = error.response?.data ? JSON.stringify(error.response.data) : '';
      errors.push({ index: i, error: errorMsg, status: errorStatus });
      console.error(`\nError creating room ${i}: ${errorMsg} (Status: ${errorStatus})`);
      if (errorDetails && errorDetails.length < 200) {
        console.error(`  Details: ${errorDetails}`);
      }
    }
  }

  console.log(`\n✅ Created ${rooms.length} rooms`);
  if (errors.length > 0) {
    console.warn(`⚠️  ${errors.length} errors occurred`);
  }

  return rooms;
}

/**
 * Salva dados em arquivo JSON
 */
function saveData(students, rooms) {
  const fs = require('fs');
  const path = require('path');
  const dataDir = path.join(__dirname, '../data');
  
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const data = {
    students,
    rooms,
    createdAt: new Date().toISOString(),
  };

  const filePath = path.join(dataDir, 'seed-data.json');
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`\n💾 Data saved to ${filePath}`);
  
  return filePath;
}

/**
 * Main
 */
async function main() {
  console.log('🌱 Starting seed process...\n');
  console.log(`Configuration:`);
  console.log(`  Students Service: ${CONFIG.studentsService}`);
  console.log(`  Rooms Service: ${CONFIG.roomsService}`);
  console.log(`  Number of Students: ${CONFIG.numStudents}`);
  console.log(`  Number of Rooms: ${CONFIG.numRooms}\n`);

  try {
    // Verificar se serviços estão disponíveis
    await axios.get(`${CONFIG.studentsService}/metrics`, { timeout: 3000, validateStatus: () => true });
    await axios.get(`${CONFIG.roomsService}/metrics`, { timeout: 3000, validateStatus: () => true });
    console.log('✅ Services are available\n');
  } catch (error) {
    console.error('❌ Services are not available. Please start them first.');
    console.error(`   Students: ${CONFIG.studentsService}`);
    console.error(`   Rooms: ${CONFIG.roomsService}`);
    process.exit(1);
  }

  const startTime = Date.now();

  // Criar dados
  const students = await seedStudents();
  const rooms = await seedRooms();

  // Salvar dados
  const dataPath = saveData(students, rooms);

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`\n✨ Seed completed in ${duration}s`);
  console.log(`\n📊 Summary:`);
  console.log(`   Students: ${students.length}`);
  console.log(`   Rooms: ${rooms.length}`);
  console.log(`\n💡 Use this data file for stress tests: ${dataPath}`);
}

if (require.main === module) {
  main().catch((error) => {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  });
}

module.exports = { seedStudents, seedRooms, saveData };

