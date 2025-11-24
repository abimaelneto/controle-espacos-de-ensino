# Documentação do Projeto

Bem-vindo à documentação oficial do projeto **Controle de Espaços de Ensino**.

## 📋 Estrutura

```
docs/
├── README.md                    # Este arquivo
├── CONTRIBUTING.md              # Guia de contribuição
├── DEVELOPMENT_GUIDE.md        # Guia de desenvolvimento
├── TROUBLESHOOTING.md           # Solução de problemas
├── REQUIREMENTS.md              # Requisitos do projeto
├── REQUIREMENTS_STATUS.md       # Status dos requisitos
├── PLANO_DETALHADO.md           # Plano de implementação
├── CHANGELOG.md                 # Histórico de mudanças
│
├── architecture/                # Documentação arquitetural
│   ├── ARCHITECTURE.md          # Arquitetura completa
│   ├── DESIGN_DECISIONS.md      # Decisões de design (ADRs)
│   ├── DIAGRAMAS_PROJETO.md     # Índice de diagramas
│   └── diagrams/                # Diagramas Mermaid
│
├── api/                         # Documentação de APIs
│   └── API_DOCUMENTATION.md     # APIs consolidadas
│
├── setup/                       # Guias de setup
│   └── LOCAL_DEVELOPMENT.md     # Desenvolvimento local
│
├── testing/                     # Documentação de testes
│   ├── TESTING_STRATEGY.md      # Estratégia de testes
│   └── PERFORMANCE_TESTS.md     # Testes de performance
│
├── deployment/                  # Documentação de deploy
│   └── DEPLOYMENT.md            # Guia de deploy
│
├── infrastructure/              # Infraestrutura
│   ├── AWS_ADAPTERS.md          # Adaptadores AWS (proposta)
│   ├── TRAEFIK_SETUP.md         # Setup Traefik (proposta)
│   ├── INFRASTRUCTURE_KUBERNETES.md  # Kubernetes (proposta)
│   └── INFRASTRUCTURE_TERRAFORM.md   # Terraform (proposta)
│
├── observability/               # Observabilidade
│   └── OBSERVABILITY_COMPLETE.md # Observabilidade completa
│
├── security/                    # Segurança
    ├── SECURITY.md              # Política de segurança
    └── RACE_CONDITIONS_SOLUTIONS.md  # Race conditions
│
├── demonstration/               # Demonstração
    └── DEMONSTRATION_GUIDE.md  # Guia de demonstração
│
├── evaluation/                  # Avaliação
    └── USER_EVALUATION.md       # Avaliação do usuário final
│
├── checklist/                   # Checklists
    └── FEATURES_CHECKLIST.md    # Checklist de funcionalidades
│
└── status/                      # Status
    └── PROJECT_STATUS.md        # Status do projeto
```

## 🚀 Início Rápido

1. **Novo no projeto?** Comece com:
   - [README.md](../README.md) - Visão geral
   - [setup/LOCAL_DEVELOPMENT.md](setup/LOCAL_DEVELOPMENT.md) - Setup local
   - [DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md) - Guia de desenvolvimento

2. **Quer contribuir?**
   - [CONTRIBUTING.md](CONTRIBUTING.md) - Guia de contribuição

3. **Problemas?**
   - [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Solução de problemas

## 📖 Documentação por Categoria

### Arquitetura
- [Arquitetura do Sistema](architecture/ARCHITECTURE.md)
- [Decisões de Design](architecture/DESIGN_DECISIONS.md)
- [Diagramas](architecture/DIAGRAMAS_PROJETO.md)

### Desenvolvimento
- [Guia de Desenvolvimento](DEVELOPMENT_GUIDE.md)
- [Desenvolvimento Local](setup/LOCAL_DEVELOPMENT.md)
- [Guia de Contribuição](CONTRIBUTING.md)

### APIs
- [Documentação de APIs](api/API_DOCUMENTATION.md)
- Swagger em cada serviço: `http://localhost:300X/api/docs`

### Testes
- [Estratégia de Testes](testing/TESTING_STRATEGY.md)
- [Testes de Performance](testing/PERFORMANCE_TESTS.md)

### Deploy
- [Guia de Deploy](deployment/DEPLOYMENT.md)
- [Proposta de Deploy para Produção](deployment/PRODUCTION_DEPLOYMENT.md) - ⭐ Proposta completa
- [Kubernetes](infrastructure/INFRASTRUCTURE_KUBERNETES.md) - Proposta
- [Terraform](infrastructure/INFRASTRUCTURE_TERRAFORM.md) - Proposta

### Observabilidade
- [Observabilidade Completa](observability/OBSERVABILITY_COMPLETE.md)

### Segurança
- [Política de Segurança](security/SECURITY.md)
- [Guia de Autenticação JWT](security/AUTHENTICATION.md) - **Autenticação e autorização completa** ⭐
- [Race Conditions](security/RACE_CONDITIONS_SOLUTIONS.md)

### Demonstração e Avaliação
- [Guia de Demonstração](demonstration/DEMONSTRATION_GUIDE.md) - Roteiro completo para demonstrar o projeto
- [Avaliação do Usuário Final](evaluation/USER_EVALUATION.md) - Perspectiva do gestor de espaços
- [Checklist de Funcionalidades](checklist/FEATURES_CHECKLIST.md) - Verificação completa
- [Status do Projeto](status/PROJECT_STATUS.md) - Estado atual e funcionalidades

## 📝 Nota sobre docs_ia/

A pasta `docs_ia/` contém documentação de contexto para IA e processo seletivo. A documentação oficial do projeto está em `docs/`.

---

**Última atualização**: 2025-01-20

