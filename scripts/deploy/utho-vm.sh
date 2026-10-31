#!/usr/bin/env bash

set -Eeuo pipefail

APP_DIR=/opt/dao
DEPLOY_BRANCH="${DEPLOY_BRANCH:-main}"
EXPECTED_SERVICES=(frontend matrix-frontend api indexer queue postgres redis)

cd "$APP_DIR"

if [ ! -d .git ]; then
  echo "Deployment failed: $APP_DIR is not a Git repository."
  exit 1
fi

if [ ! -f .env ]; then
  echo "Deployment failed: $APP_DIR/.env does not exist."
  echo 'Create the production environment file on the VM before deploying.'
  exit 1
fi

command -v git >/dev/null 2>&1 || { echo 'Deployment failed: git is not installed.'; exit 1; }
command -v docker >/dev/null 2>&1 || { echo 'Deployment failed: docker is not installed.'; exit 1; }
docker info >/dev/null 2>&1 || {
  echo 'Deployment failed: the deployment user cannot access the Docker daemon.'
  exit 1
}

docker compose version >/dev/null 2>&1 || {
  echo 'Deployment failed: Docker Compose v2 is not available.'
  exit 1
}

compose() {
  docker compose --env-file "$APP_DIR/.env" "$@"
}

print_diagnostics() {
  echo '--- docker compose ps ---'
  compose ps || true
  echo '--- application and infrastructure logs ---'
  compose logs --no-color --tail=200 postgres redis api frontend matrix-frontend indexer queue || true
}

wait_for_health() {
  local attempt service container_id state health all_ready

  for attempt in $(seq 1 60); do
    all_ready=true

    for service in "${EXPECTED_SERVICES[@]}"; do
      container_id="$(compose ps -q "$service" | head -n 1)"
      if [ -z "$container_id" ]; then
        all_ready=false
        continue
      fi

      state="$(docker inspect --format '{{.State.Status}}' "$container_id" 2>/dev/null || true)"
      health="$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' "$container_id" 2>/dev/null || true)"

      case "$service" in
        postgres|redis|api|frontend|matrix-frontend)
          if [ "$state" != running ] || [ "$health" != healthy ]; then
            all_ready=false
          fi
          ;;
        indexer|queue)
          if [ "$state" != running ]; then
            all_ready=false
          fi
          ;;
      esac
    done

    if [ "$all_ready" = true ]; then
      if compose exec -T api node -e "fetch('http://127.0.0.1:4000/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))" && \
         compose exec -T frontend node -e "fetch('http://127.0.0.1:3000/').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))" && \
         compose exec -T matrix-frontend node -e "fetch('http://127.0.0.1:3001/').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"; then
        return 0
      fi
    fi

    sleep 5
  done

  return 1
}

rollback() {
  local rollback_commit="$1"

  echo "Deployment failed. Attempting rollback to ${rollback_commit}."
  print_diagnostics

  if ! git cat-file -e "${rollback_commit}^{commit}" 2>/dev/null; then
    echo 'Rollback failed: previous commit is not available locally.'
    exit 1
  fi

  git checkout -f -B "$DEPLOY_BRANCH" "$rollback_commit"

  if ! compose config --quiet; then
    echo 'Rollback failed: previous Compose configuration is invalid.'
    exit 1
  fi

  if ! compose build; then
    echo 'Rollback failed: previous images could not be built.'
    print_diagnostics
    exit 1
  fi

  if ! compose up -d; then
    echo 'Rollback failed: previous services could not be started.'
    print_diagnostics
    exit 1
  fi

  if ! wait_for_health; then
    echo 'Rollback failed: previous version did not become healthy.'
    print_diagnostics
    exit 1
  fi

  echo "Rollback completed at ${rollback_commit}."
  exit 1
}

docker compose version
git fetch --prune origin "$DEPLOY_BRANCH"

previous_commit="$(git rev-parse HEAD)"
target_commit="$(git rev-parse "origin/${DEPLOY_BRANCH}")"

git checkout -f -B "$DEPLOY_BRANCH" "$target_commit"
test "$(git rev-parse HEAD)" = "$target_commit"
test -f .env

if ! compose config --quiet; then
  echo 'Deployment failed: Docker Compose configuration is invalid.'
  rollback "$previous_commit"
fi

actual_services="$(compose config --services)"
for service in "${EXPECTED_SERVICES[@]}"; do
  echo "$actual_services" | grep -Fxq "$service" || {
    echo "Deployment failed: expected Compose service '$service' is missing."
    rollback "$previous_commit"
  }
done

if ! compose build; then
  echo 'Deployment failed: Docker image build failed.'
  rollback "$previous_commit"
fi

# Start database and cache infrastructure first
if ! compose up -d postgres redis; then
  echo 'Deployment failed: Docker Compose could not start postgres/redis.'
  rollback "$previous_commit"
fi

# Reconcile PostgreSQL roles and databases before application containers connect
echo 'Reconciling PostgreSQL roles and databases...'
PG_CONTAINER="$(compose ps -q postgres | head -n 1)"
if [ -n "$PG_CONTAINER" ]; then
  for i in $(seq 1 30); do
    if docker exec "$PG_CONTAINER" pg_isready -h localhost >/dev/null 2>&1; then
      break
    fi
    sleep 1
  done
  docker exec "$PG_CONTAINER" sh -c '
    for user_role in "${POSTGRES_USER}" "neondb_owner" "postgres"; do
      if [ -n "$user_role" ]; then
        psql -U postgres -tc "SELECT 1 FROM pg_roles WHERE rolname = '\''$user_role'\''" 2>/dev/null | grep -q 1 || \
        psql -U postgres -c "CREATE ROLE \"$user_role\" WITH LOGIN SUPERUSER PASSWORD '\''${POSTGRES_PASSWORD:-npg_1fOkpFHAZx2e}'\'';" 2>/dev/null || true
      fi
    done
    for db_name in "${POSTGRES_DB}" "neondb" "equora_db"; do
      if [ -n "$db_name" ]; then
        psql -U postgres -tc "SELECT 1 FROM pg_database WHERE datname = '\''$db_name'\''" 2>/dev/null | grep -q 1 || \
        psql -U postgres -c "CREATE DATABASE \"$db_name\" OWNER \"${POSTGRES_USER:-neondb_owner}\";" 2>/dev/null || true
        psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE \"$db_name\" TO \"${POSTGRES_USER:-neondb_owner}\";" 2>/dev/null || true
      fi
    done
  ' 2>/dev/null || true
fi

# Now bring up the full application stack
if ! compose up -d; then
  echo 'Deployment failed: Docker Compose could not start the application stack.'
  rollback "$previous_commit"
fi

if ! wait_for_health; then
  echo 'Deployment failed: services did not become healthy.'
  rollback "$previous_commit"
fi

echo "Deployment successful at ${target_commit}."
