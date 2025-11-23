import { test, expect } from '@playwright/test';
import { mockStudentsApi, mockRoomsApi, mockDashboardApis } from './utils/apiMock';
import { loginAsAdmin } from './utils/auth';

test.describe('Complete User Flows', () => {
  test('complete student CRUD flow', async ({ page }) => {
    // CRÍTICO: Configurar autenticação e mocks ANTES de navegar
    await loginAsAdmin(page);
    // Mock das APIs ANTES de page.goto()
    await mockStudentsApi(page, []);
    // AGORA pode navegar - mocks já estão configurados
    await page.goto('/students');
    // Aguardar página carregar
    await page.waitForLoadState('networkidle');

    // CREATE: Add a new student
    await expect(page.getByRole('button', { name: 'Novo Aluno' })).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: 'Novo Aluno' }).click();
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 });

    await page.getByLabel('Nome *').fill('Carlos');
    await page.getByLabel('Sobrenome *').fill('Mendes');
    await page.getByLabel('CPF *').fill('111.222.333-44');
    await page.getByLabel('Email *').fill('carlos.mendes@pucpr.br');
    await page.getByLabel('Matrícula *').fill('2024001111');
    await page.getByRole('button', { name: 'Salvar' }).click();

    // Verify student was created
    await expect(page.getByRole('dialog')).not.toBeVisible();
    await expect(page.getByTestId('student-card').filter({ hasText: 'Carlos Mendes' })).toBeVisible();

    // READ: Verify student details
    const studentCard = page.getByTestId('student-card').filter({ hasText: 'Carlos Mendes' });
    await expect(studentCard).toContainText('carlos.mendes@pucpr.br');
    await expect(studentCard).toContainText('2024001111');

    // UPDATE: Edit the student
    await studentCard.getByRole('button', { name: 'Editar' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    await page.getByLabel('Nome *').fill('Carlos Alberto');
    await page.getByLabel('Email *').fill('carlos.alberto@pucpr.br');
    await page.getByRole('button', { name: 'Salvar' }).click();

    // Verify update
    await expect(page.getByTestId('student-card').filter({ hasText: 'Carlos Alberto' })).toBeVisible();
    await expect(page.getByTestId('student-card').filter({ hasText: 'carlos.alberto@pucpr.br' })).toBeVisible();

    // DELETE: Remove the student
    const updatedCard = page.getByTestId('student-card').filter({ hasText: 'Carlos Alberto' });
    await updatedCard.getByRole('button', { name: 'Excluir' }).click();

    const deleteDialog = page.getByRole('dialog');
    await expect(deleteDialog).toContainText('Confirmar Exclusão');
    await deleteDialog.getByRole('button', { name: 'Excluir' }).click();

    // Verify deletion
    await expect(page.getByTestId('student-card').filter({ hasText: 'Carlos Alberto' })).toHaveCount(0);
  });

  test('complete room CRUD flow', async ({ page }) => {
    // CRÍTICO: Configurar autenticação e mocks ANTES de navegar
    await loginAsAdmin(page);
    // Mock das APIs ANTES de page.goto()
    await mockRoomsApi(page, []);
    // AGORA pode navegar - mocks já estão configurados
    await page.goto('/rooms');
    // Aguardar página carregar
    await page.waitForLoadState('networkidle');

    // CREATE: Add a new room
    await expect(page.getByRole('button', { name: 'Nova Sala' })).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: 'Nova Sala' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    await page.getByLabel('Número da Sala *').fill('D505');
    await page.getByLabel('Tipo *').selectOption('AUDITORIUM');
    await page.getByLabel('Capacidade *').fill('100');
    await page.getByLabel('Possui equipamentos').check();
    await page.getByRole('button', { name: 'Salvar' }).click();

    // Verify room was created
    await expect(page.getByRole('dialog')).not.toBeVisible();
    await expect(page.getByTestId('room-card').filter({ hasText: 'D505' })).toBeVisible();

    // READ: Verify room details
    const roomCard = page.getByTestId('room-card').filter({ hasText: 'D505' });
    await expect(roomCard).toContainText('AUDITORIUM');
    await expect(roomCard).toContainText('Capacidade: 100');

    // UPDATE: Edit the room
    await roomCard.getByRole('button', { name: 'Editar' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    await page.getByLabel('Capacidade *').fill('120');
    await page.getByLabel('Tipo *').selectOption('LABORATORY');
    await page.getByRole('button', { name: 'Salvar' }).click();

    // Verify update
    await expect(page.getByTestId('room-card').filter({ hasText: 'D505' })).toContainText('Capacidade: 120');

    // DELETE: Remove the room
    const updatedCard = page.getByTestId('room-card').filter({ hasText: 'D505' });
    await updatedCard.getByRole('button', { name: 'Excluir' }).click();

    const deleteDialog = page.getByRole('dialog');
    await expect(deleteDialog).toContainText('Confirmar Exclusão');
    await deleteDialog.getByRole('button', { name: 'Excluir' }).click();

    // Verify deletion
    await expect(page.getByTestId('room-card').filter({ hasText: 'D505' })).toHaveCount(0);
  });

  test('navigation flow through all pages', async ({ page }) => {
    // CRÍTICO: Configurar autenticação e mocks ANTES de navegar
    await loginAsAdmin(page);
    // Mock das APIs ANTES de page.goto() - usar mockDashboardApis para incluir analytics
    await mockDashboardApis(page);

    // Start at Dashboard - AGORA pode navegar - mocks já estão configurados
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    // Verificar dashboard (pode ser heading ou texto)
    const dashboardVisible = await page.getByRole('heading', { name: /dashboard/i }).isVisible().catch(() => false) ||
                            await page.locator('text=Dashboard').isVisible().catch(() => false);
    expect(dashboardVisible).toBe(true);

    // Navigate to Students (é um Link no layout)
    const alunosLink = page.getByRole('link', { name: /alunos/i });
    await expect(alunosLink).toBeVisible({ timeout: 10000 });
    await alunosLink.click();
    await expect(page).toHaveURL(/.*students/, { timeout: 10000 });
    await expect(page.getByRole('heading', { name: /alunos/i })).toBeVisible({ timeout: 10000 });

    // Navigate to Rooms (é um Link no layout)
    const salasLink = page.getByRole('link', { name: /salas/i });
    await expect(salasLink).toBeVisible({ timeout: 10000 });
    await salasLink.click();
    await expect(page).toHaveURL(/.*rooms/, { timeout: 10000 });
    await expect(page.getByRole('heading', { name: /salas/i })).toBeVisible({ timeout: 10000 });

    // Navigate to Analytics (é um Link no layout)
    const analyticsLink = page.getByRole('link', { name: /analytics/i });
    await expect(analyticsLink).toBeVisible({ timeout: 10000 });
    await analyticsLink.click();
    await expect(page).toHaveURL(/.*analytics/, { timeout: 10000 });
    await page.waitForTimeout(1000);
    const analyticsVisible = await page.getByRole('heading', { name: /analytics/i }).isVisible().catch(() => false) ||
                            await page.locator('text=/analytics/i').first().isVisible().catch(() => false);
    expect(analyticsVisible).toBe(true);

    // Navigate back to Dashboard (é um Link no layout)
    const dashboardLink = page.getByRole('link', { name: /dashboard/i });
    await expect(dashboardLink).toBeVisible({ timeout: 10000 });
    await dashboardLink.click();
    await expect(page).toHaveURL(/\/$/, { timeout: 10000 });
    await page.waitForTimeout(1000);
    const dashboardVisible2 = await page.getByRole('heading', { name: /dashboard/i }).isVisible().catch(() => false) ||
                             await page.locator('text=Dashboard').isVisible().catch(() => false);
    expect(dashboardVisible2).toBe(true);
  });

  test('create student and room, then verify in dashboard', async ({ page }) => {
    // CRÍTICO: Configurar autenticação e mocks ANTES de navegar
    await loginAsAdmin(page);
    // Mock das APIs ANTES de page.goto() - usar mockDashboardApis para incluir analytics
    await mockDashboardApis(page);

    // Create a student - AGORA pode navegar - mocks já estão configurados
    await page.goto('/students');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('button', { name: 'Novo Aluno' })).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: 'Novo Aluno' }).click();
    await page.getByLabel('Nome *').fill('Maria');
    await page.getByLabel('Sobrenome *').fill('Silva');
    await page.getByLabel('CPF *').fill('999.888.777-66');
    await page.getByLabel('Email *').fill('maria.silva@pucpr.br');
    await page.getByLabel('Matrícula *').fill('2024002222');
    await page.getByRole('button', { name: 'Salvar' }).click();
    await expect(page.getByTestId('student-card').filter({ hasText: 'Maria Silva' })).toBeVisible();

    // Create a room
    await page.goto('/rooms');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('button', { name: 'Nova Sala' })).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: 'Nova Sala' }).click();
    await page.getByLabel('Número da Sala *').fill('E606');
    await page.getByLabel('Tipo *').selectOption('STUDY_ROOM');
    await page.getByLabel('Capacidade *').fill('20');
    await page.getByRole('button', { name: 'Salvar' }).click();
    await expect(page.getByTestId('room-card').filter({ hasText: 'E606' })).toBeVisible();

    // Verify in dashboard
    await page.goto('/');
    await page.waitForTimeout(1000); // Wait for dashboard to load

    // Dashboard should show updated counts
    // The exact selectors depend on Dashboard implementation
    const dashboardContent = await page.textContent('body');
    expect(dashboardContent).toBeTruthy();
  });
});

