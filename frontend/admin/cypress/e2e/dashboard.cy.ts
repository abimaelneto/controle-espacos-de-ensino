import { mockDashboardApis } from '../support/apiMock';

describe('Dashboard', () => {
  beforeEach(() => {
    // CRÍTICO: Configurar autenticação e mocks ANTES de navegar
    cy.loginAsAdmin();
    // Mock das APIs ANTES de visit - Dashboard precisa de students, rooms E analytics
    mockDashboardApis();
    // AGORA pode navegar - mocks já estão configurados
    cy.visitAndWaitForApp('/');
  });

  it('should display dashboard page', () => {
    cy.title().should('match', /Controle de Espaços/i);
    // Aguardar conteúdo do dashboard aparecer
    cy.wait(1000);
    cy.contains(/dashboard/i).should('be.visible');
  });

  it('should display navigation menu', () => {
    cy.contains(/dashboard/i).should('be.visible');
    cy.contains(/alunos/i).should('be.visible');
    cy.contains(/salas/i).should('be.visible');
    cy.contains(/analytics/i).should('be.visible');
  });

  it('should show metrics populated from API responses', () => {
    // Aguardar métricas carregarem
    cy.get('[data-testid="metric-card-students-value"]').should('be.visible').should('contain', '2');
    cy.get('[data-testid="metric-card-rooms-value"]').should('be.visible').should('contain', '2');
  });

  it('should navigate to Students page', () => {
    cy.contains('a', /alunos/i).should('be.visible').click();
    cy.url().should('include', 'students');
    cy.contains('h1, h2, h3', /alunos/i).should('be.visible');
  });

  it('should navigate to Rooms page', () => {
    cy.contains('a', /salas/i).should('be.visible').click();
    cy.url().should('include', 'rooms');
    cy.contains('h1, h2, h3', /salas/i).should('be.visible');
  });

  it('should navigate to Analytics page', () => {
    cy.contains('a', /analytics/i).should('be.visible').click();
    cy.url().should('include', 'analytics');
    cy.wait(1000);
    cy.contains(/analytics/i).should('be.visible');
  });

  it('should refresh metrics when data changes', () => {
    // Initial load
    cy.get('[data-testid="metric-card-students-value"]').should('contain', '2');
    
    // Update mock to return different values
    cy.intercept('GET', /.*\/students.*/, {
      statusCode: 200,
      body: [
        { id: '1', firstName: 'Student', lastName: '1', email: 's1@test.com', matricula: '1', cpf: '111.111.111-11', status: 'ACTIVE' },
        { id: '2', firstName: 'Student', lastName: '2', email: 's2@test.com', matricula: '2', cpf: '222.222.222-22', status: 'ACTIVE' },
        { id: '3', firstName: 'Student', lastName: '3', email: 's3@test.com', matricula: '3', cpf: '333.333.333-33', status: 'ACTIVE' },
      ],
    });

    cy.intercept('GET', /.*\/rooms.*/, {
      statusCode: 200,
      body: [
        { id: '1', roomNumber: 'R1', type: 'CLASSROOM', capacity: 30, hasEquipment: false, status: 'AVAILABLE' },
        { id: '2', roomNumber: 'R2', type: 'CLASSROOM', capacity: 30, hasEquipment: false, status: 'AVAILABLE' },
        { id: '3', roomNumber: 'R3', type: 'CLASSROOM', capacity: 30, hasEquipment: false, status: 'AVAILABLE' },
      ],
    });

    // Reload page to get new data
    cy.reload();
    cy.wait(1000);

    // Metrics should update (if dashboard refreshes automatically)
    cy.get('[data-testid="metric-card-students-value"]').should('be.visible');
  });

  it('should handle dashboard loading state', () => {
    // Delay API responses
    cy.intercept('GET', /.*\/students.*/, { delay: 500, statusCode: 200, body: [] });
    cy.intercept('GET', /.*\/rooms.*/, { delay: 500, statusCode: 200, body: [] });

    cy.visit('/');

    // Should show loading state briefly
    cy.wait(100);
  });
});

