# Infraestrutura Local

## 🎯 Abordagem

Foco em **desenvolvimento local** com Docker Compose. Para produção, veja [Proposta de Deploy para Produção](./deployment/PRODUCTION_DEPLOYMENT.md).

## 📊 Estrutura Atual

### Docker Compose (Desenvolvimento Local) ⭐

**Quando usar:**
- Desenvolvimento local
- Testes
- Demonstração local

**Como usar:**
```bash
npm run docker:up  # Infraestrutura
npm run seed:all   # Seeds e migrations
npm run dev        # Serviços
```

**O que inclui:**
- MySQL (5 instâncias - uma por serviço)
- Kafka + Zookeeper
- Redis
- Prometheus
- Grafana

**Acesso:**
- Auth Service: `http://localhost:3000/api/v1/auth`
- Students Service: `http://localhost:3001/api/v1/students`
- Rooms Service: `http://localhost:3002/api/v1/rooms`
- Check-in Service: `http://localhost:3003/api/v1/checkin`
- Analytics Service: `http://localhost:3004/api/v1/analytics`
- Frontend Admin: `http://localhost:5173`
- Frontend Student: `http://localhost:5174`
- Grafana: `http://localhost:3001` (admin/admin)
- Prometheus: `http://localhost:9090`

## 🔄 Por que essa abordagem?

### ✅ Vantagens

1. **Simplicidade**: Um comando para subir tudo
2. **Desenvolvimento rápido**: Hot reload dos serviços
3. **Isolamento**: Cada serviço tem seu próprio banco
4. **Observabilidade**: Prometheus e Grafana incluídos
5. **Realista**: Infraestrutura similar à produção

### 📝 Decisões de Design

**Por que Docker Compose?**
- ✅ Simples e direto
- ✅ Adequado para desenvolvimento
- ✅ Fácil de configurar e manter
- ✅ Todos os serviços necessários incluídos

**Por que sem API Gateway local?**
- ✅ Desenvolvimento mais rápido
- ✅ Menos overhead
- ✅ Acesso direto por porta é suficiente para desenvolvimento
- ✅ API Gateway será usado em produção (ver proposta de deploy)

**Por que múltiplas instâncias de MySQL?**
- ✅ Isolamento por contexto (DDD)
- ✅ Cada serviço tem seu próprio banco
- ✅ Facilita desenvolvimento e testes

## 🚀 Para Produção

Para deploy em produção, consulte [Proposta de Deploy para Produção](./deployment/PRODUCTION_DEPLOYMENT.md), que inclui:
- Kubernetes ou Docker Swarm
- API Gateway (NGINX Ingress ou Traefik)
- Load balancing
- Auto-scaling
- Alta disponibilidade
- Segurança

---

**Última atualização**: 2025-01-20

