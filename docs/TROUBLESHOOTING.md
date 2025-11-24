# Guia de Troubleshooting

Soluções para problemas comuns no desenvolvimento e operação do sistema.

## 📋 Índice

- [Problemas de Setup](#problemas-de-setup)
- [Problemas de Serviços](#problemas-de-serviços)
- [Problemas de Banco de Dados](#problemas-de-banco-de-dados)
- [Problemas de Rede](#problemas-de-rede)
- [Problemas de Performance](#problemas-de-performance)
- [Problemas de Testes](#problemas-de-testes)
- [Problemas de Deploy](#problemas-de-deploy)

## 🚀 Problemas de Setup

### Erro: "Cannot find module"

**Sintoma**: `Error: Cannot find module 'xyz'`

**Solução**:
```bash
# Limpar e reinstalar
rm -rf node_modules package-lock.json
npm install

# Ou em workspaces
npm install --workspaces
```

### Erro: "Port already in use"

**Sintoma**: `Error: listen EADDRINUSE: address already in use :::3000`

**Solução**:
```bash
# Encontrar processo usando a porta
lsof -i :3000

# Matar processo
kill -9 <PID>

# Ou usar outra porta
PORT=3001 npm run dev:auth
```

### Docker não inicia

**Sintoma**: Containers não sobem ou falham ao iniciar

**Solução**:
```bash
# Verificar status
docker ps -a

# Ver logs
docker logs <container-name>

# Reiniciar containers
docker-compose down
docker-compose up -d

# Limpar volumes (cuidado: apaga dados)
docker-compose down -v
```

## 🔧 Problemas de Serviços

### Serviço não inicia

**Sintoma**: Serviço não sobe ou crasha imediatamente

**Solução**:
```bash
# Verificar logs
cd services/auth-service
npm run start:dev

# Verificar variáveis de ambiente
cat .env.local

# Verificar dependências
npm list

# Verificar banco de dados
docker exec -it mysql-auth mysql -u app_user -papp_password identity
```

### Erro de conexão com banco

**Sintoma**: `Error: connect ECONNREFUSED`

**Solução**:
```bash
# Verificar se MySQL está rodando
docker ps | grep mysql

# Verificar credenciais
echo $DATABASE_HOST
echo $DATABASE_PORT
echo $DATABASE_USER

# Testar conexão
docker exec -it mysql-auth mysql -u app_user -papp_password identity
```

### Erro de conexão com Kafka

**Sintoma**: `Error: Connection timeout`

**Solução**:
```bash
# Verificar se Kafka está rodando
docker ps | grep kafka

# Verificar logs
docker logs kafka

# Verificar variáveis
echo $KAFKA_BROKERS

# Reiniciar Kafka
docker-compose restart kafka
```

### Erro de conexão com Redis

**Sintoma**: `Error: Redis connection failed`

**Solução**:
```bash
# Verificar se Redis está rodando
docker ps | grep redis

# Testar conexão
docker exec -it redis redis-cli ping

# Verificar variáveis
echo $REDIS_HOST
echo $REDIS_PORT
```

## 💾 Problemas de Banco de Dados

### Migration falha

**Sintoma**: `Migration failed` ou `Table already exists`

**Solução**:
```bash
# Verificar migrations executadas
npm run migration:show

# Reverter última migration
npm run migration:revert

# Executar novamente
npm run migration:run

# Se necessário, resetar (cuidado: apaga dados)
# Desabilitar synchronize no código
# Deletar tabelas manualmente
```

### Erro: "Table doesn't exist"

**Sintoma**: `Table 'xyz' doesn't exist`

**Solução**:
```bash
# Executar migrations
npm run migration:run

# Verificar se tabela existe
docker exec -it mysql-auth mysql -u app_user -papp_password identity
SHOW TABLES;
```

### Dados corrompidos

**Sintoma**: Dados inconsistentes ou inválidos

**Solução**:
```bash
# Backup antes de qualquer ação
docker exec mysql-auth mysqldump -u app_user -papp_password identity > backup.sql

# Verificar dados
SELECT * FROM table_name WHERE condition;

# Corrigir manualmente ou restaurar backup
```

## 🌐 Problemas de Rede

### CORS errors

**Sintoma**: `Access to fetch at '...' from origin '...' has been blocked by CORS policy`

**Solução**:
```typescript
// Verificar configuração CORS no serviço
app.enableCors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
});

// Verificar variável de ambiente
echo $FRONTEND_URL
```

### Traefik não roteia

**Sintoma**: `404 Not Found` via Traefik

**Solução**:
```bash
# Verificar rotas no Traefik
curl http://traefik.localhost:8080/api/http/routers

# Verificar logs
docker logs traefik

# Verificar configuração
cat infrastructure/docker/traefik/routes.yml
```

### Timeout em requisições

**Sintoma**: `Request timeout` ou `ECONNRESET`

**Solução**:
```typescript
// Aumentar timeout no cliente HTTP
const httpService = new HttpService({
  timeout: 10000, // 10 segundos
});

// Verificar se serviço está respondendo
curl http://localhost:3001/health
```

## ⚡ Problemas de Performance

### Serviço lento

**Sintoma**: Requisições demoram muito

**Solução**:
```bash
# Verificar métricas
curl http://localhost:3001/metrics

# Verificar logs
docker logs -f <service-name>

# Verificar uso de recursos
docker stats

# Verificar queries lentas no banco
# Habilitar slow query log no MySQL
```

### Memory leak

**Sintoma**: Uso de memória cresce continuamente

**Solução**:
```bash
# Monitorar memória
docker stats

# Verificar heap
node --inspect services/auth-service/dist/main.js

# Analisar com Chrome DevTools
chrome://inspect
```

### Race conditions

**Sintoma**: Dados inconsistentes, capacidade excedida incorretamente

**Solução**:
- Verificar se distributed locks estão funcionando
- Verificar se transações estão sendo usadas
- Verificar logs de race conditions
- Consultar [Race Conditions Solutions](./RACE_CONDITIONS_SOLUTIONS.md)

## 🧪 Problemas de Testes

### Testes falham intermitentemente

**Sintoma**: Testes passam às vezes, falham outras

**Solução**:
```bash
# Limpar estado entre testes
beforeEach(() => {
  jest.clearAllMocks();
  // Limpar banco de dados de teste
});

# Verificar race conditions nos testes
# Usar waitFor em testes assíncronos
```

### Erro: "Cannot find module" nos testes

**Sintoma**: Testes não encontram módulos

**Solução**:
```bash
# Verificar paths no tsconfig.json
# Verificar jest.config.js
# Limpar cache
npm run test -- --clearCache
```

### Timeout em testes

**Sintoma**: `Timeout - Async callback was not invoked`

**Solução**:
```typescript
// Aumentar timeout
jest.setTimeout(10000); // 10 segundos

// Verificar se async/await está correto
it('should work', async () => {
  await expect(asyncFunction()).resolves.toBe(expected);
});
```

## 🚢 Problemas de Deploy

### Build falha

**Sintoma**: `npm run build` falha

**Solução**:
```bash
# Verificar erros de TypeScript
npm run build 2>&1 | grep error

# Limpar e rebuild
rm -rf dist node_modules
npm install
npm run build

# Verificar versão do Node.js
node --version
```

### Imagem Docker não builda

**Sintoma**: `docker build` falha

**Solução**:
```bash
# Verificar Dockerfile
cat services/auth-service/Dockerfile

# Build com mais verbosidade
docker build --progress=plain -t auth-service .

# Verificar contexto
docker build -f services/auth-service/Dockerfile .
```

### Kubernetes pods não iniciam

**Sintoma**: Pods ficam em `CrashLoopBackOff`

**Solução**:
```bash
# Ver logs
kubectl logs <pod-name> -n controle-espacos

# Ver eventos
kubectl describe pod <pod-name> -n controle-espacos

# Verificar configuração
kubectl get configmap -n controle-espacos
kubectl get secret -n controle-espacos
```

## 🔍 Debugging

### Habilitar logs detalhados

```typescript
// NestJS
const app = await NestFactory.create(AppModule, {
  logger: ['error', 'warn', 'log', 'debug', 'verbose'],
});
```

### Debug no VS Code

```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Service",
  "runtimeExecutable": "npm",
  "runtimeArgs": ["run", "start:debug"],
  "port": 9229
}
```

### Inspecionar banco de dados

```bash
# Conectar ao MySQL
docker exec -it mysql-auth mysql -u app_user -papp_password identity

# Ver tabelas
SHOW TABLES;

# Ver dados
SELECT * FROM users LIMIT 10;

# Ver estrutura
DESCRIBE users;
```

### Inspecionar Redis

```bash
# Conectar ao Redis
docker exec -it redis redis-cli

# Ver chaves
KEYS *

# Ver valor
GET key-name

# Ver TTL
TTL key-name
```

### Inspecionar Kafka

```bash
# Listar tópicos
docker exec -it kafka kafka-topics --list --bootstrap-server localhost:9092

# Ver mensagens
docker exec -it kafka kafka-console-consumer \
  --bootstrap-server localhost:9092 \
  --topic attendance.events \
  --from-beginning
```

## 📞 Ainda com Problemas?

1. **Verificar logs**: `docker logs <container-name>`
2. **Verificar documentação**: `docs/`
3. **Verificar issues**: GitHub Issues
4. **Criar issue**: Com logs, passos para reproduzir e ambiente

## 📚 Recursos

- [Docker Troubleshooting](../docs_ia/TROUBLESHOOTING_DOCKER.md) - Em docs_ia (contexto IA)
- [Race Conditions Solutions](./security/RACE_CONDITIONS_SOLUTIONS.md)
- [Development Guide](./DEVELOPMENT_GUIDE.md)
- [Architecture](./architecture/ARCHITECTURE.md)

---

**Última atualização**: 2025-01-20

