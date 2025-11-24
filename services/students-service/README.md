# 👥 Students Service

Serviço de gestão de alunos - **Academic Context**

## 📋 Responsabilidades

- CRUD completo de alunos
- Validação de CPF, matrícula e email
- Gestão de status (ativo/inativo)
- Soft delete
- Integração com Identity Context (via User ID)

## 🏗️ Arquitetura

Este serviço implementa **DDD + Ports and Adapters (Hexagonal Architecture)**:

- **Domain Layer:** Entidades, Value Objects, Domain Services, Ports
- **Application Layer:** Use Cases, DTOs, Mappers
- **Infrastructure Layer:** Adapters (MySQL/RDS, Kafka/MSK, Redis/ElastiCache)
- **Presentation Layer:** Controllers, Guards, Pipes

## 🚀 Como Rodar

### Desenvolvimento

```bash
# Instalar dependências
npm install

# Copiar variáveis de ambiente
cp env.example .env.local

# Rodar migrations
npm run migration:run

# Iniciar em modo desenvolvimento
npm run start:dev
```

O serviço estará disponível em: `http://localhost:3001`

### Swagger

Documentação da API disponível em: `http://localhost:3001/api/docs`

## 📝 Variáveis de Ambiente

Veja `env.example` para todas as variáveis disponíveis.

Principais:
- `DATABASE_TYPE`: `mysql` (local) ou `rds` (AWS)
- `DATABASE_PORT`: `3307` (MySQL Students)
- `MESSAGING_TYPE`: `kafka` (local) ou `msk` (AWS)

## 🧪 Testes

```bash
# Testes unitários
npm run test

# Testes com cobertura
npm run test:cov

# Testes E2E
npm run test:e2e
```

