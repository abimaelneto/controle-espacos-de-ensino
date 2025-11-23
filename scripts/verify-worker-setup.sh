#!/bin/bash

# Script de Verificação - Worker de Check-in e WebSocket
# Verifica se tudo está configurado corretamente para o worker funcionar

set -e

echo "🔍 Verificando configuração do Worker de Check-in e WebSocket..."
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0

# Função para verificar e reportar
check() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ $1${NC}"
    else
        echo -e "${RED}❌ $1${NC}"
        ERRORS=$((ERRORS + 1))
    fi
}

# 1. Verificar Docker
echo "📦 Verificando Docker..."
docker ps > /dev/null 2>&1
check "Docker está rodando"

# 2. Verificar Kafka
echo ""
echo "📡 Verificando Kafka..."
KAFKA_RUNNING=$(docker ps | grep -c kafka || true)
if [ "$KAFKA_RUNNING" -gt 0 ]; then
    echo -e "${GREEN}✅ Kafka está rodando${NC}"
else
    echo -e "${RED}❌ Kafka não está rodando. Execute: npm run docker:up${NC}"
    ERRORS=$((ERRORS + 1))
fi

# 3. Verificar Zookeeper
echo ""
echo "🦘 Verificando Zookeeper..."
ZOOKEEPER_RUNNING=$(docker ps | grep -c zookeeper || true)
if [ "$ZOOKEEPER_RUNNING" -gt 0 ]; then
    echo -e "${GREEN}✅ Zookeeper está rodando${NC}"
else
    echo -e "${RED}❌ Zookeeper não está rodando. Execute: npm run docker:up${NC}"
    ERRORS=$((ERRORS + 1))
fi

# 4. Verificar Redis
echo ""
echo "💾 Verificando Redis..."
REDIS_RUNNING=$(docker ps | grep -c redis || true)
if [ "$REDIS_RUNNING" -gt 0 ]; then
    echo -e "${GREEN}✅ Redis está rodando${NC}"
else
    echo -e "${YELLOW}⚠️  Redis não está rodando (opcional, mas recomendado)${NC}"
fi

# 5. Verificar Check-in Service
echo ""
echo "🔧 Verificando Check-in Service..."
CHECKIN_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3003/metrics 2>/dev/null || echo "000")
if [ "$CHECKIN_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ Check-in Service está rodando${NC}"
elif [ "$CHECKIN_RESPONSE" = "000" ]; then
    echo -e "${RED}❌ Check-in Service não está respondendo na porta 3003${NC}"
    echo -e "${YELLOW}   Certifique-se de que o serviço está rodando: npm run dev:checkin${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${YELLOW}⚠️  Check-in Service retornou status $CHECKIN_RESPONSE (pode estar iniciando)${NC}"
fi

# 6. Verificar Analytics Service
echo ""
echo "📊 Verificando Analytics Service..."
ANALYTICS_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3004/metrics 2>/dev/null || echo "000")
if [ "$ANALYTICS_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ Analytics Service está rodando${NC}"
elif [ "$ANALYTICS_RESPONSE" = "000" ]; then
    echo -e "${RED}❌ Analytics Service não está respondendo na porta 3004${NC}"
    echo -e "${YELLOW}   Certifique-se de que o serviço está rodando: npm run dev:analytics${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${YELLOW}⚠️  Analytics Service retornou status $ANALYTICS_RESPONSE (pode estar iniciando)${NC}"
fi

# 7. Verificar configuração do Check-in Service
echo ""
echo "⚙️  Verificando configuração do Check-in Service..."
if [ -f "services/checkin-service/.env.local" ]; then
    if grep -q "KAFKA_DISABLED=false" services/checkin-service/.env.local 2>/dev/null; then
        echo -e "${GREEN}✅ Kafka habilitado no Check-in Service${NC}"
    else
        echo -e "${RED}❌ Kafka desabilitado no Check-in Service. Configure KAFKA_DISABLED=false${NC}"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo -e "${YELLOW}⚠️  Arquivo .env.local não encontrado no Check-in Service${NC}"
    echo -e "${YELLOW}   Criando arquivo com configuração padrão...${NC}"
    mkdir -p services/checkin-service
    echo "KAFKA_DISABLED=false" > services/checkin-service/.env.local
    echo "KAFKA_BROKERS=localhost:9092" >> services/checkin-service/.env.local
    echo -e "${GREEN}✅ Arquivo .env.local criado${NC}"
fi

# 8. Verificar configuração do Analytics Service
echo ""
echo "⚙️  Verificando configuração do Analytics Service..."
if [ -f "services/analytics-service/.env.local" ]; then
    if grep -q "KAFKA_DISABLED=false" services/analytics-service/.env.local 2>/dev/null; then
        echo -e "${GREEN}✅ Kafka habilitado no Analytics Service${NC}"
    else
        echo -e "${RED}❌ Kafka desabilitado no Analytics Service. Configure KAFKA_DISABLED=false${NC}"
        ERRORS=$((ERRORS + 1))
    fi
    
    if grep -q "FRONTEND_URL" services/analytics-service/.env.local 2>/dev/null; then
        echo -e "${GREEN}✅ FRONTEND_URL configurado${NC}"
    else
        echo -e "${YELLOW}⚠️  FRONTEND_URL não configurado. Adicionando...${NC}"
        echo "FRONTEND_URL=http://localhost:5173" >> services/analytics-service/.env.local
        echo -e "${GREEN}✅ FRONTEND_URL adicionado${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Arquivo .env.local não encontrado no Analytics Service${NC}"
    echo -e "${YELLOW}   Criando arquivo com configuração padrão...${NC}"
    mkdir -p services/analytics-service
    echo "KAFKA_DISABLED=false" > services/analytics-service/.env.local
    echo "KAFKA_BROKERS=localhost:9092" >> services/analytics-service/.env.local
    echo "FRONTEND_URL=http://localhost:5173" >> services/analytics-service/.env.local
    echo -e "${GREEN}✅ Arquivo .env.local criado${NC}"
fi

# 9. Verificar dados no banco
echo ""
echo "📚 Verificando dados no banco..."
STUDENTS_COUNT=$(curl -s http://localhost:3001/api/v1/students 2>/dev/null | grep -o '"id"' | wc -l || echo "0")
ROOMS_COUNT=$(curl -s http://localhost:3002/api/v1/rooms 2>/dev/null | grep -o '"id"' | wc -l || echo "0")

if [ "$STUDENTS_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✅ $STUDENTS_COUNT aluno(s) encontrado(s)${NC}"
else
    echo -e "${RED}❌ Nenhum aluno encontrado. Execute: npm run seed:all${NC}"
    ERRORS=$((ERRORS + 1))
fi

if [ "$ROOMS_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✅ $ROOMS_COUNT sala(s) encontrada(s)${NC}"
else
    echo -e "${RED}❌ Nenhuma sala encontrada. Execute: npm run seed:all${NC}"
    ERRORS=$((ERRORS + 1))
fi

# 10. Resumo
echo ""
echo "═══════════════════════════════════════"
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ Tudo verificado! Pode executar o worker.${NC}"
    echo ""
    echo "Próximos passos:"
    echo "  1. Execute: npm run worker:checkin"
    echo "  2. Abra: http://localhost:5173/realtime"
    echo "  3. Observe os gráficos atualizando em tempo real"
    exit 0
else
    echo -e "${RED}❌ Encontrados $ERRORS problema(s). Corrija antes de executar o worker.${NC}"
    echo ""
    echo "Consulte: docs_ia/TROUBLESHOOTING_WORKER_WEBSOCKET.md"
    exit 1
fi

