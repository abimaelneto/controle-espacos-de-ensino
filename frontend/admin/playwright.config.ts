import { defineConfig, devices } from '@playwright/test';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.test file
config({ path: resolve(__dirname, '.env.test') });

// Get environment variables with fallback to defaults
const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:5173';
const WEB_SERVER_URL = process.env.PLAYWRIGHT_WEB_SERVER_URL || 'http://localhost:5173';

console.log('Loaded Playwright config for admin frontend');
console.log('Env PLAYWRIGHT_TEST_BASE_URL:', BASE_URL);
console.log('Env PLAYWRIGHT_WEB_SERVER_URL:', WEB_SERVER_URL);

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  // Aumentar timeouts para evitar falhas por timing
  timeout: 30000, // 30 segundos por teste
  expect: {
    timeout: 10000, // 10 segundos para expect
  },
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    // Aumentar timeout de navegação
    navigationTimeout: 30000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],

  webServer: {
    // CRÍTICO: O problema é que o Playwright verifica apenas se a URL retorna 200,
    // mas o Vite pode retornar 200 antes de estar pronto para processar módulos TypeScript.
    // 
    // Solução: O Playwright inicia o Vite e verifica se a URL retorna 200.
    // Mas precisamos aguardar mais tempo para o Vite processar os módulos.
    // Vamos aumentar o timeout e adicionar um delay no helper gotoAndWaitForApp.
    command: 'npm run dev',
    url: WEB_SERVER_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    stdout: 'pipe',
    stderr: 'pipe',
    // Aguardar um pouco mais após o servidor retornar 200
    // O Vite precisa de tempo para processar módulos TypeScript
  },
});

