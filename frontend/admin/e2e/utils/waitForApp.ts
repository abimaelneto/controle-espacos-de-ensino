/**
 * Helper para aguardar o app React estar completamente carregado
 * Resolve o problema de tela branca no Playwright
 */
import { Page } from '@playwright/test';

/**
 * Configura listeners para capturar erros do console e da página
 * Útil para diagnosticar problemas de renderização
 */
export function setupErrorListeners(page: Page) {
  const errors: string[] = [];
  const consoleErrors: string[] = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      consoleErrors.push(text);
      console.error('[Browser Console Error]', text);
    }
  });

  page.on('pageerror', (error) => {
    const message = error.message;
    errors.push(message);
    console.error('[Page Error]', message);
  });

  page.on('requestfailed', (request) => {
    console.error('[Request Failed]', request.url(), request.failure()?.errorText);
  });

  return { errors, consoleErrors };
}

/**
 * Aguarda o app React estar completamente carregado e renderizado
 * 
 * @param page - Instância do Page do Playwright
 * @param timeout - Timeout em ms (padrão: 30000)
 */
export async function waitForAppReady(page: Page, timeout = 30000) {
  // Configurar listeners de erro
  const { errors, consoleErrors } = setupErrorListeners(page);

  try {
    // 1. Aguardar DOM estar carregado
    await page.waitForLoadState('domcontentloaded', { timeout });

    // 2. Aguardar elemento root estar presente
    await page.waitForSelector('#root', { state: 'attached', timeout });

    // 3. Aguardar React ter renderizado (verificar se root tem conteúdo)
    // Tentar várias vezes com timeout menor
    let retries = 5;
    let rootHasContent = false;

    while (retries > 0 && !rootHasContent) {
      try {
        await page.waitForFunction(
          () => {
            const root = document.getElementById('root');
            if (!root) return false;
            // Verificar se tem filhos OU se tem texto (React pode renderizar texto direto)
            return root.children.length > 0 || root.textContent?.trim().length > 0;
          },
          { timeout: 5000 }
        );
        rootHasContent = true;
      } catch (e) {
        retries--;
        if (retries > 0) {
          await page.waitForTimeout(1000);
        }
      }
    }

    if (!rootHasContent) {
      // Diagnosticar o problema
      const rootInfo = await page.evaluate(() => {
        const root = document.getElementById('root');
        return {
          exists: !!root,
          children: root?.children.length || 0,
          textContent: root?.textContent?.substring(0, 100) || '',
          innerHTML: root?.innerHTML?.substring(0, 200) || '',
        };
      });

      console.error('[waitForAppReady] Root não tem conteúdo:', rootInfo);
      console.error('[waitForAppReady] Console errors:', consoleErrors);
      console.error('[waitForAppReady] Page errors:', errors);

      throw new Error(
        `App não renderizou. Root info: ${JSON.stringify(rootInfo)}. ` +
        `Console errors: ${consoleErrors.join('; ')}. ` +
        `Page errors: ${errors.join('; ')}`
      );
    }

    // 4. Aguardar network idle (assets carregados) - mas não bloquear se demorar muito
    try {
      await page.waitForLoadState('networkidle', { timeout: 10000 });
    } catch (e) {
      // Se networkidle demorar muito, continuar mesmo assim
      console.warn('[waitForAppReady] networkidle timeout, continuando...');
    }

    // 5. Aguardar um pouco mais para garantir que React terminou de renderizar
    await page.waitForTimeout(1000);

    // Verificar se há erros críticos
    if (errors.length > 0 || consoleErrors.length > 0) {
      console.warn('[waitForAppReady] Encontrados erros, mas continuando:', {
        errors,
        consoleErrors,
      });
    }
  } catch (error: any) {
    // Capturar screenshot para debug
    await page.screenshot({ path: 'test-results/app-not-ready.png', fullPage: true });
    
    // Capturar HTML para debug
    const html = await page.content();
    console.error('[waitForAppReady] HTML content (first 500 chars):', html.substring(0, 500));
    
    throw new Error(
      `Falha ao aguardar app estar pronto: ${error.message}. ` +
      `Console errors: ${consoleErrors.join('; ')}. ` +
      `Page errors: ${errors.join('; ')}`
    );
  }
}

/**
 * Verifica se o Vite está realmente pronto para processar módulos TypeScript
 */
async function verifyViteReady(page: Page, baseURL: string): Promise<boolean> {
  try {
    // Tentar acessar um módulo TypeScript através do Vite
    // O Vite deve processar e retornar JavaScript, não 404
    const response = await page.request.get(`${baseURL}/src/main.tsx`, {
      headers: {
        'Accept': 'application/javascript, text/javascript, */*',
      },
    });
    
    // Se retornar 200, o Vite está processando corretamente
    if (response.ok()) {
      const contentType = response.headers()['content-type'] || '';
      // Verificar se o conteúdo é JavaScript (processado pelo Vite)
      if (contentType.includes('javascript')) {
        return true;
      }
    }
    
    return false;
  } catch (error) {
    return false;
  }
}

/**
 * Navega para uma URL e aguarda o app estar pronto
 * 
 * @param page - Instância do Page do Playwright
 * @param url - URL para navegar
 * @param timeout - Timeout em ms (padrão: 10000)
 */
export async function gotoAndWaitForApp(page: Page, url: string, timeout = 10000) {
  // CRÍTICO: O Playwright verifica se a URL retorna 200, mas o Vite pode retornar 200
  // antes de estar pronto para processar módulos TypeScript.
  // Vamos verificar se o Vite está realmente processando módulos antes de navegar.
  const baseURL = page.context().baseURL || 'http://localhost:5173';
  
  console.log('[gotoAndWaitForApp] Verificando se Vite está pronto...');
  
  // Aguardar até o Vite estar realmente pronto (máximo 10 segundos)
  let viteReady = false;
  for (let i = 0; i < 20; i++) {
    viteReady = await verifyViteReady(page, baseURL);
    if (viteReady) {
      console.log('[gotoAndWaitForApp] Vite está pronto!');
      break;
    }
    await page.waitForTimeout(500);
  }
  
  if (!viteReady) {
    console.warn('[gotoAndWaitForApp] Não foi possível verificar se Vite está pronto, continuando...');
  }
  
  console.log('[gotoAndWaitForApp] Navegando para:', url);
  
  // Navegar para a URL com waitUntil 'networkidle' para garantir que todos os recursos carregaram
  await page.goto(url, { waitUntil: 'networkidle', timeout });
  
  // Aguardar o app estar completamente pronto
  await waitForAppReady(page, timeout);
}

