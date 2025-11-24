# Guia de Deploy

Processo completo de deploy do sistema em diferentes ambientes.

## 📋 Índice

- [Ambientes](#ambientes)
- [Deploy Local (Docker)](#deploy-local-docker)
- [Deploy Kubernetes Local](#deploy-kubernetes-local)
- [Deploy AWS](#deploy-aws)
- [Rollback](#rollback)
- [Verificação Pós-Deploy](#verificação-pós-deploy)

## 🌍 Ambientes

### Desenvolvimento
- **Local**: Docker Compose
- **Kubernetes Local**: Kind/Minikube

### Produção
- **AWS**: ECS/EKS via Terraform

## 🐳 Deploy Local (Docker)

### Pré-requisitos

- Docker 24.x+
- Docker Compose 2.x+
- 8GB RAM mínimo
- 20GB disco livre

### Passos

1. **Clone e instale dependências**:
```bash
git clone <repository-url>
cd controle-espacos-de-ensino
npm install
```

2. **Configure variáveis de ambiente**:
```bash
# Copie e ajuste .env.local em cada serviço
cp services/*/env.example services/*/.env.local
```

3. **Inicie infraestrutura**:
```bash
npm run docker:up
```

4. **Execute migrations**:
```bash
cd services/auth-service && npm run migration:run
cd ../students-service && npm run migration:run
cd ../rooms-service && npm run migration:run
cd ../checkin-service && npm run migration:run
cd ../analytics-service && npm run migration:run
```

5. **Inicie serviços**:
```bash
npm run dev:auth &
npm run dev:students &
npm run dev:spaces &
npm run dev:checkin &
npm run dev:analytics &
npm run dev:frontend
```

### Verificação

```bash
# Verificar containers
docker ps

# Verificar saúde
curl http://localhost:3000/health
curl http://localhost:3001/health
# ...

# Verificar métricas
curl http://localhost:3000/metrics
```

## ☸️ Deploy Kubernetes Local

### Pré-requisitos

- Docker Desktop ou Docker Engine
- Kind ou Minikube instalado
- kubectl configurado
- 16GB RAM recomendado

### Passos

1. **Setup completo**:
```bash
npm run k8s:setup
```

Isso executa:
- Cria cluster Kind
- Builda imagens Docker
- Carrega imagens no cluster
- Aplica manifests Kubernetes

2. **Verificar deploy**:
```bash
kubectl get pods -n controle-espacos
kubectl get services -n controle-espacos
kubectl get ingress -n controle-espacos
```

3. **Acessar serviços**:
```bash
# Port forward (se necessário)
kubectl port-forward -n controle-espacos svc/auth-service 3000:3000

# Via Ingress
curl http://api.localhost/api/v1/auth/health
```

### Limpeza

```bash
npm run k8s:cleanup
# ou
kind delete cluster --name controle-espacos
```

## ☁️ Deploy AWS

### Pré-requisitos

- AWS CLI configurado
- Terraform 1.5+
- Credenciais AWS com permissões adequadas
- Domain configurado (opcional)

### Passos

1. **Configurar Terraform**:
```bash
cd infrastructure/terraform/environments/cloud
cp terraform.tfvars.example terraform.tfvars
# Edite terraform.tfvars com seus valores
```

2. **Inicializar Terraform**:
```bash
npm run terraform:init
```

3. **Planejar deploy**:
```bash
npm run terraform:plan
```

4. **Aplicar infraestrutura**:
```bash
npm run terraform:apply
```

Isso cria:
- VPC com subnets públicas/privadas
- RDS MySQL (Multi-AZ)
- ECS Cluster ou EKS
- Application Load Balancer
- Security Groups
- IAM Roles

5. **Deploy aplicação**:

**ECS**:
```bash
# Build e push imagens para ECR
aws ecr get-login-password | docker login --username AWS --password-stdin <account>.dkr.ecr.<region>.amazonaws.com

# Build
docker build -t auth-service:latest services/auth-service/
docker tag auth-service:latest <account>.dkr.ecr.<region>.amazonaws.com/auth-service:latest

# Push
docker push <account>.dkr.ecr.<region>.amazonaws.com/auth-service:latest

# Atualizar task definition e service
aws ecs update-service --cluster controle-espacos --service auth-service --force-new-deployment
```

**EKS**:
```bash
# Build e push imagens
# Aplicar manifests Kubernetes
kubectl apply -f infrastructure/kubernetes/
```

### Variáveis de Ambiente (AWS)

Configure via:
- **ECS**: Task Definition environment variables
- **EKS**: ConfigMaps e Secrets
- **RDS**: Connection strings via Secrets Manager

### Secrets Management

```bash
# Criar secret
aws secretsmanager create-secret \
  --name controle-espacos/database \
  --secret-string '{"username":"admin","password":"..."}'

# Usar no Terraform
data "aws_secretsmanager_secret_version" "db" {
  secret_id = "controle-espacos/database"
}
```

## 🔄 Rollback

### Docker Compose

```bash
# Parar serviços
docker-compose down

# Voltar para versão anterior
git checkout <previous-commit>
docker-compose up -d
```

### Kubernetes

```bash
# Rollback deployment
kubectl rollout undo deployment/auth-service -n controle-espacos

# Ver histórico
kubectl rollout history deployment/auth-service -n controle-espacos

# Rollback para versão específica
kubectl rollout undo deployment/auth-service --to-revision=2 -n controle-espacos
```

### AWS ECS

```bash
# Listar task definitions
aws ecs list-task-definitions --family-prefix auth-service

# Atualizar service para versão anterior
aws ecs update-service \
  --cluster controle-espacos \
  --service auth-service \
  --task-definition auth-service:<previous-revision>
```

### AWS EKS

```bash
# Mesmo processo do Kubernetes local
kubectl rollout undo deployment/auth-service -n controle-espacos
```

## ✅ Verificação Pós-Deploy

### Checklist

- [ ] Todos os serviços estão rodando
- [ ] Health checks passando
- [ ] APIs respondendo corretamente
- [ ] Banco de dados conectado
- [ ] Kafka conectado
- [ ] Redis conectado
- [ ] Métricas sendo coletadas
- [ ] Logs sendo gerados
- [ ] Frontend acessível
- [ ] Autenticação funcionando

### Comandos de Verificação

```bash
# Health checks
curl http://api.localhost/api/v1/auth/health
curl http://api.localhost/api/v1/students/health
# ...

# Métricas
curl http://api.localhost/api/v1/auth/metrics
curl http://api.localhost/api/v1/students/metrics
# ...

# Teste de funcionalidade
curl -X POST http://api.localhost/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"password"}'
```

### Monitoramento

- **Grafana**: http://localhost:3001 (local) ou via ALB (AWS)
- **Prometheus**: http://localhost:9090 (local) ou via ALB (AWS)
- **CloudWatch**: AWS Console (produção)

## 🔐 Segurança no Deploy

### Checklist de Segurança

- [ ] Secrets não hardcoded
- [ ] HTTPS configurado
- [ ] CORS configurado
- [ ] Security groups restritivos
- [ ] IAM roles com least privilege
- [ ] Backups configurados
- [ ] Logs de auditoria habilitados

### Secrets

```bash
# Nunca commitar secrets
echo "*.env.local" >> .gitignore
echo "*.tfvars" >> .gitignore

# Usar secret managers
# AWS: Secrets Manager
# Kubernetes: Secrets
# Docker: Docker secrets
```

## 📊 Monitoramento Pós-Deploy

### Métricas a Monitorar

- **Latência**: P95, P99
- **Taxa de erro**: 4xx, 5xx
- **Throughput**: Requests por segundo
- **Recursos**: CPU, memória, disco
- **Negócio**: Check-ins, alunos, salas

### Alertas

Configure alertas para:
- Taxa de erro > 1%
- Latência P95 > 1s
- CPU > 80%
- Memória > 80%
- Disk > 80%

## 🚨 Troubleshooting de Deploy

### Problemas Comuns

1. **Serviço não inicia**: Verificar logs, variáveis de ambiente
2. **Banco não conecta**: Verificar credenciais, security groups
3. **Kafka não conecta**: Verificar brokers, network
4. **Redis não conecta**: Verificar endpoint, portas

Consulte [Troubleshooting Guide](./TROUBLESHOOTING.md) para mais detalhes.

## 📚 Recursos

- [Infrastructure Terraform](../infrastructure/INFRASTRUCTURE_TERRAFORM.md)
- [Infrastructure Kubernetes](../infrastructure/INFRASTRUCTURE_KUBERNETES.md)
- [Troubleshooting](../TROUBLESHOOTING.md)
- [Architecture](../architecture/ARCHITECTURE.md)

---

**Última atualização**: 2025-01-20

