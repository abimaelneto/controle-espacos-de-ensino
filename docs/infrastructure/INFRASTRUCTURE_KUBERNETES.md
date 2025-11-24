# ⚠️ Kubernetes - Proposta de Infraestrutura

> **Nota:** Este documento descreve uma proposta de como configurar a infraestrutura em Kubernetes. **Não está implementado no projeto atual**, que roda apenas localmente com Docker Compose.

Para desenvolvimento local, veja [Desenvolvimento Local](../setup/LOCAL_DEVELOPMENT.md).

Para a proposta completa de deploy em produção, veja [Proposta de Deploy para Produção](../deployment/PRODUCTION_DEPLOYMENT.md).

---

Este guia descreve como configurar e executar a aplicação em um cluster Kubernetes local usando **kind** (Kubernetes in Docker) - **como proposta para produção**.

## Pré-requisitos

- Docker instalado e rodando
- `kind` instalado ([Instalação](https://kind.sigs.k8s.io/docs/user/quick-start/#installation))
- `kubectl` instalado ([Instalação](https://kubernetes.io/docs/tasks/tools/))
- Scripts com permissão de execução

### Instalação do kind (macOS)

```bash
brew install kind
```

### Instalação do kubectl (macOS)

```bash
brew install kubectl
```

## Setup Completo

### Opção 1: Setup Automatizado (Recomendado)

Execute o script completo que faz tudo automaticamente:

```bash
cd infrastructure/kubernetes
./scripts/setup-complete.sh
```

Este script:
1. Cria o cluster kind
2. Instala o NGINX Ingress Controller
3. Builda e carrega as imagens Docker
4. Aplica todos os manifests Kubernetes

### Opção 2: Setup Manual (Passo a Passo)

#### 1. Criar o Cluster

```bash
cd infrastructure/kubernetes
./scripts/setup-kind-cluster.sh
```

#### 2. Buildar e Carregar Imagens

```bash
./scripts/build-and-load-images.sh
```

#### 3. Aplicar Manifests

```bash
./scripts/apply-manifests.sh
```

## Estrutura dos Manifests

```
infrastructure/kubernetes/
├── namespaces/
│   └── app-namespace.yaml          # Namespace principal
├── configmaps/
│   ├── mysql-config.yaml           # Configurações MySQL
│   ├── kafka-config.yaml            # Configurações Kafka
│   └── redis-config.yaml           # Configurações Redis
├── secrets/
│   └── app-secrets.yaml.example    # Secrets (copiar e configurar)
├── deployments/
│   ├── auth-service-deployment.yaml
│   ├── students-service-deployment.yaml
│   ├── rooms-service-deployment.yaml
│   ├── checkin-service-deployment.yaml
│   └── analytics-service-deployment.yaml
├── services/
│   ├── auth-service-service.yaml
│   ├── students-service-service.yaml
│   ├── rooms-service-service.yaml
│   ├── checkin-service-service.yaml
│   └── analytics-service-service.yaml
└── ingress/
    └── api-ingress.yaml             # Ingress para roteamento
```

## Configuração de Secrets

Antes de aplicar os manifests, você precisa criar o arquivo de secrets:

```bash
cd infrastructure/kubernetes/secrets
cp app-secrets.yaml.example app-secrets.yaml
# Edite app-secrets.yaml com seus valores reais
```

**Importante**: Nunca commite o arquivo `app-secrets.yaml` com valores reais!

## Verificação

### Verificar Status dos Pods

```bash
kubectl get pods -n controle-espacos
```

### Verificar Services

```bash
kubectl get services -n controle-espacos
```

### Verificar Ingress

```bash
kubectl get ingress -n controle-espacos
```

### Ver Logs de um Pod

```bash
kubectl logs -f <pod-name> -n controle-espacos
```

### Port Forward (para testes locais)

```bash
# Auth Service
kubectl port-forward -n controle-espacos svc/auth-service 3000:3000

# Students Service
kubectl port-forward -n controle-espacos svc/students-service 3001:3001
```

## Acessar Serviços

Após o setup completo, os serviços estarão disponíveis via Ingress:

- `http://api.localhost/api/v1/auth`
- `http://api.localhost/api/v1/students`
- `http://api.localhost/api/v1/rooms`
- `http://api.localhost/api/v1/checkin`
- `http://api.localhost/api/v1/analytics`

**Nota**: Certifique-se de que o domínio `api.localhost` está configurado no seu `/etc/hosts`:

```
127.0.0.1 api.localhost
```

## Infraestrutura de Apoio

Os manifests Kubernetes assumem que você tem os seguintes serviços rodando:

- **MySQL**: Instâncias separadas para cada serviço (ou use StatefulSets)
- **Kafka**: Cluster Kafka para mensageria
- **Redis**: Instância Redis para cache

Para desenvolvimento local, você pode usar o `docker-compose.yml` para subir esses serviços e então configurar os serviços Kubernetes para acessá-los.

## Limpeza

Para remover o cluster e limpar tudo:

```bash
cd infrastructure/kubernetes
./scripts/cleanup.sh
```

Ou manualmente:

```bash
kind delete cluster --name controle-espacos
```

## Troubleshooting

### Pods não iniciam

1. Verifique os logs: `kubectl logs <pod-name> -n controle-espacos`
2. Verifique eventos: `kubectl describe pod <pod-name> -n controle-espacos`
3. Verifique se as imagens foram carregadas: `kind load docker-image --help`

### Imagens não encontradas

Certifique-se de que as imagens foram buildadas e carregadas:

```bash
docker images | grep controle-espacos
kind load docker-image controle-espacos/auth-service:latest --name controle-espacos
```

### Ingress não funciona

1. Verifique se o NGINX Ingress está rodando: `kubectl get pods -n ingress-nginx`
2. Verifique o Ingress: `kubectl describe ingress api-ingress -n controle-espacos`

### Problemas de conexão com banco

1. Verifique se o MySQL está acessível
2. Verifique os ConfigMaps: `kubectl get configmap -n controle-espacos`
3. Verifique os Secrets: `kubectl get secrets -n controle-espacos`

## Próximos Passos

- [ ] Adicionar StatefulSets para MySQL
- [ ] Adicionar Deployments para Kafka e Redis
- [ ] Configurar Horizontal Pod Autoscaler (HPA)
- [ ] Adicionar Network Policies
- [ ] Configurar Resource Quotas
- [ ] Adicionar ServiceMonitor para Prometheus

