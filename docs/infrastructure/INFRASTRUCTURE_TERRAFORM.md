# Terraform para AWS - Controle de Espaços de Ensino

Este guia descreve como usar o Terraform para provisionar a infraestrutura na AWS.

## Estrutura

```
infrastructure/terraform/
├── modules/
│   ├── vpc/          # Módulo VPC (subnets, NAT, IGW)
│   ├── rds/          # Módulo RDS (MySQL para cada serviço)
│   ├── ecs/          # Módulo ECS (alternativa ao EKS)
│   └── eks/          # Módulo EKS (Kubernetes gerenciado)
└── environments/
    └── cloud/        # Configuração para AWS
        ├── main.tf
        ├── variables.tf
        ├── outputs.tf
        └── terraform.tfvars.example
```

## Pré-requisitos

- Terraform >= 1.0 instalado
- AWS CLI configurado com credenciais
- Permissões adequadas na AWS (IAM, VPC, RDS, EKS, ECS)

### Instalação do Terraform (macOS)

```bash
brew install terraform
```

### Configuração AWS

```bash
aws configure
# AWS Access Key ID
# AWS Secret Access Key
# Default region name: us-east-1
# Default output format: json
```

## Módulos Disponíveis

### 1. VPC Module

Cria uma VPC completa com:
- Subnets públicas e privadas
- Internet Gateway
- NAT Gateways
- Route Tables

**Uso:**

```hcl
module "vpc" {
  source = "../../modules/vpc"

  project_name        = "controle-espacos"
  environment         = "dev"
  vpc_cidr            = "10.0.0.0/16"
  availability_zones  = ["us-east-1a", "us-east-1b"]
  public_subnet_cidrs = ["10.0.1.0/24", "10.0.2.0/24"]
  private_subnet_cidrs = ["10.0.10.0/24", "10.0.20.0/24"]
}
```

### 2. RDS Module

Cria instâncias RDS MySQL para cada serviço:
- auth (identity)
- students (academic)
- rooms (facilities)
- checkin (attendance)
- analytics (analytics)

**Uso:**

```hcl
module "rds" {
  source = "../../modules/rds"

  project_name          = "controle-espacos"
  environment           = "dev"
  vpc_id                = module.vpc.vpc_id
  private_subnet_ids    = module.vpc.private_subnet_ids
  allowed_security_group_ids = [module.ecs.ecs_tasks_security_group_id]
  databases = {
    auth = { db_name = "identity" }
    students = { db_name = "academic" }
    rooms = { db_name = "facilities" }
    checkin = { db_name = "attendance" }
    analytics = { db_name = "analytics" }
  }
  master_username = var.db_master_username
  master_password = var.db_master_password
}
```

### 3. ECS Module

Cria um cluster ECS com:
- Cluster configurado
- IAM Roles
- Security Groups
- CloudWatch Log Groups

**Uso:**

```hcl
module "ecs" {
  source = "../../modules/ecs"

  project_name = "controle-espacos"
  environment  = "dev"
  vpc_id       = module.vpc.vpc_id
}
```

### 4. EKS Module

Cria um cluster EKS com:
- Cluster Kubernetes gerenciado
- Node Groups
- IAM Roles
- CloudWatch Logs

**Uso:**

```hcl
module "eks" {
  source = "../../modules/eks"

  project_name        = "controle-espacos"
  environment         = "dev"
  public_subnet_ids   = module.vpc.public_subnet_ids
  private_subnet_ids  = module.vpc.private_subnet_ids
  kubernetes_version  = "1.28"
  node_desired_size   = 2
  node_max_size       = 4
  node_min_size       = 1
}
```

## Configuração

### 1. Copiar arquivo de variáveis

```bash
cd infrastructure/terraform/environments/cloud
cp terraform.tfvars.example terraform.tfvars
```

### 2. Editar `terraform.tfvars`

```hcl
project_name = "controle-espacos"
environment   = "dev"
aws_region    = "us-east-1"

vpc_cidr = "10.0.0.0/16"

availability_zones = ["us-east-1a", "us-east-1b"]

public_subnet_cidrs  = ["10.0.1.0/24", "10.0.2.0/24"]
private_subnet_cidrs = ["10.0.10.0/24", "10.0.20.0/24"]

# Database credentials
db_master_username = "admin"
db_master_password  = "SUA_SENHA_SEGURA_AQUI"

# RDS Configuration
db_instance_class         = "db.t3.small"
db_allocated_storage      = 20
db_max_allocated_storage  = 100
db_backup_retention_period = 7

# EKS Configuration
kubernetes_version     = "1.28"
eks_node_desired_size  = 2
eks_node_max_size      = 4
eks_node_min_size      = 1
eks_node_instance_types = ["t3.medium"]
```

**⚠️ IMPORTANTE**: Nunca commite o arquivo `terraform.tfvars` com valores reais!

### 3. Configurar Backend (Opcional)

Para usar S3 como backend do Terraform, edite `main.tf`:

```hcl
terraform {
  backend "s3" {
    bucket = "seu-terraform-state-bucket"
    key    = "controle-espacos/terraform.tfstate"
    region = "us-east-1"
  }
}
```

## Uso

### Inicializar Terraform

```bash
cd infrastructure/terraform/environments/cloud
terraform init
```

### Planejar Mudanças

```bash
terraform plan
```

### Aplicar Infraestrutura

```bash
terraform apply
```

Confirme digitando `yes` quando solicitado.

### Verificar Outputs

```bash
terraform output
```

### Destruir Infraestrutura

```bash
terraform destroy
```

**⚠️ CUIDADO**: Isso vai deletar TODA a infraestrutura!

## Outputs Importantes

Após aplicar o Terraform, você terá acesso a:

- `vpc_id`: ID da VPC criada
- `public_subnet_ids`: IDs das subnets públicas
- `private_subnet_ids`: IDs das subnets privadas
- `rds_endpoints`: Endpoints dos bancos RDS
- `ecs_cluster_id`: ID do cluster ECS
- `eks_cluster_id`: ID do cluster EKS
- `eks_cluster_endpoint`: Endpoint do cluster EKS
- `eks_cluster_name`: Nome do cluster EKS

## Conectando ao EKS

Após criar o cluster EKS:

```bash
# Atualizar kubeconfig
aws eks update-kubeconfig --region us-east-1 --name controle-espacos-cluster

# Verificar conexão
kubectl get nodes
```

## Custos Estimados

### Desenvolvimento (dev)

- VPC: ~$0
- RDS (5x db.t3.micro): ~$75/mês
- EKS Cluster: ~$73/mês
- EKS Nodes (2x t3.medium): ~$60/mês
- NAT Gateways (2x): ~$65/mês
- **Total estimado**: ~$273/mês

### Produção

- RDS (5x db.t3.small): ~$150/mês
- EKS Cluster: ~$73/mês
- EKS Nodes (4x t3.medium): ~$120/mês
- NAT Gateways (2x): ~$65/mês
- **Total estimado**: ~$408/mês

**Nota**: Custos podem variar baseado em uso, tráfego e região.

## Segurança

### Boas Práticas

1. **Secrets**: Use AWS Secrets Manager ou Parameter Store para senhas
2. **IAM**: Aplique princípio do menor privilégio
3. **Network**: Use Security Groups restritivos
4. **Encryption**: Habilite encryption at rest e in transit
5. **Backup**: Configure backups automáticos do RDS
6. **Monitoring**: Use CloudWatch e AWS Config

### Exemplo: Usando AWS Secrets Manager

```hcl
data "aws_secretsmanager_secret_version" "db_credentials" {
  secret_id = "controle-espacos/db-credentials"
}

locals {
  db_credentials = jsondecode(data.aws_secretsmanager_secret_version.db_credentials.secret_string)
}

module "rds" {
  # ...
  master_username = local.db_credentials.username
  master_password = local.db_credentials.password
}
```

## Troubleshooting

### Erro de permissões

Verifique se suas credenciais AWS têm as permissões necessárias:

- `ec2:*`
- `rds:*`
- `eks:*`
- `ecs:*`
- `iam:*` (para criar roles)

### Erro ao criar RDS

- Verifique se as subnets privadas têm pelo menos 2 AZs
- Verifique se o security group permite tráfego do ECS/EKS

### Erro ao criar EKS

- Verifique se você tem permissões para criar clusters
- Verifique se as subnets estão em AZs diferentes
- Verifique se há limites de recursos na sua conta AWS

## Próximos Passos

- [ ] Adicionar módulo para ElastiCache (Redis)
- [ ] Adicionar módulo para MSK (Kafka)
- [ ] Adicionar módulo para ALB (Application Load Balancer)
- [ ] Adicionar módulo para CloudFront (CDN)
- [ ] Configurar CI/CD com GitHub Actions
- [ ] Adicionar módulo para WAF (Web Application Firewall)

