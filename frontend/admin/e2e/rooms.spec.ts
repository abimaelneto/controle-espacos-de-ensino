import { test, expect } from '@playwright/test';
import { mockRoomsApi } from './utils/apiMock';
import { loginAsAdmin } from './utils/auth';
import { gotoAndWaitForApp } from './utils/waitForApp';

test.describe('Rooms Page', () => {
  test.beforeEach(async ({ page }) => {
    // CRÍTICO: Configurar autenticação e mocks ANTES de navegar
    await loginAsAdmin(page);
    // Mock das APIs ANTES de page.goto()
    await mockRoomsApi(page);
    // AGORA pode navegar - mocks já estão configurados
    // Usar helper para aguardar app estar completamente carregado
    await gotoAndWaitForApp(page, '/rooms');
  });

  test('should list rooms from API', async ({ page }) => {
    // Aguardar heading aparecer
    await expect(page.getByRole('heading', { name: 'Salas' })).toBeVisible({ timeout: 10000 });
    // Aguardar cards aparecerem
    await expect(page.getByTestId('room-card').filter({ hasText: 'A101' })).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('room-card').filter({ hasText: 'LAB-02' })).toBeVisible({ timeout: 10000 });
  });

  test('should create a new room', async ({ page }) => {
    // Aguardar botão aparecer
    await expect(page.getByRole('button', { name: 'Nova Sala' })).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: 'Nova Sala' }).click();
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 });

    await page.getByLabel('Número da Sala *').fill('B202');
    await page.getByLabel('Tipo *').selectOption('AUDITORIUM');
    await page.getByLabel('Capacidade *').fill('80');
    await page.getByLabel('Possui equipamentos').check();
    await page.getByRole('button', { name: 'Salvar' }).click();

    await expect(page.getByTestId('room-card').filter({ hasText: 'B202' })).toBeVisible();
  });

  test('should edit a room capacity', async ({ page }) => {
    const roomCard = page.getByTestId('room-card').filter({ hasText: 'A101' });
    await roomCard.getByRole('button', { name: 'Editar' }).click();

    await page.getByLabel('Capacidade *').fill('55');
    await page.getByRole('button', { name: 'Salvar' }).click();

    await expect(roomCard).toContainText('Capacidade: 55');
  });

  test('should delete a room', async ({ page }) => {
    const roomCard = page.getByTestId('room-card').filter({ hasText: 'LAB-02' });
    await expect(roomCard).toBeVisible(); // Ensure card exists before deletion
    
    await roomCard.getByRole('button', { name: 'Excluir' }).click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText('Confirmar Exclusão');
    await expect(dialog).toContainText('LAB-02');
    
    await dialog.getByRole('button', { name: 'Excluir' }).click();

    // Wait for dialog to close and card to be removed
    await expect(dialog).not.toBeVisible({ timeout: 3000 });
    await expect(roomCard).toHaveCount(0);
  });

  test('should cancel room deletion', async ({ page }) => {
    const roomCard = page.getByTestId('room-card').filter({ hasText: 'A101' });
    await expect(roomCard).toBeVisible();
    
    await roomCard.getByRole('button', { name: 'Excluir' }).click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: 'Cancelar' }).click();

    // Dialog should close and room should still exist
    await expect(dialog).not.toBeVisible();
    await expect(roomCard).toBeVisible();
  });

  test('should display empty state when no rooms', async ({ page }) => {
    // Mock empty rooms list (usar regex para interceptar)
    await page.route(/.*\/rooms.*/, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    // Should show empty state message
    await expect(page.getByText(/nenhuma sala/i)).toBeVisible({ timeout: 10000 });
  });
});


