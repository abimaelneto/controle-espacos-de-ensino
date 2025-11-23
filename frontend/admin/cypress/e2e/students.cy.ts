import { mockStudentsApi } from '../support/apiMock';

describe('Students Page', () => {
  beforeEach(() => {
    // CRÍTICO: Configurar autenticação e mocks ANTES de navegar
    cy.loginAsAdmin();
    // Mock das APIs ANTES de visit
    mockStudentsApi();
    // AGORA pode navegar - mocks já estão configurados
    cy.visitAndWaitForApp('/students');
  });

  it('should display students from API', () => {
    // Aguardar heading aparecer
    cy.contains('h1, h2, h3', 'Alunos').should('be.visible');
    // Aguardar cards aparecerem
    cy.get('[data-testid="student-card"]').contains('Ana Souza').should('be.visible');
    cy.get('[data-testid="student-card"]').contains('Bruno Lima').should('be.visible');
  });

  it('should create a new student through the dialog', () => {
    // Aguardar botão aparecer
    cy.contains('button', 'Novo Aluno').should('be.visible').click();
    cy.get('[role="dialog"]').should('be.visible');

    cy.get('label').contains('Nome *').parent().find('input').type('Carla');
    cy.get('label').contains('Sobrenome *').parent().find('input').type('Ribeiro');
    cy.get('label').contains('CPF *').parent().find('input').type('111.222.333-44');
    cy.get('label').contains('Email *').parent().find('input').type('carla.ribeiro@pucpr.br');
    cy.get('label').contains('Matrícula *').parent().find('input').type('20239999');
    cy.contains('button', 'Salvar').click();

    // Wait for dialog to close
    cy.get('[role="dialog"]').should('not.exist');
    
    // Verify student appears in list
    cy.get('[data-testid="student-card"]').contains('Carla Ribeiro').should('be.visible');
    cy.get('[data-testid="student-card"]').contains('carla.ribeiro@pucpr.br').should('be.visible');
  });

  it('should edit an existing student', () => {
    cy.get('[data-testid="student-card"]').contains('Ana Souza').within(() => {
      cy.contains('button', 'Editar').click();
    });

    cy.get('label').contains('Nome *').parent().find('input').clear().type('Ana Paula');
    cy.get('label').contains('Email *').parent().find('input').clear().type('ana.paula@pucpr.br');
    cy.contains('button', 'Salvar').click();

    cy.get('[data-testid="student-card"]').contains('Ana Paula').should('be.visible');
    cy.get('[data-testid="student-card"]').contains('ana.paula@pucpr.br').should('be.visible');
  });

  it('should delete a student after confirmation', () => {
    cy.get('[data-testid="student-card"]').contains('Bruno Lima').should('be.visible').within(() => {
      cy.contains('button', 'Excluir').click();
    });

    cy.get('[role="dialog"]').should('be.visible');
    cy.get('[role="dialog"]').should('contain', 'Confirmar Exclusão');
    cy.get('[role="dialog"]').should('contain', 'Bruno Lima');
    
    cy.get('[role="dialog"]').contains('button', 'Excluir').click();

    // Wait for dialog to close and card to be removed
    cy.get('[role="dialog"]').should('not.exist');
    cy.get('[data-testid="student-card"]').contains('Bruno Lima').should('not.exist');
  });

  it('should cancel student deletion', () => {
    cy.get('[data-testid="student-card"]').contains('Ana Souza').should('be.visible').within(() => {
      cy.contains('button', 'Excluir').click();
    });

    cy.get('[role="dialog"]').should('be.visible');
    cy.get('[role="dialog"]').contains('button', 'Cancelar').click();

    // Dialog should close and student should still exist
    cy.get('[role="dialog"]').should('not.exist');
    cy.get('[data-testid="student-card"]').contains('Ana Souza').should('be.visible');
  });

  it('should display empty state when no students', () => {
    // Mock empty students list
    cy.intercept('GET', /.*\/students[^/]*$/, {
      statusCode: 200,
      body: [],
    });

    cy.reload();
    cy.wait(1000);

    // Should show empty state message
    cy.contains(/nenhum aluno/i).should('be.visible');
  });
});

