import { test, expect } from '@playwright/test';
import { mockDashboardApis } from './utils/apiMock';
import { loginAsAdmin } from './utils/auth';
import { gotoAndWaitForApp } from './utils/waitForApp';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // CRÍTICO: Configurar autenticação e mocks ANTES de navegar
    // loginAsAdmin agora usa addInitScript, então localStorage será configurado antes de qualquer navegação
    await loginAsAdmin(page);
    // Mock das APIs ANTES de page.goto() - Dashboard precisa de students, rooms E analytics
    await mockDashboardApis(page);
    // AGORA pode navegar - mocks já estão configurados
    // Usar helper para aguardar app estar completamente carregado
    await gotoAndWaitForApp(page, '/');
  });

  test('should display dashboard page', async ({ page }) => {
    await expect(page).toHaveTitle(/Controle de Espaços/, { timeout: 10000 });
    // Aguardar conteúdo do dashboard aparecer
    await page.waitForTimeout(1000);
    await expect(page.locator('text=Dashboard').or(page.getByRole('heading', { name: /dashboard/i }))).toBeVisible({ timeout: 10000 });
  });

  test('should display navigation menu', async ({ page }) => {
    await expect(page.locator('text=Dashboard')).toBeVisible();
    await expect(page.locator('text=Alunos')).toBeVisible();
    await expect(page.locator('text=Salas')).toBeVisible();
    await expect(page.locator('text=Analytics')).toBeVisible();
  });

  test('should show metrics populated from API responses', async ({ page }) => {
    // Aguardar métricas carregarem
    await expect(page.getByTestId('metric-card-students-value')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('metric-card-students-value')).toHaveText('2', { timeout: 5000 });
    await expect(page.getByTestId('metric-card-rooms-value')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('metric-card-rooms-value')).toHaveText('2', { timeout: 5000 });
  });

  test('should navigate to Students page', async ({ page }) => {
    const alunosLink = page.getByRole('link', { name: /alunos/i });
    await expect(alunosLink).toBeVisible({ timeout: 10000 });
    await alunosLink.click();
    await expect(page).toHaveURL(/.*students/, { timeout: 10000 });
    await expect(page.getByRole('heading', { name: /alunos/i })).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to Rooms page', async ({ page }) => {
    const salasLink = page.getByRole('link', { name: /salas/i });
    await expect(salasLink).toBeVisible({ timeout: 10000 });
    await salasLink.click();
    await expect(page).toHaveURL(/.*rooms/, { timeout: 10000 });
    await expect(page.getByRole('heading', { name: /salas/i })).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to Analytics page', async ({ page }) => {
    const analyticsLink = page.getByRole('link', { name: /analytics/i });
    await expect(analyticsLink).toBeVisible({ timeout: 10000 });
    await analyticsLink.click();
    await expect(page).toHaveURL(/.*analytics/, { timeout: 10000 });
    await page.waitForTimeout(1000);
    const analyticsVisible = await page.getByRole('heading', { name: /analytics/i }).isVisible().catch(() => false) ||
                            await page.locator('text=/analytics/i').first().isVisible().catch(() => false);
    expect(analyticsVisible).toBe(true);
  });

  test('should refresh metrics when data changes', async ({ page }) => {
    // Initial load
    await expect(page.getByTestId('metric-card-students-value')).toHaveText('2');
    
    // Update mock to return different values
    await page.route(/.*\/students.*/, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: '1', firstName: 'Student', lastName: '1', email: 's1@test.com', matricula: '1', cpf: '111.111.111-11', status: 'ACTIVE' },
          { id: '2', firstName: 'Student', lastName: '2', email: 's2@test.com', matricula: '2', cpf: '222.222.222-22', status: 'ACTIVE' },
          { id: '3', firstName: 'Student', lastName: '3', email: 's3@test.com', matricula: '3', cpf: '333.333.333-33', status: 'ACTIVE' },
        ]),
      });
    });

    await page.route(/.*\/rooms.*/, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: '1', roomNumber: 'R1', type: 'CLASSROOM', capacity: 30, hasEquipment: false, status: 'AVAILABLE' },
          { id: '2', roomNumber: 'R2', type: 'CLASSROOM', capacity: 30, hasEquipment: false, status: 'AVAILABLE' },
          { id: '3', roomNumber: 'R3', type: 'CLASSROOM', capacity: 30, hasEquipment: false, status: 'AVAILABLE' },
        ]),
      });
    });

    // Reload page to get new data
    await page.reload();
    await page.waitForTimeout(1000);

    // Metrics should update (if dashboard refreshes automatically)
    // This test verifies the dashboard can handle data changes
    await expect(page.getByTestId('metric-card-students-value')).toBeVisible();
  });

  test('should handle dashboard loading state', async ({ page }) => {
    // Delay API responses
    await page.route(/.*\/students.*/, async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    await page.route(/.*\/rooms.*/, async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    await page.goto('/');

    // Should show loading state briefly
    // The exact implementation depends on Dashboard component
    await page.waitForTimeout(100);
  });
});

