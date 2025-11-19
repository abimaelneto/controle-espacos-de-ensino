# 🏛️ Controle de Espaços de Ensino - PUCPR

Sistema para controle de uso de espaços de ensino com análise de taxa de ocupação.

## 📋 Sobre o Projeto

Este projeto foi desenvolvido como parte do processo seletivo para a vaga de **Desenvolvedor Full Stack Sr.** na PUCPR.

### 🎯 Objetivo

Desenvolver uma aplicação web para controlar o uso de espaços de ensino, permitindo:
- Registro de entrada e saída de alunos
- Análise da taxa de ocupação dos ambientes
- Gestão de diferentes tipos de ambientes (sala de aula, laboratório, sala de estudos)

## 🏗️ Arquitetura

### Stack Tecnológica

**Backend:**
- NestJS + TypeScript
- DDD (Domain-Driven Design)
- Ports and Adapters (Hexagonal Architecture)
- TypeORM + MySQL
- Kafka para mensageria
- Redis para cache

**Frontend:**
- React + TypeScript + Vite
- shadcn/ui + Tailwind CSS
- Zustand para state management
- TanStack Query

**Infraestrutura:**
- Docker + Docker Compose (desenvolvimento)
- Kubernetes (Minikube/Kind - local)
- Terraform (IaC)
- Traefik (API Gateway)

**Observabilidade:**
- Prometheus (métricas)
- Grafana (visualização)
- Winston/CloudWatch (logs)

### Microsserviços

1. **auth-service** - Autenticação e autorização (Identity Context)
2. **students-service** - Gestão de alunos (Academic Context)
3. **spaces-service** - Gestão de ambientes e registros (Facilities Context)
4. **analytics-service** - Análise e relatórios (Analytics Context)

## 🚀 Como Começar

### Pré-requisitos

- Node.js 20 LTS ou superior
- Docker e Docker Compose
- npm ou yarn

### Instalação

1. **Clone o repositório:**
```bash
git clone <repository-url>
cd controle-espacos-de-ensino
```

2. **Instale as dependências:**
```bash
npm install
```

3. **Suba a infraestrutura:**
```bash
npm run docker:up
```

Isso irá subir:
- 4 instâncias MySQL (uma por serviço)
- Redis
- Kafka + Zookeeper
- Prometheus
- Grafana

4. **Configure as variáveis de ambiente:**

Crie arquivos `.env.local` em cada serviço (veja exemplos em cada serviço).

5. **Inicie os serviços:**

```bash
# Terminal 1 - Auth Service
npm run dev:auth

# Terminal 2 - Students Service
npm run dev:students

# Terminal 3 - Spaces Service
npm run dev:spaces

# Terminal 4 - Analytics Service
npm run dev:analytics

# Terminal 5 - Frontend
npm run dev:frontend
```

## 📚 Documentação

- [Requisitos e Análise](./REQUIREMENTS.md)
- [Plano Detalhado](./PLANO_DETALHADO.md)
- [Adaptadores AWS](./AWS_ADAPTERS.md)
- [Progresso do Projeto](./PROGRESS.md)

## 🧪 Testes

```bash
# Executar todos os testes
npm run test

# Testes de um serviço específico
cd services/auth-service && npm run test
```

## 🏗️ Estrutura do Projeto

```
controle-espacos-de-ensino/
├── services/              # Microsserviços
│   ├── auth-service/
│   ├── students-service/
│   ├── spaces-service/
│   └── analytics-service/
├── frontend/              # Frontend React
│   └── web-app/
├── infrastructure/        # Infraestrutura
│   ├── docker/
│   ├── kubernetes/
│   └── terraform/
├── shared/                # Código compartilhado
│   ├── types/
│   ├── events/
│   └── utils/
└── docs/                  # Documentação
```

## 🔧 Scripts Disponíveis

- `npm run docker:up` - Sobe toda a infraestrutura
- `npm run docker:down` - Para a infraestrutura
- `npm run docker:logs` - Ver logs dos containers
- `npm run dev:auth` - Inicia Auth Service
- `npm run dev:students` - Inicia Students Service
- `npm run dev:spaces` - Inicia Spaces Service
- `npm run dev:analytics` - Inicia Analytics Service
- `npm run dev:frontend` - Inicia Frontend
- `npm run test` - Executa todos os testes
- `npm run build` - Build de todos os serviços

## 🌐 Portas dos Serviços

- **Auth Service:** http://localhost:3000
- **Students Service:** http://localhost:3001
- **Spaces Service:** http://localhost:3002
- **Analytics Service:** http://localhost:3003
- **Frontend:** http://localhost:5173
- **Grafana:** http://localhost:3001 (admin/admin)
- **Prometheus:** http://localhost:9090

## 📝 Licença

MIT

## 👤 Autor

Desenvolvido para o processo seletivo PUCPR - 2025
