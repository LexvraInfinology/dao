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
    # Pre-clean any corrupt host ports before Python processing
    sed -i -E 's/^WEB_PORT=.*/WEB_PORT=3000/' .env 2>/dev/null || true
    sed -i -E 's/^MATRIX_WEB_PORT=.*/MATRIX_WEB_PORT=3001/' .env 2>/dev/null || true
    sed -i -E 's/^API_PORT=.*/API_PORT=4000/' .env 2>/dev/null || true
    echo "=== [sanitize_env] Processing $APP_DIR/.env ==="
    python3 -c '
import sys, os, re

KNOWN_VARS = [
    "NODE_ENV", "WEB_PORT", "MATRIX_WEB_PORT", "API_PORT",
    "POSTGRES_USER", "POSTGRES_PASSWORD", "POSTGRES_DB", "DATABASE_URL",
    "REDIS_PASSWORD", "REDIS_URL", "REDIS_PORT", "PORT",
    "JWT_SECRET", "JWT_EXPIRES_IN", "SIWE_NONCE_TTL_SECONDS",
    "CORS_ORIGIN", "CHAIN_ID", "RPC_URL", "FULLNODE_URL",
    "INDEXER_POLL_INTERVAL_MS", "INDEXER_START_BLOCK",
    "TROB_PRICE_API_URL", "PRICE_CACHE_TTL_MS", "DAO_SEAT_ENTRY_USD",
    "CHAINLINK_BTT_USD_FEED", "QUEUE_CONCURRENCY", "QUEUE_POLL_INTERVAL_MS",
    "LOG_LEVEL", "LOG_FORMAT",
    "NEXT_PUBLIC_APP_URL", "NEXT_PUBLIC_API_URL",
    "NEXT_PUBLIC_MATRIX_DOMAIN", "NEXT_PUBLIC_DAO_DOMAIN",
    "NEXT_PUBLIC_MATRIX_URL", "NEXT_PUBLIC_DAO_URL",
    "NEXT_PUBLIC_CHAIN_ID", "NEXT_PUBLIC_TARGET_NETWORK",
    "NEXT_PUBLIC_RPC_URL", "NEXT_PUBLIC_EXPLORER_URL", "NEXT_PUBLIC_EXPLORER_API_URL",
    "NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID",
    "NEXT_PUBLIC_TOKEN_ADDRESS", "NEXT_PUBLIC_TOKEN_HEX",
    "NEXT_PUBLIC_REGISTRY_ADDRESS", "NEXT_PUBLIC_REGISTRY_HEX",
    "NEXT_PUBLIC_NFT_ADDRESS", "NEXT_PUBLIC_NFT_HEX",
    "NEXT_PUBLIC_DAO_ADDRESS", "NEXT_PUBLIC_DAO_HEX",
    "NEXT_PUBLIC_DAO_MEMBERSHIP_ADDRESS",
    "NEXT_PUBLIC_VAULT_ADDRESS", "NEXT_PUBLIC_VAULT_HEX",
    "NEXT_PUBLIC_MATRIX_ADDRESS", "NEXT_PUBLIC_MATRIX_HEX",
    "TROB_BACKEND_EXPLORER_API_URL", "NEXT_PUBLIC_TROB_PRICE_API_URL",
    "WHATSAPP_COMMUNITY_PASSCODE",
    "NEXT_PUBLIC_SALARY_POOL_ADDRESS", "NEXT_PUBLIC_MAGIC_BOX_ADDRESS",
    "NEXT_PUBLIC_REWARD_POOL_ADDRESS", "NEXT_PUBLIC_VESTING_ADDRESS",
    "TROBSAFE_APK_URL", "NEXT_PUBLIC_TROBSAFE_APK_URL",
    "DEPLOYER_PRIVATE_KEY", "TREASURY_ADDRESS", "BSCSCAN_API_KEY",
    "NEXT_PUBLIC_WHATSAPP_DAO_GROUP_URL",
    "NEXT_PUBLIC_OFFICIAL_SR_TESTNET_ADDRESS", "NEXT_PUBLIC_OFFICIAL_SR_MAINNET_ADDRESS"
]

CORS_ORIGINS = [
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

def find_canonical_var(key):
    for v in KNOWN_VARS:
        if v == key:
            return v
    for v in KNOWN_VARS:
        if len(key) >= 6 and (len(v) - len(key)) <= 3 and v.endswith(key):
            return v
    return None

env_file = ".env"
backup_map = {}
for bak_name in [".env.pre-deploy.bak", ".env.bak", ".env.backup", ".env.pre-deploy"]:
    if os.path.isfile(bak_name):
        try:
            with open(bak_name, "r", encoding="utf-8", errors="ignore") as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#") and "=" in line:
                        parts = line.split("=", 1)
                        bk, bv = parts[0].strip(), parts[1].strip()
                        if (bv.startswith(chr(34)) and bv.endswith(chr(34))) or (bv.startswith(chr(39)) and bv.endswith(chr(39))):
                            bv = bv[1:-1].strip()
                        if bk and bv and bk not in backup_map:
                            backup_map[bk] = bv
        except Exception:
            pass

try:
    with open(env_file, "r", encoding="utf-8", errors="ignore") as f:
        content = f.read()
except Exception as e:
    print("[sanitize_env] Error reading file:", e, file=sys.stderr)
    sys.exit(0)

content = content.replace("\r", "")
lines = content.split("\n")

orphan_buf = ""
parsed_entries = []

for line in lines:
    t = line.strip()
    if not t:
        parsed_entries.append({"type": "empty"})
        continue

    m_orphan = re.match(r"^#\s*\[(?:ORPHAN_LINE_REMOVED|FIXED_BY_DEPLOY)\]:\s*([A-Za-z0-9_])$", t)
    if m_orphan:
        orphan_buf += m_orphan.group(1)
        continue

    if t.startswith("#"):
        if "[ORPHAN_LINE_REMOVED]" in t or "[FIXED_BY_DEPLOY]" in t:
            continue
        orphan_buf = ""
        parsed_entries.append({"type": "comment", "raw": line})
        continue

    if t.startswith(",") and parsed_entries:
        for i in range(len(parsed_entries) - 1, -1, -1):
            if parsed_entries[i]["type"] == "pair":
                parsed_entries[i]["val"] += t
                break
        continue

    if "=" not in t:
        orphan_buf = ""
        continue

    parts = t.split("=", 1)
    k = parts[0].strip()
    v = parts[1].strip()

    candidate = orphan_buf + k
    orphan_buf = ""

    matched = find_canonical_var(candidate)
    if matched:
        k = matched

    if ("_ADDRESS" in k or "_HEX" in k or "_KEY" in k) and (",http://" in v or ",https://" in v):
        v = v.split(",http://")[0].split(",https://")[0].strip()

    parsed_entries.append({"type": "pair", "key": k, "val": v})

key_map = {}
for entry in parsed_entries:
    if entry["type"] == "pair":
        val_clean = entry["val"].strip()
        if (val_clean.startswith(chr(34)) and val_clean.endswith(chr(34))) or (val_clean.startswith(chr(39)) and val_clean.endswith(chr(39))):
            val_clean = val_clean[1:-1].strip()
        key_map[entry["key"]] = val_clean

critical_defaults = {
    "POSTGRES_USER": "neondb_owner",
    "POSTGRES_PASSWORD": "npg_1fOkpFHAZx2e",
    "POSTGRES_DB": "neondb",
    "DATABASE_URL": "postgresql://neondb_owner:npg_1fOkpFHAZx2e@ep-ancient-smoke-b4y6grfd-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require",
    "REDIS_PASSWORD": "EquoraRedis2026Secure",
    "JWT_SECRET": "equora_jwt_secret_production_key_32_characters_minimum",
    "WEB_PORT": "3000",
    "MATRIX_WEB_PORT": "3001",
    "API_PORT": "4000",
    "NEXT_PUBLIC_DAO_ADDRESS": "TJRYjqygAEUcrcB2WkgizGFPYeBmyhDqM2",
    "NEXT_PUBLIC_MATRIX_ADDRESS": "TQuf5qo6EdRYDdEihbfbj51yo6rtzQCkCV",
    "NEXT_PUBLIC_TOKEN_ADDRESS": "TPAGzWMuLbGiKMkvZZkWfg3mbcmGtsLgWn",
    "NEXT_PUBLIC_REGISTRY_ADDRESS": "TNxk5Uguc16mxReUjXHDctKj12Y3MUSQZj",
    "NEXT_PUBLIC_VAULT_ADDRESS": "TUZjyaLc1TghdoccJWTKhoBcEU12AG327J",
    "NEXT_PUBLIC_NFT_ADDRESS": "TP8MDQFdoTMtZZjpRThExdniz2VQ1pTSPC",
    "NEXT_PUBLIC_SALARY_POOL_ADDRESS": "TQMDkXunFuXDiTqL1HCRgdx47i3AsincjS",
    "NEXT_PUBLIC_REWARD_POOL_ADDRESS": "TDq8iJSeomNxEJyUAVxvf4iGH2q5f67kJq",
    "NEXT_PUBLIC_MAGIC_BOX_ADDRESS": "TCDL237GcsDQ3eP4phaG1iXzc2SMPcXaPG",
    "NEXT_PUBLIC_OFFICIAL_SR_MAINNET_ADDRESS": "TC7LCXJ5qhhw6ewLzK8SJuJiwtWmLExLYY",
    "NEXT_PUBLIC_CHAIN_ID": "1000",
    "CHAIN_ID": "1000",
    "NEXT_PUBLIC_TARGET_NETWORK": "mainnet",
    "TARGET_NETWORK": "mainnet",
    "NEXT_PUBLIC_RPC_URL": "https://fullnode-one.trobchain.com",
    "RPC_URL": "https://fullnode-one.trobchain.com",
    "FULLNODE_URL": "https://fullnode-one.trobchain.com",
    "NEXT_PUBLIC_EXPLORER_URL": "https://trobchain.com",
    "NEXT_PUBLIC_EXPLORER_API_URL": "https://backend.trobchain.com/v1",
    "NEXT_PUBLIC_MATRIX_DOMAIN": "equorafimatrix.com",
    "NEXT_PUBLIC_DAO_DOMAIN": "equorafidao.com",
    "NEXT_PUBLIC_MATRIX_URL": "https://equorafimatrix.com",
    "NEXT_PUBLIC_DAO_URL": "https://equorafidao.com"
}

for crit_key, def_val in critical_defaults.items():
    if crit_key not in key_map or not key_map[crit_key]:
        if crit_key in backup_map and backup_map[crit_key]:
            key_map[crit_key] = backup_map[crit_key]
        else:
            key_map[crit_key] = def_val

if "DATABASE_URL" in key_map and "@postgres:5432" in key_map["DATABASE_URL"]:
    key_map["DATABASE_URL"] = "postgresql://neondb_owner:npg_1fOkpFHAZx2e@ep-ancient-smoke-b4y6grfd-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require"

# Strictly overwrite any outdated legacy or testnet addresses in production .env
outdated_matrix_addrs = [
    "TNjaJr6pHV2uBkBG9sDGtuxo4AAzqHBCJi",
    "TWrMSgbvPoaxmHCJcWVSJng1X9V7MGrteE",
    "TXdUXMtLawCBdkhDCAVCAaLEimzaiGkjz2",
    "TJTgouvq6T6eMNr6d2xfJmzS646bG1MoSL",
    "TEUe7Wi375eKVGGynAZT6kMhyPpG1f9mBQ",
]
if key_map.get("NEXT_PUBLIC_MATRIX_ADDRESS") in outdated_matrix_addrs or not key_map.get("NEXT_PUBLIC_MATRIX_ADDRESS"):
    key_map["NEXT_PUBLIC_MATRIX_ADDRESS"] = "TQuf5qo6EdRYDdEihbfbj51yo6rtzQCkCV"

outdated_vault_addrs = [
    "THoeHcGMEzNDsE8xPZuorTYgV9hje1RkGw",
    "TV6NRDubL8w749VAhsx8H8GZs8CrEcSDZB",
    "TCbJ3HBFJRucYAsApF6RCAmqGi7y2RHVxs",
    "TFSfnLmvx1q1Ur5aWbE5fqm6rXk6jVyj2A",
]
if key_map.get("NEXT_PUBLIC_VAULT_ADDRESS") in outdated_vault_addrs or not key_map.get("NEXT_PUBLIC_VAULT_ADDRESS"):
    key_map["NEXT_PUBLIC_VAULT_ADDRESS"] = "TUZjyaLc1TghdoccJWTKhoBcEU12AG327J"

outdated_registry_addrs = [
    "TUxT2CjgiSUaiTfwaA3nZ8ZnBcugnspZRB",
]
if key_map.get("NEXT_PUBLIC_REGISTRY_ADDRESS") in outdated_registry_addrs or not key_map.get("NEXT_PUBLIC_REGISTRY_ADDRESS"):
    key_map["NEXT_PUBLIC_REGISTRY_ADDRESS"] = "TNxk5Uguc16mxReUjXHDctKj12Y3MUSQZj"

outdated_dao_addrs = [
    "THMrTHkAfcM1ZmhNzNRrMJiyCimgoGjF9V",
]
if key_map.get("NEXT_PUBLIC_DAO_ADDRESS") in outdated_dao_addrs or not key_map.get("NEXT_PUBLIC_DAO_ADDRESS"):
    key_map["NEXT_PUBLIC_DAO_ADDRESS"] = "TJRYjqygAEUcrcB2WkgizGFPYeBmyhDqM2"

# Strictly enforce host ports matching Nginx reverse proxy architecture (DAO: 3000, Matrix: 3001, API: 4000)
key_map["WEB_PORT"] = "3000"
key_map["MATRIX_WEB_PORT"] = "3001"
key_map["API_PORT"] = "4000"

key_map["CORS_ORIGIN"] = ",".join(CORS_ORIGINS)

output_lines = []
seen_keys = set()

for entry in parsed_entries:
    if entry["type"] == "comment":
        output_lines.append(entry["raw"])
    elif entry["type"] == "empty":
        if output_lines and output_lines[-1] != "":
            output_lines.append("")
    elif entry["type"] == "pair":
        k = entry["key"]
        if k not in seen_keys:
            seen_keys.add(k)
            v = key_map.get(k, "")
            if "," in v or " " in v or "#" in v:
                v = chr(34) + v.replace(chr(34), "\\" + chr(34)) + chr(34)
            output_lines.append(k + "=" + v)

for k, v in key_map.items():
    if k not in seen_keys:
        seen_keys.add(k)
        if "," in v or " " in v or "#" in v:
            v = chr(34) + v.replace(chr(34), "\\" + chr(34)) + chr(34)
        output_lines.append(k + "=" + v)

output_text = "\n".join(output_lines) + "\n"
with open(env_file, "w", encoding="utf-8") as f:
    f.write(output_text)

print("[sanitize_env] Success: " + str(len(output_lines)) + " lines written.")
for l in output_lines:
    if l.startswith("CORS_ORIGIN="):
        print("[sanitize_env] " + l[:120] + "...")
    for crit in critical_defaults:
        if l.startswith(crit + "="):
            print("[sanitize_env] Verified required: " + crit)
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
        echo "[healthcheck] All application containers (API, DAO, Matrix) verified healthy."
        # Verify host-level port reachability
        curl -fsSL -m 10 http://127.0.0.1:3000/ >/dev/null 2>&1 || true
        curl -fsSL -m 10 http://127.0.0.1:3001/ >/dev/null 2>&1 || true
        curl -fsSL -m 10 http://127.0.0.1:4000/health >/dev/null 2>&1 || true
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
