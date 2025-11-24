# ⚠️ Traefik API Gateway - Proposta para Produção

> **Nota:** Este documento descreve uma proposta de como configurar Traefik como API Gateway. **Não está implementado no projeto atual**, que roda apenas localmente com acesso direto por porta.

Para desenvolvimento local, veja [Desenvolvimento Local](../setup/LOCAL_DEVELOPMENT.md).

Para a proposta completa de deploy em produção, veja [Proposta de Deploy para Produção](../deployment/PRODUCTION_DEPLOYMENT.md).

---

## 🎯 Objetivo Proposto

Centralizar o acesso aos microsserviços por meio de um gateway HTTP único (`http://api.localhost`) com suporte a CORS, métricas e dashboard.

## 🏗️ Como Funcionaria

```bash
# Em produção, Traefik seria adicionado ao docker-compose.yml
docker-compose up -d traefik
```

- **API base:** `http://api.localhost`
- **Dashboard:** `http://traefik.localhost:8080`

## 🔁 Rotas Propostas

| Serviço | Caminho via Traefik | Porta Interna |
|---------|--------------------|---------------|
| Auth Service | `http://api.localhost/api/v1/auth/*` | `host.docker.internal:3000` |
| Students Service | `http://api.localhost/api/v1/students/*` | `host.docker.internal:3001` |
| Rooms Service | `http://api.localhost/api/v1/rooms/*` | `host.docker.internal:3002` |
| Check-in Service | `http://api.localhost/api/v1/checkin/*` | `host.docker.internal:3003` |
| Analytics Service | `http://api.localhost/api/v1/analytics/*` | `host.docker.internal:3004` |

## ⚙️ Estrutura dos Arquivos (Proposta)

```
infrastructure/docker/
├── traefik.yml          # Configuração estática
└── traefik/
    └── routes.yml       # Configuração dinâmica (rotas, middlewares, LB)
```

Os arquivos de configuração existem em `infrastructure/docker/traefik/` como exemplo para implementação futura.

## 🔗 Mais Informações

Para detalhes completos sobre deploy em produção, consulte:
- [Proposta de Deploy para Produção](../deployment/PRODUCTION_DEPLOYMENT.md) - Proposta completa com API Gateway

---

**Última atualização**: 2025-01-20
