import { mockRoomsApi } from '../support/apiMock';

describe('Rooms Page', () => {
  beforeEach(() => {
    // CRÍTICO: Configurar mocks ANTES de qualquer coisa
    mockRoomsApi();
    
    // Configurar autenticação
    cy.loginAsAdmin();
    
    // AGORA pode navegar - mocks já estão configurados
    cy.visitAndWaitForApp('/rooms');
    
    // CRÍTICO: Aguardar que as requisições sejam completadas
    // A página Rooms faz chamadas de API:
    // 1. fetchRooms() -> GET /rooms
    
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
    cy.get('[data-testid="room-card"]', { timeout: 10000 }).should('have.length.at.least', 1);
    
    // Aguardar um pouco mais para garantir que tudo está estável
    cy.wait(1000);
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
    cy.contains('button', 'Nova Sala', { timeout: 10000 }).should('be.visible').click();
    cy.get('[role="dialog"]', { timeout: 5000 }).should('be.visible');

    // Preencher formulário - usar IDs
    cy.get('[role="dialog"]').within(() => {
      cy.get('#roomNumber').type('B202');
      cy.get('#type').select('AUDITORIUM');
      cy.get('#capacity').type('80');
      cy.get('input[type="checkbox"]').check();
    });
    
    // Aguardar requisições: POST (criar) e depois GET (atualizar lista)
    cy.intercept('POST', /\/rooms[^/]*$/, (req) => {
      req.reply((res) => {
        res.statusCode = 201;
        res.body = {
          id: 'room-new-1',
          roomNumber: 'B202',
          type: 'AUDITORIUM',
          capacity: 80,
          hasEquipment: true,
          status: 'AVAILABLE',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      });
    }).as('createRoom');
    
    cy.intercept('GET', /\/rooms[^/]*$/, (req) => {
      req.reply((res) => {
        res.statusCode = 200;
        res.body = [
          { id: 'room-1', roomNumber: 'A101', type: 'CLASSROOM', capacity: 40, hasEquipment: true, status: 'AVAILABLE' },
          { id: 'room-2', roomNumber: 'LAB-02', type: 'LABORATORY', capacity: 25, hasEquipment: true, status: 'AVAILABLE' },
          { id: 'room-new-1', roomNumber: 'B202', type: 'AUDITORIUM', capacity: 80, hasEquipment: true, status: 'AVAILABLE' },
        ];
      });
    }).as('getRoomsAfterCreate');
    
    // Clicar em salvar
    cy.get('[role="dialog"]').contains('button', 'Salvar').click();

    // Aguardar criação completar
    cy.wait('@createRoom', { timeout: 10000 });

    // Aguardar dialog fechar
    cy.get('[role="dialog"]', { timeout: 15000 }).should('not.exist');
    
    // Aguardar que fetchRooms() seja chamado para atualizar a lista
    cy.wait('@getRoomsAfterCreate', { timeout: 10000 });
    cy.wait(1000);
    
    cy.get('[data-testid="room-card"]', { timeout: 10000 }).contains('B202').should('be.visible');
  });

  it('should edit a room capacity', () => {
    // Encontrar o card e clicar no botão Editar
    cy.get('[data-testid="room-card"]').contains('A101').should('be.visible');
    cy.get('[data-testid="room-card"]').contains('A101').closest('[data-testid="room-card"]').find('button').contains('Editar').click();

    // Aguardar dialog abrir
    cy.get('[role="dialog"]', { timeout: 5000 }).should('be.visible');

    // Editar capacidade - usar ID
    cy.get('[role="dialog"]').within(() => {
      cy.get('#capacity').clear().type('55');
    });
    
    // Aguardar requisições: PUT (atualizar) e depois GET (atualizar lista)
    cy.intercept('PUT', /\/rooms\/[^/]+$/, (req) => {
      req.reply((res) => {
        res.statusCode = 200;
        res.body = {
          id: 'room-1',
          roomNumber: 'A101',
          type: 'CLASSROOM',
          capacity: 55,
          hasEquipment: true,
          status: 'AVAILABLE',
          updatedAt: new Date().toISOString(),
        };
      });
    }).as('updateRoom');
    
    cy.intercept('GET', /\/rooms[^/]*$/, (req) => {
      req.reply((res) => {
        res.statusCode = 200;
        res.body = [
          { id: 'room-1', roomNumber: 'A101', type: 'CLASSROOM', capacity: 55, hasEquipment: true, status: 'AVAILABLE' },
          { id: 'room-2', roomNumber: 'LAB-02', type: 'LABORATORY', capacity: 25, hasEquipment: true, status: 'AVAILABLE' },
        ];
      });
    }).as('getRoomsAfterUpdate');
    
    // Clicar em salvar
    cy.get('[role="dialog"]').contains('button', 'Salvar').click();

    // Aguardar atualização completar
    cy.wait('@updateRoom', { timeout: 10000 });

    // Aguardar dialog fechar
    cy.get('[role="dialog"]', { timeout: 15000 }).should('not.exist');
    
    // Aguardar que fetchRooms() seja chamado para atualizar a lista
    cy.wait('@getRoomsAfterUpdate', { timeout: 10000 });
    cy.wait(1000);
    
    cy.get('[data-testid="room-card"]', { timeout: 10000 }).contains('A101').should('contain', 'Capacidade: 55');
  });

  it('should delete a room', () => {
    // Encontrar o card e clicar no botão Excluir
    cy.get('[data-testid="room-card"]').contains('LAB-02').should('be.visible');
    cy.get('[data-testid="room-card"]').contains('LAB-02').closest('[data-testid="room-card"]').find('button').contains('Excluir').click();

    // Aguardar dialog de confirmação aparecer
    cy.get('[role="dialog"]', { timeout: 5000 }).should('be.visible');
    cy.get('[role="dialog"]').should('contain', 'Confirmar Exclusão');
    cy.get('[role="dialog"]').should('contain', 'LAB-02');
    
    // Aguardar requisição de exclusão
    cy.intercept('DELETE', /.*\/rooms\/[^/]+$/).as('deleteRoom');
    
    // Confirmar exclusão
    cy.get('[role="dialog"]').contains('button', 'Excluir').click();

    // Aguardar requisição completar
    cy.wait('@deleteRoom', { timeout: 10000 });

    // Wait for dialog to close and card to be removed
    cy.get('[role="dialog"]', { timeout: 10000 }).should('not.exist');
    cy.wait(1000);
    cy.get('[data-testid="room-card"]').contains('LAB-02').should('not.exist');
  });

  it('should cancel room deletion', () => {
    // Encontrar o card e clicar no botão Excluir
    cy.get('[data-testid="room-card"]').contains('A101').should('be.visible');
    cy.get('[data-testid="room-card"]').contains('A101').closest('[data-testid="room-card"]').find('button').contains('Excluir').click();

    // Aguardar dialog aparecer
    cy.get('[role="dialog"]', { timeout: 5000 }).should('be.visible');
    cy.get('[role="dialog"]').contains('button', 'Cancelar').click();

    // Dialog should close and room should still exist
    cy.get('[role="dialog"]', { timeout: 5000 }).should('not.exist');
    cy.wait(500);
    cy.get('[data-testid="room-card"]').contains('A101').should('be.visible');
  });

  it('should display empty state when no rooms', () => {
    // Mock empty rooms list - sobrescrever o mock do beforeEach
    cy.intercept('GET', /\/rooms[^/]*$/, {
      statusCode: 200,
      body: [],
    }).as('getEmptyRooms');

    cy.reload();
    
    // Aguardar que o root tenha conteúdo após reload
    cy.get('#root', { timeout: 20000 }).should(($root) => {
      const hasChildren = $root.children().length > 0;
      const hasContent = ($root.html() || '').trim().length > 0;
      return hasChildren || hasContent;
    });
    
    // Aguardar requisição completar
    cy.wait('@getEmptyRooms', { timeout: 10000 });
    cy.wait(2000);

    // Should show empty state message
    cy.contains(/nenhuma sala/i, { timeout: 10000 }).should('be.visible');
  });
});

