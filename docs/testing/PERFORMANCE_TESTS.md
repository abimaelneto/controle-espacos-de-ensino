# Testes de Stress e Performance

## Ferramenta
- **Artillery v2** (`npm run perf:auth`, `npm run perf:checkin`)
- Cenários versionados em `tests/performance/`

---

## 🔐 Cenário Auth (`tests/performance/auth-login.yml`)

### Pré-requisitos
1. Subir infra mínima (MySQL + Redis):
   ```bash
   npm run docker:up:minimal
   ```
2. Iniciar o Auth Service:
   ```bash
   npm run dev:auth
   ```

### Fluxo
- 2 fases (warm-up 10s, sustained 20s), até 5 req/s.
- Flow:
  1. `POST /api/v1/auth/register` (email aleatório)
  2. `POST /api/v1/auth/login` (mesmo usuário)
- Valida HTTP 201 / 200 para garantir sucesso.

### Execução
```bash
PATH=/Users/abimaelneto/.nvm/versions/node/v22.14.0/bin:$PATH npm run perf:auth
```
- Saída inclui latência média, p95, throughput, taxa de erros.
- Em caso de falha (status != esperado) Artillery aborta; ajustar serviços/infra e repetir.

### Resultado Atual (20/11/2025)
- Infra: `mysql-auth` e `redis` via `docker-compose.minimal`; Auth com `KAFKA_DISABLED=true`.
- Correção aplicada: TypeORM agora carrega entidades usando glob `*.{ts,js}`, eliminando `EntityMetadataNotFoundError`.
- Cenário executa 240 requisições (register + login), pico de 10 req/s.
- **Status**: 100% respostas 2xx, sem falhas. Latência média 130 ms, p95 242 ms, p99 369 ms.
- Foco atual: manter cenário como “smoke” para validar autenticação antes de fluxos mais pesados.

---

## 🧾 Cenário Check-in (`tests/performance/checkin-traefik.yml`)

### Objetivo
Validar o caminho crítico de registro de presença (check-in) com alta concorrência, garantindo que o serviço continue respondendo com latência previsível mesmo sem os demais microserviços.

### Pré-requisitos
1. Subir MySQL/Redis (mesmo comando do cenário Auth):
   ```bash
   npm run docker:up:minimal
   ```
2. Iniciar o Check-in Service em **modo de stress**:
   ```bash
   cd services/checkin-service
   CHECKIN_USE_FAKE_CLIENTS=true KAFKA_DISABLED=true npm run start:dev
   ```
   - `CHECKIN_USE_FAKE_CLIENTS=true` ativa os adapters mockados, dispensando Students/Rooms reais.
   - `KAFKA_DISABLED=true` utiliza o `NoopEventPublisherAdapter`.
   - Configurar `.env.local` do serviço para apontar para o mesmo MySQL (host `localhost`, user `app_user`, etc.).

### Fluxo
- 3 fases (20s @5 req/s, ramp-up até 25 req/s, sustentado 60s @25 req/s).
- Cada VU gera `studentId` único (`stress-student-*`) e dispara `POST /api/v1/checkin` diretamente no serviço (`http://localhost:3003/api/v1/checkin`).
- O processor `tests/performance/processors/checkin.js` evita colisões de matrícula/ID.

### Execução
```bash
PATH=/Users/abimaelneto/.nvm/versions/node/v22.14.0/bin:$PATH npm run perf:checkin
```
- Sobrescreva o alvo e sala via env:
  ```bash
  CHECKIN_STRESS_TARGET=http://api.localhost CHECKIN_STRESS_ROOM_ID=stress-room-2 npm run perf:checkin
  ```

### Resultado Inicial
- Check-in (modo mock) processou **2.300 requisições** em ~2min (pico ~25 req/s) com **100% HTTP 201**.
- Latência média: **~50 ms** | p95: **~150 ms** | p99: **~0,77 s** (picos por flush de disco MySQL).
- Métricas visíveis em Prometheus (`checkins_performed_total`, `checkins_failed_total`, `checkin_duration_seconds`) e dashboard **Stress Test Monitor**.
- Próximo passo: repetir cenário via Traefik/Students/Rooms reais para validar integrações fim a fim.

## Próximos Passos
- ✅ Adicionar variações do cenário de check-in via Traefik com Students/Rooms reais (modo mocks = false) - **IMPLEMENTADO**
- [ ] Integrar os comandos `perf:*` no pipeline de CI (smoke noturno).
- ✅ Automatizar seed/cleanup das tabelas de check-in ao final da rodada - **IMPLEMENTADO**
- [ ] Expandir dashboards de observabilidade para cobrir falhas por motivo e saturação de filas.

---

## 🎯 Testes de Stress sem Mock

Para testes usando serviços reais (sem mocks), consulte: [STRESS_TESTS_REAL.md](./STRESS_TESTS_REAL.md)

**Comandos disponíveis:**
- `npm run perf:seed` - Criar dados de teste
- `npm run perf:checkin:real` - Teste direto no Check-in Service
- `npm run perf:checkin:traefik` - Teste via Traefik
- `npm run perf:cleanup` - Limpar dados de teste

