# 🔐 Auth Service

Serviço de autenticação e autorização - **Identity Context**

## 📋 Responsabilidades

- Autenticação de usuários (login)
- Geração e validação de tokens JWT
- Refresh tokens
- Autorização baseada em roles
- Gestão de usuários

## 🏗️ Arquitetura

Este serviço implementa **DDD + Ports and Adapters (Hexagonal Architecture)**:

- **Domain Layer:** Entidades, Value Objects, Domain Services, Ports
- **Application Layer:** Use Cases, DTOs, Mappers
- **Infrastructure Layer:** Adapters (MySQL/RDS, Kafka/MSK, Redis/ElastiCache, Winston/CloudWatch)
- **Presentation Layer:** Controllers, Guards, Pipes

## 🚀 Como Rodar

### Desenvolvimento

```bash
# Instalar dependências
npm install

# Copiar variáveis de ambiente
cp .env.example .env.local

# Rodar migrations (quando implementadas)
npm run migration:run

# Iniciar em modo desenvolvimento
npm run start:dev
```

O serviço estará disponível em: `http://localhost:3000`

### Swagger

Documentação da API disponível em: `http://localhost:3000/api/docs`

## 📝 Variáveis de Ambiente

Veja `.env.example` para todas as variáveis disponíveis.

Principais:
- `DATABASE_TYPE`: `mysql` (local) ou `rds` (AWS)
- `MESSAGING_TYPE`: `kafka` (local) ou `msk` (AWS)
- `CACHE_TYPE`: `redis` (local) ou `elasticache` (AWS)
- `LOGGER_TYPE`: `winston` (local) ou `cloudwatch` (AWS)

## 🧪 Testes

```bash
# Testes unitários
npm run test

# Testes com cobertura
npm run test:cov

# Testes E2E
npm run test:e2e
```

## 📚 Estrutura de Pastas

```
src/
├── domain/                    # Camada de Domínio
│   ├── entities/
│   ├── value-objects/
│   ├── services/
│   ├── ports/                 # Interfaces (Ports)
│   │   ├── repositories/
│   │   ├── messaging/
│   │   ├── cache/
│   │   └── logger/
│   └── events/
├── application/               # Camada de Aplicação
│   ├── use-cases/
│   ├── dto/
│   └── mappers/
├── infrastructure/            # Adapters (Implementações)
│   ├── adapters/
│   │   ├── persistence/
│   │   ├── messaging/
│   │   ├── cache/
│   │   └── logger/
│   ├── config/
│   └── providers/
└── presentation/              # Camada de Apresentação
    ├── http/
    │   ├── controllers/
    │   ├── guards/
    │   ├── decorators/
    │   └── pipes/
    └── swagger/
```

## 🔌 Adaptadores

O serviço suporta múltiplos adaptadores para máxima flexibilidade:

- **Persistence:** MySQL (local) ↔ RDS (AWS)
- **Messaging:** Kafka (local) ↔ MSK (AWS)
- **Cache:** Redis (local) ↔ ElastiCache (AWS)
- **Logger:** Winston (local) ↔ CloudWatch (AWS)

A seleção é feita automaticamente baseada nas variáveis de ambiente.

