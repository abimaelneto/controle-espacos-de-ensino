# Desenvolvimento Local

Guia detalhado para configurar e trabalhar no projeto localmente.

## 📋 Índice

- [Pré-requisitos](#pré-requisitos)
- [Setup Inicial](#setup-inicial)
- [Desenvolvimento](#desenvolvimento)
- [Workflow Diário](#workflow-diário)
- [Ferramentas Recomendadas](#ferramentas-recomendadas)

## ✅ Pré-requisitos

### Software Necessário

```bash
# Verificar versões
node --version    # >= 20.x
npm --version     # >= 9.x
docker --version  # >= 24.x
docker-compose --version  # >= 2.x
git --version     # >= 2.x
```

### Instalação

**Node.js**:
- Download: https://nodejs.org/
- Ou via nvm: `nvm install 20 && nvm use 20`

**Docker**:
- Download: https://www.docker.com/products/docker-desktop
- Ou via Homebrew: `brew install docker docker-compose`

## 🚀 Setup Inicial

### 1. Clone o Repositório

```bash
git clone <repository-url>
cd controle-espacos-de-ensino
```

### 2. Instale Dependências

```bash
npm install
```

Isso instalará dependências de todos os workspaces.

### 3. Configure Variáveis de Ambiente

```bash
# Copie os arquivos de exemplo
for service in auth-service students-service rooms-service checkin-service analytics-service; do
  cp services/$service/env.example services/$service/.env.local
done
```

**Ajuste as variáveis** conforme necessário (geralmente os defaults funcionam para desenvolvimento local).

### 4. Inicie a Infraestrutura

```bash
npm run docker:up
```

Aguarde todos os containers iniciarem (pode levar 1-2 minutos na primeira vez).

**Verificar**:
```bash
docker ps
# Deve mostrar: mysql-auth, mysql-students, mysql-spaces, mysql-analytics, redis, kafka, zookeeper, prometheus, grafana, traefik
```

### 5. Execute Migrations

```bash
# Auth Service
cd services/auth-service
npm run migration:run
cd ../..

# Students Service
cd services/students-service
npm run migration:run
cd ../..

# Rooms Service
cd services/rooms-service
npm run migration:run
cd ../..

# Check-in Service
cd services/checkin-service
npm run migration:run
cd ../..

# Analytics Service
cd services/analytics-service
npm run migration:run
cd ../..
```

### 6. Popule Dados (Opcional)

```bash
# Seed para observabilidade
npm run seed:observability
```

## 💻 Desenvolvimento

### Iniciando os Serviços

**Opção 1: Terminais Separados** (Recomendado)

```bash
# Terminal 1
npm run dev:auth

# Terminal 2
npm run dev:students

# Terminal 3
npm run dev:spaces

# Terminal 4
npm run dev:checkin

# Terminal 5
npm run dev:analytics

# Terminal 6
npm run dev:frontend
```

**Opção 2: Process Manager** (tmux, screen, ou PM2)

```bash
# Com tmux
tmux new-session -d -s dev
tmux send-keys 'npm run dev:auth' C-m
tmux split-window -h
tmux send-keys 'npm run dev:students' C-m
# ... continuar para outros serviços
```

### Hot Reload

Todos os serviços usam `nest start --watch` que recarrega automaticamente ao detectar mudanças.

### Verificando se Está Funcionando

```bash
# Health checks
curl http://localhost:3000/health  # Auth
curl http://localhost:3001/health  # Students
curl http://localhost:3002/health  # Rooms
curl http://localhost:3003/health  # Check-in
curl http://localhost:3004/health  # Analytics

# Métricas
curl http://localhost:3000/metrics
curl http://localhost:3001/metrics
# ...

# Swagger
open http://localhost:3000/api/docs
open http://localhost:3001/api/docs
# ...
```

## 🔄 Workflow Diário

### Iniciando o Dia

```bash
# 1. Atualizar código
git pull origin develop

# 2. Instalar novas dependências (se houver)
npm install

# 3. Iniciar infraestrutura
npm run docker:up

# 4. Verificar se está tudo ok
docker ps

# 5. Iniciar serviços
npm run dev:auth &
npm run dev:students &
# ...
```

### Durante o Desenvolvimento

1. **Criar branch**:
```bash
git checkout develop
git pull origin develop
git checkout -b feature/nova-funcionalidade
```

2. **Desenvolver**:
- Fazer alterações
- Testes passam automaticamente (watch mode)
- Verificar logs

3. **Testar**:
```bash
npm run test
npm run test:e2e  # Se alterou frontend
```

4. **Commit**:
```bash
git add .
git commit -m "feat(service): add new feature"
```

### Finalizando o Dia

```bash
# Parar serviços (Ctrl+C em cada terminal)
# Ou
pkill -f "nest start"

# Parar infraestrutura (opcional, pode deixar rodando)
npm run docker:down
```

## 🛠️ Ferramentas Recomendadas

### VS Code

**Extensions**:
- ESLint
- Prettier
- Docker
- REST Client
- Mermaid Preview
- GitLens

**Settings** (`.vscode/settings.json`):
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

### Postman/Insomnia

**Coleções**:
- Criar coleção para cada serviço
- Variáveis de ambiente:
  - `base_url`: `http://localhost:3000`
  - `token`: JWT token

### DBeaver/TablePlus

**Conexões MySQL**:
- **Auth**: `localhost:3306`, database: `identity`
- **Students**: `localhost:3307`, database: `academic`
- **Rooms**: `localhost:3308`, database: `facilities`
- **Check-in**: `localhost:3309`, database: `attendance`
- **Analytics**: `localhost:3310`, database: `analytics`

Credenciais: `app_user` / `app_password`

### Redis Commander

```bash
# Via Docker
docker run -d \
  --name redis-commander \
  -p 8081:8081 \
  rediscommander/redis-commander:latest \
  --redis-host host.docker.internal \
  --redis-port 6379
```

Acesse: http://localhost:8081

### Kafka UI

```bash
# Via Docker
docker run -d \
  --name kafka-ui \
  -p 8082:8080 \
  -e KAFKA_CLUSTERS_0_NAME=local \
  -e KAFKA_CLUSTERS_0_BOOTSTRAPSERVERS=host.docker.internal:9092 \
  provectuslabs/kafka-ui:latest
```

Acesse: http://localhost:8082

## 🐛 Debugging

### VS Code Debug

Configure `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Auth Service",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "start:debug"],
      "cwd": "${workspaceFolder}/services/auth-service",
      "port": 9229,
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

### Logs

```bash
# Logs de um serviço
docker logs -f auth-service

# Logs de todos os containers
docker-compose logs -f

# Logs filtrados
docker-compose logs -f | grep ERROR
```

### Database

```bash
# Conectar ao MySQL
docker exec -it mysql-auth mysql -u app_user -papp_password identity

# Ver tabelas
SHOW TABLES;

# Ver dados
SELECT * FROM users LIMIT 10;
```

## 📝 Dicas

### Performance

- Use `docker-compose up -d` para rodar em background
- Feche serviços não utilizados para economizar recursos
- Use `npm run docker:up:minimal` se não precisar de tudo

### Troubleshooting

- Se algo não funciona, verifique logs primeiro
- Reinicie containers: `docker-compose restart <service>`
- Limpe volumes se necessário: `docker-compose down -v` (cuidado: apaga dados)

### Produtividade

- Use aliases no shell:
```bash
alias dev-up='npm run docker:up && npm run dev:auth & npm run dev:students & ...'
alias dev-down='pkill -f "nest start" && npm run docker:down'
```

## 📚 Próximos Passos

- [Development Guide](../DEVELOPMENT_GUIDE.md)
- [Architecture](../architecture/ARCHITECTURE.md)
- [Troubleshooting](../TROUBLESHOOTING.md)

---

**Última atualização**: 2025-01-20

