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
- Registro de entrada e saída de alunos (check-in/check-out)
- Análise da taxa de ocupação dos ambientes
- Gestão de diferentes tipos de ambientes (sala de aula, laboratório, sala de estudos)
- Dashboard em tempo real com métricas de uso

## 🏗️ Arquitetura

### Stack Tecnológica

**Backend:**
- NestJS + TypeScript
- DDD (Domain-Driven Design)
- Ports and Adapters (Hexagonal Architecture)
- TypeORM + MySQL (database per service)
- Kafka para mensageria assíncrona
- Redis para cache, locks distribuídos e idempotência

**Frontend:**
- React + TypeScript + Vite
- shadcn/ui + Tailwind CSS
- Zustand para state management
- TanStack Query para data fetching

**Infraestrutura (Desenvolvimento Local):**
- **Docker Compose** - Infraestrutura local (MySQL, Kafka, Redis, Prometheus, Grafana)
- **Observabilidade** - Prometheus + Grafana para métricas e monitoramento

### Microsserviços

O sistema é composto por **5 microsserviços independentes**, cada um com seu próprio banco de dados:

1. **auth-service** (Porta 3000) - Autenticação e autorização (Identity Context)
   - JWT tokens, refresh tokens, roles e permissões
   - Gera tokens JWT que são validados por outros serviços
   - Banco: `identity` (MySQL na porta 3306)

2. **students-service** (Porta 3001) - Gestão de alunos (Academic Context)
   - CRUD de alunos, validação de dados acadêmicos
   - Protegido com JWT authentication e role-based authorization
   - Banco: `academic` (MySQL na porta 3307)

3. **rooms-service** (Porta 3002) - Gestão de salas e ambientes (Facilities Context)
   - CRUD de salas, tipos de ambiente, capacidade
   - Protegido com JWT authentication e role-based authorization
   - Banco: `facilities` (MySQL na porta 3308)

4. **checkin-service** (Porta 3003) - Registro de entrada e saída (Attendance Context)
   - Check-in/check-out de alunos, validação de capacidade
   - Protegido com JWT authentication e role-based authorization
   - Proteções contra race conditions (locks distribuídos, idempotência)
   - Banco: `facilities` (compartilhado com rooms-service)

5. **analytics-service** (Porta 3004) - Análise e relatórios (Analytics Context)
   - Métricas de ocupação, dashboards, estatísticas
   - Protegido com JWT authentication e role-based authorization
   - Consome eventos do Kafka para processamento assíncrono
   - Banco: `analytics` (MySQL na porta 3309)

### Frontend

- **frontend/admin** (Porta 5173) - Interface administrativa
  - Gestão de alunos, salas, dashboard, analytics
  - Autenticação JWT completa com login, logout e rotas protegidas
  - Interceptors axios para adicionar token automaticamente

- **frontend/student** (Porta 5174) - Interface do estudante
  - Check-in/check-out, seleção de sala
  - Autenticação JWT completa com login e rotas protegidas
  - Interceptors para serviços de check-in e rooms

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

> **🧪 Teste do Zero:** Para testar como se fosse a primeira vez (simulando um avaliador), execute: `npm run test:from-scratch`. Isso limpa tudo e testa o projeto do zero.

### Passo a Passo (Desenvolvimento Local)

```bash
# 1. Clone e instale dependências
git clone <repository-url>
cd controle-espacos-de-ensino
npm install

# 2. Instale dependências de desenvolvimento (tsx para hot-reload)
npm run setup:dev

# 3. Configure variáveis de ambiente (cria .env.local a partir dos env.example)
npm run setup:env

# 4. Suba a infraestrutura (MySQL, Kafka, Redis, Prometheus, Grafana)
npm run docker:up

# 5. Aguarde alguns segundos para MySQL inicializar completamente
# (importante: MySQL precisa de tempo para estar pronto)

# 6. Execute migrations e seeds (cria dados iniciais)
npm run seed:all

# 7. Inicie todos os serviços (em outro terminal)
npm run dev

# 8. Aguarde 30-60 segundos para serviços iniciarem
# O usuário admin já foi criado pelo seed:all (passo 6)
# Se precisar criar manualmente ou se o login falhar, execute:
# node scripts/create-admin-user.js

# 9. Acesse o frontend admin e faça login:
# URL: http://localhost:5173
# Email: admin@observability.local
# Senha: Admin123!
#
# Se receber "credenciais inválidas":
# - Execute: node scripts/create-admin-user.js (cria/recria o usuário)
# - Aguarde alguns segundos após criar o usuário antes de tentar login
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

**Swagger (Documentação da API):**
- Auth: `http://localhost:3000/api/docs`
- Students: `http://localhost:3001/api/docs`
- Rooms: `http://localhost:3002/api/docs`
- Check-in: `http://localhost:3003/api/docs`
- Analytics: `http://localhost:3004/api/docs`

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
- [Guia de Demonstração](./docs/demonstration/DEMONSTRATION_GUIDE.md) - **Roteiro completo para demonstrar o projeto** ⭐
- [Desenvolvimento Local](./docs/setup/LOCAL_DEVELOPMENT.md) - Setup e workflow local
- [Proposta de Deploy para Produção](./docs/deployment/PRODUCTION_DEPLOYMENT.md) - Como fazer deploy em produção

### 📖 Documentação Essencial
- [Arquitetura do Sistema](./docs/architecture/ARCHITECTURE.md) - Visão arquitetural completa
- [Guia de Desenvolvimento](./docs/DEVELOPMENT_GUIDE.md) - Guia para desenvolvedores
- [Guia de Autenticação JWT](./docs/security/AUTHENTICATION.md) - **Autenticação e autorização completa** ⭐
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
- [Guia de Autenticação JWT](./docs/security/AUTHENTICATION.md) - **Autenticação e autorização** ⭐
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
│   ├── auth-service/      # Porta 3000 - Identity Context
│   ├── students-service/   # Porta 3001 - Academic Context
│   ├── rooms-service/      # Porta 3002 - Facilities Context
│   ├── checkin-service/    # Porta 3003 - Attendance Context
│   └── analytics-service/  # Porta 3004 - Analytics Context
├── frontend/              # Frontend React
│   ├── admin/             # Porta 5173 - Interface administrativa
│   └── student/           # Porta 5174 - Interface do estudante
├── shared/                # Código compartilhado
│   ├── types/
│   ├── events/
│   └── utils/
├── scripts/               # Scripts auxiliares
│   ├── setup-env.js       # Configura variáveis de ambiente
│   ├── seed-all.js        # Executa migrations e seeds
│   └── test-from-scratch.sh # Testa do zero
├── docs/                  # Documentação
└── docker-compose.yml     # Infraestrutura local
```

## 🔧 Scripts Disponíveis

### 🚀 Quick Start (Ordem Recomendada)
1. `npm run setup:env` - **Configura variáveis de ambiente** (primeiro passo após clonar)
2. `npm run docker:up` - **Sobe infraestrutura** (MySQL, Kafka, Redis, Prometheus, Grafana)
3. `npm run seed:all` - **Executa migrations e seeds** (cria dados iniciais)
4. `npm run dev` - **Inicia todos os serviços** (backend + frontend)

### 🧹 Setup e Limpeza
- `npm run setup:dev` - Instala dependências de desenvolvimento (tsx) em todos os serviços
- `npm run setup:env` - Cria arquivos `.env.local` a partir dos `env.example`
- `npm run seed:all` - Executa todas as migrations e seeds
- `npm run test:from-scratch` - **Testa o projeto do zero** (limpa tudo e testa como avaliador)
- `npm run clean:all` - Limpa tudo (containers, node_modules, .env.local, etc.)

### 🐳 Docker (Infraestrutura)
- `npm run docker:up` - Sobe infraestrutura (MySQL, Kafka, Redis, Prometheus, Grafana)
- `npm run docker:down` - Para a infraestrutura
- `npm run docker:logs` - Ver logs dos containers
- `npm run docker:ps` - Lista containers em execução

### 💻 Desenvolvimento
- `npm run dev` - Inicia todos os serviços em paralelo
- `npm run dev:auth` - Apenas Auth Service
- `npm run dev:students` - Apenas Students Service
- `npm run dev:spaces` - Apenas Rooms Service
- `npm run dev:checkin` - Apenas Check-in Service
- `npm run dev:analytics` - Apenas Analytics Service
- `npm run dev:frontend` - Apenas Frontend Admin
- `npm run dev:student` - Apenas Frontend Student

### 🧪 Testes
- `npm run test` - Executa todos os testes
- `npm run test:e2e` - Testes E2E do frontend
- `npm run test:e2e:ui` - Testes E2E com interface

### 🏗️ Build e Qualidade
- `npm run build` - Build de todos os serviços
- `npm run lint` - Lint de todos os serviços

## 🌐 Acesso aos Serviços (Desenvolvimento Local)

| Serviço | URL | Descrição |
|---------|-----|-----------|
| Auth Service | `http://localhost:3000/api/v1/auth` | Autenticação e autorização |
| Students Service | `http://localhost:3001/api/v1/students` | Gestão de alunos |
| Rooms Service | `http://localhost:3002/api/v1/rooms` | Gestão de salas |
| Check-in Service | `http://localhost:3003/api/v1/checkin` | Check-in/check-out |
| Analytics Service | `http://localhost:3004/api/v1/analytics` | Análise e relatórios |
| Frontend Admin | `http://localhost:5173` | Interface administrativa |
| Frontend Student | `http://localhost:5174` | Interface do estudante |
| Grafana | `http://localhost:3005` (admin/admin) | Dashboards e métricas |
| Prometheus | `http://localhost:9090` | Coleta de métricas |

> **📘 Para produção:** Veja [Proposta de Deploy para Produção](./docs/deployment/PRODUCTION_DEPLOYMENT.md)

## 🧪 Teste do Zero (Simulando Avaliador)

Para testar o projeto como se fosse a primeira vez (simulando um avaliador clonando o repo):

### Opção 1: Script Automatizado (Recomendado)

```bash
# Limpa tudo e testa do zero
npm run test:from-scratch
```

Este script:
1. Limpa containers, volumes, node_modules, .env.local
2. Instala dependências
3. Configura variáveis de ambiente
4. Sobe infraestrutura
5. Executa migrations e seeds
6. Verifica saúde dos serviços

### Opção 2: Limpeza Manual

```bash
# Apenas limpar (sem testar)
npm run clean:all

# Depois seguir os passos do README normalmente
npm install
npm run setup:env
npm run docker:up
npm run seed:all
npm run dev
```

### Guia Completo

Para um guia detalhado de teste do zero, consulte:
- [Guia de Teste para Avaliador](./docs_ia/GUIA_TESTE_AVALIADOR.md)

---

## Ressalvas

- Por conta do prazo de entrega, não foi possível garantir a estrutura completa 100% funcional, o que incluiria observabilidade perfeita, monitoramente de saúde dos serviços, teste de stress impecável e testes automatizados com cobertura alta e todos passando. 
- A ideia, de qualquer forma, é demonstrar a valorização dos diversos conceitos de engenharia de software, sem deixar a funcionalidade de lado. 

## ⚠️ Limitações do Projeto

### Contexto de Desenvolvimento

Este projeto foi desenvolvido como **case técnico** para processo seletivo, com foco em demonstrar:
- Conhecimento de arquitetura de microsserviços
- Implementação de DDD e Hexagonal Architecture
- Boas práticas de desenvolvimento
- Observabilidade e monitoramento
- Tratamento de concorrência e race conditions

### Limitações Conhecidas

1. **Ambiente de Desenvolvimento Local**
   - Configurado para desenvolvimento local com Docker Compose
   - Não inclui configuração completa para produção (Kubernetes, etc.)
   - API Gateway (Traefik) documentado mas não implementado para desenvolvimento local

2. **Autenticação e Segurança**
   - ✅ JWT implementado em todos os serviços (backend e frontend)
   - ✅ Autenticação completa com login, logout e rotas protegidas
   - ✅ Role-based authorization (ADMIN, STUDENT, MONITOR)
   - ⚠️ Refresh token automático não implementado no frontend
   - ⚠️ Sem rate limiting implementado
   - ⚠️ Sem validação de CSRF tokens
   - ✅ Senhas armazenadas com hash (bcrypt)
   - ⚠️ Sem política de complexidade forçada

3. **Testes**
   - Cobertura de testes não completa (alguns serviços têm mais testes que outros)
   - Testes E2E do frontend podem falhar intermitentemente
   - Testes de performance disponíveis mas não executados automaticamente

4. **Frontend**
   - Interface funcional mas pode ter melhorias de UX
   - Alguns componentes podem não estar totalmente responsivos
   - Tratamento de erros pode ser melhorado em alguns fluxos

5. **Observabilidade**
   - Prometheus e Grafana configurados, mas alertas não implementados
   - Logs estruturados implementados, mas sem centralização (ELK, etc.)

6. **Performance**
   - Otimizado para desenvolvimento local
   - Não testado com carga real de produção
   - Cache Redis implementado mas pode ser expandido

7. **Documentação**
   - Documentação extensa, mas alguns detalhes podem estar desatualizados
   - Alguns diagramas podem não refletir a implementação final

### O que Funciona Bem

✅ **Arquitetura:**
- Microsserviços bem separados e independentes
- DDD e Hexagonal Architecture implementados corretamente
- Database per service funcionando

✅ **Funcionalidades Core:**
- CRUD de alunos e salas funcionando
- Check-in/check-out implementado e testado
- Validação de capacidade funcionando
- Proteções contra race conditions implementadas

✅ **Observabilidade:**
- Métricas de negócio coletadas
- Dashboards Grafana funcionando
- Prometheus coletando métricas HTTP e de sistema

✅ **Documentação:**
- Swagger em todos os serviços
- Documentação técnica extensa
- Guias de demonstração e troubleshooting

### Recomendações para Produção

Se este projeto fosse para produção, seria necessário:

1. **Infraestrutura:**
   - Configurar Kubernetes ou ECS
   - Implementar API Gateway (Traefik ou AWS API Gateway)
   - Configurar load balancers
   - Implementar service mesh (se necessário)

2. **Segurança:**
   - Implementar rate limiting
   - Adicionar WAF (Web Application Firewall)
   - Configurar HTTPS/TLS
   - Implementar políticas de senha mais rigorosas
   - Adicionar validação de CSRF

3. **Observabilidade:**
   - Centralizar logs (ELK, CloudWatch, etc.)
   - Implementar alertas
   - Adicionar tracing distribuído (Jaeger, etc.)
   - Configurar health checks mais robustos

4. **Testes:**
   - Aumentar cobertura de testes
   - Implementar testes de carga contínuos
   - Adicionar testes de segurança
   - Implementar testes de integração mais abrangentes

5. **Performance:**
   - Otimizar queries de banco de dados
   - Implementar cache mais agressivo
   - Configurar CDN para frontend
   - Implementar paginação em todas as listagens

---

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

Desenvolvido por Abimael Neto para o processo seletivo PUCPR - 2025
