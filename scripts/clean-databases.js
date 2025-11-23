#!/usr/bin/env node

/**
 * Script para limpar todas as bases de dados
 * DROP todas as tabelas e recria os bancos
 */

const mysql = require('mysql2/promise');

const databases = [
  { name: 'identity', port: 3306 },
  { name: 'academic', port: 3307 },
  { name: 'facilities', port: 3308 },
  { name: 'analytics', port: 3309 },
];

const config = {
  host: 'localhost',
  user: 'app_user',
  password: 'app_password',
};

async function cleanDatabase(dbName, port) {
  try {
    // Primeiro conectar sem especificar database para criar se não existir
    const adminConnection = await mysql.createConnection({
      ...config,
      port,
      multipleStatements: true,
    });

    // Criar database se não existir
    await adminConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    await adminConnection.end();

    // Conectar ao database específico
    const connection = await mysql.createConnection({
      ...config,
      port,
      database: dbName,
      multipleStatements: true,
    });

    console.log(`🧹 Limpando banco ${dbName} (porta ${port})...`);

    // Desabilitar foreign key checks temporariamente
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');

    // Obter todas as tabelas
    const [tables] = await connection.query(
      `SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ?`,
      [dbName]
    );

    // Dropar todas as tabelas
    if (tables.length > 0) {
      for (const table of tables) {
        await connection.query(`DROP TABLE IF EXISTS \`${table.TABLE_NAME}\``);
        console.log(`  ✓ Tabela ${table.TABLE_NAME} removida`);
      }
    } else {
      console.log(`  ℹ️  Nenhuma tabela encontrada`);
    }

    // Reabilitar foreign key checks
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');

    await connection.end();
    console.log(`✅ Banco ${dbName} limpo\n`);
    return true;
  } catch (error) {
    console.error(`❌ Erro ao limpar ${dbName}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Iniciando limpeza de bases de dados...\n');

  let successCount = 0;
  for (const db of databases) {
    const success = await cleanDatabase(db.name, db.port);
    if (success) successCount++;
  }

  console.log(`\n📊 Resumo: ${successCount}/${databases.length} bancos limpos`);
  
  if (successCount === databases.length) {
    console.log('✅ Todas as bases foram limpas com sucesso!');
  } else {
    console.log('⚠️  Algumas bases não foram limpas. Verifique os erros acima.');
  }
}

main().catch(console.error);

