# ⚠️ Kubernetes - Proposta para Produção

> **Nota:** Este documento descreve uma proposta de como o sistema poderia ser deployado em Kubernetes. **Não está implementado no projeto atual**, que roda apenas localmente com Docker Compose.

Para desenvolvimento local, veja [Desenvolvimento Local](./setup/LOCAL_DEVELOPMENT.md).

Para a proposta completa de deploy em produção, incluindo Kubernetes, veja [Proposta de Deploy para Produção](./deployment/PRODUCTION_DEPLOYMENT.md).

---

## 🎯 Por que Kubernetes?

Kubernetes seria a escolha ideal para produção porque oferece:

- ✅ **Escalabilidade automática** (HPA)
- ✅ **Auto-healing** (restart automático de pods)
- ✅ **Load balancing** nativo
- ✅ **Service discovery** integrado
- ✅ **Rolling updates** sem downtime
- ✅ **Health checks** e readiness probes

## 📋 O que seria necessário

### 1. Cluster Kubernetes
- **EKS** (AWS), **GKE** (GCP), **AKS** (Azure) ou self-hosted
- Namespaces para isolamento
- Resource limits e requests

### 2. API Gateway / Ingress
- **NGINX Ingress Controller** ou **Traefik**
- Roteamento de requisições
- SSL/TLS termination
- Rate limiting

### 3. Infraestrutura Gerenciada
- **MySQL gerenciado** (RDS, Cloud SQL, Azure Database)
- **Kafka gerenciado** (MSK, Confluent Cloud, Event Hubs)
- **Redis gerenciado** (ElastiCache, Memorystore, Azure Cache)

### 4. Observabilidade
- **Prometheus** + **Grafana**
- **Loki** ou **CloudWatch** para logs
- **Jaeger** ou **Zipkin** para tracing

## 🏗️ Estrutura Proposta

```
┌─────────────────────────────────────────┐
│         Load Balancer / Ingress        │
└────────────────────┬────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
┌───────▼────────┐      ┌─────────▼──────────┐
│  Frontend      │      │   API Gateway     │
│  (React SPA)   │      │   (Ingress)        │
└────────────────┘      └─────────┬──────────┘
                                  │
        ┌─────────────────────────┼─────────────────────────┐
        │                         │                         │
┌───────▼────────┐   ┌───────────▼──────────┐   ┌─────────▼─────────┐
│ Auth Service   │   │ Students Service     │   │ Rooms Service      │
│ (3 replicas)   │   │ (3 replicas)         │   │ (3 replicas)       │
└────────────────┘   └──────────────────────┘   └────────────────────┘
        │
┌───────▼────────┐   ┌───────────▼──────────┐
│ Checkin Service │   │ Analytics Service     │
│ (5 replicas)   │   │ (3 replicas)           │
└────────────────┘   └───────────────────────┘
```

## 📦 Exemplo de Deployment

```yaml
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
```

## 🔗 Mais Informações

Para detalhes completos sobre deploy em produção, consulte:
- [Proposta de Deploy para Produção](./deployment/PRODUCTION_DEPLOYMENT.md) - Proposta completa com Kubernetes, segurança, performance e escalabilidade

---

**Última atualização**: 2025-11-23
