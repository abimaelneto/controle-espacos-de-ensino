# 🧪 Testes E2E - Auth Service

## ✅ Status

```
✅ 19 Testes E2E passando
✅ 0 falhas
✅ Cobertura completa dos endpoints
```

## 📋 Testes Implementados

### POST /api/v1/auth/register

1. ✅ **Registrar novo usuário com sucesso**
   - Retorna 201
   - Gera accessToken e refreshToken
   - Retorna dados do usuário

2. ✅ **Validação de email inválido** (400)
3. ✅ **Validação de senha curta** (400)
4. ✅ **Validação de role inválido** (400)
5. ✅ **Validação de campos obrigatórios** (400)
6. ✅ **Erro para email duplicado** (500)
7. ✅ **Normalização de email** (lowercase)

### POST /api/v1/auth/login

1. ✅ **Login com credenciais válidas**
   - Retorna 200
   - Gera tokens
   - Retorna dados do usuário

2. ✅ **Erro para email inexistente** (401)
3. ✅ **Erro para senha incorreta** (401)
4. ✅ **Validação de email inválido** (400)
5. ✅ **Validação de senha obrigatória** (400)
6. ✅ **Erro para usuário inativo** (401)
7. ✅ **Normalização de email** (lowercase)

### Validação de Tokens

1. ✅ **Estrutura válida do JWT** (3 partes)
2. ✅ **Estrutura válida do refresh token**
3. ✅ **Tokens diferentes** (access ≠ refresh)

### Roles

1. ✅ **Registrar usuário ADMIN**
2. ✅ **Registrar usuário MONITOR**

## 🏃 Como Rodar

```bash
# Todos os testes E2E
npm run test:e2e

# Com watch mode (se configurado)
npm run test:e2e:watch
```

## 🔧 Configuração

### Mock Event Publisher

Os testes E2E usam um `MockEventPublisher` para não depender do Kafka:

```typescript
class MockEventPublisher implements IEventPublisher {
  async publish(event: IDomainEvent): Promise<void> {
    // Mock - não faz nada em testes
  }
}
```

### Database de Teste

Os testes usam o mesmo banco de dados, mas limpam as tabelas antes de cada teste:

```typescript
beforeEach(async () => {
  await dataSource.query('DELETE FROM refresh_tokens');
  await dataSource.query('DELETE FROM users');
});
```

## 📊 Cobertura de Testes

### Endpoints Testados
- ✅ POST /api/v1/auth/register (7 cenários)
- ✅ POST /api/v1/auth/login (7 cenários)
- ✅ Validação de tokens (3 cenários)
- ✅ Diferentes roles (2 cenários)

### Casos de Erro
- ✅ Validações de entrada (400)
- ✅ Autenticação falha (401)
- ✅ Erros de negócio (500)

## 🎯 Próximos Testes (Opcional)

- [ ] POST /api/v1/auth/refresh (quando implementado)
- [ ] POST /api/v1/auth/validate (quando implementado)
- [ ] Testes de performance
- [ ] Testes de carga

