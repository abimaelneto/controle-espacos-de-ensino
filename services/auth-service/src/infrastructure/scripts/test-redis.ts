import Redis from 'ioredis';
import { config } from 'dotenv';
import * as path from 'path';

config({ path: path.join(__dirname, '../../../.env.local') });

async function testRedis() {
  const host = process.env.REDIS_HOST || 'localhost';
  const port = parseInt(process.env.REDIS_PORT || '6379');

  console.log('🔄 Tentando conectar ao Redis...');
  console.log(`📍 Host: ${host}:${port}`);

  const client = new Redis({
    host,
    port,
  });

  client.on('error', (err) => {
    console.error('❌ Erro no Redis:', err);
    process.exit(1);
  });

  try {
    // Testar PING
    const pingResult = await client.ping();
    console.log('✅ PING:', pingResult);

    // Testar SET/GET
    await client.set('test:key', 'test-value');
    const value = await client.get('test:key');
    console.log('✅ SET/GET:', value);

    // Testar TTL
    await client.setex('test:ttl', 10, 'value-with-ttl');
    const ttl = await client.ttl('test:ttl');
    console.log('✅ SETEX/TTL:', ttl, 'segundos');

    // Limpar chaves de teste
    await client.del('test:key', 'test:ttl');
    console.log('✅ Chaves de teste removidas');

    await client.quit();
    console.log('✅ Conexão fechada');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Erro ao conectar:', error.message);
    process.exit(1);
  }
}

testRedis();
