# Arquitetura do Sistema

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Arquitetura de Microsserviços](#arquitetura-de-microsserviços)
- [Arquitetura Hexagonal](#arquitetura-hexagonal)
- [Domain-Driven Design](#domain-driven-design)
- [Comunicação entre Serviços](#comunicação-entre-serviços)
- [Persistência de Dados](#persistência-de-dados)
- [Observabilidade](#observabilidade)
- [Segurança](#segurança)
- [Escalabilidade](#escalabilidade)

## 🎯 Visão Geral

O sistema **Controle de Espaços de Ensino** é uma aplicação distribuída baseada em microsserviços, desenvolvida para gerenciar o uso de espaços de ensino em uma instituição educacional.

### Princípios Arquiteturais

1. **Microsserviços**: Cada serviço é independente e pode ser desenvolvido, testado e deployado separadamente
2. **Domain-Driven Design**: Cada serviço representa um bounded context específico
3. **Arquitetura Hexagonal**: Isolamento do domínio da infraestrutura
4. **Event-Driven**: Comunicação assíncrona via eventos
5. **API-First**: APIs bem definidas e documentadas

## 🏗️ Arquitetura de Microsserviços

### Serviços do Sistema

#### 1. Auth Service (Porta 3000)
**Bounded Context**: Identity

**Responsabilidades**:
- Autenticação de usuários
- Geração e validação de JWT tokens
- Gerenciamento de roles e permissões
- Refresh tokens

**Tecnologias**:
- NestJS + TypeScript
- MySQL (banco de dados próprio)
- JWT para tokens

**APIs Principais**:
- `POST /api/v1/auth/register` - Registro de usuário
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/refresh` - Refresh token

#### 2. Students Service (Porta 3001)
**Bounded Context**: Academic

**Responsabilidades**:
- CRUD de alunos
- Validação de dados acadêmicos (CPF, Matrícula, Email)
- Gestão de status (ACTIVE/INACTIVE)

**Tecnologias**:
- NestJS + TypeScript
- MySQL (banco de dados próprio)
- TypeORM

**APIs Principais**:
- `GET /api/v1/students` - Listar alunos
- `POST /api/v1/students` - Criar aluno
- `GET /api/v1/students/:id` - Buscar aluno
- `PUT /api/v1/students/:id` - Atualizar aluno
- `DELETE /api/v1/students/:id` - Deletar aluno

#### 3. Rooms Service (Porta 3002)
**Bounded Context**: Facilities

**Responsabilidades**:
- CRUD de salas/ambientes
- Gestão de capacidade
- Tipos de sala (CLASSROOM, LABORATORY, AUDITORIUM, STUDY_ROOM)
- Equipamentos

**Tecnologias**:
- NestJS + TypeScript
- MySQL (banco de dados próprio)
- TypeORM

**APIs Principais**:
- `GET /api/v1/rooms` - Listar salas
- `POST /api/v1/rooms` - Criar sala
- `GET /api/v1/rooms/:id` - Buscar sala
- `PUT /api/v1/rooms/:id` - Atualizar sala
- `DELETE /api/v1/rooms/:id` - Deletar sala

#### 4. Check-in Service (Porta 3003)
**Bounded Context**: Attendance

**Responsabilidades**:
- Registro de check-ins
- Validação de capacidade
- Validação de aluno ativo
- Integração com Students e Rooms Services
- Publicação de eventos

**Tecnologias**:
- NestJS + TypeScript
- MySQL (banco de dados próprio)
- Redis (locks e idempotência)
- Kafka (eventos)

**APIs Principais**:
- `POST /api/v1/checkin` - Realizar check-in
- `GET /api/v1/checkin/history` - Histórico de check-ins

**Proteções**:
- Distributed locks (Redis)
- Idempotency keys
- Transações SERIALIZABLE
- Optimistic locking

#### 5. Analytics Service (Porta 3004)
**Bounded Context**: Analytics

**Responsabilidades**:
- Processamento de eventos de check-in
- Cálculo de métricas de ocupação
- Geração de estatísticas
- Dashboards

**Tecnologias**:
- NestJS + TypeScript
- MySQL (banco de dados próprio)
- Kafka Consumer
- Redis (deduplicação de eventos)

**APIs Principais**:
- `GET /api/v1/analytics/rooms/:id/stats` - Estatísticas de sala

## 🔷 Arquitetura Hexagonal

Cada microsserviço segue a arquitetura hexagonal (Ports and Adapters):

```
┌─────────────────────────────────────┐
│      Presentation Layer             │
│  (Controllers, Middleware, DTOs)   │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      Application Layer              │
│  (Use Cases, Application Services)  │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│        Domain Layer                 │
│  (Entities, Value Objects, Events)  │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│     Infrastructure Layer            │
│  (Adapters: Persistence, HTTP,     │
│   Messaging, Cache, Metrics)        │
└─────────────────────────────────────┘
```

### Camadas

1. **Domain Layer (Core)**
   - Entidades de domínio
   - Value Objects
   - Domain Events
   - Domain Services
   - **Sem dependências externas**

2. **Application Layer**
   - Use Cases
   - Application Services
   - DTOs
   - **Depende apenas do Domain**

3. **Infrastructure Layer**
   - Adapters de Persistência (MySQL, TypeORM)
   - Adapters HTTP (Clients para outros serviços)
   - Adapters de Messaging (Kafka)
   - Adapters de Cache (Redis)
   - Adapters de Métricas (Prometheus)
   - **Implementa as interfaces do Domain/Application**

4. **Presentation Layer**
   - Controllers (REST)
   - Middleware (Auth, Validation)
   - **Depende do Application Layer**

## 🎯 Domain-Driven Design

### Bounded Contexts

1. **Identity Context** (Auth Service)
   - User, Role, Permission
   - Autenticação e autorização

2. **Academic Context** (Students Service)
   - Student, CPF, Matricula
   - Dados acadêmicos

3. **Facilities Context** (Rooms Service)
   - Room, RoomType, Equipment
   - Infraestrutura física

4. **Attendance Context** (Check-in Service)
   - Attendance, CheckIn
   - Registro de presença

5. **Analytics Context** (Analytics Service)
   - Metric, Statistics
   - Análise e relatórios

### Integração entre Contextos

- **Check-in Service** integra com **Students** e **Rooms** via HTTP
- **Analytics Service** consome eventos de **Check-in Service** via Kafka
- **Event-Driven Architecture** para desacoplamento

## 🔄 Comunicação entre Serviços

### Síncrona (HTTP/REST)

- **Check-in → Students**: Validação de aluno
- **Check-in → Rooms**: Validação de sala e capacidade

**Características**:
- Via Traefik API Gateway
- Timeout configurado
- Retry com exponential backoff (futuro)
- Circuit breaker (futuro)

### Assíncrona (Kafka)

- **Auth → Analytics**: Eventos de login
- **Students → Analytics**: Eventos de criação/atualização
- **Rooms → Analytics**: Eventos de criação/atualização
- **Check-in → Analytics**: Eventos de check-in

**Características**:
- Event-driven
- Desacoplamento temporal
- Event deduplication (Redis)
- Exactly-once semantics (via deduplicação)

### Eventos Principais

```typescript
// Auth Service
UserCreated
UserLoggedIn

// Students Service
StudentCreated
StudentUpdated

// Rooms Service
RoomCreated
RoomUpdated

// Check-in Service
AttendanceCheckedIn
```

## 💾 Persistência de Dados

### Database per Service

Cada serviço possui seu próprio banco de dados MySQL:

- **auth-service**: `identity` database
- **students-service**: `academic` database
- **rooms-service**: `facilities` database
- **checkin-service**: `attendance` database
- **analytics-service**: `analytics` database

### Benefícios

- Isolamento de dados
- Escalabilidade independente
- Tecnologias diferentes por serviço (se necessário)
- Deploy independente

### Desafios

- Consistência eventual (resolvido via eventos)
- Transações distribuídas (evitadas, uso de eventos)

### Migrations

- TypeORM migrations em cada serviço
- Versionamento de schema
- Rollback suportado

## 📊 Observabilidade

### Métricas (Prometheus)

- **HTTP Metrics**: Request rate, duration, errors
- **Business Metrics**: Check-ins, alunos, salas
- **System Metrics**: CPU, memória, disk

### Logs

- Estruturados (JSON)
- Níveis: error, warn, info, debug
- Contexto incluído (service, requestId, userId)

### Traces (Futuro)

- Distributed tracing
- Request correlation
- Performance analysis

### Dashboards (Grafana)

- Services Overview
- Check-ins Overview
- Room Occupancy
- Students Overview
- Services Performance
- Stress Test Monitor

## 🔒 Segurança

### Autenticação

- JWT tokens
- Refresh tokens
- Token expiration
- Secure storage

### Autorização

- Role-based (RBAC)
- Guards no NestJS
- Validação de permissões

### Proteções

- CORS configurado
- Helmet para headers de segurança
- Validação de input (class-validator)
- SQL injection prevention (TypeORM)
- XSS prevention

### Race Conditions

- Distributed locks (Redis)
- Idempotency keys
- Database transactions (SERIALIZABLE)
- Optimistic locking

## 📈 Escalabilidade

### Horizontal Scaling

- Cada serviço pode ser escalado independentemente
- Stateless services (exceto Analytics que tem estado)
- Load balancing via Traefik

### Vertical Scaling

- Ajuste de recursos por serviço
- Resource limits no Kubernetes

### Caching

- Redis para locks e idempotência
- Cache de resultados (futuro)
- Cache de queries frequentes (futuro)

### Database Scaling

- Read replicas (futuro)
- Sharding (futuro)
- Connection pooling

## 🚀 Deploy

### Ambientes

1. **Local**: Docker Compose
2. **Kubernetes Local**: Kind/Minikube
3. **AWS**: ECS/EKS (Terraform)

### Estratégia

- Blue-Green deployment (futuro)
- Canary releases (futuro)
- Rolling updates (Kubernetes)

## 📚 Referências

- [Diagramas do Projeto](./DIAGRAMAS_PROJETO.md)
- [Arquitetura Hexagonal](./diagrams/03-arquitetura-hexagonal.md)
- [DDD Bounded Contexts](./diagrams/08-ddd-bounded-contexts.md)
- [Race Conditions Solutions](../security/RACE_CONDITIONS_SOLUTIONS.md)

---

**Última atualização**: 2025-01-20

