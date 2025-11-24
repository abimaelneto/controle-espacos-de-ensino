#!/usr/bin/env node

/**
 * Script para aguardar o Vite estar completamente pronto
 * Verifica se o Vite está processando módulos TypeScript corretamente
 * 
 * Uso: node scripts/wait-for-vite.js
 */

const http = require('http');

const VITE_URL = process.env.PLAYWRIGHT_WEB_SERVER_URL || 'http://localhost:5173';
const MAX_RETRIES = 60; // 60 tentativas = 30 segundos (500ms cada)
const RETRY_DELAY = 500;

function checkViteReady() {
  return new Promise((resolve) => {
    try {
      const url = new URL(VITE_URL);
      
      const options = {
        hostname: url.hostname,
        port: url.port || 5173,
        path: '/src/main.tsx',
        method: 'GET',
        headers: {
          'Accept': 'application/javascript, text/javascript, */*',
        },
        timeout: 2000,
      };

      const req = http.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          // O Vite deve retornar 200 e processar o módulo TypeScript
          // Se retornar 404, o Vite ainda não está pronto
          if (res.statusCode === 200) {
            const contentType = res.headers['content-type'] || '';
            // Verificar se o conteúdo é JavaScript (processado pelo Vite)
            // O Vite processa TypeScript e retorna JavaScript
            if (contentType.includes('javascript') || 
                data.includes('import') || 
                data.includes('export') ||
                data.includes('React')) {
              resolve(true);
            } else {
              resolve(false);
            }
          } else {
            resolve(false);
          }
        });
      });

      req.on('error', () => {
        // Erro de conexão - servidor ainda não está pronto
        resolve(false);
      });

      req.on('timeout', () => {
        req.destroy();
        resolve(false);
      });

      req.end();
    } catch (error) {
      resolve(false);
    }
  });
}

async function waitForVite() {
  console.log(`⏳ Aguardando Vite estar pronto em ${VITE_URL}...`);
  
  for (let i = 0; i < MAX_RETRIES; i++) {
    const isReady = await checkViteReady();
    
    if (isReady) {
      // Aguardar um pouco mais para garantir que tudo está estável
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('✅ Vite está pronto e processando módulos corretamente!');
      return true;
    }
    
    if (i % 10 === 0 && i > 0) {
      process.stdout.write('.');
    }
    
    if (i < MAX_RETRIES - 1) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
    }
  }
  
  console.error('\n❌ Timeout: Vite não está pronto após', MAX_RETRIES * RETRY_DELAY / 1000, 'segundos');
  return false;
}

// Executar
if (require.main === module) {
  waitForVite()
    .then((ready) => {
      process.exit(ready ? 0 : 1);
    })
    .catch((error) => {
      console.error('Erro ao verificar Vite:', error);
      process.exit(1);
    });
}

module.exports = { waitForVite, checkViteReady };

