# Guia de Desenvolvimento

Este guia fornece informações essenciais para desenvolvedores trabalhando no projeto.

## 📋 Índice

- [Pré-requisitos](#pré-requisitos)
- [Setup do Ambiente](#setup-do-ambiente)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Desenvolvimento Local](#desenvolvimento-local)
- [Padrões de Código](#padrões-de-código)
- [Testes](#testes)
- [Debugging](#debugging)
- [Ferramentas](#ferramentas)

## ✅ Pré-requisitos

### Software Necessário

- **Node.js**: 20.x LTS ou superior
- **npm**: 9.x ou superior (vem com Node.js)
- **Docker**: 24.x ou superior
- **Docker Compose**: 2.x ou superior
- **Git**: 2.x ou superior

### Opcional (mas recomendado)

- **VS Code**: Editor recomendado
- **Docker Desktop**: Para gerenciar containers
- **Postman/Insomnia**: Para testar APIs
- **TablePlus/DBeaver**: Para gerenciar bancos de dados

## 🚀 Setup do Ambiente

### 1. Clone o Repositório

```bash
git clone <repository-url>
cd controle-espacos-de-ensino
```

### 2. Instale Dependências

```bash
npm install
```

Isso instalará dependências de todos os workspaces (serviços e frontend).

### 3. Configure Variáveis de Ambiente

Cada serviço tem um arquivo `env.example`. Copie e ajuste:

```bash
# Auth Service
cp services/auth-service/env.example services/auth-service/.env.local

# Students Service
cp services/students-service/env.example services/students-service/.env.local

# Rooms Service
cp services/rooms-service/env.example services/rooms-service/.env.local

# Check-in Service
cp services/checkin-service/env.example services/checkin-service/.env.local

# Analytics Service
cp services/analytics-service/env.example services/analytics-service/.env.local
```

### 4. Inicie a Infraestrutura

```bash
npm run docker:up
```

Isso inicia:
- MySQL (5 instâncias)
- Redis
- Kafka + Zookeeper
- Prometheus
- Grafana
- Traefik

### 5. Execute Migrations

```bash
# Auth Service
cd services/auth-service
npm run migration:run

# Students Service
cd services/students-service
npm run migration:run

# Rooms Service
cd services/rooms-service
npm run migration:run

# Check-in Service
cd services/checkin-service
npm run migration:run

# Analytics Service
cd services/analytics-service
npm run migration:run
```

## 🏗️ Estrutura do Projeto

```
controle-espacos-de-ensino/
├── services/                    # Microsserviços
│   ├── auth-service/
│   │   ├── src/
│   │   │   ├── domain/         # Entidades, Value Objects, Events
│   │   │   ├── application/    # Use Cases, DTOs
│   │   │   ├── infrastructure/ # Adapters
│   │   │   └── presentation/   # Controllers
│   │   └── test/
│   ├── students-service/
│   ├── rooms-service/
│   ├── checkin-service/
│   └── analytics-service/
├── frontend/
│   ├── admin/                  # Frontend Admin
│   └── student/                # Frontend Student
├── infrastructure/
│   ├── docker/                 # Docker Compose, configs
│   ├── kubernetes/             # K8s manifests
│   └── terraform/              # IaC AWS
├── tests/
│   └── performance/            # Testes de performance
├── scripts/                     # Scripts utilitários
└── docs/                        # Documentação
```

## 💻 Desenvolvimento Local

### Iniciando os Serviços

```bash
# Terminal 1 - Auth Service
npm run dev:auth

# Terminal 2 - Students Service
npm run dev:students

# Terminal 3 - Rooms Service
npm run dev:spaces

# Terminal 4 - Check-in Service
npm run dev:checkin

# Terminal 5 - Analytics Service
npm run dev:analytics

# Terminal 6 - Frontend Admin
npm run dev:frontend
```

### Endpoints Locais

- **Auth Service**: http://localhost:3000
- **Students Service**: http://localhost:3001
- **Rooms Service**: http://localhost:3002
- **Check-in Service**: http://localhost:3003
- **Analytics Service**: http://localhost:3004
- **Frontend Admin**: http://localhost:5173
- **Grafana**: http://localhost:3001 (admin/admin)
- **Prometheus**: http://localhost:9090
- **Traefik Dashboard**: http://traefik.localhost:8080

### Via Traefik (API Gateway)

Todos os serviços podem ser acessados via:
- `http://api.localhost/api/v1/auth/*`
- `http://api.localhost/api/v1/students/*`
- `http://api.localhost/api/v1/rooms/*`
- `http://api.localhost/api/v1/checkin/*`
- `http://api.localhost/api/v1/analytics/*`

## 📝 Padrões de Código

### TypeScript

```typescript
// ✅ Bom
interface User {
  id: string;
  email: string;
  role: UserRole;
}

function createUser(data: CreateUserDto): Promise<User> {
  // ...
}

// ❌ Evitar
function createUser(data: any): any {
  // ...
}
```

### Nomenclatura

- **Classes**: PascalCase (`UserService`)
- **Interfaces**: PascalCase (`IUserRepository`)
- **Funções/Métodos**: camelCase (`createUser`)
- **Variáveis**: camelCase (`userEmail`)
- **Constantes**: UPPER_SNAKE_CASE (`MAX_RETRIES`)
- **Arquivos**: kebab-case (`user-service.ts`)

### Estrutura de Arquivos

```
src/
├── domain/
│   ├── entities/
│   │   └── user.entity.ts
│   ├── value-objects/
│   │   └── email.vo.ts
│   ├── events/
│   │   └── user-created.event.ts
│   └── services/
│       └── user-validation.service.ts
├── application/
│   ├── use-cases/
│   │   └── create-user.use-case.ts
│   └── dto/
│       └── create-user.dto.ts
├── infrastructure/
│   ├── adapters/
│   │   ├── persistence/
│   │   ├── http/
│   │   └── messaging/
│   └── config/
└── presentation/
    └── http/
        └── controllers/
            └── users.controller.ts
```

### Imports

```typescript
// Ordem: externos, internos, relativos
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { User } from '../../domain/entities/user.entity';
import { CreateUserUseCase } from '../use-cases/create-user.use-case';

import { CreateUserDto } from './dto/create-user.dto';
```

## 🧪 Testes

### Executando Testes

```bash
# Todos os testes
npm run test

# Testes de um serviço
cd services/auth-service && npm run test

# Testes com cobertura
npm run test:cov

# Testes E2E
npm run test:e2e

# Testes de integração
cd services/checkin-service && npm run test:integration
```

### Escrevendo Testes

```typescript
describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;
  let repository: MockUserRepository;

  beforeEach(() => {
    repository = new MockUserRepository();
    useCase = new CreateUserUseCase(repository);
  });

  it('should create user successfully', async () => {
    // Arrange
    const dto = { email: 'test@example.com', password: 'password123' };
    repository.save = jest.fn().mockResolvedValue(undefined);

    // Act
    const result = await useCase.execute(dto);

    // Assert
    expect(result).toBeDefined();
    expect(repository.save).toHaveBeenCalled();
  });
});
```

### TDD Workflow

1. **Red**: Escreva teste que falha
2. **Green**: Escreva código mínimo para passar
3. **Refactor**: Melhore o código mantendo testes passando

## 🐛 Debugging

### VS Code

Configure `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Auth Service",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "start:debug"],
      "cwd": "${workspaceFolder}/services/auth-service",
      "port": 9229
    }
  ]
}
```

### Logs

```typescript
// Use logger do NestJS
import { Logger } from '@nestjs/common';

const logger = new Logger('ServiceName');

logger.log('Info message');
logger.warn('Warning message');
logger.error('Error message', error.stack);
```

### Database

```bash
# Conectar ao MySQL
docker exec -it mysql-auth mysql -u app_user -papp_password identity

# Ver logs do container
docker logs -f auth-service
```

## 🛠️ Ferramentas

### VS Code Extensions Recomendadas

- **ESLint**: Linting
- **Prettier**: Formatação
- **TypeScript**: Suporte TypeScript
- **Docker**: Gerenciamento Docker
- **REST Client**: Testar APIs
- **Mermaid Preview**: Visualizar diagramas

### Scripts Úteis

```bash
# Build
npm run build

# Lint
npm run lint

# Formatar código
npm run format

# Limpar node_modules
npm run clean

# Verificar dependências
npm audit
```

## 📚 Recursos

- [Arquitetura do Projeto](./architecture/ARCHITECTURE.md)
- [Guia de Contribuição](./CONTRIBUTING.md)
- [Documentação de APIs](./api/API_DOCUMENTATION.md)
- [Troubleshooting](./TROUBLESHOOTING.md)

---

**Dúvidas?** Abra uma issue ou consulte a documentação em `docs/`.

