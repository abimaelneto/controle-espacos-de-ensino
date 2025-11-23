#!/usr/bin/env node

/**
 * Script para sincronizar check-ins do check-in service com o analytics service
 * Útil quando eventos do Kafka não foram processados ou Kafka está desabilitado
 */

const axios = require('axios');

const CHECKIN_API = process.env.CHECKIN_API_URL || 'http://localhost:3004/api/v1';
const ANALYTICS_API = process.env.ANALYTICS_API_URL || 'http://localhost:3005/api/v1';
const AUTH_API = process.env.AUTH_API_URL || 'http://localhost:3000/api/v1';

// Credenciais padrão do admin
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@pucpr.br';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

let authToken = null;

async function login() {
  try {
    const response = await axios.post(`${AUTH_API}/auth/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });
    authToken = response.data.accessToken;
    console.log('✅ Autenticado com sucesso');
    return true;
  } catch (error) {
    console.error('❌ Erro ao autenticar:', error.response?.data || error.message);
    return false;
  }
}

async function getCheckIns(startDate, endDate) {
  try {
    // Buscar check-ins ativos (sem checkout)
    const response = await axios.get(`${CHECKIN_API}/checkin/attendance/history`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      params: {
        startDate: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: endDate || new Date().toISOString(),
      },
    });
    return response.data || [];
  } catch (error) {
    console.error('❌ Erro ao buscar check-ins:', error.response?.data || error.message);
    return [];
  }
}

async function syncCheckInToAnalytics(checkIn) {
  try {
    // Criar evento de check-in manualmente
    const event = {
      eventType: 'AttendanceCheckedIn',
      aggregateId: checkIn.id,
      occurredAt: checkIn.checkInTime,
      topic: 'attendance.events',
      payload: {
        attendanceId: checkIn.id,
        studentId: checkIn.studentId,
        roomId: checkIn.roomId,
        checkInTime: checkIn.checkInTime,
      },
    };

    // Publicar evento via endpoint interno (se existir) ou diretamente no Kafka
    // Por enquanto, vamos criar a métrica diretamente via API interna
    // Nota: Isso requer um endpoint de sincronização no analytics service
    
    console.log(`  📊 Sincronizando check-in ${checkIn.id} (estudante: ${checkIn.studentId}, sala: ${checkIn.roomId})`);
    
    // Se houver endpoint de sincronização, usar aqui
    // Por enquanto, apenas logamos
    return true;
  } catch (error) {
    console.error(`  ❌ Erro ao sincronizar check-in ${checkIn.id}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🔄 Iniciando sincronização de check-ins com analytics...\n');

  // Autenticar
  const authenticated = await login();
  if (!authenticated) {
    process.exit(1);
  }

  // Buscar check-ins
  console.log('📥 Buscando check-ins...');
  const checkIns = await getCheckIns();
  console.log(`✅ Encontrados ${checkIns.length} check-ins\n`);

  if (checkIns.length === 0) {
    console.log('ℹ️  Nenhum check-in encontrado para sincronizar');
    return;
  }

  // Sincronizar cada check-in
  console.log('🔄 Sincronizando check-ins...\n');
  let synced = 0;
  let failed = 0;

  for (const checkIn of checkIns) {
    const success = await syncCheckInToAnalytics(checkIn);
    if (success) {
      synced++;
    } else {
      failed++;
    }
  }

  console.log(`\n✅ Sincronização concluída:`);
  console.log(`   - Sincronizados: ${synced}`);
  console.log(`   - Falhas: ${failed}`);
  console.log(`\n⚠️  NOTA: Este script apenas simula a sincronização.`);
  console.log(`   Para sincronizar de verdade, é necessário:`);
  console.log(`   1. Habilitar Kafka (KAFKA_DISABLED=false)`);
  console.log(`   2. Ou criar endpoint de sincronização no analytics service`);
  console.log(`   3. Ou re-publicar eventos manualmente no Kafka`);
}

main().catch(console.error);

