import { mockRoomsApi } from '../support/apiMock';

describe('Rooms Page', () => {
  beforeEach(() => {
    // CRÍTICO: Configurar autenticação e mocks ANTES de navegar
    cy.loginAsAdmin();
    // Mock das APIs ANTES de visit
    mockRoomsApi();
    // AGORA pode navegar - mocks já estão configurados
    cy.visitAndWaitForApp('/rooms');
  });

  it('should list rooms from API', () => {
    // Aguardar heading aparecer
    cy.contains('h1, h2, h3', 'Salas').should('be.visible');
    // Aguardar cards aparecerem
    cy.get('[data-testid="room-card"]').contains('A101').should('be.visible');
    cy.get('[data-testid="room-card"]').contains('LAB-02').should('be.visible');
  });

  it('should create a new room', () => {
    // Aguardar botão aparecer
    cy.contains('button', 'Nova Sala').should('be.visible').click();
    cy.get('[role="dialog"]').should('be.visible');

    cy.get('label').contains('Número da Sala *').parent().find('input').type('B202');
    cy.get('label').contains('Tipo *').parent().find('select').select('AUDITORIUM');
    cy.get('label').contains('Capacidade *').parent().find('input').type('80');
    cy.get('label').contains('Possui equipamentos').parent().find('input').check();
    cy.contains('button', 'Salvar').click();

    cy.get('[data-testid="room-card"]').contains('B202').should('be.visible');
  });

  it('should edit a room capacity', () => {
    cy.get('[data-testid="room-card"]').contains('A101').within(() => {
      cy.contains('button', 'Editar').click();
    });

    cy.get('label').contains('Capacidade *').parent().find('input').clear().type('55');
    cy.contains('button', 'Salvar').click();

    cy.get('[data-testid="room-card"]').contains('A101').should('contain', 'Capacidade: 55');
  });

  it('should delete a room', () => {
    cy.get('[data-testid="room-card"]').contains('LAB-02').should('be.visible').within(() => {
      cy.contains('button', 'Excluir').click();
    });

    cy.get('[role="dialog"]').should('be.visible');
    cy.get('[role="dialog"]').should('contain', 'Confirmar Exclusão');
    cy.get('[role="dialog"]').should('contain', 'LAB-02');
    
    cy.get('[role="dialog"]').contains('button', 'Excluir').click();

    // Wait for dialog to close and card to be removed
    cy.get('[role="dialog"]').should('not.exist');
    cy.get('[data-testid="room-card"]').contains('LAB-02').should('not.exist');
  });

  it('should cancel room deletion', () => {
    cy.get('[data-testid="room-card"]').contains('A101').should('be.visible').within(() => {
      cy.contains('button', 'Excluir').click();
    });

    cy.get('[role="dialog"]').should('be.visible');
    cy.get('[role="dialog"]').contains('button', 'Cancelar').click();

    // Dialog should close and room should still exist
    cy.get('[role="dialog"]').should('not.exist');
    cy.get('[data-testid="room-card"]').contains('A101').should('be.visible');
  });

  it('should display empty state when no rooms', () => {
    // Mock empty rooms list
    cy.intercept('GET', /.*\/rooms[^/]*$/, {
      statusCode: 200,
      body: [],
    });

    cy.reload();
    cy.wait(1000);

    // Should show empty state message
    cy.contains(/nenhuma sala/i).should('be.visible');
  });
});

