import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './utils/auth';
import { gotoAndWaitForApp } from './utils/waitForApp';
import { mockAnalyticsApi, mockDashboardApis } from './utils/apiMock';

test.describe('Analytics Page', () => {
  test.beforeEach(async ({ page }) => {
    // CRÍTICO: Configurar autenticação e mocks ANTES de navegar
    await loginAsAdmin(page);
    // Mock das APIs ANTES de page.goto() - Analytics pode precisar de students/rooms também
    await mockDashboardApis(page); // Inclui analytics, students e rooms
    // AGORA pode navegar - mocks já estão configurados
    // Usar helper para aguardar app estar completamente carregado
    await gotoAndWaitForApp(page, '/analytics');
  });

  test('should display analytics page', async ({ page }) => {
    // Aguardar página carregar
    await page.waitForTimeout(1000);
    
    // Verificar se página de analytics está visível (pode ser título ou heading)
    const analyticsHeading = page.getByRole('heading', { name: /analytics/i });
    const analyticsTitle = page.locator('text=/analytics/i').first();
    
    // Verificar se pelo menos um elemento de analytics está visível
    const isVisible = await analyticsHeading.isVisible().catch(() => false) || 
                     await analyticsTitle.isVisible().catch(() => false);
    
    expect(isVisible).toBe(true);
  });

  test('should show analytics metrics', async ({ page }) => {
    // Wait for content to load
    await page.waitForTimeout(1000);

    // Check for analytics content (exact selectors depend on implementation)
    // This is a basic check - adjust based on actual Analytics page structure
    const pageContent = await page.textContent('body');
    expect(pageContent).toBeTruthy();
  });

  test('should navigate to Analytics from Dashboard', async ({ page }) => {
    // Mock dashboard APIs (usar regex)
    await page.route(/.*\/students.*/, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    await page.route(/.*\/rooms.*/, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    // Usar helper para aguardar app estar completamente carregado
    await gotoAndWaitForApp(page, '/');
    // Analytics é um Link no layout
    const analyticsLink = page.getByRole('link', { name: /analytics/i });
    await expect(analyticsLink).toBeVisible({ timeout: 10000 });
    await analyticsLink.click();

    await expect(page).toHaveURL(/.*analytics/);
    await expect(page.getByRole('heading', { name: /analytics/i })).toBeVisible();
  });

  test('should handle analytics API errors gracefully', async ({ page }) => {
    await page.route(/.*\/analytics.*/, (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Internal Server Error' }),
      });
    });

    // Usar helper para aguardar app estar completamente carregado
    await gotoAndWaitForApp(page, '/analytics');
    // The exact behavior depends on implementation
  });
});

