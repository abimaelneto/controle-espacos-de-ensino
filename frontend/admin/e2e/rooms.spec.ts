import { test, expect } from '@playwright/test';
import { mockRoomsApi } from './utils/apiMock';

test.describe('Rooms Page', () => {
  test.beforeEach(async ({ page }) => {
    await mockRoomsApi(page);
    await page.goto('/rooms');
  });

  test('should list rooms from API', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Salas' })).toBeVisible();
    await expect(page.getByTestId('room-card').filter({ hasText: 'A101' })).toBeVisible();
    await expect(page.getByTestId('room-card').filter({ hasText: 'LAB-02' })).toBeVisible();
  });

  test('should create a new room', async ({ page }) => {
    await page.getByRole('button', { name: 'Nova Sala' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

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
    await roomCard.getByRole('button', { name: 'Excluir' }).click();

    const dialog = page.getByRole('dialog');
    await dialog.getByRole('button', { name: 'Excluir' }).click();

    await expect(roomCard).toHaveCount(0);
  });
});


