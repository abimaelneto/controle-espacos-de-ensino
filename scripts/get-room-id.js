#!/usr/bin/env node

/**
 * Script auxiliar para obter um ID de sala para testar o frontend do estudante
 * 
 * Uso: node scripts/get-room-id.js [opções]
 * 
 * Opções:
 *   --room-number=<numero>  Buscar sala por número (ex: A101)
 *   --first                 Retornar primeira sala (padrão)
 *   --url                   Gerar URL completa para o frontend
 */

const axios = require('axios');

const ROOMS_URL = process.env.ROOMS_URL || 'http://localhost:3002';

const args = process.argv.slice(2);
const config = {
  roomNumber: args.find(arg => arg.startsWith('--room-number='))?.split('=')[1],
  first: args.includes('--first') || !args.find(arg => arg.startsWith('--room-number=')),
  url: args.includes('--url'),
};

async function getRooms() {
  try {
    const response = await axios.get(`${ROOMS_URL}/api/v1/rooms`);
    return response.data || [];
  } catch (error) {
    console.error('❌ Erro ao buscar salas:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', JSON.stringify(error.response.data));
    }
    process.exit(1);
  }
}

async function main() {
  const rooms = await getRooms();

  if (rooms.length === 0) {
    console.error('❌ Nenhuma sala encontrada. Execute o seed primeiro:');
    console.error('   npm run seed:all');
    process.exit(1);
  }

  let room;

  if (config.roomNumber) {
    room = rooms.find(r => r.roomNumber === config.roomNumber);
    if (!room) {
      console.error(`❌ Sala "${config.roomNumber}" não encontrada.`);
      console.error('   Salas disponíveis:');
      rooms.slice(0, 10).forEach(r => {
        console.error(`   - ${r.roomNumber} (${r.type})`);
      });
      process.exit(1);
    }
  } else {
    room = rooms[0];
  }

  console.log('');
  console.log('═══════════════════════════════════════');
  console.log('📋 Informações da Sala');
  console.log('═══════════════════════════════════════');
  console.log(`ID: ${room.id}`);
  console.log(`Número: ${room.roomNumber}`);
  console.log(`Tipo: ${room.type}`);
  console.log(`Capacidade: ${room.capacity}`);
  console.log(`Status: ${room.status}`);
  console.log('═══════════════════════════════════════');
  console.log('');

  if (config.url) {
    const frontendUrl = `http://localhost:5174?roomId=${room.id}`;
    console.log('🌐 URL do Frontend do Estudante:');
    console.log(`   ${frontendUrl}`);
    console.log('');
    console.log('💡 Dica: Copie e cole no navegador');
    console.log('');
  } else {
    console.log('💡 Dica: Use --url para gerar URL completa');
    console.log(`   node scripts/get-room-id.js --url`);
    console.log('');
  }
}

main().catch((error) => {
  console.error('❌ Erro fatal:', error.message);
  process.exit(1);
});

