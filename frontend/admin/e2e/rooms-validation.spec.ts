import { test, expect } from '@playwright/test';
import { mockRoomsApi } from './utils/apiMock';
import { loginAsAdmin } from './utils/auth';

test.describe('Rooms Form Validation', () => {
  test.beforeEach(async ({ page }) => {
    // CRÍTICO: Configurar autenticação e mocks ANTES de navegar
    await loginAsAdmin(page);
    // Mock das APIs ANTES de page.goto()
    await mockRoomsApi(page);
    // AGORA pode navegar - mocks já estão configurados
    await page.goto('/rooms');
    // Aguardar página carregar
    await page.waitForLoadState('networkidle');
  });

  test('should validate required fields', async ({ page }) => {
    await page.getByRole('button', { name: 'Nova Sala' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    // Try to submit with empty room number
    await page.getByLabel('Tipo *').selectOption('CLASSROOM');
    await page.getByLabel('Capacidade *').fill('30');
    await page.getByLabel('Número da Sala *').clear();

    await page.getByRole('button', { name: 'Salvar' }).click();

    // Form should still be open due to validation
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('should validate capacity minimum value', async ({ page }) => {
    await page.getByRole('button', { name: 'Nova Sala' }).click();

    await page.getByLabel('Número da Sala *').fill('B202');
    await page.getByLabel('Tipo *').selectOption('LABORATORY');
    await page.getByLabel('Capacidade *').fill('0'); // Invalid capacity

    await page.getByRole('button', { name: 'Salvar' }).click();

    // Form should still be open
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('should validate capacity maximum value', async ({ page }) => {
    await page.getByRole('button', { name: 'Nova Sala' }).click();

    await page.getByLabel('Número da Sala *').fill('B202');
    await page.getByLabel('Tipo *').selectOption('AUDITORIUM');
    await page.getByLabel('Capacidade *').fill('10001'); // Exceeds maximum

    await page.getByRole('button', { name: 'Salvar' }).click();

    // Form should still be open
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('should accept all room types', async ({ page }) => {
    const roomTypes = [
      { value: 'CLASSROOM', label: 'Sala de Aula' },
      { value: 'LABORATORY', label: 'Laboratório' },
      { value: 'AUDITORIUM', label: 'Auditório' },
      { value: 'STUDY_ROOM', label: 'Sala de Estudo' },
    ];

    for (const roomType of roomTypes) {
      await page.getByRole('button', { name: 'Nova Sala' }).click();

      await page.getByLabel('Número da Sala *').fill(`TEST-${roomType.value}`);
      await page.getByLabel('Tipo *').selectOption(roomType.value);
      await page.getByLabel('Capacidade *').fill('50');
      await page.getByRole('button', { name: 'Salvar' }).click();

      // Form should close and room should appear
      await expect(page.getByRole('dialog')).not.toBeVisible();
      await expect(page.getByTestId('room-card').filter({ hasText: `TEST-${roomType.value}` })).toBeVisible();
    }
  });

  test('should toggle equipment checkbox', async ({ page }) => {
    await page.getByRole('button', { name: 'Nova Sala' }).click();

    await page.getByLabel('Número da Sala *').fill('C303');
    await page.getByLabel('Tipo *').selectOption('LABORATORY');
    await page.getByLabel('Capacidade *').fill('25');

    // Check equipment checkbox
    await page.getByLabel('Possui equipamentos').check();
    await expect(page.getByLabel('Possui equipamentos')).toBeChecked();

    // Uncheck equipment checkbox
    await page.getByLabel('Possui equipamentos').uncheck();
    await expect(page.getByLabel('Possui equipamentos')).not.toBeChecked();

    await page.getByRole('button', { name: 'Salvar' }).click();
    await expect(page.getByTestId('room-card').filter({ hasText: 'C303' })).toBeVisible();
  });

  test('should not allow editing room number', async ({ page }) => {
    await expect(page.getByTestId('room-card').filter({ hasText: 'A101' })).toBeVisible();

    const roomCard = page.getByTestId('room-card').filter({ hasText: 'A101' });
    await roomCard.getByRole('button', { name: 'Editar' }).click();

    // Room number field should not exist in edit mode
    const roomNumberField = page.getByLabel('Número da Sala *');
    await expect(roomNumberField).toHaveCount(0);

    // Only type, capacity, and equipment should be editable
    await page.getByLabel('Capacidade *').fill('60');
    await page.getByRole('button', { name: 'Salvar' }).click();

    await expect(roomCard).toContainText('Capacidade: 60');
  });

  test('should cancel form without saving', async ({ page }) => {
    await page.getByRole('button', { name: 'Nova Sala' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    await page.getByLabel('Número da Sala *').fill('D404');
    await page.getByRole('button', { name: 'Cancelar' }).click();

    // Form should close
    await expect(page.getByRole('dialog')).not.toBeVisible();

    // Room should not be created
    await expect(page.getByTestId('room-card').filter({ hasText: 'D404' })).toHaveCount(0);
  });
});

