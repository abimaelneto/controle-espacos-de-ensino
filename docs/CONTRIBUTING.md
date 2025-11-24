# Guia de Contribuição

Obrigado por considerar contribuir com o projeto Controle de Espaços de Ensino!

## 📋 Índice

- [Código de Conduta](#código-de-conduta)
- [Como Contribuir](#como-contribuir)
- [Processo de Desenvolvimento](#processo-de-desenvolvimento)
- [Padrões de Código](#padrões-de-código)
- [Testes](#testes)
- [Commits](#commits)
- [Pull Requests](#pull-requests)

## 📜 Código de Conduta

Este projeto segue um código de conduta baseado em respeito mútuo, colaboração e profissionalismo.

### Nossos Valores

- **Respeito**: Trate todos com respeito e consideração
- **Colaboração**: Trabalhe em conjunto para alcançar objetivos comuns
- **Qualidade**: Busque sempre a excelência técnica
- **Aprendizado**: Esteja aberto a aprender e ensinar

## 🚀 Como Contribuir

### Reportar Bugs

1. Verifique se o bug já não foi reportado nas [Issues](../../issues)
2. Crie uma nova issue com:
   - Título descritivo
   - Descrição clara do problema
   - Passos para reproduzir
   - Comportamento esperado vs. atual
   - Ambiente (OS, versões, etc.)
   - Screenshots/logs (se aplicável)

### Sugerir Funcionalidades

1. Verifique se a funcionalidade já não foi sugerida
2. Crie uma issue com:
   - Título descritivo
   - Descrição da funcionalidade
   - Casos de uso
   - Benefícios esperados
   - Possíveis implementações

### Contribuir com Código

1. Fork o repositório
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Faça suas alterações seguindo os padrões do projeto
4. Escreva testes para suas alterações
5. Certifique-se de que todos os testes passam
6. Faça commit seguindo as convenções
7. Abra um Pull Request

## 🔄 Processo de Desenvolvimento

### Workflow Git

```
main (produção)
  └── develop (desenvolvimento)
       └── feature/nome-da-feature
       └── bugfix/nome-do-bug
       └── hotfix/nome-do-hotfix
```

### Branches

- **main**: Código em produção, sempre estável
- **develop**: Branch de desenvolvimento principal
- **feature/***: Novas funcionalidades
- **bugfix/***: Correções de bugs
- **hotfix/***: Correções urgentes para produção

### Criando uma Branch

```bash
# A partir de develop
git checkout develop
git pull origin develop
git checkout -b feature/nome-da-feature
```

## 📝 Padrões de Código

### TypeScript/JavaScript

- Use **TypeScript** para todo código novo
- Siga o **ESLint** configurado no projeto
- Use **Prettier** para formatação
- Máximo de 100 caracteres por linha
- Use nomes descritivos para variáveis e funções

### NestJS (Backend)

- Siga a arquitetura **Hexagonal (Ports and Adapters)**
- Use **DDD** (Domain-Driven Design)
- Separe em camadas: Domain, Application, Infrastructure, Presentation
- Use **Injeção de Dependência** do NestJS
- Documente com **Swagger/OpenAPI**

### React (Frontend)

- Use **TypeScript**
- Componentes funcionais com hooks
- Use **shadcn/ui** para componentes base
- Siga os padrões de **Zustand** para state management
- Use **TanStack Query** para data fetching

### Estrutura de Arquivos

```
services/[service-name]/
├── src/
│   ├── domain/          # Entidades, Value Objects, Events
│   ├── application/     # Use Cases, DTOs
│   ├── infrastructure/  # Adapters (Persistence, HTTP, Messaging)
│   └── presentation/    # Controllers, Middleware
└── test/                # Testes
```

## 🧪 Testes

### Princípios

- **TDD** (Test-Driven Development) é encorajado
- Mantenha cobertura mínima de **80%**
- Teste casos de sucesso e falha
- Teste edge cases

### Tipos de Teste

1. **Unit Tests**: Teste funções/métodos isolados
2. **Integration Tests**: Teste integração entre componentes
3. **E2E Tests**: Teste fluxos completos (Playwright)

### Executando Testes

```bash
# Todos os testes
npm run test

# Testes de um serviço específico
cd services/auth-service && npm run test

# Testes E2E
npm run test:e2e

# Com cobertura
npm run test:cov
```

### Escrevendo Testes

```typescript
describe('FeatureName', () => {
  it('should do something when condition is met', () => {
    // Arrange
    const input = 'test';
    
    // Act
    const result = functionUnderTest(input);
    
    // Assert
    expect(result).toBe('expected');
  });
});
```

## 💬 Commits

### Convenção de Commits

Seguimos o padrão [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Tipos

- **feat**: Nova funcionalidade
- **fix**: Correção de bug
- **docs**: Documentação
- **style**: Formatação (não afeta código)
- **refactor**: Refatoração
- **test**: Testes
- **chore**: Tarefas de manutenção
- **perf**: Melhorias de performance
- **ci**: CI/CD

### Exemplos

```bash
feat(auth): add refresh token endpoint
fix(checkin): resolve race condition in capacity check
docs(api): update authentication documentation
refactor(students): simplify student validation logic
test(checkin): add race condition tests
```

### Regras

- Use o presente do indicativo ("add" não "added")
- Primeira linha com máximo de 50 caracteres
- Use o corpo para explicar o "porquê", não o "o quê"
- Referencie issues: `Closes #123`

## 🔀 Pull Requests

### Antes de Abrir um PR

- [ ] Código segue os padrões do projeto
- [ ] Testes passam localmente
- [ ] Testes foram adicionados/atualizados
- [ ] Documentação foi atualizada (se necessário)
- [ ] Commits seguem a convenção
- [ ] Branch está atualizada com `develop`

### Template de PR

```markdown
## Descrição
Breve descrição das mudanças

## Tipo de Mudança
- [ ] Bug fix
- [ ] Nova funcionalidade
- [ ] Breaking change
- [ ] Documentação

## Checklist
- [ ] Testes adicionados/atualizados
- [ ] Documentação atualizada
- [ ] Código segue padrões do projeto
- [ ] Testes passam localmente

## Screenshots (se aplicável)

## Issues Relacionadas
Closes #123
```

### Processo de Review

1. **Autor**: Abre PR e marca revisores
2. **Revisores**: Revisam código e deixam feedback
3. **Autor**: Responde feedback e faz ajustes
4. **Revisores**: Aprovam quando satisfeitos
5. **Maintainer**: Faz merge quando aprovado

### Critérios de Aprovação

- ✅ Código segue padrões
- ✅ Testes passam
- ✅ Sem conflitos
- ✅ Documentação atualizada
- ✅ Pelo menos 1 aprovação

## 🏗️ Arquitetura

### Princípios

- **Separation of Concerns**: Separação clara de responsabilidades
- **Dependency Inversion**: Depender de abstrações, não implementações
- **Single Responsibility**: Uma classe/função, uma responsabilidade
- **DRY**: Don't Repeat Yourself
- **SOLID**: Princípios SOLID

### Padrões

- **Hexagonal Architecture**: Ports and Adapters
- **DDD**: Domain-Driven Design
- **CQRS**: Quando apropriado
- **Event Sourcing**: Para eventos de domínio
- **Repository Pattern**: Para persistência

## 📚 Recursos

- [NestJS Documentation](https://docs.nestjs.com/)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [DDD Reference](https://www.domainlanguage.com/ddd/reference/)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

## 📖 Documentação do Projeto

- [Arquitetura do Sistema](./architecture/ARCHITECTURE.md)
- [Guia de Desenvolvimento](./DEVELOPMENT_GUIDE.md)
- [Documentação de APIs](./api/API_DOCUMENTATION.md)
- [Troubleshooting](./TROUBLESHOOTING.md)

## ❓ Dúvidas?

- Abra uma issue com a tag `question`
- Consulte a documentação em `docs/`
- Entre em contato com os maintainers

---

**Obrigado por contribuir!** 🎉

