# 🏛️ Controle de Espaços de Ensino - PUCPR

Sistema para controle de uso de espaços de ensino com análise de taxa de ocupação.

> **🚀 Quick Start (Kubernetes - Pronto para Produção):** 
> ```bash
> npm install && npm run k8s:start
> ```
> Isso inicia tudo no Kubernetes local (kind) - ideal para demonstração!

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
- **Kubernetes (Kind)** - Containerização e orquestração ⭐ (Requisito da vaga)
- **Docker Compose** - Desenvolvimento local (Requisito da vaga)
- **Terraform** - IaC para AWS (Demonstra conhecimento em Cloud - Requisito)
- **NGINX Ingress** - API Gateway no Kubernetes
- **Observabilidade** - Prometheus + Grafana (Requisito da vaga)

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
- **Para Kubernetes (recomendado para demonstração):** kind e kubectl

### Opção 1: Kubernetes Local (Recomendado para Demonstração/Produção) ⭐

Ideal para demonstrar que o sistema está pronto para produção:

```bash
# 1. Clone e instale dependências
git clone <repository-url>
cd controle-espacos-de-ensino
npm install

# 2. Inicie tudo no Kubernetes (um comando só!)
npm run k8s:start
```

Isso irá:
- Criar cluster Kubernetes local (kind)
- Buildar imagens Docker de todos os serviços
- Deployar toda a infraestrutura (MySQL, Kafka, Redis, etc.)
- Deployar todos os microsserviços
- Configurar Ingress para acesso externo

**Acesse os serviços:**
- `http://api.localhost/api/v1/auth/health`
- `http://api.localhost/api/v1/students`
- `http://api.localhost/api/v1/rooms`
- `http://api.localhost/api/v1/checkin`
- `http://api.localhost/api/v1/analytics`

**Comandos úteis:**
```bash
npm run k8s:status    # Ver status de pods e serviços
npm run k8s:stop     # Parar e remover cluster
kubectl get pods -n controle-espacos  # Ver pods
kubectl logs -f <pod-name> -n controle-espacos  # Ver logs
```

### Opção 2: Docker Compose + Desenvolvimento Local

Para desenvolvimento rápido:

```bash
# 1. Clone e instale dependências
git clone <repository-url>
cd controle-espacos-de-ensino
npm install

# 2. Suba a infraestrutura (MySQL, Kafka, Redis, Prometheus, Grafana)
npm run docker:up

# 3. Configure variáveis de ambiente
# Crie arquivos .env.local em cada serviço

# 4. Execute migrations e seeds
npm run seed:all

# 5. Inicie todos os serviços
npm run dev
```

**Acesso direto por porta (sem gateway):**
- Auth Service: `http://localhost:3000/api/v1/auth`
- Students Service: `http://localhost:3001/api/v1/students`
- Rooms Service: `http://localhost:3002/api/v1/rooms`
- Check-in Service: `http://localhost:3003/api/v1/checkin`
- Analytics Service: `http://localhost:3004/api/v1/analytics`
- Frontend Admin: `http://localhost:5173`

**Alternativa:** Rodar serviços individuais:
```bash
npm run dev:auth      # Apenas Auth Service
npm run dev:students  # Apenas Students Service
npm run dev:spaces    # Apenas Rooms Service
npm run dev:checkin   # Apenas Check-in Service
npm run dev:analytics # Apenas Analytics Service
npm run dev:frontend  # Apenas Frontend
```

**Nota**: Docker Compose não inclui API Gateway. Para produção/demonstração, use Kubernetes.

## 📚 Documentação

### 📖 Documentação Essencial
- [Guia de Contribuição](./docs/CONTRIBUTING.md) - Como contribuir com o projeto
- [Arquitetura do Sistema](./docs/architecture/ARCHITECTURE.md) - Visão arquitetural completa
- [Guia de Desenvolvimento](./docs/DEVELOPMENT_GUIDE.md) - Guia para desenvolvedores
- [Desenvolvimento Local](./docs/setup/LOCAL_DEVELOPMENT.md) - Setup e workflow local
- [Documentação de APIs](./docs/api/API_DOCUMENTATION.md) - APIs consolidadas
- [Política de Segurança](./docs/security/SECURITY.md) - Segurança do sistema
- [Troubleshooting](./docs/TROUBLESHOOTING.md) - Solução de problemas
- [Guia de Deploy](./docs/deployment/DEPLOYMENT.md) - Processo de deploy
- [Estratégia de Testes](./docs/testing/TESTING_STRATEGY.md) - Estratégia completa de testes
- [Decisões de Design](./docs/architecture/DESIGN_DECISIONS.md) - ADRs (Architecture Decision Records)

### 📊 Diagramas
- [Diagramas do Projeto](./docs/architecture/DIAGRAMAS_PROJETO.md) - Índice de todos os diagramas
- [Diagramas Individuais](./docs/architecture/diagrams/) - Diagramas separados por arquivo

### 🔧 Documentação Técnica
- [Infraestrutura Simplificada](./docs/INFRAESTRUTURA_SIMPLIFICADA.md) - **Abordagem e decisões** ⭐
- [Requisitos e Análise](./docs/REQUIREMENTS.md)
- [Status dos Requisitos](./docs/REQUIREMENTS_STATUS.md)
- [Plano Detalhado](./docs/PLANO_DETALHADO.md)
- [Infraestrutura Kubernetes](./docs/infrastructure/INFRASTRUCTURE_KUBERNETES.md) - Setup K8s
- [Observabilidade](./docs/observability/OBSERVABILITY_COMPLETE.md) - Prometheus + Grafana
- [Race Conditions](./docs/security/RACE_CONDITIONS_SOLUTIONS.md)
- [Testes de Performance](./docs/testing/PERFORMANCE_TESTS.md)
- [Adaptadores AWS](./docs/infrastructure/AWS_ADAPTERS.md) - Preparação para cloud (bonus)
- [Infraestrutura Terraform](./docs/infrastructure/INFRASTRUCTURE_TERRAFORM.md) - IaC (bonus)

### 🎓 Processo Seletivo
- [Kubernetes Quick Start](./docs/KUBERNETES_QUICK_START.md) - **Iniciar tudo no K8s** ⭐
- [Demonstração do Projeto](./docs_ia/DEMONSTRACAO_PROJETO.md) - Guia de demonstração
- [Perguntas Processo Seletivo](./docs_ia/PERGUNTAS_PROCESSO_SELETIVO.md) - Perguntas e respostas

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

### Kubernetes (Produção/Demonstração) ⭐
- `npm run k8s:start` - **Inicia tudo no Kubernetes** (recomendado para demonstração)
- `npm run k8s:stop` - Para e remove cluster Kubernetes
- `npm run k8s:status` - Ver status de pods, serviços e ingress
- `npm run k8s:logs` - Ver logs de um pod (use: `npm run k8s:logs <pod-name>`)
- `npm run k8s:test` - Testa conectividade e saúde dos serviços

### Desenvolvimento Local
- `npm run dev` - Inicia todos os serviços em paralelo (Docker Compose)
- `npm run dev:auth` - Inicia apenas Auth Service
- `npm run dev:students` - Inicia apenas Students Service
- `npm run dev:spaces` - Inicia apenas Rooms/Spaces Service
- `npm run dev:checkin` - Inicia apenas Check-in Service
- `npm run dev:analytics` - Inicia apenas Analytics Service
- `npm run dev:frontend` - Inicia apenas Frontend Admin

### Seeds e Migrations
- `npm run seed:all` - **Executa todas as migrations e seeds** (recomendado)
- `npm run seed:observability` - Seed apenas para observabilidade
- `perf:seed` - Seed apenas para testes de performance

### Docker (Desenvolvimento Local)
- `npm run docker:up` - Sobe infraestrutura (MySQL, Kafka, Redis, Prometheus, Grafana)
- `npm run docker:down` - Para a infraestrutura
- `npm run docker:logs` - Ver logs dos containers
- `npm run docker:ps` - Lista containers em execução

**Nota**: Sem API Gateway no Docker Compose. Acesse serviços diretamente por porta.

### Testes
- `npm run test` - Executa todos os testes
- `npm run test:e2e` - Testes E2E do frontend
- `npm run test:e2e:ui` - Testes E2E com interface

### Build
- `npm run build` - Build de todos os serviços
- `npm run lint` - Lint de todos os serviços

## 🌐 Acesso aos Serviços

### Kubernetes (Produção/Demonstração)

Todos os serviços via NGINX Ingress em `http://api.localhost`:

| Serviço | URL |
|---------|-----|
| Auth Service | `http://api.localhost/api/v1/auth/health` |
| Students Service | `http://api.localhost/api/v1/students` |
| Rooms Service | `http://api.localhost/api/v1/rooms` |
| Check-in Service | `http://api.localhost/api/v1/checkin` |
| Analytics Service | `http://api.localhost/api/v1/analytics` |

### Docker Compose (Desenvolvimento Local)

Acesso direto por porta:

| Serviço | URL |
|---------|-----|
| Auth Service | `http://localhost:3000/api/v1/auth` |
| Students Service | `http://localhost:3001/api/v1/students` |
| Rooms Service | `http://localhost:3002/api/v1/rooms` |
| Check-in Service | `http://localhost:3003/api/v1/checkin` |
| Analytics Service | `http://localhost:3004/api/v1/analytics` |

## 🌐 Portas Diretas dos Serviços

- **Auth Service:** http://localhost:3000
- **Students Service:** http://localhost:3001
- **Rooms Service:** http://localhost:3002
- **Check-in Service:** http://localhost:3003
- **Analytics Service:** http://localhost:3004
- **Frontend Admin:** http://localhost:5173
- **Frontend Student:** http://localhost:5174
- **Grafana:** http://localhost:3001 (admin/admin)
- **Prometheus:** http://localhost:9090

## 📝 Licença

MIT

## 👤 Autor

Desenvolvido para o processo seletivo PUCPR - 2025
