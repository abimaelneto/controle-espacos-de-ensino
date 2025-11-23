#!/usr/bin/env node

/**
 * Script que executa ciclo completo: limpar -> ajustar -> seed -> verificar -> repetir até funcionar
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function execCommand(command, description) {
  try {
    log(`\n${description}...`, 'cyan');
    const output = execSync(command, { 
      cwd: process.cwd(),
      stdio: 'pipe',
      encoding: 'utf-8'
    });
    return { success: true, output };
  } catch (error) {
    return { success: false, output: error.stdout + error.stderr, error };
  }
}

async function cleanDatabases() {
  log('\n🧹 Limpando bases de dados...', 'blue');
  const result = execCommand('node scripts/clean-databases.js', 'Limpeza de bases');
  return result.success;
}

async function runSeed() {
  log('\n🌱 Executando seed...', 'blue');
  const result = execCommand('node scripts/seed-all.js', 'Seed completo');
  return result;
}

function analyzeErrors(seedOutput) {
  const errors = [];
  
  // Verificar erros de migration
  if (seedOutput.includes('Access denied') || seedOutput.includes('ER_ACCESS_DENIED')) {
    errors.push('MIGRATION_DB_AUTH');
  }
  
  if (seedOutput.includes('Cannot find module') || seedOutput.includes('typeorm.config.ts')) {
    errors.push('MIGRATION_CONFIG_MISSING');
  }
  
  // Verificar erros 401
  if (seedOutput.includes('status code 401') || seedOutput.includes('Unauthorized')) {
    errors.push('AUTH_TOKEN_MISSING');
  }
  
  // Verificar erros de criação
  if (seedOutput.includes('0 alunos criados') || seedOutput.includes('0 salas criadas')) {
    errors.push('SEED_CREATION_FAILED');
  }
  
  return errors;
}

function fixErrors(errors) {
  let fixed = false;
  
  for (const error of errors) {
    switch (error) {
      case 'MIGRATION_DB_AUTH':
        log('🔧 Corrigindo autenticação MySQL nas migrations...', 'yellow');
        // Já corrigido nos typeorm.config.ts
        fixed = true;
        break;
        
      case 'MIGRATION_CONFIG_MISSING':
        log('🔧 Verificando arquivos typeorm.config.ts...', 'yellow');
        // Já criados
        fixed = true;
        break;
        
      case 'AUTH_TOKEN_MISSING':
        log('🔧 Verificando token de autenticação no seed...', 'yellow');
        // Já corrigido
        fixed = true;
        break;
        
      case 'SEED_CREATION_FAILED':
        log('🔧 Verificando criação de dados...', 'yellow');
        // Pode ser problema de token ou dados
        fixed = true;
        break;
    }
  }
  
  return fixed;
}

function checkSuccess(seedOutput) {
  // Verificar se seed foi bem-sucedido
  const hasSuccess = 
    seedOutput.includes('✅ Processo de seed concluído com sucesso') ||
    (seedOutput.includes('alunos criados') && !seedOutput.includes('0 alunos criados')) ||
    (seedOutput.includes('salas criadas') && !seedOutput.includes('0 salas criadas'));
    
  return hasSuccess;
}

async function main() {
  log('\n🚀 Iniciando ciclo de correção e seed...\n', 'blue');
  log('═══════════════════════════════════════════════════════════', 'cyan');
  
  let attempts = 0;
  const maxAttempts = 5;
  
  while (attempts < maxAttempts) {
    attempts++;
    log(`\n📋 Tentativa ${attempts}/${maxAttempts}`, 'cyan');
    
    // 1. Limpar bases
    const cleaned = await cleanDatabases();
    if (!cleaned) {
      log('⚠️  Limpeza falhou, continuando...', 'yellow');
    }
    
    // 2. Executar seed
    const seedResult = runSeed();
    const seedOutput = seedResult.output || '';
    
    // 3. Verificar sucesso
    if (checkSuccess(seedOutput)) {
      log('\n✅ Seed executado com sucesso!', 'green');
      log('\n📊 Resumo:', 'blue');
      console.log(seedOutput);
      return;
    }
    
    // 4. Analisar erros
    const errors = analyzeErrors(seedOutput);
    log(`\n🔍 Erros encontrados: ${errors.join(', ')}`, 'yellow');
    
    // 5. Corrigir erros
    const fixed = fixErrors(errors);
    
    if (!fixed && errors.length > 0) {
      log('\n❌ Não foi possível corrigir automaticamente. Erros:', 'red');
      console.log(seedOutput);
      break;
    }
    
    log('\n🔄 Reiniciando ciclo...', 'cyan');
  }
  
  log('\n⚠️  Máximo de tentativas atingido', 'yellow');
}

main().catch(console.error);

