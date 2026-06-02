#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/laprovence/api}"
BRANCH="${BRANCH:-develop}"
REPO_URL="${REPO_URL:-https://github.com/gedsss/laprovence-api.git}"
SERVICE_NAME="${SERVICE_NAME:-laprovence-api}"
PORT="${PORT:-3668}"
HEALTH_URL="${HEALTH_URL:-http://127.0.0.1:${PORT}/}"
LOCK_FILE="${LOCK_FILE:-/run/laprovence-api-deploy.lock}"
STATE_FILE="${STATE_FILE:-/var/lib/laprovence-api-deploy/last-successful-commit}"

if [ ! -d "$APP_DIR/.git" ]; then
  echo "Repositorio nao encontrado em $APP_DIR."
  exit 1
fi

APP_USER="${APP_USER:-$(stat -c '%U' "$APP_DIR")}"

run_app() {
  if [ "$(id -un)" = "$APP_USER" ]; then
    env APP_DIR="$APP_DIR" BRANCH="$BRANCH" REPO_URL="$REPO_URL" bash -lc "$1"
  else
    sudo -H -u "$APP_USER" env APP_DIR="$APP_DIR" BRANCH="$BRANCH" REPO_URL="$REPO_URL" bash -lc "$1"
  fi
}

mkdir -p "$(dirname "$STATE_FILE")"
exec 9>"$LOCK_FILE"
if ! flock -n 9; then
  echo "Deploy ja em execucao; saindo."
  exit 0
fi

echo "Iniciando deploy de homologacao a partir de origin/$BRANCH."

run_app 'cd "$APP_DIR"; git remote get-url origin >/dev/null 2>&1 || git remote add origin "$REPO_URL"'
run_app 'cd "$APP_DIR"; git fetch --prune origin "+refs/heads/${BRANCH}:refs/remotes/origin/${BRANCH}"'

target_commit="$(run_app 'cd "$APP_DIR"; git rev-parse "origin/$BRANCH"')"
current_commit="$(run_app 'cd "$APP_DIR"; git rev-parse HEAD 2>/dev/null || true')"
last_successful="$(cat "$STATE_FILE" 2>/dev/null || true)"

if [ "$target_commit" = "$current_commit" ] && [ "$target_commit" = "$last_successful" ]; then
  echo "origin/$BRANCH ja esta publicado: ${target_commit:0:12}."
  exit 0
fi

tracked_changes="$(run_app 'cd "$APP_DIR"; git status --porcelain --untracked-files=no')"
if [ -n "$tracked_changes" ]; then
  echo "Ha alteracoes rastreadas em $APP_DIR; deploy abortado para evitar sobrescrever trabalho manual."
  echo "$tracked_changes"
  exit 1
fi

run_app 'cd "$APP_DIR"; git checkout -B "$BRANCH" "origin/$BRANCH"; git reset --hard "origin/$BRANCH"'

if [ ! -f "$APP_DIR/.env" ]; then
  echo "Arquivo $APP_DIR/.env nao encontrado."
  exit 1
fi

cd "$APP_DIR"
docker compose up -d db redis

run_app 'cd "$APP_DIR"; npm ci --no-audit --no-fund'
run_app 'cd "$APP_DIR"; npm run prisma:generate'
run_app 'cd "$APP_DIR"; npm run prisma:migrate:deploy'
run_app 'cd "$APP_DIR"; npm run typecheck'

systemctl restart "$SERVICE_NAME"

for attempt in 1 2 3 4 5; do
  if curl -fsS "$HEALTH_URL" >/dev/null; then
    printf '%s\n' "$target_commit" > "$STATE_FILE"
    echo "Deploy concluido: ${target_commit:0:12}."
    exit 0
  fi
  echo "Aguardando API responder em $HEALTH_URL (tentativa $attempt/5)."
  sleep 2
done

echo "Servico reiniciado, mas health check falhou em $HEALTH_URL."
systemctl status "$SERVICE_NAME" --no-pager --lines=30 || true
exit 1
