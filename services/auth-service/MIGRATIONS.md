# 📦 Migrations - Auth Service

## ✅ Migrations Criadas

### 1. CreateUsersTable (1700000000000)
- Tabela `users` com:
  - id (VARCHAR 36, PK)
  - email (VARCHAR 255, UNIQUE)
  - passwordHash (VARCHAR 255)
  - role (ENUM: ADMIN, STUDENT, MONITOR)
  - status (ENUM: ACTIVE, INACTIVE)
  - createdAt, updatedAt (TIMESTAMP)
- Índices:
  - IDX_USERS_EMAIL
  - IDX_USERS_STATUS

### 2. CreateRefreshTokensTable (1700000000001)
- Tabela `refresh_tokens` com:
  - id (VARCHAR 36, PK)
  - userId (VARCHAR 36, FK -> users.id)
  - token (VARCHAR 500)
  - expiresAt (TIMESTAMP)
  - createdAt (TIMESTAMP)
- Foreign Key: CASCADE DELETE
- Índices:
  - IDX_REFRESH_TOKENS_USER_ID
  - IDX_REFRESH_TOKENS_TOKEN
  - IDX_REFRESH_TOKENS_EXPIRES_AT

## 🚀 Comandos

### Executar Migrations
```bash
npm run migration:run
```

### Reverter Última Migration
```bash
npm run migration:revert
```

### Ver Status das Migrations
```bash
npm run migration:show
```

### Gerar Nova Migration
```bash
npm run migration:generate src/infrastructure/migrations/NomeDaMigration
```

## ✅ Status

- ✅ Migrations criadas
- ✅ Migrations executadas com sucesso
- ✅ Tabelas criadas no banco

## 🧪 Testar Conexão

```bash
# Testar MySQL
npm run test:connection

# Testar Redis
npm run test:redis

# Testar Kafka
npm run test:kafka
```

