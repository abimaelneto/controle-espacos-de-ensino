import { mockStudentsApi } from '../support/apiMock';

describe('Students Page', () => {
  beforeEach(() => {
    // CRÍTICO: Configurar mocks ANTES de qualquer coisa
    mockStudentsApi();
    
    // Configurar autenticação
    cy.loginAsAdmin();
    
    // AGORA pode navegar - mocks já estão configurados
    cy.visitAndWaitForApp('/students');
    
    // CRÍTICO: Aguardar que as requisições sejam completadas
    // A página Students faz chamadas de API:
    // 1. fetchStudents() -> GET /students
    
    // Aguardar que o root tenha conteúdo após as requisições
    cy.get('#root', { timeout: 20000 }).should(($root) => {
      const hasChildren = $root.children().length > 0;
      const hasContent = ($root.html() || '').trim().length > 0;
      
      if (!hasChildren && !hasContent) {
        return false;
      }
      
      return true;
    });
    
    // Aguardar que os cards apareçam (indica que a API foi chamada e dados renderizados)
    cy.get('[data-testid="student-card"]', { timeout: 10000 }).should('have.length.at.least', 1);
    
    // Aguardar um pouco mais para garantir que tudo está estável
    cy.wait(1000);
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
    cy.contains('button', 'Novo Aluno', { timeout: 10000 }).should('be.visible').click();
    cy.get('[role="dialog"]', { timeout: 5000 }).should('be.visible');

    // Preencher formulário - usar IDs para ser mais preciso
    cy.get('[role="dialog"]').within(() => {
      cy.get('#firstName').type('Carla');
      cy.get('#lastName').type('Ribeiro');
      cy.get('#cpf').type('111.222.333-44');
      cy.get('#email').type('carla.ribeiro@pucpr.br');
      cy.get('#matricula').type('20239999');
    });
    
    // Aguardar requisições: POST (criar) e depois GET (atualizar lista)
    // Usar padrão mais genérico que funcione com qualquer URL
    cy.intercept('POST', /\/students[^/]*$/, (req) => {
      req.reply((res) => {
        res.statusCode = 201;
        res.body = {
          id: 'student-new-1',
          userId: 'user-new-1',
          firstName: 'Carla',
          lastName: 'Ribeiro',
          cpf: '111.222.333-44',
          email: 'carla.ribeiro@pucpr.br',
          matricula: '20239999',
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      });
    }).as('createStudent');
    
    cy.intercept('GET', /\/students[^/]*$/, (req) => {
      req.reply((res) => {
        res.statusCode = 200;
        res.body = [
          { id: 'student-1', firstName: 'Ana', lastName: 'Souza', email: 'ana.souza@pucpr.br', matricula: '20231234', cpf: '123.456.789-01', status: 'ACTIVE' },
          { id: 'student-2', firstName: 'Bruno', lastName: 'Lima', email: 'bruno.lima@pucpr.br', matricula: '20235678', cpf: '987.654.321-00', status: 'ACTIVE' },
          { id: 'student-new-1', firstName: 'Carla', lastName: 'Ribeiro', email: 'carla.ribeiro@pucpr.br', matricula: '20239999', cpf: '111.222.333-44', status: 'ACTIVE' },
        ];
      });
    }).as('getStudentsAfterCreate');
    
    // Clicar em salvar
    cy.get('[role="dialog"]').contains('button', 'Salvar').click();

    // Aguardar criação completar
    cy.wait('@createStudent', { timeout: 10000 });
    
    // Wait for dialog to close
    cy.get('[role="dialog"]', { timeout: 15000 }).should('not.exist');
    
    // Aguardar que fetchStudents() seja chamado para atualizar a lista
    cy.wait('@getStudentsAfterCreate', { timeout: 10000 });
    cy.wait(1000);
    
    // Verify student appears in list
    cy.get('[data-testid="student-card"]', { timeout: 10000 }).contains('Carla Ribeiro').should('be.visible');
    cy.get('[data-testid="student-card"]').contains('carla.ribeiro@pucpr.br').should('be.visible');
  });

  it('should edit an existing student', () => {
    // Encontrar o card e clicar no botão Editar - usar seletor mais direto
    cy.get('[data-testid="student-card"]').contains('Ana Souza').should('be.visible');
    cy.get('[data-testid="student-card"]').contains('Ana Souza').closest('[data-testid="student-card"]').find('button').contains('Editar').click();

    // Aguardar dialog abrir
    cy.get('[role="dialog"]', { timeout: 5000 }).should('be.visible');

    // Preencher formulário - no modo edição, só firstName, lastName e email são editáveis
    cy.get('[role="dialog"]').within(() => {
      cy.get('#firstName').clear().type('Ana Paula');
      cy.get('#lastName').clear().type('Souza Paula');
      cy.get('#email').clear().type('ana.paula@pucpr.br');
    });
    
    // Aguardar requisições: PUT (atualizar) e depois GET (atualizar lista)
    cy.intercept('PUT', /\/students\/[^/]+$/, (req) => {
      req.reply((res) => {
        res.statusCode = 200;
        res.body = {
          id: 'student-1',
          userId: 'user-1',
          firstName: 'Ana Paula',
          lastName: 'Souza Paula',
          cpf: '123.456.789-01',
          email: 'ana.paula@pucpr.br',
          matricula: '20231234',
          status: 'ACTIVE',
          updatedAt: new Date().toISOString(),
        };
      });
    }).as('updateStudent');
    
    cy.intercept('GET', /\/students[^/]*$/, (req) => {
      req.reply((res) => {
        res.statusCode = 200;
        res.body = [
          { id: 'student-1', firstName: 'Ana Paula', lastName: 'Souza Paula', email: 'ana.paula@pucpr.br', matricula: '20231234', cpf: '123.456.789-01', status: 'ACTIVE' },
          { id: 'student-2', firstName: 'Bruno', lastName: 'Lima', email: 'bruno.lima@pucpr.br', matricula: '20235678', cpf: '987.654.321-00', status: 'ACTIVE' },
        ];
      });
    }).as('getStudentsAfterUpdate');
    
    // Clicar em salvar
    cy.get('[role="dialog"]').contains('button', 'Salvar').click();

    // Aguardar atualização completar
    cy.wait('@updateStudent', { timeout: 10000 });

    // Aguardar dialog fechar
    cy.get('[role="dialog"]', { timeout: 15000 }).should('not.exist');
    
    // Aguardar que fetchStudents() seja chamado para atualizar a lista
    cy.wait('@getStudentsAfterUpdate', { timeout: 10000 });
    cy.wait(1000);

    cy.get('[data-testid="student-card"]', { timeout: 10000 }).contains('Ana Paula').should('be.visible');
    cy.get('[data-testid="student-card"]').contains('ana.paula@pucpr.br').should('be.visible');
  });

  it('should delete a student after confirmation', () => {
    // Encontrar o card e clicar no botão Excluir - usar seletor mais direto
    cy.get('[data-testid="student-card"]').contains('Bruno Lima').should('be.visible');
    cy.get('[data-testid="student-card"]').contains('Bruno Lima').closest('[data-testid="student-card"]').find('button').contains('Excluir').click();

    // Aguardar dialog de confirmação aparecer
    cy.get('[role="dialog"]', { timeout: 5000 }).should('be.visible');
    cy.get('[role="dialog"]').should('contain', 'Confirmar Exclusão');
    cy.get('[role="dialog"]').should('contain', 'Bruno Lima');
    
    // Aguardar requisição de exclusão
    cy.intercept('DELETE', /.*\/students\/[^/]+$/).as('deleteStudent');
    
    // Confirmar exclusão
    cy.get('[role="dialog"]').contains('button', 'Excluir').click();

    // Aguardar requisição completar
    cy.wait('@deleteStudent', { timeout: 10000 });

    // Wait for dialog to close and card to be removed
    cy.get('[role="dialog"]', { timeout: 10000 }).should('not.exist');
    cy.wait(1000);
    cy.get('[data-testid="student-card"]').contains('Bruno Lima').should('not.exist');
  });

  it('should cancel student deletion', () => {
    // Encontrar o card e clicar no botão Excluir - usar seletor mais direto
    cy.get('[data-testid="student-card"]').contains('Ana Souza').should('be.visible');
    cy.get('[data-testid="student-card"]').contains('Ana Souza').closest('[data-testid="student-card"]').find('button').contains('Excluir').click();

    // Aguardar dialog aparecer
    cy.get('[role="dialog"]', { timeout: 5000 }).should('be.visible');
    cy.get('[role="dialog"]').contains('button', 'Cancelar').click();

    // Dialog should close and student should still exist
    cy.get('[role="dialog"]', { timeout: 5000 }).should('not.exist');
    cy.wait(500);
    cy.get('[data-testid="student-card"]').contains('Ana Souza').should('be.visible');
  });

  it('should display empty state when no students', () => {
    // Mock empty students list - sobrescrever o mock do beforeEach
    cy.intercept('GET', /\/students[^/]*$/, {
      statusCode: 200,
      body: [],
    }).as('getEmptyStudents');

    cy.reload();
    
    // Aguardar que o root tenha conteúdo após reload
    cy.get('#root', { timeout: 20000 }).should(($root) => {
      const hasChildren = $root.children().length > 0;
      const hasContent = ($root.html() || '').trim().length > 0;
      return hasChildren || hasContent;
    });
    
    // Aguardar requisição completar
    cy.wait('@getEmptyStudents', { timeout: 10000 });
    cy.wait(2000);

    // Should show empty state message
    cy.contains(/nenhum aluno/i, { timeout: 10000 }).should('be.visible');
  });
});

