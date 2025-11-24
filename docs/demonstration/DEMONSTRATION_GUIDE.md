# Guia de Demonstração - Controle de Espaços de Ensino

Este documento fornece um roteiro completo para demonstrar o projeto, requisito por requisito.

## 📊 Status de Conclusão

**Percentual Estimado: ~98%**

- ✅ **Requisitos Obrigatórios**: 100% concluídos
- ✅ **Funcionalidades Principais**: 100% concluídas
- ✅ **Arquitetura**: 100% implementada
- ✅ **Infraestrutura**: 100% implementada (Docker Compose com MySQL/Kafka/Redis, Prometheus, Grafana)
- ✅ **Observabilidade**: 100% implementada
- ✅ **Testes**: ~95% (303+ testes: 253 backend + 50+ E2E frontend)
- ⚠️ **Relatórios Detalhados**: Pendente (exportação PDF/Excel)

## 🚀 Roteiro de Demonstração

### Pré-requisitos

1. **Docker Desktop** rodando
2. **Node.js 20+** instalado
3. **npm** instalado

> **Nota:** Para deploy em produção, veja [Proposta de Deploy para Produção](../deployment/PRODUCTION_DEPLOYMENT.md)

### Passo 1: Infraestrutura Base

#### Opção A: Docker Compose (Recomendado para demonstração rápida)

```bash
# Subir toda a infraestrutura
npm run docker:up

# Verificar serviços
npm run docker:ps

# Ver logs
npm run docker:logs
```

**Serviços disponíveis:**
- MySQL (5 instâncias): ports 3306-3310
- Kafka: port 9092
- Redis: port 6379
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3005 (admin/admin)

> **Nota:** Para deploy em produção com Kubernetes, veja [Proposta de Deploy para Produção](../deployment/PRODUCTION_DEPLOYMENT.md)

### Passo 2: Iniciar Serviços Backend

Em terminais separados:

```bash
# Terminal 1: Auth Service
npm run dev:auth

# Terminal 2: Students Service
npm run dev:students

# Terminal 3: Rooms Service
cd services/rooms-service && npm run start:dev

# Terminal 4: Check-in Service
npm run dev:checkin

# Terminal 5: Analytics Service
npm run dev:analytics
```

**Verificar saúde dos serviços:**
- Auth: http://localhost:3000/health
- Students: http://localhost:3001/health
- Rooms: http://localhost:3002/health
- Check-in: http://localhost:3003/health
- Analytics: http://localhost:3004/health

### Passo 3: Iniciar Frontend Admin

```bash
npm run dev:frontend
```

**Acesso:** http://localhost:5173

### Passo 4: Demonstração Requisito por Requisito

#### ✅ Requisito 1: CRUD de Alunos

**Demonstração:**
1. Acesse http://localhost:5173
2. Navegue para "Alunos" no menu lateral
3. Clique em "Novo Aluno"
4. Preencha o formulário:
   - Nome: "João Silva"
   - Email: "joao@example.com"
   - CPF: "12345678909"
   - Matrícula: "2024001234"
5. Salve e verifique na listagem
6. Edite um aluno existente
7. Delete um aluno (soft delete)

**Validação:**
- ✅ Formulário com validação
- ✅ Integração com API
- ✅ Listagem atualizada
- ✅ Feedback visual

**API Direta:**
```bash
# Criar aluno
curl -X POST http://localhost:3001/api/v1/students \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Maria Santos",
    "email": "maria@example.com",
    "cpf": "98765432100",
    "matricula": "2024005678"
  }'

# Listar alunos
curl http://localhost:3001/api/v1/students

# Buscar por CPF
curl http://localhost:3001/api/v1/students/cpf/98765432100
```

#### ✅ Requisito 2: CRUD de Salas

**Demonstração:**
1. Navegue para "Salas" no menu lateral
2. Clique em "Nova Sala"
3. Preencha o formulário:
   - Número: "A101"
   - Capacidade: 30
   - Tipo: "CLASSROOM"
4. Salve e verifique na listagem
5. Edite uma sala existente
6. Delete uma sala

**Validação:**
- ✅ Formulário com validação
- ✅ Tipos de sala (CLASSROOM, LABORATORY, AUDITORIUM, STUDY_ROOM)
- ✅ Integração com API

**API Direta:**
```bash
# Criar sala
curl -X POST http://localhost:3002/api/v1/rooms \
  -H "Content-Type: application/json" \
  -d '{
    "roomNumber": "B205",
    "capacity": 50,
    "type": "LABORATORY"
  }'
```

#### ✅ Requisito 3: Autenticação JWT

**Demonstração:**
1. Registre um novo usuário:
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "Str0ngPass!123",
    "role": "ADMIN"
  }'
```

2. Faça login:
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "Str0ngPass!123"
  }'
```

3. Use o token para acessar endpoints protegidos:
```bash
TOKEN="seu-token-aqui"
curl http://localhost:3001/api/v1/students \
  -H "Authorization: Bearer $TOKEN"
```

**Validação:**
- ✅ Registro de usuário
- ✅ Login com JWT
- ✅ Refresh token
- ✅ Proteção de rotas
- ✅ Roles (ADMIN, STUDENT, MONITOR)

#### ✅ Requisito 4: Check-in de Alunos

**Demonstração Manual (Como Estudante):**

1. **Obter URL do Frontend Estudante:**
   ```bash
   npm run student:room --url
   ```
   Isso gerará uma URL como: `http://localhost:5174?roomId=d49cf2ad-84f4-4eb7-9612-de6f85a9df44`

2. **Acessar Frontend do Estudante:**
   - Abra a URL gerada no navegador
   - Você verá informações da sala e formulário de check-in

3. **Fazer Check-in:**
   - Selecione método: **Matrícula** (recomendado)
   - Digite matrícula: `20247044` (ou outra do sistema)
   - Clique em "Realizar Check-in"
   - ✅ Confirmação de sucesso

4. **Verificar no Admin:**
   - Acesse: `http://localhost:5173/realtime`
   - Veja ocupação atualizada em tempo real

5. **Fazer Check-out:**
   - Acesse frontend estudante novamente
   - Digite mesma matrícula
   - Sistema detecta check-in ativo
   - Clique "Fazer Check-out"
   - ✅ Confirmação de checkout

**Métodos de Identificação Disponíveis:**
- ✅ **Matrícula**: Ex: `20247044`
- ✅ **CPF**: Ex: `12345678909` (sem formatação)
- ✅ **QR Code**: Ex: `QR-192e00a9`
- ✅ **Biometria**: Ex: `BIO-192e00a9`

**Demonstração via API:**
```bash
# Obter IDs primeiro
npm run list:data

# Fazer check-in
curl -X POST http://localhost:3003/api/v1/checkin \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "192e00a9-b43d-478e-bf92-d1636c26c236",
    "roomId": "d49cf2ad-84f4-4eb7-9612-de6f85a9df44",
    "identificationMethod": "MATRICULA",
    "identificationValue": "20247044"
  }'

# Verificar histórico
curl "http://localhost:3003/api/v1/checkin/history/192e00a9-b43d-478e-bf92-d1636c26c236"

# Fazer checkout
curl -X POST http://localhost:3003/api/v1/checkin/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "identificationMethod": "MATRICULA",
    "identificationValue": "20247044"
  }'
```

**Validação:**
- ✅ Check-in bem-sucedido via frontend
- ✅ Check-in bem-sucedido via API
- ✅ Validação de capacidade
- ✅ Validação de aluno ativo
- ✅ Histórico de check-ins
- ✅ Check-out funcionando
- ✅ Eventos publicados no Kafka
- ✅ Atualização em tempo real no admin

**Guia Completo:**
- Consulte `docs_ia/GUIA_TESTE_CHECKIN_MANUAL.md` para guia detalhado passo a passo

#### ✅ Requisito 5: Observabilidade

**Demonstração:**
1. Acesse Prometheus: http://localhost:9090
2. Execute queries:
   - `checkins_performed_total`
   - `students_total`
   - `rooms_total`
   - `http_request_duration_seconds`

3. Acesse Grafana: http://localhost:3001
   - Login: admin/admin
   - Dashboards disponíveis:
     - **Ocupação de Salas**: Métricas de ocupação em tempo real
     - **Visão Geral de Check-ins**: Throughput e distribuição
     - **Visão Geral de Alunos**: Estatísticas de alunos
     - **Performance dos Serviços**: Latência e erros
     - **Stress Test Monitor**: Monitoramento em tempo real

**Validação:**
- ✅ Métricas coletadas
- ✅ Dashboards funcionais
- ✅ Alertas configuráveis

#### ✅ Requisito 6: Testes de Stress

**Demonstração:**

1. **Auth Service:**
```bash
npm run perf:auth
```

2. **Check-in Service:**
```bash
# Inicie o serviço em modo mock
CHECKIN_USE_FAKE_CLIENTS=true KAFKA_DISABLED=true npm run dev:checkin

# Em outro terminal, execute o stress test
npm run perf:checkin
```

3. **Monitore no Grafana:**
   - Acesse o dashboard "Stress Test Monitor"
   - Observe métricas em tempo real:
     - Check-ins por segundo
     - Falhas por motivo
     - Latência P95
     - Distribuição por método

**Validação:**
- ✅ Testes executados com sucesso
- ✅ Métricas coletadas
- ✅ Dashboard em tempo real

#### ✅ Requisito 7: Arquitetura DDD + Hexagonal

**Demonstração:**
1. Explore a estrutura de um serviço:
```bash
cd services/auth-service
tree src/
```

2. Mostre as camadas:
   - **Domain**: Entidades, Value Objects, Events
   - **Application**: Use Cases
   - **Infrastructure**: Adapters (Persistence, Messaging, HTTP)
   - **Presentation**: Controllers

**Validação:**
- ✅ Separação de responsabilidades
- ✅ Ports e Adapters
- ✅ Domain isolado
- ✅ Testabilidade

#### ✅ Requisito 8: Infraestrutura

**Demonstração:**

1. **Dockerfiles:**
```bash
# Verificar Dockerfiles
ls services/*/Dockerfile

# Verificar Docker Compose
cat docker-compose.yml
```

**Validação:**
- ✅ Dockerfiles multi-stage
- ✅ Docker Compose configurado
- ✅ Scripts de automação

### Passo 5: Testes Automatizados

```bash
# Executar todos os testes
npm run test

# Testes por serviço
cd services/auth-service && npm test
cd services/students-service && npm test
cd services/rooms-service && npm test
cd services/checkin-service && npm test
cd services/analytics-service && npm test
```

**Cobertura:**
- ✅ 253 testes implementados
- ✅ Testes unitários
- ✅ Testes de integração
- ✅ Testes E2E (Auth Service)

### Passo 6: Métricas e Observabilidade

1. **Prometheus:**
   - Acesse: http://localhost:9090
   - Explore métricas customizadas
   - Execute queries PromQL

2. **Grafana:**
   - Acesse: http://localhost:3001
   - Visualize dashboards
   - Configure alertas (opcional)

3. **Métricas de Negócio:**
   - `students_created_total`
   - `rooms_occupied`
   - `checkins_performed_total`
   - `checkin_duration_seconds`

## 📋 Checklist de Demonstração

- [ ] Infraestrutura rodando (Docker Compose)
- [ ] Todos os serviços backend iniciados
- [ ] Frontend admin acessível
- [ ] CRUD de Alunos funcionando
- [ ] CRUD de Salas funcionando
- [ ] Autenticação JWT funcionando
- [ ] Check-in funcionando
- [ ] Observabilidade (Prometheus + Grafana)
- [ ] Testes executados
- [ ] Stress tests executados
- [ ] Dashboards visualizados

## 🎯 Pontos de Destaque

1. **Arquitetura Limpa**: DDD + Hexagonal em todos os serviços
2. **Testabilidade**: 303+ testes (253 backend + 50+ E2E frontend)
3. **Observabilidade**: Métricas de negócio + dashboards em tempo real
4. **Infraestrutura Completa**: Docker Compose (MySQL, Kafka, Redis, Prometheus, Grafana)
5. **Event-Driven**: Kafka para comunicação assíncrona
6. **Performance**: Stress tests com monitoramento em tempo real
7. **Cache e Locks**: Redis para locks distribuídos e idempotência
8. **Proposta de Produção**: Documentação completa de deploy em produção disponível

## ⚠️ Pendências (2% restante)

1. **Relatórios Detalhados**: Exportação PDF/Excel
2. **Testes de Integração Multi-serviço**: Executar com serviços reais (estrutura pronta)

## 📚 Documentação Adicional

- [Status dos Requisitos](../REQUIREMENTS_STATUS.md)
- [Proposta de Deploy para Produção](../deployment/PRODUCTION_DEPLOYMENT.md)
- [Observabilidade](../observability/OBSERVABILITY_COMPLETE.md)
- [Testes de Performance](../testing/PERFORMANCE_TESTS.md)

