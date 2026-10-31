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

# Robust environment file sanitization:
# 1. Joins wrapped lines that begin with a comma (e.g. multiline CORS_ORIGIN)
# 2. Strips carriage returns (\r)
# 3. Ensures CORS_ORIGIN includes port 3000 (equorafidao) and port 3001 (equorafimatrix)
# 4. Comments out any orphaned lines lacking '='
sanitize_env() {
  if [ -f .env ]; then
    cp .env .env.pre-deploy.bak 2>/dev/null || true
    echo "=== [sanitize_env] Processing $APP_DIR/.env ==="
    python3 -c '
import sys, os, re
env_file = ".env"
try:
    with open(env_file, "r", encoding="utf-8", errors="ignore") as f:
        raw_text = f.read()
except Exception as e:
    print(f"[sanitize_env] Error reading {env_file}: {e}", file=sys.stderr)
    sys.exit(0)

raw_text = raw_text.replace("\r", "")
raw_lines = raw_text.split("\n")

merged_lines = []
for line in raw_lines:
    stripped = line.strip()
    if stripped.startswith(",") and merged_lines:
        prev = merged_lines[-1].rstrip()
        if prev.endswith(",") or prev.endswith("\\") or (prev.count("\"") % 2 != 0) or (prev.count("\x27") % 2 != 0) or "CORS_ORIGIN" in prev:
            if prev.endswith("\\"):
                prev = prev[:-1].rstrip()
            merged_lines[-1] = prev + stripped
        else:
            merged_lines.append("# [FIXED_BY_DEPLOY]: " + line)
    elif (stripped.startswith("\"") or stripped.startswith("\x27")) and stripped.endswith(stripped[0]) and len(stripped) > 1 and "=" not in stripped and merged_lines:
        if merged_lines[-1].count("\"") % 2 != 0 or merged_lines[-1].count("\x27") % 2 != 0:
            merged_lines[-1] = merged_lines[-1].rstrip() + stripped
        else:
            merged_lines.append("# [FIXED_BY_DEPLOY]: " + line)
    else:
        merged_lines.append(line)

final_lines = []
i = 0
while i < len(merged_lines):
    line = merged_lines[i]
    if "=" in line and not line.strip().startswith("#"):
        k, v = line.split("=", 1)
        v_strip = v.strip()
        if (v_strip.startswith("\"") and v_strip.count("\"") % 2 != 0) or (v_strip.startswith("\x27") and v_strip.count("\x27") % 2 != 0):
            quote_char = v_strip[0]
            accumulated = [line]
            i += 1
            while i < len(merged_lines):
                next_line = merged_lines[i]
                accumulated.append(next_line.strip())
                if quote_char in next_line:
                    break
                i += 1
            line = "".join(accumulated)
    final_lines.append(line)
    i += 1

sanitized_lines = []
for line in final_lines:
    trimmed = line.strip()
    if not trimmed or trimmed.startswith("#") or "=" in trimmed:
        sanitized_lines.append(line)
    else:
        sanitized_lines.append("# [FIXED_BY_DEPLOY]: " + line)

required_cors = [
    "https://equorafidao.com",
    "https://www.equorafidao.com",
    "http://equorafidao.com:3000",
    "https://equorafidao.com:3000",
    "https://equorafimatrix.com",
    "https://www.equorafimatrix.com",
    "http://equorafimatrix.com:3001",
    "https://equorafimatrix.com:3001",
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:4000",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    "http://127.0.0.1:4000"
]

cors_found = False
for idx, line in enumerate(sanitized_lines):
    if re.match(r"^[ \t]*CORS_ORIGIN=", line):
        cors_found = True
        val = line.split("=", 1)[1].strip()
        if val.startswith("\"") and val.endswith("\""):
            val = val[1:-1]
        elif val.startswith("\x27") and val.endswith("\x27"):
            val = val[1:-1]
        existing = [x.strip() for x in val.split(",") if x.strip()]
        for req in required_cors:
            if req not in existing:
                existing.append(req)
        sanitized_lines[idx] = f"CORS_ORIGIN=\"{\",\".join(existing)}\""
        break

if not cors_found:
    sanitized_lines.append(f"CORS_ORIGIN=\"{\",\".join(required_cors)}\"")

output_text = "\n".join(sanitized_lines) + "\n"
with open(env_file, "w", encoding="utf-8") as f:
    f.write(output_text)

print(f"[sanitize_env] Success: {len(sanitized_lines)} lines written.")
for line in sanitized_lines:
    if line.startswith("CORS_ORIGIN="):
        print(f"[sanitize_env] {line[:120]}...")
' || {
      echo "[sanitize_env] Python3 fallback to awk..."
      awk '{ sub(/\r$/, ""); if (/^[ \t]*,/) { prev = prev $0 } else { if (NR > 1) print prev; prev = $0 } } END { if (NR > 0) print prev }' .env | awk '{ trimmed = $0; sub(/^[ \t]+/, "", trimmed); sub(/[ \t]+$/, "", trimmed); if (trimmed == "" || substr(trimmed, 1, 1) == "#" || index(trimmed, "=") > 0) { print $0 } else { print "# [FIXED_BY_DEPLOY]: " $0 } }' > .env.sanitized && mv .env.sanitized .env
    }
  fi
}

sanitize_env

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
  sanitize_env

  if ! compose config --quiet; then
    echo 'Rollback failed: previous Compose configuration is invalid.'
    compose config 2>&1 | head -n 30 || true
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

sanitize_env

if ! compose config --quiet; then
  echo 'Deployment failed: Docker Compose configuration is invalid.'
  compose config 2>&1 | head -n 30 || true
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
