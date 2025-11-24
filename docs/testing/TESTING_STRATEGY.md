# Estratégia de Testes

Visão completa da estratégia de testes do projeto.

## 📋 Índice

- [Pirâmide de Testes](#pirâmide-de-testes)
- [Tipos de Teste](#tipos-de-teste)
- [Cobertura](#cobertura)
- [Ferramentas](#ferramentas)
- [Processo](#processo)

## 🏗️ Pirâmide de Testes

```
        /\
       /  \      E2E Tests (~50)
      /____\     - Playwright
     /      \    
    /        \   Integration Tests (~30)
   /__________\  - Supertest
  /            \
 /              \ Unit Tests (~250)
/________________\ - Jest
```

### Distribuição Ideal

- **70% Unit Tests**: Rápidos, isolados, muitos
- **20% Integration Tests**: Testam integração entre componentes
- **10% E2E Tests**: Testam fluxos completos

## 🧪 Tipos de Teste

### 1. Unit Tests

**O que testa**: Funções, métodos, classes isoladas

**Ferramenta**: Jest

**Exemplo**:
```typescript
describe('CreateStudentUseCase', () => {
  it('should create student successfully', () => {
    // Teste isolado
  });
});
```

**Onde**: `services/*/src/**/*.spec.ts`

**Executar**:
```bash
cd services/auth-service
npm run test
```

### 2. Integration Tests

**O que testa**: Integração entre componentes (repositório + use case, etc.)

**Ferramenta**: Jest + Supertest

**Exemplo**:
```typescript
describe('CheckIn Integration', () => {
  it('should perform check-in with valid data', async () => {
    // Testa integração real
  });
});
```

**Onde**: `services/*/test/integration/*.spec.ts`

**Executar**:
```bash
cd services/checkin-service
npm run test:integration
```

### 3. E2E Tests (Frontend)

**O que testa**: Fluxos completos do usuário

**Ferramenta**: Playwright

**Exemplo**:
```typescript
test('should create student', async ({ page }) => {
  await page.goto('/students');
  await page.click('button:has-text("Novo Aluno")');
  // ...
});
```

**Onde**: `frontend/admin/e2e/*.spec.ts`

**Executar**:
```bash
npm run test:e2e
```

### 4. Performance Tests

**O que testa**: Performance e carga do sistema

**Ferramenta**: Artillery

**Exemplo**:
```yaml
config:
  target: "http://localhost:3000"
  phases:
    - duration: 60
      arrivalRate: 10
```

**Onde**: `tests/performance/*.yml`

**Executar**:
```bash
npm run perf:auth
npm run perf:checkin
```

### 5. Race Condition Tests

**O que testa**: Condições de corrida e concorrência

**Ferramenta**: Jest + Supertest

**Exemplo**:
```typescript
it('should prevent exceeding capacity with concurrent requests', async () => {
  const requests = Array.from({ length: 10 }, () => 
    request(app).post('/api/v1/checkin').send(data)
  );
  await Promise.all(requests);
  // Verificar que não excedeu capacidade
});
```

**Onde**: `services/checkin-service/test/integration/race-condition.spec.ts`

## 📊 Cobertura

### Metas de Cobertura

- **Unit Tests**: 80% mínimo
- **Integration Tests**: 60% mínimo
- **E2E Tests**: Fluxos críticos 100%

### Verificar Cobertura

```bash
# Cobertura de um serviço
cd services/auth-service
npm run test:cov

# Cobertura completa
npm run test -- --coverage
```

### Relatório

Cobertura é gerada em:
- `services/*/coverage/lcov-report/index.html`

## 🛠️ Ferramentas

### Jest

**Configuração**: `jest.config.js` em cada serviço

**Features**:
- Mocking
- Snapshots
- Coverage
- Watch mode

### Supertest

**Uso**: Testes de integração HTTP

```typescript
import * as request from 'supertest';

request(app.getHttpServer())
  .post('/api/v1/students')
  .send(data)
  .expect(201);
```

### Playwright

**Configuração**: `playwright.config.ts`

**Features**:
- Multi-browser
- Screenshots
- Video recording
- Trace viewer

### Artillery

**Configuração**: `tests/performance/*.yml`

**Features**:
- Load testing
- Stress testing
- Custom processors
- Metrics export

## 🔄 Processo

### TDD (Test-Driven Development)

1. **Red**: Escreva teste que falha
2. **Green**: Escreva código mínimo para passar
3. **Refactor**: Melhore mantendo testes passando

### Antes de Commitar

```bash
# Executar testes
npm run test

# Verificar lint
npm run lint

# Verificar build
npm run build
```

### CI/CD (Futuro)

```yaml
# .github/workflows/test.yml
- name: Run tests
  run: npm run test

- name: Check coverage
  run: npm run test:cov

- name: Run E2E
  run: npm run test:e2e
```

## 📝 Escrevendo Testes

### Estrutura AAA

```typescript
it('should do something', () => {
  // Arrange
  const input = 'test';
  const expected = 'result';
  
  // Act
  const result = functionUnderTest(input);
  
  // Assert
  expect(result).toBe(expected);
});
```

### Boas Práticas

1. **Nomes descritivos**: `should create user when data is valid`
2. **Um conceito por teste**: Não testar múltiplas coisas
3. **Isolamento**: Testes não devem depender uns dos outros
4. **Fast**: Testes devem ser rápidos
5. **Determinísticos**: Sempre mesmo resultado

### Mocks

```typescript
// Mock de repositório
const mockRepository = {
  save: jest.fn(),
  findById: jest.fn(),
};

// Mock de serviço externo
jest.mock('@nestjs/axios', () => ({
  HttpService: {
    get: jest.fn(),
  },
}));
```

## 🎯 Cobertura por Serviço

### Auth Service
- ✅ 98 testes (79 unitários + 19 E2E)
- ✅ Cobertura: ~85%

### Students Service
- ✅ 75 testes
- ✅ Cobertura: ~80%

### Rooms Service
- ✅ 61 testes
- ✅ Cobertura: ~78%

### Check-in Service
- ✅ 15+ testes unitários
- ✅ Testes de integração
- ✅ Testes de race condition
- ✅ Cobertura: ~75%

### Analytics Service
- ✅ 4 testes
- 🟡 Cobertura: ~60% (melhorar)

### Frontend
- ✅ ~50 testes E2E (Playwright)
- ✅ Cobertura de fluxos críticos

## 🚀 Executando Testes

### Todos os Testes

```bash
npm run test
```

### Por Serviço

```bash
cd services/auth-service
npm run test
```

### Com Watch

```bash
npm run test:watch
```

### E2E

```bash
npm run test:e2e
npm run test:e2e:ui  # Com interface
```

### Performance

```bash
npm run perf:auth
npm run perf:checkin
```

## 📚 Recursos

- [Jest Documentation](https://jestjs.io/)
- [Playwright Documentation](https://playwright.dev/)
- [Artillery Documentation](https://www.artillery.io/)
- [Testing Best Practices](https://testingjavascript.com/)

---

**Última atualização**: 2025-01-20

