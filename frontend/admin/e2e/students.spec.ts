import { test, expect } from '@playwright/test';
import { mockStudentsApi } from './utils/apiMock';

test.describe('Students Page', () => {
  test.beforeEach(async ({ page }) => {
    await mockStudentsApi(page);
    await page.goto('/students');
  });

  test('should display students from API', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Alunos' })).toBeVisible();
    await expect(page.getByTestId('student-card').filter({ hasText: 'Ana Souza' })).toBeVisible();
    await expect(page.getByTestId('student-card').filter({ hasText: 'Bruno Lima' })).toBeVisible();
  });

  test('should create a new student through the dialog', async ({ page }) => {
    await page.getByRole('button', { name: 'Novo Aluno' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    await page.getByLabel('Nome *').fill('Carla');
    await page.getByLabel('Sobrenome *').fill('Ribeiro');
    await page.getByLabel('CPF *').fill('111.222.333-44');
    await page.getByLabel('Email *').fill('carla.ribeiro@pucpr.br');
    await page.getByLabel('Matrícula *').fill('20239999');
    await page.getByRole('button', { name: 'Salvar' }).click();

    await expect(page.getByTestId('student-card').filter({ hasText: 'Carla Ribeiro' })).toBeVisible();
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
    await targetCard.getByRole('button', { name: 'Excluir' }).click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toContainText('Confirmar Exclusão');
    await dialog.getByRole('button', { name: 'Excluir' }).click();

    await expect(targetCard).toHaveCount(0);
  });
});

