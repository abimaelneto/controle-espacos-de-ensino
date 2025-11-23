#!/bin/bash

# Script para parar e limpar o cluster Kubernetes
# Uso: npm run k8s:stop

set -e

echo "🛑 Parando sistema no Kubernetes..."
echo ""

# Verificar se cluster existe
if ! kind get clusters | grep -q "controle-espacos"; then
    echo "⚠️  Cluster 'controle-espacos' não existe."
    exit 0
fi

read -p "Deseja remover o cluster Kubernetes? (s/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Ss]$ ]]; then
    echo "🗑️  Removendo cluster..."
    kind delete cluster --name controle-espacos
    echo "✅ Cluster removido!"
else
    echo "ℹ️  Cluster mantido. Use 'kubectl delete namespace controle-espacos' para remover recursos."
fi

