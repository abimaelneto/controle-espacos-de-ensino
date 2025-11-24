# 🚀 Quick Start - Auth Service

## ✅ Pré-requisitos

- ✅ Containers Docker rodando (`npm run docker:up`)
- ✅ Dependências instaladas (`npm install`)

## 🏃 Rodar o Serviço

```bash
# Desenvolvimento (watch mode)
npm run start:dev

# O serviço estará disponível em:
# http://localhost:3000
# Swagger: http://localhost:3000/api/docs
```

## 🧪 Testar

```bash
# Todos os testes
npm run test

# Watch mode
npm run test:watch

# Com cobertura
npm run test:cov
```

## 📝 Endpoints Disponíveis

### POST /api/v1/auth/login
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### POST /api/v1/auth/register
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "role": "STUDENT"
}
```

## 🔍 Verificar Conexões

### MySQL
```bash
mysql -h localhost -P 3306 -u app_user -papp_password identity
```

### Redis
```bash
redis-cli -h localhost -p 6379
PING
```

### Kafka
```bash
# Verificar tópicos
docker exec -it kafka kafka-topics --list --bootstrap-server localhost:9092
```

## 📊 Monitoramento

- **Prometheus:** http://localhost:9090
- **Grafana:** http://localhost:3001 (admin/admin)

## 🐛 Troubleshooting

Se houver problemas de conexão:

1. Verificar se containers estão rodando: `npm run docker:ps`
2. Verificar logs: `npm run docker:logs`
3. Verificar variáveis de ambiente: `.env.local`

