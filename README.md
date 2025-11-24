# 🏛️ Controle de Espaços de Ensino - PUCPR

Sistema para controle de uso de espaços de ensino com análise de taxa de ocupação.

> **🚀 Quick Start (Desenvolvimento Local):** 
> ```bash
> npm install && npm run setup:env && npm run docker:up && npm run seed:all && npm run dev
> ```
> Isso configura o ambiente, inicia a infraestrutura e serviços localmente!

---

## 🧪 TESTE RÁPIDO - Frontend de Students (Para Avaliadores)

**Esta seção contém instruções simples e diretas para testar o frontend de students e verificar se atende aos requisitos do case.**

### 📋 Resumo Executivo

**Tempo estimado:** 5 minutos  
**URL do Frontend:** `http://localhost:5174`  
**Credenciais:** `student1@observability.local` / `Student123!`  
**Teste principal:** Login → Selecionar sala → Check-in com matrícula `20240001` → Check-out

### ✅ Requisitos do Case que serão testados:
- ✅ **CRUD de alunos** (via frontend admin)
- ✅ **Registro de entrada e saída** (check-in/check-out via frontend student)
- ✅ **Autenticação via token JWT** (login protegido)
- ✅ **API com autenticação e autorização** (backend protegido)

### 🚀 Passos para Testar (5 minutos)

#### 1️⃣ **Preparação (Execute uma vez)**

```bash
# Clone o repositório (se ainda não clonou)
git clone <repository-url>
cd controle-espacos-de-ensino

# Instale dependências
npm install

# Configure ambiente e suba infraestrutura
npm run setup:env
npm run docker:up

# Aguarde 10-15 segundos para MySQL inicializar

# Crie dados de teste (alunos, salas, usuários)
npm run seed:all

# Inicie todos os serviços
npm run dev
```

**Aguarde 30-60 segundos** até ver mensagens de "listening on port" nos serviços.

#### 2️⃣ **Teste o Frontend de Students**

**Acesse:** `http://localhost:5174`

**Credenciais de teste (copie e cole):**
- **Email:** `student1@observability.local`
- **Senha:** `Student123!`

> **💡 Dica:** O seed cria 50 alunos. Você pode usar `student1` até `student50` com a mesma senha.

#### 3️⃣ **O que você verá após o login:**

1. **Tela de Check-in** com lista de salas disponíveis
2. **Selecione uma sala** clicando nela (ex: `A101`, `A102`, `B101`)
3. **Formulário de Check-in** com 4 métodos de identificação:
   - Matrícula (recomendado)
   - CPF
   - QR Code
   - Biometria

#### 4️⃣ **Faça um Check-in (Teste Principal)**

**Método mais simples - Matrícula:**

1. Selecione o método **"Matrícula"**
2. Digite: `20240001` (matrícula do student1)
3. Clique em **"Fazer Check-in"**
4. ✅ **Resultado esperado:** Mensagem de sucesso "Check-in realizado com sucesso!"

> **📋 Outras matrículas para testar:**
> - `student1` → Matrícula: `20240001`
> - `student2` → Matrícula: `20240002`
> - `student3` → Matrícula: `20240003`
> - Padrão: `2024XXXX` onde XXXX são 4 dígitos (0001 a 0050)

#### 5️⃣ **Teste Check-out**

1. Após fazer check-in, você verá: "Você tem um check-in ativo na sala X"
2. Clique em **"Fazer Check-out"** no mesmo formulário (não existe tela separada)
3. ✅ **Resultado esperado:** Mensagem de sucesso e liberação para novo check-in
4. 🔁 **Fluxo único:** sempre que você abrir outra sala, o sistema detecta automaticamente check-ins ativos e exibe o botão de checkout no topo do formulário. Não é necessário navegar para outra rota.

#### 6️⃣ **Verifique Autenticação JWT**

**Teste de segurança:**
1. Abra o **DevTools** (F12) → **Application** → **Local Storage**
2. Você verá um token JWT armazenado (chave: `auth_token`)
3. Tente acessar `http://localhost:5174/checkin` sem fazer login
4. ✅ **Resultado esperado:** Redirecionamento automático para `/login`

**Teste de API protegida:**
1. No DevTools → **Network**, faça um check-in
2. Veja as requisições HTTP → Todas incluem header `Authorization: Bearer <token>`
3. ✅ **Resultado esperado:** APIs respondem com dados (não retornam 401 Unauthorized)

### ✅ Checklist de Requisitos Atendidos

Após seguir os passos acima, você terá verificado:

- ✅ **CRUD de alunos:** Teste via frontend admin (`http://localhost:5173`)
  - Login: `admin@observability.local` / `Admin123!`
  - Menu "Alunos" → Criar, Editar, Listar, Excluir

- ✅ **Registro de entrada e saída:** 
  - ✅ Check-in funcionando (passo 4)
  - ✅ Check-out funcionando (passo 5)
  - ✅ Validação de dados (tente matrícula inválida para ver erro)

- ✅ **Autenticação via token:**
  - ✅ Login protegido (passo 6)
  - ✅ Rotas protegidas (redirecionamento automático)
  - ✅ Token JWT armazenado e enviado nas requisições

- ✅ **API com autenticação e autorização:**
  - ✅ Backend valida token JWT
  - ✅ Apenas usuários autenticados podem fazer check-in
  - ✅ Verifique no Swagger: `http://localhost:3003/api/docs`

### 🔍 Verificação Rápida de Saúde dos Serviços

Se algo não funcionar, verifique:

```bash
# Verificar containers Docker
npm run docker:ps

# Verificar saúde dos serviços
curl http://localhost:3000/health  # Auth Service
curl http://localhost:3001/health   # Students Service
curl http://localhost:3002/health   # Rooms Service
curl http://localhost:3003/health   # Check-in Service
curl http://localhost:3004/health   # Analytics Service
```

Todos devem retornar `{"status":"ok"}`.

### 🆘 Problemas Comuns

**"Credenciais inválidas" no login:**
```bash
npm run seed:all  # Recria os usuários
# Aguarde 5 segundos e tente novamente
```

**"Nenhuma sala disponível":**
```bash
npm run seed:all  # Recria as salas
```

**Frontend não carrega:**
- Verifique se `npm run dev` está rodando
- Verifique se a porta 5174 está livre: `lsof -i :5174`

**APIs retornam 401 Unauthorized:**
- Verifique se fez login no frontend
- Verifique se o token está no Local Storage
- Reinicie os serviços: `Ctrl+C` e `npm run dev` novamente

> **📖 Para mais detalhes sobre testes e dados disponíveis, veja a seção [Como Testar o Check-in como Aluno](#-como-testar-o-check-in-como-aluno) abaixo.**

---

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
# IMPORTANTE: Este script garante que todos os serviços usam o mesmo JWT_SECRET

# 4. Suba a infraestrutura (MySQL, Kafka, Redis, Prometheus, Grafana)
npm run docker:up

# 5. Aguarde alguns segundos para MySQL inicializar completamente
# (importante: MySQL precisa de tempo para estar pronto)

# 6. Execute migrations e seeds (cria dados iniciais)
npm run seed:all

# 7. Inicie todos os serviços (em outro terminal)
npm run dev
# ⚠️  IMPORTANTE: Se você executou setup:env após os serviços já estarem rodando,
# você DEVE reiniciar os serviços (Ctrl+C e npm run dev novamente) para aplicar o JWT_SECRET.
# O NestJS carrega variáveis de ambiente apenas na inicialização.

# 8. Aguarde 30-60 segundos para serviços iniciarem
# O usuário admin já foi criado pelo seed:all (passo 6)
# Se precisar criar manualmente ou se o login falhar, execute:
# node scripts/create-admin-user.js

# 9. Acesse os frontends e faça login:

# Frontend Admin:
# URL: http://localhost:5173
# Email: admin@observability.local
# Senha: Admin123!

# Frontend Student (Alunos):
# URL: http://localhost:5174
# Email: student1@observability.local (ou student2, student3, ..., student50)
# Senha: Student123!
#
# Nota: O seed cria 50 alunos com emails student1@observability.local até student50@observability.local
# Todos usam a mesma senha: Student123!

# Se receber "credenciais inválidas":
# - Execute: node scripts/create-admin-user.js (cria/recria o usuário admin)
# - Para alunos: Execute npm run seed:all novamente (cria os alunos)
# - Aguarde alguns segundos após criar os usuários antes de tentar login
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

**Credenciais de acesso:**

| Frontend | URL | Email | Senha |
|----------|-----|-------|-------|
| Admin | `http://localhost:5173` | `admin@observability.local` | `Admin123!` |
| Student | `http://localhost:5174` | `student1@observability.local`<br/>(ou student2, student3, ..., student50) | `Student123!` |

> **Nota:** O seed (`npm run seed:all`) cria automaticamente:
> - 1 usuário admin: `admin@observability.local` / `Admin123!`
> - 50 usuários estudantes: `student1@observability.local` até `student50@observability.local` / `Student123!`

**Swagger (Documentação da API):**
- Auth: `http://localhost:3000/api/docs`
- Students: `http://localhost:3001/api/docs`
- Rooms: `http://localhost:3002/api/docs`
- Check-in: `http://localhost:3003/api/docs`
- Analytics: `http://localhost:3004/api/docs`

## 🧪 Como Testar o Check-in como Aluno

### Pré-requisitos

1. **Certifique-se de que os dados foram criados:**
   ```bash
   npm run seed:all
   ```
   Isso cria:
   - 50 alunos (student1@observability.local até student50@observability.local)
   - 20 salas ativas
   - 1 usuário admin

2. **Inicie todos os serviços:**
   ```bash
   npm run dev
   ```

### Passo a Passo para Testar Check-in

1. **Acesse o Frontend de Alunos:**
   - URL: `http://localhost:5174`

2. **Faça Login:**
   - Email: `student1@observability.local` (ou qualquer student2 até student50)
   - Senha: `Student123!`

3. **Selecione uma Sala:**
   - Após o login, você será redirecionado para a página de check-in
   - Você verá uma lista de **salas disponíveis** (criadas pelo seed)
   - Clique em qualquer sala para selecioná-la
   - As salas mostram: número da sala, tipo (Sala de Aula, Laboratório, etc.) e capacidade

4. **Faça Check-in:**
   - Após selecionar uma sala, você verá o formulário de check-in
   - Selecione o método de identificação:
     - **Matrícula** (recomendado para teste)
     - **CPF**
     - **QR Code**
     - **Biometria**
   - **Digite os dados do aluno que está logado:**
     - Se você fez login com `student1@observability.local`, use:
       - **Matrícula:** `20240001` (ou qualquer matrícula no formato `2024XXXX`)
       - **CPF:** `12345678901` (ou qualquer CPF válido gerado pelo seed)
     - Se você fez login com `student2@observability.local`, use:
       - **Matrícula:** `20240002`
       - **CPF:** `23456789012`
     - **Dica:** Use o método **Matrícula** com o padrão `2024XXXX` (ex: `20240001`, `20240002`, `20240003`, etc.)
   - Clique em "Fazer Check-in"
   - ✅ Você verá uma mensagem de sucesso!

5. **Fazer Check-out (opcional):**
   - Se você já tem um check-in ativo, o sistema mostrará essa informação
   - Você pode fazer check-out clicando no botão "Fazer Check-out" que aparece no mesmo card
   - Todo o fluxo acontece na mesma tela; após o checkout basta selecionar outra sala e repetir o processo
   - Isso libera você para fazer check-in em outra sala

### Dados de Teste Disponíveis

**Alunos criados pelo seed:**
- 50 alunos com emails `student1@observability.local` até `student50@observability.local`
- Todos com senha: `Student123!`
- Cada aluno tem: matrícula, CPF, nome completo

**📋 Exemplos Prontos para Teste (copie e cole):**

**Aluno 1:**
- **Email:** `student1@observability.local`
- **Senha:** `Student123!`
- **Matrícula para check-in:** `20240001` (ou qualquer `2024XXXX` onde XXXX são 4 dígitos)
- **CPF para check-in:** Use qualquer CPF válido de 11 dígitos (ex: `12345678901`)

**Aluno 2:**
- **Email:** `student2@observability.local`
- **Senha:** `Student123!`
- **Matrícula para check-in:** `20240002`
- **CPF para check-in:** `23456789012`

**Aluno 3:**
- **Email:** `student3@observability.local`
- **Senha:** `Student123!`
- **Matrícula para check-in:** `20240003`
- **CPF para check-in:** `34567890123`

> **💡 Dica:** As matrículas seguem o padrão `2024XXXX` (ano + 4 dígitos). Use qualquer número de 4 dígitos após `2024` (ex: `20240001`, `20240002`, `20240050`). O sistema valida se a matrícula existe no banco.

**Salas Disponíveis (aparecem automaticamente na lista após login):**

O seed cria **20 salas ativas** com números no formato:
- `A101`, `A102`, `A103`, `A201`, `A202`, etc. (Salas de Aula)
- `B101`, `B102`, etc. (Laboratórios)
- `C101`, etc. (Auditórios)
- `D101`, etc. (Salas de Estudo)

> **💡 Dica:** Após fazer login, você verá **todas as salas disponíveis** na tela. Basta clicar em qualquer uma para selecioná-la e fazer check-in. Não precisa decorar números - elas aparecem na lista!

### 🎯 Exemplos Prontos para Teste (Passo a Passo)

**✅ Cenário 1: Check-in com Matrícula (RECOMENDADO - mais simples)**

1. Acesse: `http://localhost:5174`
2. **Login:**
   - Email: `student1@observability.local`
   - Senha: `Student123!`
3. Você será redirecionado para a página de check-in
4. **Selecione uma sala:** Clique em qualquer sala da lista (ex: `A101`, `A102`, etc.)
5. **No formulário de check-in:**
   - Método: Selecione **"Matrícula"**
   - Digite: `20240001`
6. Clique em **"Fazer Check-in"**
7. ✅ **Sucesso!** Você verá uma mensagem de confirmação

**✅ Cenário 2: Check-in com CPF**

1. Acesse: `http://localhost:5174`
2. **Login:**
   - Email: `student2@observability.local`
   - Senha: `Student123!`
3. Selecione qualquer sala da lista
4. **No formulário:**
   - Método: Selecione **"CPF"**
   - Digite: `23456789012` (11 dígitos)
5. Clique em **"Fazer Check-in"**
6. ✅ **Sucesso!**

**✅ Cenário 3: Check-out e novo check-in em outra sala**

1. Após fazer check-in, o sistema mostrará: "Você tem um check-in ativo na sala X"
2. Clique em **"Fazer Check-out"** no card que aparece automaticamente
3. Selecione **outra sala** da lista (sem sair do fluxo atual)
4. Faça um novo check-in usando a mesma matrícula/CPF
5. ✅ **Sucesso!** Agora você está em uma nova sala, tudo na mesma tela

### Dicas para Teste

- **Se não aparecer salas:** Verifique se o seed foi executado (`npm run seed:all`)
- **Se o check-in falhar:** 
  - Verifique se a matrícula/CPF digitada corresponde ao aluno no banco
  - Use a API ou Swagger para consultar os dados corretos do aluno
- **Para testar múltiplos check-ins:** Use diferentes alunos (student1, student2, etc.)
- **Para ver check-ins em tempo real:** Execute `node scripts/worker-checkin-test.js` em outro terminal
- **Dica rápida:** Use matrículas no formato `20240001`, `20240002`, etc. (funciona para a maioria dos alunos criados pelo seed)

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
