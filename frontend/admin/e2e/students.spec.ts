import { test, expect } from '@playwright/test';
import { mockStudentsApi } from './utils/apiMock';
import { loginAsAdmin } from './utils/auth';
import { gotoAndWaitForApp } from './utils/waitForApp';

test.describe('Students Page', () => {
  test.beforeEach(async ({ page }) => {
    // CRÍTICO: Configurar autenticação e mocks ANTES de navegar
    // loginAsAdmin agora usa addInitScript, então localStorage será configurado antes de qualquer navegação
    await loginAsAdmin(page);
    // Mock das APIs ANTES de page.goto()
    await mockStudentsApi(page);
    // AGORA pode navegar - mocks já estão configurados
    // Usar helper para aguardar app estar completamente carregado
    await gotoAndWaitForApp(page, '/students');
  });

  test('should display students from API', async ({ page }) => {
    // Aguardar heading aparecer
    await expect(page.getByRole('heading', { name: 'Alunos' })).toBeVisible({ timeout: 10000 });
    // Aguardar cards aparecerem
    await expect(page.getByTestId('student-card').filter({ hasText: 'Ana Souza' })).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('student-card').filter({ hasText: 'Bruno Lima' })).toBeVisible({ timeout: 10000 });
  });

  test('should create a new student through the dialog', async ({ page }) => {
    // Aguardar botão aparecer
    await expect(page.getByRole('button', { name: 'Novo Aluno' })).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: 'Novo Aluno' }).click();
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 });

    await page.getByLabel('Nome *').fill('Carla');
    await page.getByLabel('Sobrenome *').fill('Ribeiro');
    await page.getByLabel('CPF *').fill('111.222.333-44');
    await page.getByLabel('Email *').fill('carla.ribeiro@pucpr.br');
    await page.getByLabel('Matrícula *').fill('20239999');
    await page.getByRole('button', { name: 'Salvar' }).click();

    // Wait for dialog to close
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 3000 });
    
    // Verify student appears in list
    await expect(page.getByTestId('student-card').filter({ hasText: 'Carla Ribeiro' })).toBeVisible();
    await expect(page.getByTestId('student-card').filter({ hasText: 'carla.ribeiro@pucpr.br' })).toBeVisible();
  });

  test('should edit an existing student', async ({ page }) => {
    const firstCard = page.getByTestId('student-card').filter({ hasText: 'Ana Souza' });
    await firstCard.getByRole('button', { name: 'Editar' }).click();

    await page.getByLabel('Nome *').fill('Ana Paula');
    await page.getByLabel('Email *').fill('ana.paula@pucpr.br');
    await page.getByRole('button', { name: 'Salvar' }).click();

    await expect(page.getByTestId('student-card').filter({ hasText: 'Ana Paula' })).toBeVisible();
    await expect(page.getByTestId('student-card').filter({ hasText: 'ana.paula@pucpr.br' })).toBeVisible();
  });

  test('should delete a student after confirmation', async ({ page }) => {
    const targetCard = page.getByTestId('student-card').filter({ hasText: 'Bruno Lima' });
    await expect(targetCard).toBeVisible(); // Ensure card exists before deletion
    
    await targetCard.getByRole('button', { name: 'Excluir' }).click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText('Confirmar Exclusão');
    await expect(dialog).toContainText('Bruno Lima');
    
    await dialog.getByRole('button', { name: 'Excluir' }).click();

    // Wait for dialog to close and card to be removed
    await expect(dialog).not.toBeVisible({ timeout: 3000 });
    await expect(targetCard).toHaveCount(0);
  });

  test('should cancel student deletion', async ({ page }) => {
    const targetCard = page.getByTestId('student-card').filter({ hasText: 'Ana Souza' });
    await expect(targetCard).toBeVisible();
    
    await targetCard.getByRole('button', { name: 'Excluir' }).click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: 'Cancelar' }).click();

    // Dialog should close and student should still exist
    await expect(dialog).not.toBeVisible();
    await expect(targetCard).toBeVisible();
  });

  test('should display empty state when no students', async ({ page }) => {
    // CRÍTICO: Configurar mock ANTES de navegar
    await page.route(/.*\/students.*/, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    // Usar helper para aguardar app estar completamente carregado
    await gotoAndWaitForApp(page, '/students');

    // Should show empty state message
    await expect(page.getByText(/nenhum aluno/i)).toBeVisible();
  });
});

