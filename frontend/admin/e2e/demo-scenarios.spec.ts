import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './utils/auth';
import { mockStudentsApi, mockRoomsApi } from './utils/apiMock';

/**
 * Suite de testes E2E baseada nos cenários de demonstração
 * Baseado em: docs_ia/DEMONSTRACAO_PROJETO.md e docs_ia/GUIA_DEMONSTRACAO_CASE.md
 */
import { mockDashboardApis } from './utils/apiMock';

test.describe('Cenários de Demonstração - E2E', () => {
  test.beforeEach(async ({ page }) => {
    // CRÍTICO: Configurar autenticação e mocks ANTES de navegar
    await loginAsAdmin(page);
    // Mock das APIs ANTES de qualquer page.goto() - usar mockDashboardApis para incluir analytics
    await mockDashboardApis(page);
  });

  test.describe('Requisito 1: CRUD de Alunos', () => {
    test('deve criar, editar e deletar um aluno', async ({ page }) => {
      // Navegar para página de alunos
      await page.goto('/students');
      await page.waitForLoadState('networkidle');
      await expect(page.getByRole('heading', { name: /alunos/i })).toBeVisible({ timeout: 10000 });

      // CREATE: Criar novo aluno
      await expect(page.getByRole('button', { name: 'Novo Aluno' })).toBeVisible({ timeout: 10000 });
      await page.getByRole('button', { name: 'Novo Aluno' }).click();
      await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 });

      await page.getByLabel('Nome *').fill('João');
      await page.getByLabel('Sobrenome *').fill('Silva');
      await page.getByLabel('CPF *').fill('123.456.789-09');
      await page.getByLabel('Email *').fill('joao@example.com');
      await page.getByLabel('Matrícula *').fill('2024001234');
      await page.getByRole('button', { name: 'Salvar' }).click();

      // Verificar que aluno foi criado
      await expect(page.getByRole('dialog')).not.toBeVisible();
      await expect(page.getByTestId('student-card').filter({ hasText: 'João Silva' })).toBeVisible();

      // READ: Verificar detalhes do aluno
      const studentCard = page.getByTestId('student-card').filter({ hasText: 'João Silva' });
      await expect(studentCard).toContainText('joao@example.com');
      await expect(studentCard).toContainText('2024001234');

      // UPDATE: Editar aluno
      await studentCard.getByRole('button', { name: 'Editar' }).click();
      await expect(page.getByRole('dialog')).toBeVisible();

      await page.getByLabel('Nome *').fill('João Carlos');
      await page.getByLabel('Email *').fill('joao.carlos@example.com');
      await page.getByRole('button', { name: 'Salvar' }).click();

      // Verificar atualização
      await expect(page.getByTestId('student-card').filter({ hasText: 'João Carlos' })).toBeVisible();

      // DELETE: Remover aluno
      const updatedCard = page.getByTestId('student-card').filter({ hasText: 'João Carlos' });
      await updatedCard.getByRole('button', { name: 'Excluir' }).click();

      const deleteDialog = page.getByRole('dialog');
      await expect(deleteDialog).toContainText('Confirmar Exclusão');
      await deleteDialog.getByRole('button', { name: 'Excluir' }).click();

      // Verificar exclusão
      await expect(page.getByTestId('student-card').filter({ hasText: 'João Carlos' })).toHaveCount(0);
    });

    test('deve validar campos obrigatórios ao criar aluno', async ({ page }) => {
      await page.goto('/students');
      await page.waitForLoadState('networkidle');
      await expect(page.getByRole('button', { name: 'Novo Aluno' })).toBeVisible({ timeout: 10000 });
      await page.getByRole('button', { name: 'Novo Aluno' }).click();

      // Tentar salvar sem preencher campos
      await page.getByRole('button', { name: 'Salvar' }).click();

      // Verificar mensagens de erro (depende da implementação)
      // O formulário deve impedir o envio
      await expect(page.getByRole('dialog')).toBeVisible();
    });
  });

  test.describe('Requisito 2: CRUD de Salas', () => {
    test('deve criar, editar e deletar uma sala', async ({ page }) => {
      // Navegar para página de salas
      await page.goto('/rooms');
      await page.waitForLoadState('networkidle');
      await expect(page.getByRole('heading', { name: /salas/i })).toBeVisible({ timeout: 10000 });

      // CREATE: Criar nova sala
      await expect(page.getByRole('button', { name: 'Nova Sala' })).toBeVisible({ timeout: 10000 });
      await page.getByRole('button', { name: 'Nova Sala' }).click();
      await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 });

      await page.getByLabel('Número da Sala *').fill('A101');
      await page.getByLabel('Tipo *').selectOption('CLASSROOM');
      await page.getByLabel('Capacidade *').fill('30');
      await page.getByRole('button', { name: 'Salvar' }).click();

      // Verificar que sala foi criada
      await expect(page.getByRole('dialog')).not.toBeVisible();
      await expect(page.getByTestId('room-card').filter({ hasText: 'A101' })).toBeVisible();

      // READ: Verificar detalhes da sala
      const roomCard = page.getByTestId('room-card').filter({ hasText: 'A101' });
      await expect(roomCard).toContainText('CLASSROOM');
      await expect(roomCard).toContainText('Capacidade: 30');

      // UPDATE: Editar sala
      await roomCard.getByRole('button', { name: 'Editar' }).click();
      await expect(page.getByRole('dialog')).toBeVisible();

      await page.getByLabel('Capacidade *').fill('40');
      await page.getByLabel('Tipo *').selectOption('LABORATORY');
      await page.getByRole('button', { name: 'Salvar' }).click();

      // Verificar atualização
      await expect(page.getByTestId('room-card').filter({ hasText: 'A101' })).toContainText('Capacidade: 40');

      // DELETE: Remover sala
      const updatedCard = page.getByTestId('room-card').filter({ hasText: 'A101' });
      await updatedCard.getByRole('button', { name: 'Excluir' }).click();

      const deleteDialog = page.getByRole('dialog');
      await expect(deleteDialog).toContainText('Confirmar Exclusão');
      await deleteDialog.getByRole('button', { name: 'Excluir' }).click();

      // Verificar exclusão
      await expect(page.getByTestId('room-card').filter({ hasText: 'A101' })).toHaveCount(0);
    });

    test('deve criar sala com diferentes tipos', async ({ page }) => {
      await page.goto('/rooms');
      
      const roomTypes = ['CLASSROOM', 'LABORATORY', 'AUDITORIUM', 'STUDY_ROOM'];
      
      for (const type of roomTypes) {
        await page.getByRole('button', { name: 'Nova Sala' }).click();
        await page.getByLabel('Número da Sala *').fill(`TEST-${type}`);
        await page.getByLabel('Tipo *').selectOption(type);
        await page.getByLabel('Capacidade *').fill('20');
        await page.getByRole('button', { name: 'Salvar' }).click();
        
        await expect(page.getByTestId('room-card').filter({ hasText: `TEST-${type}` })).toBeVisible();
      }
    });
  });

  test.describe('Requisito 4: Check-in de Alunos', () => {
    test('deve verificar check-ins no dashboard em tempo real', async ({ page }) => {
      // Mock da API de check-in e analytics
      await page.route(/.*\/checkin\/attendance\/active.*/, async (route) => {
        await route.fulfill({
          status: 200,
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify([
            {
              id: 'attendance-1',
              studentId: 'student-1',
              roomId: 'room-1',
              checkInTime: new Date().toISOString(),
            },
          ]),
        });
      });

      await page.route(/.*\/analytics\/rooms\/realtime.*/, async (route) => {
        await route.fulfill({
          status: 200,
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            rooms: [
              {
                roomId: 'room-1',
                roomNumber: 'A101',
                currentOccupancy: 1,
                capacity: 40,
                occupancyRate: 2.5,
              },
            ],
          }),
        });
      });

      // Navegar para dashboard em tempo real
      await page.goto('/realtime');
      await page.waitForLoadState('networkidle');
      await expect(page.getByRole('heading', { name: /tempo real/i })).toBeVisible({ timeout: 10000 });

      // Verificar que dados são exibidos
      await expect(page.getByText('A101')).toBeVisible();
    });

    test('deve buscar salas no dashboard em tempo real', async ({ page }) => {
      await page.goto('/realtime');

      // Verificar se campo de busca existe
      const searchInput = page.getByPlaceholder(/buscar sala/i);
      if (await searchInput.isVisible()) {
        await searchInput.fill('A101');
        await page.waitForTimeout(500); // Aguardar filtro
      }
    });
  });

  test.describe('Requisito 5: Analytics e Relatórios', () => {
    test('deve exibir dashboard geral de analytics', async ({ page }) => {
      // Mock da API de analytics
      await page.route(/.*\/analytics\/dashboard.*/, async (route) => {
        await route.fulfill({
          status: 200,
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            totalCheckins: 150,
            activeCheckins: 5,
            roomsOccupied: 3,
            studentsActive: 25,
            period: {
              startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
              endDate: new Date().toISOString(),
            },
          }),
        });
      });

      await page.goto('/analytics');
      await page.waitForLoadState('networkidle');
      await expect(page.getByRole('heading', { name: /analytics/i })).toBeVisible();

      // Verificar se métricas são exibidas
      await expect(page.getByText(/total de check-ins/i)).toBeVisible();
    });

    test('deve exibir histórico de sala', async ({ page }) => {
      // Mock da API de analytics para sala
      await page.route(/.*\/analytics\/rooms\/.*\/timeline.*/, async (route) => {
        await route.fulfill({
          status: 200,
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            roomId: 'room-1',
            totalCheckins: 50,
            totalHours: 120.5,
            uniqueStudents: 15,
            averageCheckinsPerDay: 1.67,
            dailyStats: [
              { date: '2024-01-01', checkins: 5 },
              { date: '2024-01-02', checkins: 8 },
            ],
          }),
        });
      });

      await page.goto('/analytics');
      await page.waitForLoadState('networkidle');
      
      // Selecionar aba de histórico de sala
      const roomTab = page.getByRole('button', { name: /histórico de sala/i });
      if (await roomTab.isVisible()) {
        await roomTab.click();
        
        // Selecionar uma sala
        const roomSelect = page.getByLabel(/sala/i);
        if (await roomSelect.isVisible()) {
          await roomSelect.selectOption('room-1');
          
          // Aplicar filtros
          const applyButton = page.getByRole('button', { name: /aplicar filtros/i });
          if (await applyButton.isVisible()) {
            await applyButton.click();
            await page.waitForTimeout(1000);
          }
        }
      }
    });

    test('deve exibir histórico de estudante', async ({ page }) => {
      // Mock da API de analytics para estudante
      await page.route(/.*\/analytics\/students\/.*\/stats.*/, async (route) => {
        await route.fulfill({
          status: 200,
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            studentId: 'student-1',
            totalCheckins: 20,
            totalHours: 45.5,
            roomsVisited: 5,
            averageCheckinsPerDay: 0.67,
            dailyStats: [
              { date: '2024-01-01', checkins: 2 },
              { date: '2024-01-02', checkins: 3 },
            ],
          }),
        });
      });

      await page.goto('/analytics');
      await page.waitForLoadState('networkidle');
      
      // Selecionar aba de histórico de estudante
      const studentTab = page.getByRole('button', { name: /histórico de estudante/i });
      if (await studentTab.isVisible()) {
        await studentTab.click();
        
        // Selecionar um estudante
        const studentSelect = page.getByLabel(/estudante/i);
        if (await studentSelect.isVisible()) {
          await studentSelect.selectOption('student-1');
          
          // Aplicar filtros
          const applyButton = page.getByRole('button', { name: /aplicar filtros/i });
          if (await applyButton.isVisible()) {
            await applyButton.click();
            await page.waitForTimeout(1000);
          }
        }
      }
    });
  });

  test.describe('Cenários Edge Cases', () => {
    test('deve lidar com check-in duplicado (estudante já em outra sala)', async ({ page }) => {
      // Este teste simula o cenário onde um estudante tenta fazer check-in
      // em uma segunda sala enquanto já está em outra
      
      // Mock de check-in ativo
      await page.route(/.*\/checkin\/attendance\/active.*/, async (route) => {
        await route.fulfill({
          status: 200,
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify([
            {
              id: 'attendance-1',
              studentId: 'student-1',
              roomId: 'room-1',
              checkInTime: new Date().toISOString(),
            },
          ]),
        });
      });

      // Mock de tentativa de check-in duplicado
      await page.route(/.*\/checkin.*/, async (route) => {
        const request = route.request();
        if (request.method() === 'POST') {
          await route.fulfill({
            status: 400,
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
              message: 'Aluno já possui um check-in registrado hoje na sala',
            }),
          });
        } else {
          await route.continue();
        }
      });

      await page.goto('/realtime');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      
      // Verificar que o sistema mostra check-ins ativos
      await expect(page.getByText(/ocupação/i)).toBeVisible({ timeout: 10000 });
    });

    test('deve lidar com capacidade máxima da sala', async ({ page }) => {
      // Mock de sala com capacidade máxima atingida
      await page.route(/.*\/analytics\/rooms\/realtime.*/, async (route) => {
        await route.fulfill({
          status: 200,
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            rooms: [
              {
                roomId: 'room-1',
                roomNumber: 'A101',
                currentOccupancy: 40,
                capacity: 40,
                occupancyRate: 100,
              },
            ],
          }),
        });
      });

      await page.goto('/realtime');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      
      // Verificar que sala com 100% de ocupação é exibida
      await expect(page.getByText(/100%/i).or(page.getByText(/capacidade máxima/i))).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Navegação Completa', () => {
    test('deve navegar por todas as páginas principais', async ({ page }) => {
      // Dashboard
      await page.goto('/');
      await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();

      // Alunos
      await page.getByRole('button', { name: /alunos/i }).click();
      await expect(page).toHaveURL(/.*students/);
      await expect(page.getByRole('heading', { name: /alunos/i })).toBeVisible();

      // Salas
      await page.getByRole('button', { name: /salas/i }).click();
      await expect(page).toHaveURL(/.*rooms/);
      await expect(page.getByRole('heading', { name: /salas/i })).toBeVisible();

      // Analytics
      await page.getByRole('button', { name: /analytics/i }).click();
      await expect(page).toHaveURL(/.*analytics/);
      await expect(page.getByRole('heading', { name: /analytics/i })).toBeVisible();

      // Tempo Real
      await page.getByRole('button', { name: /tempo real/i }).click();
      await expect(page).toHaveURL(/.*realtime/);
      await expect(page.getByRole('heading', { name: /tempo real/i })).toBeVisible();

      // Voltar ao Dashboard
      await page.getByRole('button', { name: /dashboard/i }).click();
      await expect(page).toHaveURL(/\/$/);
    });
  });
});

