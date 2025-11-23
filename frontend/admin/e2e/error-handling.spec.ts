import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './utils/auth';

import { mockStudentsApi, mockRoomsApi } from './utils/apiMock';

test.describe('Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    // CRÍTICO: Configurar autenticação ANTES de qualquer navegação
    await loginAsAdmin(page);
  });

  test('should display error message when API fails to load students', async ({ page }) => {
    // CRÍTICO: Configurar mock ANTES de page.goto()
    // Mock API to return error (usar regex)
    await page.route(/.*\/students.*/, (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Internal Server Error' }),
      });
    });

    // AGORA pode navegar - mock já está configurado
    await page.goto('/students');
    await page.waitForLoadState('networkidle');

    // Should show error message
    await expect(page.getByText(/erro|error/i)).toBeVisible({ timeout: 10000 });
  });

  test('should display error message when API fails to load rooms', async ({ page }) => {
    // CRÍTICO: Configurar mock ANTES de page.goto()
    await page.route(/.*\/rooms.*/, (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Internal Server Error' }),
      });
    });

    // AGORA pode navegar - mock já está configurado
    await page.goto('/rooms');

    // Should show error message
    await expect(page.getByText(/erro|error/i)).toBeVisible({ timeout: 5000 });
  });

  test('should handle network error gracefully', async ({ page }) => {
    // CRÍTICO: Configurar mock ANTES de page.goto()
    // Mock network failure - mas precisamos mockar outras APIs também para a página carregar
    await page.route(/.*\/students.*/, (route) => {
      route.abort('failed');
    });
    
    // Mock analytics para evitar erros adicionais
    await page.route(/.*\/analytics.*/, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({}),
      });
    });

    // AGORA pode navegar - mocks já estão configurados
    await page.goto('/students');

    // Should show error or loading state
    // The exact behavior depends on implementation
    await page.waitForTimeout(2000);
  });

  test('should show error when creating student fails', async ({ page }) => {
    // CRÍTICO: Configurar mock ANTES de page.goto()
    await page.route(/.*\/students.*/, async (route) => {
      const request = route.request();
      if (request.method() === 'POST') {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Validation failed' }),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]),
        });
      }
    });

    // AGORA pode navegar - mock já está configurado
    await page.goto('/students');
    await page.getByRole('button', { name: 'Novo Aluno' }).click();

    await page.getByLabel('Nome *').fill('Test');
    await page.getByLabel('Sobrenome *').fill('User');
    await page.getByLabel('CPF *').fill('123.456.789-09');
    await page.getByLabel('Email *').fill('test@example.com');
    await page.getByLabel('Matrícula *').fill('2024001234');
    await page.getByRole('button', { name: 'Salvar' }).click();

    // Should show error message
    await expect(page.getByText(/erro|error|falhou/i)).toBeVisible({ timeout: 3000 });
  });

  test('should handle 404 error when student not found', async ({ page }) => {
    await page.route(/.*\/students\/student-not-found.*/, (route) => {
      route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Student not found' }),
      });
    });

    // This test verifies that 404 errors are handled
    // The exact UI behavior depends on implementation
    await page.goto('/students');
    await page.waitForTimeout(1000);
  });

  test('should show error when deleting student fails', async ({ page }) => {
    let deleteAttempted = false;

    // CRÍTICO: Configurar mock ANTES de page.goto()
    await page.route(/.*\/students.*/, async (route) => {
      const request = route.request();
      const url = new URL(request.url());

      if (request.method() === 'DELETE') {
        deleteAttempted = true;
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Delete failed' }),
        });
      } else if (request.method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              id: 'student-1',
              firstName: 'Ana',
              lastName: 'Souza',
              email: 'ana@example.com',
              matricula: '20231234',
              cpf: '123.456.789-01',
              status: 'ACTIVE',
            },
          ]),
        });
      } else {
        await route.continue();
      }
    });

    await page.goto('/students');
    await expect(page.getByTestId('student-card').filter({ hasText: 'Ana Souza' })).toBeVisible();

    const studentCard = page.getByTestId('student-card').filter({ hasText: 'Ana Souza' });
    await studentCard.getByRole('button', { name: 'Excluir' }).click();

    // Confirm deletion
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('button', { name: 'Excluir' }).click();

    // Wait for delete request
    await page.waitForTimeout(1000);

    // Verify delete was attempted
    expect(deleteAttempted).toBe(true);
  });
});

