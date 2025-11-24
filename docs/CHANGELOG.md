# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [Unreleased]

### Adicionado
- Script de seed para observabilidade (`scripts/seed-observability.js`)
- Documentação completa de APIs (`docs_ia/API_DOCUMENTATION.md`)
- Guia de desenvolvimento (`docs_ia/DEVELOPMENT_GUIDE.md`)
- Política de segurança (`docs_ia/SECURITY.md`)
- Guia de troubleshooting (`docs_ia/TROUBLESHOOTING.md`)
- Guia de deploy (`docs_ia/DEPLOYMENT.md`)
- Estratégia de testes (`docs_ia/TESTING_STRATEGY.md`)
- Documentação arquitetural (`docs_ia/ARCHITECTURE.md`)
- Guia de contribuição (`docs_ia/CONTRIBUTING.md`)
- Checklist de documentação (`docs_ia/DOCUMENTACAO_CHECKLIST.md`)

## [1.0.0] - 2025-01-20

### Adicionado
- Sistema completo de microsserviços
- 5 serviços: Auth, Students, Rooms, Check-in, Analytics
- Frontend Admin e Student
- Observabilidade completa (Prometheus + Grafana)
- Testes E2E com Playwright
- Testes de performance com Artillery
- Infraestrutura Kubernetes (Kind)
- Terraform para AWS
- Traefik API Gateway
- Proteções contra race conditions
- Distributed locks (Redis)
- Idempotency keys
- Event deduplication
- Optimistic locking
- Transações SERIALIZABLE

### Arquitetura
- Domain-Driven Design (DDD)
- Arquitetura Hexagonal (Ports and Adapters)
- Event-Driven Architecture (Kafka)
- Database per Service
- API Gateway (Traefik)

### Infraestrutura
- Docker Compose para desenvolvimento
- Kubernetes local (Kind)
- Terraform para AWS (VPC, RDS, ECS, EKS)
- Prometheus para métricas
- Grafana para visualização
- Redis para cache e locks
- Kafka para mensageria

### Testes
- ~250 testes unitários
- ~30 testes de integração
- ~50 testes E2E (Playwright)
- Testes de performance (Artillery)
- Testes de race conditions

### Documentação
- Diagramas Mermaid (9 diagramas)
- Documentação técnica completa
- Guias de setup e desenvolvimento
- Documentação de APIs
- Perguntas para processo seletivo

---

## Tipos de Mudanças

- **Adicionado**: Novas funcionalidades
- **Modificado**: Mudanças em funcionalidades existentes
- **Depreciado**: Funcionalidades que serão removidas
- **Removido**: Funcionalidades removidas
- **Corrigido**: Correções de bugs
- **Segurança**: Correções de vulnerabilidades

---

**Nota**: Este changelog será atualizado conforme o projeto evolui.

