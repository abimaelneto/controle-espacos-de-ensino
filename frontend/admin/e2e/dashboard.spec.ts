import { test, expect } from '@playwright/test';
import { mockDashboardApis } from './utils/apiMock';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await mockDashboardApis(page);
    await page.goto('/');
  });

  test('should display dashboard page', async ({ page }) => {
    await expect(page).toHaveTitle(/Controle de Espaços/);
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });

  test('should display navigation menu', async ({ page }) => {
    await expect(page.locator('text=Dashboard')).toBeVisible();
    await expect(page.locator('text=Alunos')).toBeVisible();
    await expect(page.locator('text=Salas')).toBeVisible();
    await expect(page.locator('text=Analytics')).toBeVisible();
  });

  test('should show metrics populated from API responses', async ({ page }) => {
    await expect(page.getByTestId('metric-card-students-value')).toHaveText('2');
    await expect(page.getByTestId('metric-card-rooms-value')).toHaveText('2');
  });

  test('should navigate to Students page', async ({ page }) => {
    await page.click('text=Alunos');
    await expect(page).toHaveURL(/.*students/);
    await expect(page.locator('text=Alunos')).toBeVisible();
  });

  test('should navigate to Rooms page', async ({ page }) => {
    await page.click('text=Salas');
    await expect(page).toHaveURL(/.*rooms/);
    await expect(page.locator('text=Salas')).toBeVisible();
  });

  test('should navigate to Analytics page', async ({ page }) => {
    await page.click('text=Analytics');
    await expect(page).toHaveURL(/.*analytics/);
    await expect(page.locator('text=Analytics')).toBeVisible();
  });
});

