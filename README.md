# 🏛️ Controle de Espaços de Ensino - PUCPR

Sistema para controle de uso de espaços de ensino com análise de taxa de ocupação.

> **🚀 Quick Start (Desenvolvimento Local):** 
> ```bash
> npm install && npm run setup:env && npm run docker:up && npm run seed:all && npm run dev
> ```
> Isso configura o ambiente, inicia a infraestrutura e serviços localmente!

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

**Infraestrutura (Desenvolvimento Local):**
- **Docker Compose** - Infraestrutura local (MySQL, Kafka, Redis, Prometheus, Grafana)
- **Observabilidade** - Prometheus + Grafana para métricas e monitoramento

**Observabilidade:**
- Prometheus (métricas)
- Grafana (visualização)

### Microsserviços

1. **auth-service** - Autenticação e autorização (Identity Context)
2. **students-service** - Gestão de alunos (Academic Context)
3. **spaces-service** - Gestão de ambientes e registros (Facilities Context)
4. **analytics-service** - Análise e relatórios (Analytics Context)

## 🚀 Como Começar

### Pré-requisitos

**Obrigatórios:**
- **Docker** e **Docker Compose** (versão 2.x ou superior)
- **Node.js** 20 LTS ou superior (com npm 9.x ou superior)

**Verificação rápida:**
```bash
docker --version        # Deve mostrar Docker 24.x ou superior
docker-compose --version # Deve mostrar Docker Compose 2.x ou superior
node --version          # Deve mostrar v20.x ou superior
npm --version           # Deve mostrar 9.x ou superior
```

> **💡 Nota:** Com Docker instalado, você pode rodar toda a infraestrutura (MySQL, Kafka, Redis, Prometheus, Grafana) sem precisar instalar nada adicional. Os serviços Node.js rodam localmente, mas toda a infraestrutura está containerizada.

### Como Começar (Desenvolvimento Local)

```bash
# 1. Clone e instale dependências
git clone <repository-url>
cd controle-espacos-de-ensino
npm install

# 2. Configure variáveis de ambiente (cria .env.local a partir dos env.example)
npm run setup:env

# 3. Suba a infraestrutura (MySQL, Kafka, Redis, Prometheus, Grafana)
npm run docker:up

# 4. Execute migrations e seeds
npm run seed:all

# 5. Inicie todos os serviços
npm run dev
```

**Acesso aos serviços:**
- Auth Service: `http://localhost:3000/api/v1/auth`
- Students Service: `http://localhost:3001/api/v1/students`
- Rooms Service: `http://localhost:3002/api/v1/rooms`
- Check-in Service: `http://localhost:3003/api/v1/checkin`
- Analytics Service: `http://localhost:3004/api/v1/analytics`
- Frontend Admin: `http://localhost:5173`
- Frontend Student: `http://localhost:5174`
- Grafana: `http://localhost:3005` (admin/admin)
- Prometheus: `http://localhost:9090`

**Verificação rápida:**
```bash
# Verificar se os containers estão rodando
npm run docker:ps

# Verificar saúde dos serviços (após npm run dev)
curl http://localhost:3000/health  # Auth
curl http://localhost:3001/health   # Students
curl http://localhost:3002/health   # Rooms
curl http://localhost:3003/health   # Check-in
curl http://localhost:3004/health   # Analytics
```

**Alternativa:** Rodar serviços individuais:
```bash
npm run dev:auth      # Apenas Auth Service
npm run dev:students  # Apenas Students Service
npm run dev:spaces    # Apenas Rooms Service
npm run dev:checkin   # Apenas Check-in Service
npm run dev:analytics # Apenas Analytics Service
npm run dev:frontend  # Apenas Frontend Admin
npm run dev:student   # Apenas Frontend Student
```

> **📘 Para produção:** Veja [Proposta de Deploy para Produção](./docs/deployment/PRODUCTION_DEPLOYMENT.md)

## 📚 Documentação

### 🚀 Início Rápido
- [Desenvolvimento Local](./docs/setup/LOCAL_DEVELOPMENT.md) - Setup e workflow local
- [Guia de Demonstração](./docs/demonstration/DEMONSTRATION_GUIDE.md) - Roteiro completo para demonstrar o projeto
- [Proposta de Deploy para Produção](./docs/deployment/PRODUCTION_DEPLOYMENT.md) - Como fazer deploy em produção

### 📖 Documentação Essencial
- [Arquitetura do Sistema](./docs/architecture/ARCHITECTURE.md) - Visão arquitetural completa
- [Guia de Desenvolvimento](./docs/DEVELOPMENT_GUIDE.md) - Guia para desenvolvedores
- [Documentação de APIs](./docs/api/API_DOCUMENTATION.md) - APIs consolidadas
- [Estratégia de Testes](./docs/testing/TESTING_STRATEGY.md) - Estratégia completa de testes
- [Decisões de Design](./docs/architecture/DESIGN_DECISIONS.md) - ADRs (Architecture Decision Records)
- [Troubleshooting](./docs/TROUBLESHOOTING.md) - Solução de problemas

### 📊 Avaliação e Status
- [Status do Projeto](./docs/status/PROJECT_STATUS.md) - Estado atual e funcionalidades implementadas
- [Checklist de Funcionalidades](./docs/checklist/FEATURES_CHECKLIST.md) - Verificação completa de features
- [Avaliação do Usuário Final](./docs/evaluation/USER_EVALUATION.md) - Perspectiva do gestor de espaços

### 🔧 Documentação Técnica
- [Infraestrutura Local](./docs/INFRAESTRUTURA_SIMPLIFICADA.md) - Abordagem e decisões
- [Requisitos e Análise](./docs/REQUIREMENTS.md) - Requisitos do case
- [Status dos Requisitos](./docs/REQUIREMENTS_STATUS.md) - Status de implementação
- [Observabilidade](./docs/observability/OBSERVABILITY_COMPLETE.md) - Prometheus + Grafana
- [Testes de Performance](./docs/testing/PERFORMANCE_TESTS.md) - Testes de carga e stress
- [Política de Segurança](./docs/security/SECURITY.md) - Segurança do sistema
- [Race Conditions](./docs/security/RACE_CONDITIONS_SOLUTIONS.md) - Soluções para concorrência

### 📊 Diagramas e Visualizações
- [Diagramas do Projeto](./docs/architecture/DIAGRAMAS_PROJETO.md) - Índice de todos os diagramas
- [Diagramas Individuais](./docs/architecture/diagrams/) - Diagramas separados por arquivo

### 🔗 Referências Adicionais
- [Mapa de Endpoints](./docs_ia/MAPA_COMPLETO_ENDPOINTS_E_PORTAS.md) - Referência rápida de APIs
- [FAQ do Processo Seletivo](./docs_ia/PERGUNTAS_PROCESSO_SELETIVO.md) - Perguntas e respostas
- [Guia de Contribuição](./docs/CONTRIBUTING.md) - Como contribuir com o projeto
- [Guia de Deploy](./docs/deployment/DEPLOYMENT.md) - Processo de deploy
- [Plano Detalhado](./docs/PLANO_DETALHADO.md) - Plano de implementação completo

> **Nota:** A pasta `docs_ia/` contém documentação de contexto para desenvolvimento com IA. A documentação oficial e pública está em `docs/`.

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
│   └── docker/
├── shared/                # Código compartilhado
│   ├── types/
│   ├── events/
│   └── utils/
└── docs/                  # Documentação
```

## 🔧 Scripts Disponíveis

### Desenvolvimento Local
- `npm run dev` - Inicia todos os serviços em paralelo (Docker Compose)
- `npm run dev:auth` - Inicia apenas Auth Service
- `npm run dev:students` - Inicia apenas Students Service
- `npm run dev:spaces` - Inicia apenas Rooms/Spaces Service
- `npm run dev:checkin` - Inicia apenas Check-in Service
- `npm run dev:analytics` - Inicia apenas Analytics Service
- `npm run dev:frontend` - Inicia apenas Frontend Admin

### Setup e Configuração
- `npm run setup:env` - **Cria arquivos .env.local a partir dos env.example** (execute após clonar)
- `npm run seed:all` - **Executa todas as migrations e seeds** (recomendado)
- `npm run seed:observability` - Seed apenas para observabilidade
- `perf:seed` - Seed apenas para testes de performance

### Docker (Infraestrutura)
- `npm run docker:up` - Sobe infraestrutura (MySQL, Kafka, Redis, Prometheus, Grafana)
- `npm run docker:down` - Para a infraestrutura
- `npm run docker:logs` - Ver logs dos containers
- `npm run docker:ps` - Lista containers em execução

### Testes
- `npm run test` - Executa todos os testes
- `npm run test:e2e` - Testes E2E do frontend
- `npm run test:e2e:ui` - Testes E2E com interface

### Build
- `npm run build` - Build de todos os serviços
- `npm run lint` - Lint de todos os serviços

## 🌐 Acesso aos Serviços (Desenvolvimento Local)

| Serviço | URL |
|---------|-----|
| Auth Service | `http://localhost:3000/api/v1/auth` |
| Students Service | `http://localhost:3001/api/v1/students` |
| Rooms Service | `http://localhost:3002/api/v1/rooms` |
| Check-in Service | `http://localhost:3003/api/v1/checkin` |
| Analytics Service | `http://localhost:3004/api/v1/analytics` |
| Frontend Admin | `http://localhost:5173` |
| Frontend Student | `http://localhost:5174` |
| Grafana | `http://localhost:3005` (admin/admin) |
| Prometheus | `http://localhost:9090` |

> **📘 Para produção:** Veja [Proposta de Deploy para Produção](./docs/deployment/PRODUCTION_DEPLOYMENT.md)

## 🔧 Troubleshooting

### Problemas Comuns

**1. Erro ao executar `npm install`:**
```bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

**2. Containers não iniciam:**
```bash
# Verificar se Docker está rodando
docker ps

# Ver logs dos containers
npm run docker:logs

# Parar e reiniciar
npm run docker:down
npm run docker:up
```

**3. Erro de conexão com banco de dados:**
```bash
# Verificar se os containers MySQL estão rodando
npm run docker:ps

# Aguardar alguns segundos após subir os containers (MySQL precisa de tempo para inicializar)
# Depois executar migrations novamente
npm run seed:all
```

**4. Porta já em uso:**
```bash
# Verificar qual processo está usando a porta
lsof -i :3000  # Para porta 3000, ajuste conforme necessário

# Parar o processo ou alterar a porta no .env.local do serviço
```

**5. Arquivos .env.local não encontrados:**
```bash
# Executar o script de setup
npm run setup:env
```

**6. Migrations falham:**
```bash
# Verificar se os bancos de dados estão acessíveis
# Aguardar alguns segundos após subir os containers
# Executar migrations novamente
npm run seed:all
```

Para mais detalhes, consulte [Troubleshooting](./docs/TROUBLESHOOTING.md).

## 📝 Licença

MIT

## 👤 Autor

Desenvolvido para o processo seletivo PUCPR - 2025
