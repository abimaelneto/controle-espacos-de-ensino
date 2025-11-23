import { Page } from '@playwright/test';

/**
 * Helper para autenticação compartilhada nos testes E2E
 * Simula login e armazena token no localStorage
 * 
 * IMPORTANTE: Configura localStorage ANTES de qualquer navegação usando addInitScript
 * Isso garante que o token esteja disponível quando a página carregar
 */
export async function loginAsAdmin(page: Page) {
  // CRÍTICO: Configurar localStorage ANTES de qualquer page.goto()
  // Usar addInitScript garante que o localStorage seja configurado antes da página carregar
  await page.addInitScript(() => {
    localStorage.setItem('auth_token', 'mock-jwt-token-for-testing');
    localStorage.setItem('user', JSON.stringify({
      id: 'admin-user-id',
      email: 'admin@pucpr.br',
      role: 'ADMIN',
    }));
  });

  // Mock da API de autenticação (interceptar com ou sem baseURL)
  await page.route(/.*\/auth\/login.*/, async (route) => {
    const request = route.request();
    const method = request.method();

    if (method === 'POST') {
      const payload = await request.postDataJSON();
      
      // Validação básica (pode ser expandida)
      if (payload.email && payload.password) {
        return route.fulfill({
          status: 200,
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            accessToken: 'mock-jwt-token-for-testing',
            refreshToken: 'mock-refresh-token',
            user: {
              id: 'admin-user-id',
              email: payload.email,
              role: 'ADMIN',
            },
          }),
        });
      }
    }

    return route.fulfill({ status: 401 });
  });

  // NÃO fazer page.goto() aqui - deixar para os testes fazerem
  // Isso permite que os testes configurem mocks antes de navegar
}

/**
 * Helper para fazer logout
 */
export async function logout(page: Page) {
  await page.evaluate(() => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  });
  await page.reload();
}

/**
 * Helper para verificar se está autenticado
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  return await page.evaluate(() => {
    return !!localStorage.getItem('auth_token');
  });
}

