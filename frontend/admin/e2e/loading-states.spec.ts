import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './utils/auth';

import { mockAnalyticsApi } from './utils/apiMock';

test.describe('Loading States', () => {
  test.beforeEach(async ({ page }) => {
    // CRÍTICO: Configurar autenticação ANTES de qualquer navegação
    await loginAsAdmin(page);
  });

  test('should show loading indicator while fetching students', async ({ page }) => {
    // CRÍTICO: Configurar mocks ANTES de page.goto()
    // Delay API response to see loading state (usar regex)
    await page.route(/.*\/students.*/, async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });
    
    // Mock analytics para evitar erros
    await mockAnalyticsApi(page);

    // AGORA pode navegar - mocks já estão configurados
    await page.goto('/students');

    // Should show loading indicator (spinner or similar)
    // The exact selector depends on implementation
    const loadingIndicator = page.locator('[data-testid*="loading"], .animate-spin, [aria-label*="loading" i]');
    await expect(loadingIndicator.first()).toBeVisible({ timeout: 1000 });
  });

  test('should show loading indicator while fetching rooms', async ({ page }) => {
    // CRÍTICO: Configurar mocks ANTES de page.goto()
    await page.route(/.*\/rooms.*/, async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });
    
    // Mock analytics para evitar erros
    await mockAnalyticsApi(page);

    // AGORA pode navegar - mocks já estão configurados
    await page.goto('/rooms');

    // Should show loading indicator
    const loadingIndicator = page.locator('[data-testid*="loading"], .animate-spin, [aria-label*="loading" i]');
    await expect(loadingIndicator.first()).toBeVisible({ timeout: 1000 });
  });

  test('should show loading state while creating student', async ({ page }) => {
    // CRÍTICO: Configurar mocks ANTES de page.goto()
    await page.route(/.*\/students.*/, async (route) => {
      const request = route.request();
      if (request.method() === 'POST') {
        // Delay POST response
        await new Promise((resolve) => setTimeout(resolve, 500));
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'new-student',
            firstName: 'New',
            lastName: 'Student',
            email: 'new@example.com',
            matricula: '2024001234',
            cpf: '123.456.789-09',
            status: 'ACTIVE',
          }),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]),
        });
      }
    });

    await page.goto('/students');
    await page.getByRole('button', { name: 'Novo Aluno' }).click();

    await page.getByLabel('Nome *').fill('New');
    await page.getByLabel('Sobrenome *').fill('Student');
    await page.getByLabel('CPF *').fill('123.456.789-09');
    await page.getByLabel('Email *').fill('new@example.com');
    await page.getByLabel('Matrícula *').fill('2024001234');

    // Click save and check for loading state
    await page.getByRole('button', { name: 'Salvar' }).click();

    // Button should show loading state (disabled or with spinner)
    const saveButton = page.getByRole('button', { name: /salvando|loading/i });
    await expect(saveButton).toBeVisible({ timeout: 1000 });
  });

  test('should show loading state while updating room', async ({ page }) => {
    // CRÍTICO: Configurar mocks ANTES de page.goto()
    await page.route(/.*\/rooms.*/, async (route) => {
      const request = route.request();
      if (request.method() === 'PUT') {
        // Delay PUT response
        await new Promise((resolve) => setTimeout(resolve, 500));
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'room-1',
            roomNumber: 'A101',
            type: 'CLASSROOM',
            capacity: 60,
            hasEquipment: true,
            status: 'AVAILABLE',
          }),
        });
      } else if (request.method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              id: 'room-1',
              roomNumber: 'A101',
              type: 'CLASSROOM',
              capacity: 40,
              hasEquipment: true,
              status: 'AVAILABLE',
            },
          ]),
        });
      } else {
        await route.continue();
      }
    });
    
    // Mock analytics para evitar erros
    await mockAnalyticsApi(page);

    // AGORA pode navegar - mocks já estão configurados
    await page.goto('/rooms');
    await expect(page.getByTestId('room-card').filter({ hasText: 'A101' })).toBeVisible();

    const roomCard = page.getByTestId('room-card').filter({ hasText: 'A101' });
    await roomCard.getByRole('button', { name: 'Editar' }).click();

    await page.getByLabel('Capacidade *').fill('60');
    await page.getByRole('button', { name: 'Salvar' }).click();

    // Should show loading state
    const saveButton = page.getByRole('button', { name: /salvando|loading/i });
    await expect(saveButton).toBeVisible({ timeout: 1000 });
  });

  test('should disable form fields while loading', async ({ page }) => {
    // CRÍTICO: Configurar mocks ANTES de page.goto()
    await page.route(/.*\/students.*/, async (route) => {
      const request = route.request();
      if (request.method() === 'POST') {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'new-student',
            firstName: 'Test',
            lastName: 'User',
            email: 'test@example.com',
            matricula: '2024001234',
            cpf: '123.456.789-09',
            status: 'ACTIVE',
          }),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]),
        });
      }
    });
    
    // Mock analytics para evitar erros
    await mockAnalyticsApi(page);

    // AGORA pode navegar - mocks já estão configurados
    await page.goto('/students');
    await page.getByRole('button', { name: 'Novo Aluno' }).click();

    await page.getByLabel('Nome *').fill('Test');
    await page.getByLabel('Sobrenome *').fill('User');
    await page.getByLabel('CPF *').fill('123.456.789-09');
    await page.getByLabel('Email *').fill('test@example.com');
    await page.getByLabel('Matrícula *').fill('2024001234');

    await page.getByRole('button', { name: 'Salvar' }).click();

    // Fields should be disabled while loading
    await expect(page.getByLabel('Nome *')).toBeDisabled({ timeout: 500 });
  });
});

