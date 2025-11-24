# Scripts de Seed

## seed-observability.js

Script para popular dados na base de dados para visualização de observabilidade no Grafana.

### O que faz

- Cria 1 usuário admin no Auth Service
- Cria 50 usuários estudantes no Auth Service
- Cria 50 alunos no Students Service (90% ativos, 10% inativos)
- Cria 20 salas no Rooms Service (diferentes tipos e capacidades)
- Cria ~200 check-ins distribuídos no Check-in Service

### Pré-requisitos

1. Serviços rodando:
   - Auth Service (porta 3000)
   - Students Service (porta 3001)
   - Rooms Service (porta 3002)
   - Check-in Service (porta 3003)

2. Instalar dependências (se necessário):
   ```bash
   npm install
   ```
   
   O script requer `axios` que está listado como devDependency.

### Uso

```bash
# Via npm script
npm run seed:observability

# Ou diretamente
node scripts/seed-observability.js
```

### Variáveis de Ambiente

```bash
API_BASE_URL=http://localhost:3000        # Auth Service
STUDENTS_URL=http://localhost:3001        # Students Service
ROOMS_URL=http://localhost:3002           # Rooms Service
CHECKIN_URL=http://localhost:3003          # Check-in Service
```

### O que você verá no Grafana

Após executar o script, os seguintes dashboards terão dados:

1. **Services Overview**
   - Taxa de requisições HTTP
   - Métricas de negócio (alunos, salas, check-ins criados)

2. **Check-ins Overview**
   - Total de check-ins
   - Check-ins por hora
   - Check-ins por método de identificação
   - Taxa de sucesso
   - Tempo de processamento

3. **Room Occupancy**
   - Taxa de ocupação por sala (%)
   - Check-ins por sala
   - Ocupação atual
   - Check-ins por tipo de sala

4. **Students Overview**
   - Total de alunos
   - Alunos ativos
   - Alunos criados (últimas 24h)
   - Taxa de criação

5. **Services Performance**
   - Request rate por serviço
   - Latência P95
   - Taxa de erro
   - Uso de memória

### Notas

- O script é idempotente: pode ser executado múltiplas vezes
- Usuários/alunos/salas duplicados serão ignorados
- Check-ins podem falhar se a sala estiver na capacidade máxima (normal)
- O script cria dados realistas com distribuição variada

### Troubleshooting

**Erro: "Cannot find module 'axios'"**
```bash
npm install axios
```

**Serviços não respondem**
- Verifique se os serviços estão rodando: `npm run docker:ps`
- Verifique as portas: `lsof -i :3000 -i :3001 -i :3002 -i :3003`

**Check-ins falhando**
- Normal se a sala estiver na capacidade máxima
- O script continua mesmo com algumas falhas

