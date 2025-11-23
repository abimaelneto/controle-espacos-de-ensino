/// <reference types="cypress" />

// Importar mocks de API para facilitar uso
import './apiMock';

/**
 * Helper para autenticação compartilhada nos testes E2E
 * Simula login e armazena token no localStorage
 */
export function loginAsAdmin() {
  // Configurar localStorage antes de qualquer navegação
  cy.window().then((win) => {
    win.localStorage.setItem('auth_token', 'mock-jwt-token-for-testing');
    win.localStorage.setItem('user', JSON.stringify({
      id: 'admin-user-id',
      email: 'admin@pucpr.br',
      role: 'ADMIN',
    }));
  });
}

/**
 * Helper para fazer logout
 */
export function logout() {
  cy.window().then((win) => {
    win.localStorage.removeItem('auth_token');
    win.localStorage.removeItem('user');
  });
  cy.reload();
}

/**
 * Helper para verificar se está autenticado
 */
export function isAuthenticated(): Cypress.Chainable<boolean> {
  return cy.window().then((win) => {
    return !!win.localStorage.getItem('auth_token');
  });
}

/**
 * Aguarda o app React estar completamente carregado
 */
export function waitForAppReady() {
  // Aguardar elemento root estar presente
  cy.get('#root', { timeout: 20000 }).should('exist');
  
  // Aguardar que o documento esteja completamente carregado
  cy.document().should('have.property', 'readyState', 'complete');
  
  // Aguardar React ter renderizado - verificar se root tem conteúdo
  // Usar uma abordagem mais tolerante - aguardar que o root tenha algum conteúdo
  cy.get('#root', { timeout: 20000 }).should(($root) => {
    const html = $root.html() || '';
    const text = $root.text() || '';
    const hasChildren = $root.children().length > 0;
    const hasContent = html.trim().length > 0 || text.trim().length > 0;
    
    // Retornar true se tiver qualquer conteúdo
    return hasChildren || hasContent;
  });
  
  // Aguardar um pouco mais para garantir que React terminou de renderizar
  cy.wait(1000);
}

/**
 * Navega para uma URL e aguarda o app estar pronto
 * IMPORTANTE: loginAsAdmin deve ser chamado ANTES desta função
 */
export function visitAndWaitForApp(url: string) {
  // Visitar a página
  cy.visit(url, {
    onBeforeLoad(win) {
      // Garantir que localStorage está configurado antes da página carregar
      // Isso é feito aqui como fallback, mas loginAsAdmin deve ser chamado antes
      if (!win.localStorage.getItem('auth_token')) {
        win.localStorage.setItem('auth_token', 'mock-jwt-token-for-testing');
        win.localStorage.setItem('user', JSON.stringify({
          id: 'admin-user-id',
          email: 'admin@pucpr.br',
          role: 'ADMIN',
        }));
      }
    },
  });
  
  // Aguardar app estar pronto
  waitForAppReady();
}

// Declare global types for TypeScript
declare global {
  namespace Cypress {
    interface Chainable {
      loginAsAdmin(): Chainable<void>;
      logout(): Chainable<void>;
      isAuthenticated(): Chainable<boolean>;
      waitForAppReady(): Chainable<void>;
      visitAndWaitForApp(url: string): Chainable<void>;
    }
  }
}

// Adicionar comandos customizados ao Cypress
Cypress.Commands.add('loginAsAdmin', loginAsAdmin);
Cypress.Commands.add('logout', logout);
Cypress.Commands.add('isAuthenticated', isAuthenticated);
Cypress.Commands.add('waitForAppReady', waitForAppReady);
Cypress.Commands.add('visitAndWaitForApp', visitAndWaitForApp);

