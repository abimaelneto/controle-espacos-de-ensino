# Documentação de APIs

Documentação consolidada de todas as APIs do sistema.

## 📋 Índice

- [Autenticação](#autenticação)
- [Students Service](#students-service)
- [Rooms Service](#rooms-service)
- [Check-in Service](#check-in-service)
- [Analytics Service](#analytics-service)
- [Versionamento](#versionamento)
- [Erros](#erros)

## 🔐 Autenticação

> **📘 Documentação Completa:** Veja [Guia de Autenticação JWT](../security/AUTHENTICATION.md) para detalhes completos sobre autenticação e autorização.

### Visão Geral

O sistema utiliza **JWT (JSON Web Tokens)** para autenticação e autorização baseada em roles (RBAC).

**Arquitetura:**
- **Auth Service** gera tokens JWT usando `JWT_SECRET`
- **Outros serviços** validam tokens usando o mesmo `JWT_SECRET`
- **Frontend** gerencia login, logout e adiciona tokens automaticamente via interceptors

**Roles Disponíveis:**
- `ADMIN` - Acesso total
- `MONITOR` - Acesso para monitoramento
- `STUDENT` - Acesso limitado (próprios dados)

### Base URL
- Local: `http://localhost:3000`

> **Nota:** Para produção com API Gateway, veja [Proposta de Deploy para Produção](../deployment/PRODUCTION_DEPLOYMENT.md)

### Endpoints

#### POST /api/v1/auth/register
Registra um novo usuário.

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "role": "ADMIN" | "STUDENT" | "MONITOR"
}
```

**Response** (201):
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "ADMIN",
    "createdAt": "2025-01-20T10:00:00Z"
  },
  "accessToken": "jwt-token",
  "refreshToken": "refresh-token"
}
```

#### POST /api/v1/auth/login
Autentica um usuário.

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response** (200):
```json
{
  "accessToken": "jwt-token",
  "refreshToken": "refresh-token",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "ADMIN"
  }
}
```

#### POST /api/v1/auth/refresh
Renova o access token.

**Headers**:
```
Authorization: Bearer <refresh-token>
```

**Response** (200):
```json
{
  "accessToken": "new-jwt-token"
}
```

**Swagger**: http://localhost:3000/api/docs

### Como Usar

**1. Fazer Login:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "password123"}'
```

**2. Usar Token em Requisições:**
```bash
curl -X GET http://localhost:3001/api/v1/students \
  -H "Authorization: Bearer <access-token>"
```

**3. Frontend (Automático):**
- Token é adicionado automaticamente via interceptors axios
- Em caso de erro 401, redireciona para login

---

## 🎓 Students Service

### Base URL
- Local: `http://localhost:3001`
- Via Traefik: `http://api.localhost`

### Autenticação
Todos os endpoints requerem JWT token no header `Authorization: Bearer <token>`.

**Roles Permitidas por Endpoint:**
- `POST /students` - ADMIN
- `GET /students` - ADMIN, MONITOR
- `GET /students/:id` - ADMIN, MONITOR, STUDENT (próprio ID)
- `PUT /students/:id` - ADMIN
- `DELETE /students/:id` - ADMIN
- `GET /students/cpf/:cpf` - ADMIN, MONITOR
- `GET /students/matricula/:matricula` - ADMIN, MONITOR

**Exemplo de Requisição:**
```bash
curl -X GET http://localhost:3001/api/v1/students \
  -H "Authorization: Bearer <access-token>"
```

### Endpoints

#### GET /api/v1/students
Lista todos os alunos.

**Query Parameters**:
- `page` (opcional): Número da página (default: 1)
- `limit` (opcional): Itens por página (default: 10)
- `status` (opcional): Filtrar por status (ACTIVE, INACTIVE)

**Response** (200):
```json
{
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "name": "João Silva",
      "cpf": "12345678909",
      "email": "joao@example.com",
      "matricula": "2024001234",
      "status": "ACTIVE",
      "createdAt": "2025-01-20T10:00:00Z",
      "updatedAt": "2025-01-20T10:00:00Z"
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 10
}
```

#### POST /api/v1/students
Cria um novo aluno.

**Request Body**:
```json
{
  "userId": "uuid",
  "firstName": "João",
  "lastName": "Silva",
  "cpf": "12345678909",
  "email": "joao@example.com",
  "matricula": "2024001234",
  "status": "ACTIVE"
}
```

**Response** (201):
```json
{
  "id": "uuid",
  "userId": "uuid",
  "name": "João Silva",
  "cpf": "12345678909",
  "email": "joao@example.com",
  "matricula": "2024001234",
  "status": "ACTIVE",
  "createdAt": "2025-01-20T10:00:00Z",
  "updatedAt": "2025-01-20T10:00:00Z"
}
```

#### GET /api/v1/students/:id
Busca um aluno por ID.

**Response** (200):
```json
{
  "id": "uuid",
  "userId": "uuid",
  "name": "João Silva",
  "cpf": "12345678909",
  "email": "joao@example.com",
  "matricula": "2024001234",
  "status": "ACTIVE",
  "createdAt": "2025-01-20T10:00:00Z",
  "updatedAt": "2025-01-20T10:00:00Z"
}
```

#### PUT /api/v1/students/:id
Atualiza um aluno.

**Request Body** (campos opcionais):
```json
{
  "firstName": "João",
  "lastName": "Silva",
  "email": "joao@example.com",
  "status": "ACTIVE"
}
```

**Response** (200): Aluno atualizado

#### DELETE /api/v1/students/:id
Deleta um aluno (soft delete).

**Response** (204): No content

#### GET /api/v1/students/by-cpf/:cpf
Busca aluno por CPF.

**Response** (200): Aluno encontrado

#### GET /api/v1/students/by-matricula/:matricula
Busca aluno por matrícula.

**Response** (200): Aluno encontrado

**Swagger**: http://localhost:3001/api/docs

---

## 🏫 Rooms Service

### Base URL
- Local: `http://localhost:3002`
- Via Traefik: `http://api.localhost`

### Autenticação
Todos os endpoints requerem JWT token no header `Authorization: Bearer <token>`.

**Roles Permitidas por Endpoint:**
- `POST /rooms` - ADMIN
- `GET /rooms` - ADMIN, MONITOR, STUDENT
- `GET /rooms/:id` - ADMIN, MONITOR, STUDENT
- `PUT /rooms/:id` - ADMIN
- `DELETE /rooms/:id` - ADMIN

**Exemplo de Requisição:**
```bash
curl -X GET http://localhost:3002/api/v1/rooms \
  -H "Authorization: Bearer <access-token>"
```

### Endpoints

#### GET /api/v1/rooms
Lista todas as salas.

**Query Parameters**:
- `page` (opcional): Número da página
- `limit` (opcional): Itens por página
- `type` (opcional): Filtrar por tipo (CLASSROOM, LABORATORY, AUDITORIUM, STUDY_ROOM)
- `status` (opcional): Filtrar por status (ACTIVE, INACTIVE)

**Response** (200):
```json
{
  "data": [
    {
      "id": "uuid",
      "roomNumber": "A101",
      "capacity": 30,
      "type": "CLASSROOM",
      "status": "ACTIVE",
      "description": "Sala de aula padrão",
      "hasEquipment": false,
      "createdAt": "2025-01-20T10:00:00Z",
      "updatedAt": "2025-01-20T10:00:00Z"
    }
  ],
  "total": 50,
  "page": 1,
  "limit": 10
}
```

#### POST /api/v1/rooms
Cria uma nova sala.

**Request Body**:
```json
{
  "roomNumber": "A101",
  "capacity": 30,
  "type": "CLASSROOM",
  "description": "Sala de aula padrão",
  "hasEquipment": false
}
```

**Response** (201): Sala criada

#### GET /api/v1/rooms/:id
Busca uma sala por ID.

**Response** (200): Sala encontrada

#### PUT /api/v1/rooms/:id
Atualiza uma sala.

**Request Body** (campos opcionais):
```json
{
  "capacity": 35,
  "status": "ACTIVE",
  "description": "Sala atualizada",
  "hasEquipment": true
}
```

**Response** (200): Sala atualizada

#### DELETE /api/v1/rooms/:id
Deleta uma sala (soft delete).

**Response** (204): No content

**Swagger**: http://localhost:3002/api/docs

---

## ✅ Check-in Service

### Base URL
- Local: `http://localhost:3003`
- Via Traefik: `http://api.localhost`

### Autenticação
Todos os endpoints requerem JWT token no header `Authorization: Bearer <token>`.

**Roles Permitidas por Endpoint:**
- `POST /checkin` - ADMIN, STUDENT
- `GET /checkin/history/:studentId` - ADMIN, MONITOR, STUDENT (próprio ID)
- `GET /checkin/active` - ADMIN, MONITOR, STUDENT
- `POST /checkin/checkout` - ADMIN, STUDENT

**Exemplo de Requisição:**
```bash
curl -X POST http://localhost:3003/api/v1/checkin \
  -H "Authorization: Bearer <access-token>" \
  -H "Content-Type: application/json" \
  -d '{"studentId": "...", "roomId": "...", ...}'
```

### Endpoints

#### POST /api/v1/checkin
Realiza um check-in.

**Request Body**:
```json
{
  "studentId": "uuid",
  "roomId": "uuid",
  "identificationMethod": "MATRICULA" | "CPF" | "QR_CODE" | "BIOMETRIC",
  "identificationValue": "2024001234",
  "idempotencyKey": "optional-unique-key"
}
```

**Response** (201):
```json
{
  "success": true,
  "message": "Check-in realizado com sucesso",
  "checkInId": "uuid",
  "attendance": {
    "id": "uuid",
    "studentId": "uuid",
    "roomId": "uuid",
    "checkInTime": "2025-01-20T10:00:00Z"
  }
}
```

**Erros Possíveis**:
- `400`: Dados inválidos
- `401`: Não autenticado
- `403`: Não autorizado
- `201` com `success: false`: Validação falhou (capacidade excedida, aluno inativo, etc.)

#### GET /api/v1/checkin/history
Histórico de check-ins.

**Query Parameters**:
- `studentId` (opcional): Filtrar por aluno
- `roomId` (opcional): Filtrar por sala
- `startDate` (opcional): Data inicial (ISO 8601)
- `endDate` (opcional): Data final (ISO 8601)
- `page` (opcional): Número da página
- `limit` (opcional): Itens por página

**Response** (200):
```json
{
  "data": [
    {
      "id": "uuid",
      "studentId": "uuid",
      "roomId": "uuid",
      "checkInTime": "2025-01-20T10:00:00Z",
      "createdAt": "2025-01-20T10:00:00Z"
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 10
}
```

**Swagger**: http://localhost:3003/api/docs

---

## 📊 Analytics Service

### Base URL
- Local: `http://localhost:3004`
- Via Traefik: `http://api.localhost`

### Autenticação
Todos os endpoints requerem JWT token no header `Authorization: Bearer <token>`.

**Roles Permitidas por Endpoint:**
- `GET /analytics/dashboard` - ADMIN, MONITOR
- `GET /analytics/rooms/stats` - ADMIN, MONITOR
- `GET /analytics/rooms/:roomId/usage` - ADMIN, MONITOR
- `GET /analytics/rooms/:roomId/timeline` - ADMIN, MONITOR
- `GET /analytics/students/:studentId/stats` - ADMIN, MONITOR, STUDENT (próprio ID)
- `GET /analytics/rooms/realtime` - ADMIN, MONITOR

**Exemplo de Requisição:**
```bash
curl -X GET http://localhost:3004/api/v1/analytics/dashboard \
  -H "Authorization: Bearer <access-token>"
```

### Endpoints

#### GET /api/v1/analytics/rooms/:id/stats
Estatísticas de uso de uma sala.

**Query Parameters**:
- `startDate` (opcional): Data inicial
- `endDate` (opcional): Data final

**Response** (200):
```json
{
  "roomId": "uuid",
  "roomNumber": "A101",
  "period": {
    "start": "2025-01-01T00:00:00Z",
    "end": "2025-01-31T23:59:59Z"
  },
  "stats": {
    "totalCheckIns": 150,
    "averageDailyCheckIns": 5,
    "peakHour": 14,
    "occupancyRate": 0.75
  }
}
```

**Swagger**: http://localhost:3004/api/docs

---

## 🔢 Versionamento

### Estratégia

- **URL Versioning**: `/api/v1/...`
- **Semantic Versioning**: v1.0.0, v1.1.0, v2.0.0
- **Backward Compatibility**: Versões antigas mantidas por 6 meses

### Migração de Versão

Quando uma nova versão é lançada:
1. Versão antiga mantida por período de transição
2. Documentação de breaking changes
3. Guia de migração fornecido
4. Deprecation warnings nas respostas

---

## ❌ Erros

### Códigos de Status HTTP

- **200**: Sucesso
- **201**: Criado com sucesso
- **204**: Sucesso sem conteúdo
- **400**: Bad Request (dados inválidos)
- **401**: Não autenticado
- **403**: Não autorizado
- **404**: Não encontrado
- **409**: Conflito (duplicado)
- **422**: Unprocessable Entity (validação falhou)
- **500**: Erro interno do servidor
- **503**: Serviço indisponível

### Formato de Erro

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": [
    {
      "field": "email",
      "message": "Email inválido"
    }
  ],
  "timestamp": "2025-01-20T10:00:00Z",
  "path": "/api/v1/students"
}
```

### Erros Comuns

#### 400 Bad Request
- Dados de entrada inválidos
- Validação falhou
- Formato incorreto

#### 401 Unauthorized
- Token ausente
- Token inválido
- Token expirado

#### 403 Forbidden
- Permissão insuficiente
- Role incorreta

#### 404 Not Found
- Recurso não existe
- ID inválido

#### 409 Conflict
- Recurso duplicado (CPF, email, matrícula)
- Conflito de estado

#### 500 Internal Server Error
- Erro inesperado
- Logs devem ser consultados

---

## 🔗 Links Úteis

- [Swagger Auth Service](http://localhost:3000/api/docs)
- [Swagger Students Service](http://localhost:3001/api/docs)
- [Swagger Rooms Service](http://localhost:3002/api/docs)
- [Swagger Check-in Service](http://localhost:3003/api/docs)
- [Swagger Analytics Service](http://localhost:3004/api/docs)
- [Arquitetura do Sistema](../architecture/ARCHITECTURE.md)
- [Guia de Desenvolvimento](../DEVELOPMENT_GUIDE.md)

---

**Última atualização**: 2025-01-20

