import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import * as path from 'path';

config({ path: path.join(__dirname, '../../../.env.local') });

async function testConnection() {
  const dataSource = new DataSource({
    type: 'mysql',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '3306'),
    username: process.env.DATABASE_USER || 'app_user',
    password: process.env.DATABASE_PASSWORD || 'app_password',
    database: process.env.DATABASE_NAME || 'identity',
    synchronize: false,
    logging: true,
  });

  try {
    console.log('🔄 Tentando conectar ao banco de dados...');
    await dataSource.initialize();
    console.log('✅ Conexão estabelecida com sucesso!');

    // Testar query simples
    const result = await dataSource.query('SELECT 1 as test');
    console.log('✅ Query de teste executada:', result);

    // Verificar se a tabela users existe
    const tables = await dataSource.query(
      "SHOW TABLES LIKE 'users'",
    );
    if (tables.length > 0) {
      console.log('✅ Tabela "users" existe');
    } else {
      console.log('⚠️  Tabela "users" não existe (execute as migrations)');
    }

    await dataSource.destroy();
    console.log('✅ Conexão fechada');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao conectar:', error.message);
    process.exit(1);
  }
}

testConnection();

