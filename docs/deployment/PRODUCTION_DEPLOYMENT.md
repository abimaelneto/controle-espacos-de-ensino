# 🚀 Proposta de Deploy para Produção

Este documento descreve uma proposta de arquitetura e estratégia de deploy para colocar o sistema de Controle de Espaços de Ensino em produção, garantindo comunicação, performance e escalabilidade.

## 📋 Visão Geral

O sistema é composto por:
- **5 Microsserviços Backend** (NestJS)
- **2 Frontends** (React + Vite)
- **Infraestrutura** (MySQL, Kafka, Redis, Prometheus, Grafana)

## 🏗️ Arquitetura Proposta para Produção

### Opção 1: Kubernetes (Recomendada) ⭐

**Vantagens:**
- Escalabilidade automática (HPA)
- Auto-healing (restart automático de pods)
- Load balancing nativo
- Service discovery integrado
- Rolling updates sem downtime
- Health checks e readiness probes

#### Componentes Necessários

1. **API Gateway / Ingress Controller**
   - **NGINX Ingress** ou **Traefik**
   - Roteamento de requisições
   - SSL/TLS termination
   - Rate limiting
   - CORS

2. **Orquestração**
   - **Kubernetes** (EKS, GKE, AKS ou self-hosted)
   - Namespaces para isolamento
   - Resource limits e requests
   - Horizontal Pod Autoscaler (HPA)

3. **Banco de Dados**
   - **MySQL gerenciado** (RDS, Cloud SQL, Azure Database)
   - Read replicas para analytics
   - Backup automático
   - Connection pooling

4. **Mensageria**
   - **Kafka gerenciado** (MSK, Confluent Cloud, Azure Event Hubs)
   - Ou **RabbitMQ** como alternativa mais simples
   - Tópicos por contexto (checkin, analytics)

5. **Cache**
   - **Redis gerenciado** (ElastiCache, Cloud Memorystore, Azure Cache)
   - Cluster mode para alta disponibilidade

6. **Observabilidade**
   - **Prometheus** + **Grafana** (ou soluções gerenciadas)
   - **Loki** ou **CloudWatch** para logs
   - **Jaeger** ou **Zipkin** para tracing distribuído

#### Estrutura de Deploy

```
┌─────────────────────────────────────────────────────────┐
│                    Load Balancer                        │
│              (NGINX Ingress / Traefik)                  │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
┌───────▼────────┐      ┌─────────▼──────────┐
│  Frontend      │      │   API Gateway      │
│  (React SPA)   │      │   (Ingress)        │
│                │      │                    │
│  - Admin       │      │  /api/v1/auth      │
│  - Student     │      │  /api/v1/students   │
└────────────────┘      │  /api/v1/rooms     │
                        │  /api/v1/checkin    │
                        │  /api/v1/analytics │
                        └─────────┬───────────┘
                                 │
        ┌────────────────────────┼────────────────────────┐
        │                        │                        │
┌───────▼────────┐   ┌──────────▼──────────┐   ┌─────────▼─────────┐
│ Auth Service   │   │ Students Service    │   │ Rooms Service      │
│ (3 replicas)   │   │ (3 replicas)        │   │ (3 replicas)       │
└───────┬────────┘   └──────────┬──────────┘   └─────────┬───────────┘
        │                        │                        │
┌───────▼────────┐   ┌──────────▼──────────┐   ┌─────────▼──────────┐
│ Checkin Service │   │ Analytics Service    │   │                    │
│ (5 replicas)   │   │ (3 replicas)         │   │                    │
└───────┬────────┘   └──────────┬───────────┘   └────────────────────┘
        │                       │
        └───────────┬───────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
┌───────▼────────┐   ┌─────────▼──────────┐
│ MySQL Cluster  │   │ Kafka Cluster      │
│ (Primary +     │   │ (3 brokers)        │
│  Replicas)     │   │                    │
└────────────────┘   └────────────────────┘
        │
┌───────▼────────┐
│ Redis Cluster  │
│ (3 nodes)      │
└────────────────┘
```

#### Configurações Recomendadas

**Microsserviços:**
```yaml
resources:
  requests:
    memory: "256Mi"
    cpu: "250m"
  limits:
    memory: "512Mi"
    cpu: "500m"
replicas: 3
autoscaling:
  minReplicas: 2
  maxReplicas: 10
  targetCPUUtilization: 70
```

**Check-in Service (maior carga):**
```yaml
replicas: 5
autoscaling:
  minReplicas: 3
  maxReplicas: 20
  targetCPUUtilization: 70
```

### Opção 2: Docker Swarm (Alternativa Simples)

**Vantagens:**
- Mais simples que Kubernetes
- Menos overhead
- Adequado para médio porte

**Limitações:**
- Menos recursos de autoscaling
- Menos flexibilidade

### Opção 3: Cloud Managed Services

**AWS:**
- **ECS/Fargate** para containers
- **RDS** para MySQL
- **MSK** para Kafka
- **ElastiCache** para Redis
- **ALB** como load balancer
- **CloudWatch** para observabilidade

**Azure:**
- **Azure Container Instances** ou **AKS**
- **Azure Database for MySQL**
- **Event Hubs** para mensageria
- **Azure Cache for Redis**
- **Application Gateway** como load balancer
- **Azure Monitor** para observabilidade

**GCP:**
- **Cloud Run** ou **GKE**
- **Cloud SQL** para MySQL
- **Pub/Sub** para mensageria
- **Memorystore** para Redis
- **Cloud Load Balancing**
- **Cloud Monitoring** para observabilidade

## 🔐 Segurança

### 1. Autenticação e Autorização
- **JWT** com refresh tokens
- Tokens com expiração curta (15min)
- Refresh tokens com rotação
- Rate limiting por IP/usuário

### 2. Comunicação entre Serviços
- **mTLS** (mutual TLS) entre serviços
- Service mesh (Istio, Linkerd) opcional
- Network policies no Kubernetes

### 3. Segurança de Dados
- **Criptografia em trânsito** (TLS 1.3)
- **Criptografia em repouso** (banco de dados)
- **Secrets management** (Vault, AWS Secrets Manager, Azure Key Vault)
- **Rotação de credenciais** automática

### 4. API Gateway
- **Rate limiting** por rota
- **WAF** (Web Application Firewall)
- **DDoS protection**
- **CORS** configurado corretamente

## 📊 Performance

### 1. Cache Strategy

**Redis:**
- Cache de dados de alunos (TTL: 5min)
- Cache de dados de salas (TTL: 10min)
- Cache de métricas de analytics (TTL: 1min)
- Distributed locks para check-in

**CDN para Frontend:**
- CloudFront, Cloudflare, ou Azure CDN
- Cache de assets estáticos
- Compressão gzip/brotli

### 2. Database Optimization

**MySQL:**
- Índices otimizados
- Connection pooling (HikariCP, node-pool)
- Read replicas para queries de analytics
- Particionamento de tabelas grandes (attendance)

**Queries:**
- Paginação em todas as listagens
- Lazy loading onde apropriado
- Batch operations quando possível

### 3. Message Queue

**Kafka:**
- Partições adequadas (3-5 por tópico)
- Retention policy configurada
- Compression (snappy ou gzip)
- Consumer groups para paralelismo

### 4. Load Balancing

- **Round-robin** ou **least connections**
- Health checks frequentes
- Circuit breakers (Hystrix, Resilience4j)

## 📈 Escalabilidade

### 1. Horizontal Scaling

**Microsserviços:**
- Stateless (sem sessão local)
- Auto-scaling baseado em CPU/memória
- Auto-scaling baseado em métricas customizadas (fila Kafka)

**Banco de Dados:**
- Read replicas para leitura
- Sharding por contexto (se necessário)
- Connection pooling adequado

### 2. Vertical Scaling

- Aumentar recursos de serviços críticos (check-in)
- Upgrade de instâncias de banco quando necessário

### 3. Caching Strategy

- Cache em múltiplas camadas:
  - CDN (frontend)
  - API Gateway (respostas)
  - Redis (dados frequentes)
  - Application cache (dados imutáveis)

## 🔄 CI/CD

### Pipeline Recomendado

1. **Build**
   - Build Docker images
   - Run tests
   - Security scanning (Trivy, Snyk)

2. **Test**
   - Unit tests
   - Integration tests
   - E2E tests

3. **Deploy**
   - Staging environment
   - Smoke tests
   - Production (blue/green ou canary)

### Ferramentas

- **GitHub Actions**, **GitLab CI**, ou **Jenkins**
- **ArgoCD** ou **Flux** para GitOps (Kubernetes)
- **Helm** charts para Kubernetes

## 📦 Estrutura de Deploy

### Kubernetes Manifests (Exemplo)

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: checkin-service
spec:
  replicas: 5
  selector:
    matchLabels:
      app: checkin-service
  template:
    metadata:
      labels:
        app: checkin-service
    spec:
      containers:
      - name: checkin-service
        image: registry/checkin-service:latest
        ports:
        - containerPort: 3000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health/ready
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 5
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: checkin-service-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: checkin-service
  minReplicas: 3
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

## 🎯 Checklist de Deploy

### Pré-Deploy
- [ ] Variáveis de ambiente configuradas
- [ ] Secrets gerenciados adequadamente
- [ ] Health checks implementados
- [ ] Logging estruturado configurado
- [ ] Métricas expostas (Prometheus)
- [ ] Database migrations testadas
- [ ] Backup strategy definida

### Deploy
- [ ] Deploy em staging primeiro
- [ ] Smoke tests passando
- [ ] Monitoramento ativo
- [ ] Rollback plan preparado
- [ ] Deploy gradual (canary/blue-green)

### Pós-Deploy
- [ ] Verificar logs
- [ ] Verificar métricas
- [ ] Verificar health checks
- [ ] Testar funcionalidades críticas
- [ ] Monitorar por período adequado

## 📝 Considerações Finais

### Custos Estimados (AWS - Exemplo)

**Médio Porte:**
- ECS/Fargate: ~$200-400/mês
- RDS (db.t3.medium): ~$150/mês
- MSK (3 brokers): ~$300/mês
- ElastiCache (cache.t3.medium): ~$100/mês
- ALB: ~$20/mês
- **Total: ~$770-970/mês**

**Alto Porte:**
- ECS/Fargate: ~$500-1000/mês
- RDS (db.r5.xlarge): ~$500/mês
- MSK (5 brokers): ~$600/mês
- ElastiCache (cache.r5.large): ~$300/mês
- ALB: ~$20/mês
- **Total: ~$1920-2420/mês**

### Recomendações

1. **Começar simples:** Deploy em staging primeiro
2. **Monitorar:** Observabilidade é crítica
3. **Escalar gradualmente:** Não over-provisionar
4. **Backup:** Estratégia de backup testada
5. **Documentação:** Runbooks para operações

---

**Última atualização:** 2025-01-20

