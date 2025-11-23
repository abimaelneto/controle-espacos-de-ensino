# Testes E2E com Cypress

Este diretório contém os testes end-to-end (E2E) usando Cypress.

## Estrutura

- `cypress/e2e/` - Testes E2E
- `cypress/support/` - Comandos customizados e helpers
- `cypress/fixtures/` - Dados de teste (fixtures)

## Comandos Disponíveis

```bash
# Executar testes em modo headless
npm run test:e2e

# Abrir interface gráfica do Cypress
npm run test:e2e:open

# Executar testes em modo headed (com navegador visível)
npm run test:e2e:headed
```

## Comandos Customizados

### Autenticação

```typescript
cy.loginAsAdmin(); // Configura localStorage com token de admin
cy.logout(); // Remove autenticação
cy.isAuthenticated(); // Verifica se está autenticado
```

### Navegação

```typescript
cy.visitAndWaitForApp('/dashboard'); // Navega e aguarda app estar pronto
cy.waitForAppReady(); // Aguarda app React estar completamente carregado
```

## Mocks de API

Os mocks estão em `cypress/support/apiMock.ts`:

```typescript
import { mockStudentsApi, mockRoomsApi, mockAnalyticsApi, mockDashboardApis } from '../support/apiMock';

beforeEach(() => {
  cy.loginAsAdmin();
  mockDashboardApis(); // Mocka todas as APIs do dashboard
  cy.visitAndWaitForApp('/');
});
```

## Configuração

A configuração do Cypress está em `cypress.config.ts`. O baseUrl padrão é `http://localhost:5173` (Vite dev server).

Para mudar, defina a variável de ambiente:

```bash
CYPRESS_BASE_URL=http://localhost:3000 npm run test:e2e
```

## Migração de Playwright

Os testes foram migrados de Playwright para Cypress. Principais diferenças:

- `page.goto()` → `cy.visit()`
- `page.getByRole()` → `cy.contains()` ou seletores específicos
- `page.route()` → `cy.intercept()`
- `expect().toBeVisible()` → `cy.get().should('be.visible')`
- `page.waitForTimeout()` → `cy.wait()`

