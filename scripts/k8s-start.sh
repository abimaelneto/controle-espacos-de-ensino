#!/bin/bash

# Script simplificado para iniciar tudo no Kubernetes
# Uso: npm run k8s:start

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
K8S_DIR="$PROJECT_ROOT/infrastructure/kubernetes"

echo "🚀 Iniciando sistema completo no Kubernetes..."
echo "================================================"
echo ""

# Verificar pré-requisitos
if ! command -v kind &> /dev/null; then
    echo "❌ kind não está instalado. Instale primeiro:"
    echo "   brew install kind  # macOS"
    echo "   ou visite: https://kind.sigs.k8s.io/docs/user/quick-start/#installation"
    exit 1
fi

if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl não está instalado. Instale primeiro:"
    echo "   brew install kubectl  # macOS"
    exit 1
fi

# Verificar se cluster já existe
if kind get clusters | grep -q "controle-espacos"; then
    echo "⚠️  Cluster 'controle-espacos' já existe."
    read -p "Deseja recriar? (s/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        echo "🗑️  Removendo cluster existente..."
        kind delete cluster --name controle-espacos
    else
        echo "📦 Usando cluster existente..."
    fi
fi

# Executar setup completo
cd "$K8S_DIR"
"$K8S_DIR/scripts/setup-complete.sh"

echo ""
echo "================================================"
echo "✅ Sistema iniciado no Kubernetes!"
echo ""
echo "📊 Ver status:"
echo "   kubectl get pods -n controle-espacos"
echo "   kubectl get services -n controle-espacos"
echo ""
echo "🌐 Acessar serviços:"
echo "   http://api.localhost/api/v1/auth/health"
echo "   http://api.localhost/api/v1/students"
echo "   http://api.localhost/api/v1/rooms"
echo "   http://api.localhost/api/v1/checkin"
echo "   http://api.localhost/api/v1/analytics"
echo ""
echo "📝 Ver logs:"
echo "   kubectl logs -f <pod-name> -n controle-espacos"
echo ""
echo "🛑 Parar tudo:"
echo "   npm run k8s:stop"
echo ""

