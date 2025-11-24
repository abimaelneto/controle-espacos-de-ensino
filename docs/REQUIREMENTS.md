# 📋 Documento de Requisitos e Análise - Controle de Espaços de Ensino

## 📊 Status do Projeto

**Data de Criação:** 2025-01-XX  
**Status Atual:** 📝 Planejamento e Definição de Requisitos  
**Última Atualização:** 2025-01-XX

---

## 🎯 1. Análise do Case

### 1.1. Objetivo Principal
Desenvolver uma aplicação web para **controlar o uso de espaços de ensino** com foco em:
- Registro de entrada e saída de alunos
- Análise da taxa de ocupação dos ambientes
- Gestão de diferentes tipos de ambientes (sala de aula, laboratório, sala de estudos)

### 1.2. Requisitos Obrigatórios
- ✅ CRUD completo para cadastro de alunos
- ✅ Registro de entrada e saída dos ambientes
- ✅ API REST com autenticação via token
- ✅ Autorização adequada para operações
- ✅ Back-end: Java (Spring) **ou** Node.js
- ✅ Front-end: React **ou** Angular
- ✅ Persistência de dados (banco de dados)

### 1.3. Critérios de Avaliação
- Organização e clareza do código
- Boas práticas (estrutura, padrões, segurança)
- Documentação mínima para execução
- Qualidade da solução (funcionalidade, usabilidade)
- Criatividade nas regras de negócio

---

## 🏗️ 2. Arquitetura Proposta

### 2.1. Visão Geral - Microsserviços

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (SPA)                        │
│                    React ou Angular                          │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ HTTPS/REST API
                       │
┌──────────────────────┴──────────────────────────────────────┐
│                    API Gateway                               │
│              (Autenticação/Autorização)                     │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
┌───────▼──────┐ ┌────▼─────┐ ┌─────▼──────┐
│   Auth       │ │  Students│ │  Spaces    │
│   Service    │ │  Service │ │  Service   │
└───────┬──────┘ └────┬─────┘ └─────┬──────┘
        │             │              │
┌───────▼──────┐ ┌────▼─────┐ ┌─────▼──────┐
│   Redis      │ │  MySQL   │ │  MySQL    │
│   (Sessions) │ │          │ │           │
└──────────────┘ └──────────┘ └───────────┘
```

### 2.2. Microsserviços Propostos

1. **Auth Service** - Autenticação e autorização
2. **Students Service** - CRUD de alunos
3. **Spaces Service** - Gestão de ambientes e registros de entrada/saída
4. **Analytics Service** (opcional) - Análise de ocupação

---

## 📐 3. Regras de Negócio

### 3.1. Entidades Principais

#### **Aluno**
- ID único
- Nome completo
- CPF (único, validado)
- Email (único, validado)
- Matrícula (único)
- Data de cadastro
- Status (ativo/inativo)

#### **Ambiente de Ensino**
- ID único
- Nome/Identificação
- Tipo (Sala de Aula, Laboratório, Sala de Estudos)
- Capacidade máxima
- Localização (bloco, andar, número)
- Status (disponível/indisponível/manutenção)
- Horários de funcionamento

#### **Registro de Presença**
- ID único
- Aluno (FK)
- Ambiente (FK)
- Data/Hora de entrada
- Data/Hora de saída (nullable)
- Status (dentro/fora)
- Tempo de permanência (calculado)

### 3.2. Regras de Negócio Detalhadas

#### **Cadastro de Alunos**
- ✅ CPF deve ser único e válido
- ✅ Email deve ser único e válido
- ✅ Matrícula deve ser única
- ✅ Campos obrigatórios: Nome, CPF, Email, Matrícula
- ✅ Soft delete (não excluir fisicamente)

#### **Registro de Entrada/Saída**
- ✅ Aluno só pode estar em **um ambiente por vez**
- ✅ Aluno deve estar **ativo** para registrar entrada
- ✅ Ambiente deve estar **disponível** para entrada
- ✅ Ambiente não pode exceder **capacidade máxima**
- ✅ Entrada registra timestamp automático
- ✅ Saída registra timestamp e calcula tempo de permanência
- ✅ Aluno deve ter uma entrada antes de registrar saída
- ✅ Não permitir entrada duplicada no mesmo ambiente
- ✅ Validação de horário de funcionamento do ambiente

#### **Análise de Ocupação**
- ✅ Taxa de ocupação = (alunos presentes / capacidade) × 100
- ✅ Relatórios por período (dia, semana, mês)
- ✅ Histórico de uso por ambiente
- ✅ Tempo médio de permanência por ambiente
- ✅ Horários de pico de ocupação

### 3.3. Regras de Segurança
- ✅ Autenticação obrigatória para todas as operações
- ✅ Tokens JWT com expiração
- ✅ Refresh tokens para renovação
- ✅ Roles/Permissões:
  - **Admin**: CRUD completo, relatórios
  - **Aluno**: Registrar própria entrada/saída, visualizar próprio histórico
  - **Monitor**: Visualizar ocupação em tempo real
- ✅ Validação de entrada (sanitização, validação de tipos)
- ✅ Rate limiting nas APIs
- ✅ Logs de auditoria para operações críticas

---

## 🚀 4. Três Planos de Tecnologias e Funcionalidades

### 📦 PLANO 1: ESSENCIAL (MVP Focado)

**Filosofia:** Entregar o mínimo viável com qualidade, demonstrando conhecimento sólido das tecnologias obrigatórias.

#### **Stack Tecnológica**
- **Back-end:** Node.js + Express + TypeScript
- **Front-end:** React + TypeScript + Vite
- **Banco de Dados:** MySQL (relacional)
- **Autenticação:** JWT (JSON Web Tokens)
- **Containerização:** Docker + Docker Compose
- **Testes:** Jest (backend) + React Testing Library (frontend)
- **CI/CD:** GitHub Actions (básico)

#### **Microsserviços**
- **Auth Service** (Node.js)
- **Students Service** (Node.js)
- **Spaces Service** (Node.js)

#### **Funcionalidades**
- ✅ CRUD de alunos
- ✅ CRUD de ambientes
- ✅ Registro de entrada/saída
- ✅ Dashboard básico com taxa de ocupação em tempo real
- ✅ Autenticação e autorização
- ✅ Validações de negócio essenciais

#### **Infraestrutura**
- Docker Compose local
- Deploy manual ou via GitHub Actions simples
- Banco MySQL único (um por serviço ou compartilhado)

#### **Testes**
- Testes unitários (cobertura ~70%)
- Testes de integração básicos
- Testes E2E do frontend (Playwright ou Cypress)

#### **Documentação**
- README com instruções de setup
- Swagger/OpenAPI para APIs
- Documentação de arquitetura básica

**✅ Vantagens:**
- Foco em qualidade do código
- Entrega rápida
- Demonstra conhecimento das tecnologias obrigatórias
- Fácil de rodar localmente

**⚠️ Desvantagens:**
- Não demonstra conhecimento avançado de cloud
- Não utiliza todos os conceitos da vaga (Kafka, observabilidade avançada)

---

### 🎯 PLANO 2: INTERMEDIÁRIO (Valor Estratégico)

**Filosofia:** Demonstrar conhecimento de cloud, observabilidade e padrões avançados sem complicar demais.

#### **Stack Tecnológica**
- **Back-end:** Node.js + **NestJS** + TypeScript
- **Front-end:** React + TypeScript + Vite
- **UI Components:** **shadcn/ui** (Tailwind CSS)
- **State Management:** **Zustand**
- **Banco de Dados:** 
  - MySQL (dados relacionais) - Adaptável para RDS
  - Redis (cache e sessões) - Adaptável para ElastiCache
- **Autenticação:** JWT + Refresh Tokens
- **Mensageria:** **Kafka** - Adaptável para MSK
- **Containerização:** Docker + Kubernetes (minikube local)
- **API Gateway:** **Traefik**
- **Cloud:** **AWS** (adaptável, desenvolvimento local)
- **Arquitetura:** **DDD + Ports and Adapters (Hexagonal)**
- **Observabilidade:** 
  - Prometheus + Grafana (métricas)
  - Winston/Pino (logs estruturados) - Adaptável para CloudWatch
- **Testes:** Jest + Supertest + React Testing Library + Playwright
- **CI/CD:** GitHub Actions completo

#### **Microsserviços**
- **API Gateway** (Kong ou Traefik)
- **Auth Service** (Node.js)
- **Students Service** (Node.js)
- **Spaces Service** (Node.js)
- **Analytics Service** (Node.js) - Processa eventos de ocupação

#### **Funcionalidades**
- ✅ Tudo do Plano 1
- ✅ Dashboard avançado com gráficos (Chart.js ou Recharts)
- ✅ Relatórios de ocupação (PDF export)
- ✅ Notificações em tempo real (WebSockets)
- ✅ Cache de consultas frequentes (Redis)
- ✅ Processamento assíncrono de eventos (RabbitMQ)
- ✅ Métricas de performance e saúde dos serviços

#### **Infraestrutura**
- Kubernetes local (minikube) ou EKS/AKS na cloud
- Banco MySQL por serviço (ou compartilhado com schemas separados)
- Redis para cache
- RabbitMQ para mensageria
- Deploy automatizado via CI/CD

#### **Testes**
- Testes unitários (cobertura ~80%)
- Testes de integração completos
- Testes E2E do frontend
- Testes de carga básicos (Artillery ou k6)

#### **Documentação**
- README completo com setup
- Swagger/OpenAPI detalhado
- Documentação de arquitetura
- Diagramas (C4 Model ou similar)
- Guia de deploy na cloud

**✅ Vantagens:**
- Demonstra conhecimento de cloud e Kubernetes
- Mostra uso de mensageria e observabilidade
- Valor estratégico alto
- Ainda gerenciável em termos de complexidade

**⚠️ Desvantagens:**
- Mais tempo de desenvolvimento
- Requer conhecimento de Kubernetes e cloud
- Setup mais complexo

---

### 🚀 PLANO 3: AVANÇADO (Máximo Impacto)

**Filosofia:** Demonstrar domínio completo das tecnologias mencionadas na vaga, incluindo DDD, Kafka, observabilidade completa.

#### **Stack Tecnológica**
- **Back-end:** Node.js + Express + TypeScript + DDD
- **Front-end:** React + TypeScript + Vite
- **Banco de Dados:** 
  - MySQL (dados relacionais)
  - MongoDB (logs e eventos)
  - Redis (cache e sessões)
- **Autenticação:** JWT + Refresh Tokens + OAuth2
- **Mensageria:** Apache Kafka
- **Containerização:** Docker + Kubernetes
- **Cloud:** AWS/Azure/GCP (múltiplos serviços)
- **Observabilidade:** 
  - Prometheus + Grafana
  - ELK Stack (Elasticsearch, Logstash, Kibana) ou Loki
  - Jaeger ou Zipkin (tracing distribuído)
  - Datadog ou New Relic (APM)
- **Testes:** Jest + Supertest + React Testing Library + Playwright + K6
- **CI/CD:** GitHub Actions + ArgoCD (GitOps)

#### **Microsserviços (DDD)**
- **API Gateway** (Kong/Traefik)
- **Auth Service** (DDD - Bounded Context: Identity)
- **Students Service** (DDD - Bounded Context: Academic)
- **Spaces Service** (DDD - Bounded Context: Facilities)
- **Analytics Service** (DDD - Bounded Context: Analytics)
- **Notification Service** (DDD - Bounded Context: Notifications)

#### **Funcionalidades**
- ✅ Tudo do Plano 2
- ✅ Event Sourcing para registros de presença
- ✅ CQRS (Command Query Responsibility Segregation)
- ✅ Saga Pattern para transações distribuídas
- ✅ Circuit Breaker (resiliência)
- ✅ Retry policies
- ✅ Rate limiting avançado
- ✅ Dashboard executivo com KPIs
- ✅ Machine Learning básico (previsão de ocupação)
- ✅ API GraphQL (além de REST)

#### **Infraestrutura**
- Kubernetes em cloud (EKS/AKS/GKE)
- Service Mesh (Istio ou Linkerd)
- Banco MySQL por serviço (microservices database pattern)
- Kafka cluster
- MongoDB para eventos
- Redis cluster
- CDN para frontend
- Load balancer
- Auto-scaling configurado

#### **Testes**
- Testes unitários (cobertura ~90%)
- Testes de integração completos
- Testes E2E completos
- Testes de carga e stress
- Testes de chaos engineering básicos
- Testes de segurança (OWASP)

#### **Documentação**
- README completo
- Swagger/OpenAPI + GraphQL schema
- Documentação de arquitetura completa (C4 Model)
- ADRs (Architecture Decision Records)
- Runbooks operacionais
- Guia de troubleshooting
- Documentação de observabilidade

**✅ Vantagens:**
- Demonstra domínio completo das tecnologias da vaga
- Máximo impacto na avaliação
- Mostra conhecimento de arquitetura avançada
- Diferenciação clara dos outros candidatos

**⚠️ Desvantagens:**
- Complexidade muito alta
- Tempo de desenvolvimento extenso
- Risco de over-engineering
- Pode ser difícil de rodar localmente
- Pode parecer excessivo para o escopo do case

---

## 📊 5. Comparação dos Planos

| Aspecto | Plano 1: Essencial | Plano 2: Intermediário | Plano 3: Avançado |
|---------|-------------------|------------------------|-------------------|
| **Tempo de Desenvolvimento** | 2-3 semanas | 4-5 semanas | 6-8 semanas |
| **Complexidade** | Baixa | Média | Alta |
| **Demonstra Cloud** | ❌ | ✅ | ✅✅ |
| **Demonstra Kubernetes** | ❌ | ✅ | ✅✅ |
| **Demonstra Mensageria** | ❌ | ✅ (RabbitMQ) | ✅✅ (Kafka) |
| **Demonstra Observabilidade** | ❌ | ✅ (Básica) | ✅✅ (Completa) |
| **Demonstra DDD** | ❌ | ❌ | ✅ |
| **Facilidade de Setup** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| **Valor para Avaliação** | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Risco de Over-engineering** | Baixo | Médio | Alto |

---

## 🎯 6. Decisão e Plano Escolhido

### **✅ DECISÃO: PLANO 2 (Intermediário) COM DDD**

**Plano Escolhido:** Plano 2 - Intermediário com Domain-Driven Design

**Justificativa:**
1. ✅ Demonstra conhecimento de cloud e Kubernetes (requisitos da vaga)
2. ✅ Mostra uso de mensageria (Kafka) e observabilidade (conceitos importantes)
3. ✅ Implementa DDD no backend (requisito da vaga)
4. ✅ Não é over-engineering para o escopo do case
5. ✅ Ainda é gerenciável em termos de tempo e complexidade
6. ✅ Diferenciação clara sem complicar demais
7. ✅ Permite focar em qualidade do código e testes
8. ✅ Terraform para IaC (demonstra conhecimento de DevOps)

### **Ajustes Aplicados no Plano 2:**
- ✅ **DDD completo** no backend (Bounded Contexts, Aggregates, Value Objects, Domain Services)
- ✅ **Ports and Adapters (Hexagonal Architecture)** para máxima adaptabilidade
- ✅ **NestJS** como framework backend (facilita estrutura e injeção de dependências)
- ✅ **Kafka** para mensageria (alinhado com requisitos da vaga)
- ✅ **shadcn/ui** para UI (design customizável da PUCPR)
- ✅ **Zustand** para state management (simples e eficiente)
- ✅ **Traefik** como API Gateway
- ✅ **Terraform** para Infrastructure as Code
- ✅ **Adaptadores para AWS** (RDS, ElastiCache, MSK, CloudWatch) - desenvolvimento local, deploy cloud-ready
- ✅ **Ambiente local** (Minikube/Kind) para não gastar com cloud
- ✅ Foco em **qualidade dos testes** e **documentação clara**

### **📄 Documentação Detalhada:**
Para detalhes completos do plano, consulte: **[PLANO_DETALHADO.md](./PLANO_DETALHADO.md)**

O documento detalhado inclui:
- Arquitetura DDD completa
- Modelo de domínio detalhado
- Estrutura de pastas
- Sequência de setup passo a passo
- Stack tecnológica detalhada
- Estratégia de testes
- Timeline de desenvolvimento

---

## 📝 7. Funcionalidades Adicionais (Criatividade)

### 7.1. Funcionalidades que Agregam Valor

1. **Dashboard em Tempo Real**
   - Visualização de ocupação atual por ambiente
   - Gráficos de histórico
   - Alertas de capacidade

2. **QR Code para Registro**
   - Alunos escaneiam QR code na entrada/saída
   - Mais rápido e prático

3. **Relatórios e Exportação**
   - Relatórios de ocupação por período
   - Exportação em PDF/Excel
   - Gráficos de tendências

4. **Notificações**
   - Alerta quando ambiente está próximo da capacidade
   - Notificação para aluno sobre tempo de permanência

5. **Histórico Pessoal**
   - Aluno visualiza seu próprio histórico de uso
   - Estatísticas pessoais (tempo total, ambientes mais usados)

6. **Gestão de Horários**
   - Configuração de horários de funcionamento por ambiente
   - Bloqueio automático fora do horário

### 7.2. Funcionalidades Avançadas (Opcional)

1. **Previsão de Ocupação** (ML básico)
2. **Reserva de Ambientes** (futuro)
3. **Integração com Sistema Acadêmico** (futuro)
4. **App Mobile** (futuro)

---

## 🧪 8. Estratégia de Testes

### 8.1. Backend
- **Unitários:** Jest (cada função/método)
- **Integração:** Supertest (APIs end-to-end)
- **E2E:** Testes de fluxos completos
- **Carga:** k6 ou Artillery (opcional)

### 8.2. Frontend
- **Unitários:** Jest + React Testing Library
- **Integração:** Testes de componentes
- **E2E:** Playwright ou Cypress
- **Acessibilidade:** axe-core

### 8.3. Cobertura Mínima
- **Plano 1:** 70%
- **Plano 2:** 80%
- **Plano 3:** 90%

---

## 📚 9. Documentação Necessária

### 9.1. Documentação Técnica
- [ ] README.md principal
- [ ] README.md por microsserviço
- [ ] Swagger/OpenAPI para cada API
- [ ] Diagramas de arquitetura
- [ ] Diagramas de sequência (fluxos principais)
- [ ] Guia de setup e instalação
- [ ] Guia de deploy
- [ ] ADRs (Architecture Decision Records) - se Plano 2 ou 3

### 9.2. Documentação de Negócio
- [ ] Regras de negócio documentadas
- [ ] Modelo de dados (ERD)
- [ ] User stories (opcional)

---

## 🔄 10. Próximos Passos

### Fase 1: Definição ✅
- [x] Análise do case
- [x] Definição de requisitos
- [x] Criação deste documento
- [x] **Decisão sobre qual plano seguir** → Plano 2 com DDD
- [x] Criação do plano detalhado

### Fase 2: Setup Inicial
- [ ] Setup do repositório (monorepo ou multi-repo)
- [ ] Configuração de CI/CD básico
- [ ] Estrutura de pastas
- [ ] Configuração de Docker

### Fase 3: Desenvolvimento
- [ ] Auth Service
- [ ] Students Service
- [ ] Spaces Service
- [ ] Frontend
- [ ] Testes
- [ ] Documentação

### Fase 4: Deploy e Finalização
- [ ] Deploy na cloud
- [ ] Testes finais
- [ ] Documentação final
- [ ] Apresentação

---

## 📌 11. Decisões Técnicas

### ✅ Decisões Tomadas:
1. **Plano:** Plano 2 - Intermediário com DDD ✅
2. **Frontend:** React + TypeScript ✅
3. **Backend:** Node.js + TypeScript + Express ✅
4. **Arquitetura:** Monorepo ✅
5. **Mensageria:** Kafka ✅
6. **Infraestrutura:** Terraform + Kubernetes local (Minikube/Kind) ✅
7. **DDD:** Implementação completa no backend ✅

### ✅ Decisões Técnicas Finalizadas:
1. **Framework Backend:** NestJS ✅
2. **State Management (Frontend):** Zustand ✅
3. **UI Library:** shadcn/ui ✅
4. **API Gateway:** Traefik ✅
5. **Arquitetura:** DDD + Ports and Adapters (Hexagonal Architecture) ✅
6. **Cloud:** AWS (adaptável, mas desenvolvimento local) ✅

### ⏳ Decisões Pendentes:
1. **ORM:** TypeORM ou Prisma? (Recomendação: TypeORM - mais alinhado com DDD e NestJS)
2. **Mensageria Local:** Kafka via Docker ou MSK Local? (Recomendação: Kafka via Docker)
3. **Cache:** Redis local ou ElastiCache adaptável? (Recomendação: Redis local com adaptador para ElastiCache)

---

## 📅 12. Timeline Estimada

**Prazo Final:** 24/11/2025 às 08:00

### Plano 1: Essencial
- Semana 1-2: Desenvolvimento
- Semana 3: Testes e documentação

### Plano 2: Intermediário (Escolhido) ✅
- **Semana 1:** Setup e infraestrutura (Docker, Terraform, K8s)
- **Semana 2:** Auth Service (DDD completo)
- **Semana 3:** Students Service (DDD completo)
- **Semana 4:** Spaces Service (DDD completo + Kafka)
- **Semana 5:** Analytics Service + Frontend básico
- **Semana 6:** Observabilidade, testes finais e documentação

### Plano 3: Avançado
- Semana 1-2: Setup e arquitetura
- Semana 3-5: Desenvolvimento
- Semana 6-7: Testes e observabilidade
- Semana 8: Documentação e ajustes finais

---

**Última atualização:** 2025-01-XX  
**Próxima revisão:** Após decisão do plano

