# Testes de Performance e Stress

Este diretório contém os testes de performance e stress usando Artillery.

## 📁 Estrutura

```
tests/performance/
├── auth-login.yml              # Teste de stress do Auth Service
├── checkin-traefik.yml         # Teste de check-in com mocks
├── checkin-real.yml            # Teste de check-in sem mocks (direto)
├── checkin-traefik-real.yml    # Teste de check-in sem mocks (via Traefik)
├── processors/
│   ├── checkin.js              # Processor para mocks
│   └── checkin-real.js         # Processor para serviços reais
└── scripts/
    ├── seed-data.js            # Script para criar dados de teste
    └── cleanup-data.js         # Script para limpar dados de teste
```

## 🚀 Execução Rápida

### Testes com Mock (Rápido)

```bash
# Auth Service
npm run perf:auth

# Check-in Service (com mocks)
npm run perf:checkin
```

### Testes sem Mock (Realista)

```bash
# 1. Criar dados de teste
npm run perf:seed

# 2. Executar teste
npm run perf:checkin:real        # Direto no Check-in Service
npm run perf:checkin:traefik    # Via Traefik

# 3. Limpar dados
npm run perf:cleanup
```

## 📚 Documentação

- [PERFORMANCE_TESTS.md](../../docs_ia/PERFORMANCE_TESTS.md) - Documentação geral
- [STRESS_TESTS_REAL.md](../../docs_ia/STRESS_TESTS_REAL.md) - Testes sem mock

## ⚙️ Configuração

### Variáveis de Ambiente

**Seed:**
- `STUDENTS_SERVICE_URL` - URL do Students Service
- `ROOMS_SERVICE_URL` - URL do Rooms Service
- `NUM_STUDENTS` - Número de alunos a criar
- `NUM_ROOMS` - Número de salas a criar

**Testes:**
- `CHECKIN_TARGET` - URL do Check-in Service
- `TRAEFIK_TARGET` - URL do Traefik
- `SEED_DATA_FILE` - Caminho do arquivo de seed

## 📊 Monitoramento

Durante os testes, monitore:
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3001 (admin/admin)
- **Dashboard**: Stress Test Monitor

