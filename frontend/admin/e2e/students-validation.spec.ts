import { test, expect } from '@playwright/test';
import { mockStudentsApi } from './utils/apiMock';
import { loginAsAdmin } from './utils/auth';

test.describe('Students Form Validation', () => {
  test.beforeEach(async ({ page }) => {
    // CRÍTICO: Configurar autenticação e mocks ANTES de navegar
    await loginAsAdmin(page);
    // Mock das APIs ANTES de page.goto()
    await mockStudentsApi(page);
    // AGORA pode navegar - mocks já estão configurados
    await page.goto('/students');
    // Aguardar página carregar
    await page.waitForLoadState('networkidle');
  });

  test('should show validation errors for empty required fields', async ({ page }) => {
    // Aguardar botão aparecer
    await expect(page.getByRole('button', { name: 'Novo Aluno' })).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: 'Novo Aluno' }).click();
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 });

    // Try to submit without filling fields
    await page.getByRole('button', { name: 'Salvar' }).click();

    // Check that form doesn't close (validation prevents submission)
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('should validate CPF format', async ({ page }) => {
    await page.getByRole('button', { name: 'Novo Aluno' }).click();

    await page.getByLabel('Nome *').fill('João');
    await page.getByLabel('Sobrenome *').fill('Silva');
    await page.getByLabel('CPF *').fill('123'); // Invalid CPF
    await page.getByLabel('Email *').fill('joao@example.com');
    await page.getByLabel('Matrícula *').fill('2024001234');

    await page.getByRole('button', { name: 'Salvar' }).click();

    // Form should still be open due to validation error
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('should validate email format', async ({ page }) => {
    await page.getByRole('button', { name: 'Novo Aluno' }).click();

    await page.getByLabel('Nome *').fill('Maria');
    await page.getByLabel('Sobrenome *').fill('Santos');
    await page.getByLabel('CPF *').fill('123.456.789-09');
    await page.getByLabel('Email *').fill('invalid-email'); // Invalid email
    await page.getByLabel('Matrícula *').fill('2024005678');

    await page.getByRole('button', { name: 'Salvar' }).click();

    // Form should still be open due to validation error
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('should accept valid CPF formats', async ({ page }) => {
    await page.getByRole('button', { name: 'Novo Aluno' }).click();

    await page.getByLabel('Nome *').fill('Pedro');
    await page.getByLabel('Sobrenome *').fill('Costa');
    await page.getByLabel('CPF *').fill('12345678909'); // CPF without formatting
    await page.getByLabel('Email *').fill('pedro@example.com');
    await page.getByLabel('Matrícula *').fill('2024009999');

    await page.getByRole('button', { name: 'Salvar' }).click();

    // Form should close and student should appear
    await expect(page.getByRole('dialog')).not.toBeVisible();
    await expect(page.getByTestId('student-card').filter({ hasText: 'Pedro Costa' })).toBeVisible();
  });

  test('should allow editing only allowed fields', async ({ page }) => {
    // Wait for students to load
    await expect(page.getByTestId('student-card').filter({ hasText: 'Ana Souza' })).toBeVisible();

    const firstCard = page.getByTestId('student-card').filter({ hasText: 'Ana Souza' });
    await firstCard.getByRole('button', { name: 'Editar' }).click();

    // In edit mode, CPF and Matrícula should not be editable
    const cpfField = page.getByLabel('CPF *');
    const matriculaField = page.getByLabel('Matrícula *');

    // These fields should not exist in edit mode
    await expect(cpfField).toHaveCount(0);
    await expect(matriculaField).toHaveCount(0);

    // Only firstName, lastName, and email should be editable
    await page.getByLabel('Nome *').fill('Ana Paula');
    await page.getByLabel('Email *').fill('ana.paula@example.com');
    await page.getByRole('button', { name: 'Salvar' }).click();

    await expect(page.getByTestId('student-card').filter({ hasText: 'Ana Paula' })).toBeVisible();
  });

  test('should cancel form without saving', async ({ page }) => {
    await page.getByRole('button', { name: 'Novo Aluno' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    await page.getByLabel('Nome *').fill('Test');
    await page.getByRole('button', { name: 'Cancelar' }).click();

    // Form should close
    await expect(page.getByRole('dialog')).not.toBeVisible();

    // Student should not be created
    await expect(page.getByTestId('student-card').filter({ hasText: 'Test' })).toHaveCount(0);
  });
});

