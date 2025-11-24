#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd -P)"
cd "$ROOT_DIR"

log() {
  printf "\n[clean:all] %s\n" "$1"
}

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Erro: comando '$1' não encontrado. Instale-o e execute novamente." >&2
    exit 1
  fi
}

resolve_compose_cmd() {
  if command -v docker-compose >/dev/null 2>&1; then
    echo "docker-compose"
    return
  fi

  if docker compose version >/dev/null 2>&1; then
    echo "docker compose"
    return
  fi

  echo ""
}

require_cmd docker
require_cmd npm

COMPOSE_CMD="$(resolve_compose_cmd)"
if [[ -z "$COMPOSE_CMD" ]]; then
  echo "Erro: docker-compose ou docker compose não encontrado." >&2
  exit 1
fi

log "Resumo das versões"
docker --version || true
$COMPOSE_CMD version || true
node --version || true
npm --version || true

log "Encerrando containers e removendo volumes"
if [[ -f "$ROOT_DIR/docker-compose.yml" ]]; then
  $COMPOSE_CMD -f "$ROOT_DIR/docker-compose.yml" down --remove-orphans --volumes || true
else
  log "Arquivo docker-compose.yml não encontrado; pulando etapa de Docker."
fi

log "Removendo caches e builds conhecidos"
rm -rf "$ROOT_DIR/.turbo" \
       "$ROOT_DIR/.cache" \
       "$ROOT_DIR/.vite" \
       "$ROOT_DIR/.next" \
       "$ROOT_DIR/dist" \
       "$ROOT_DIR/build" \
       "$ROOT_DIR/.parcel-cache" || true

log "Apagando node_modules em todo o monorepo"
find "$ROOT_DIR" -type d -name "node_modules" -prune -exec rm -rf {} + 2>/dev/null || true

log "Removendo package-lock.json e pnpm-lock.yaml"
find "$ROOT_DIR" -maxdepth 4 -type f \( -name "package-lock.json" -o -name "pnpm-lock.yaml" \) -exec rm -f {} +

log "Removendo arquivos .env.local e .env.test gerados"
find "$ROOT_DIR" -type f \( -name ".env.local" -o -name ".env.test" \) -exec rm -f {} +

log "Resultado"
echo "✔️  Ambiente limpo. Execute a sequência do README:"
echo "    npm install && npm run setup:env && npm run docker:up && npm run seed:all && npm run dev"

