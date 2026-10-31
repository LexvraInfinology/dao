#!/usr/bin/env python3
import sys
import os
import re

KNOWN_VARS = [
    "NODE_ENV", "WEB_PORT", "MATRIX_WEB_PORT", "API_PORT",
    "POSTGRES_USER", "POSTGRES_PASSWORD", "POSTGRES_DB", "DATABASE_URL",
    "REDIS_PASSWORD", "REDIS_URL",
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
        if v.endswith(key) and len(v) >= len(key):
            return v
    return None

def sanitize_env_file(filepath):
    if not os.path.exists(filepath):
        print("[sanitize-env] File not found: " + filepath, file=sys.stderr)
        return False

    backup_map = {}
    dir_path = os.path.dirname(os.path.abspath(filepath)) or "."
    for bak_name in [".env.pre-deploy.bak", ".env.bak", ".env.backup", ".env.pre-deploy"]:
        bak_file = os.path.join(dir_path, bak_name)
        if os.path.isfile(bak_file):
            try:
                with open(bak_file, "r", encoding="utf-8", errors="ignore") as f:
                    for line in f:
                        line = line.strip()
                        if line and not line.startswith("#") and "=" in line:
                            parts = line.split("=", 1)
                            bk, bv = parts[0].strip(), parts[1].strip()
                            if (bv.startswith('"') and bv.endswith('"')) or (bv.startswith("'") and bv.endswith("'")):
                                bv = bv[1:-1].strip()
                            if bk and bv and bk not in backup_map:
                                backup_map[bk] = bv
            except Exception:
                pass

    try:
        with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()
    except Exception as e:
        print("[sanitize-env] Error reading file: " + str(e), file=sys.stderr)
        return False

    content = content.replace("\r", "")
    lines = content.split("\n")

    orphan_buf = ""
    parsed_entries = []

    for line in lines:
        t = line.strip()
        if not t:
            parsed_entries.append({"type": "empty"})
            continue

        # Check orphan single-letter comments created by faulty previous regex runs
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

        # Wrapped comma continuation line (e.g. ,https://...)
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

    # Deduplicate pairs, keeping latest value
    key_map = {}
    for entry in parsed_entries:
        if entry["type"] == "pair":
            val_clean = entry["val"].strip()
            if (val_clean.startswith('"') and val_clean.endswith('"')) or (val_clean.startswith("'") and val_clean.endswith("'")):
                val_clean = val_clean[1:-1].strip()
            key_map[entry["key"]] = val_clean

    # Restore missing critical variables if empty
    critical_defaults = {
        "POSTGRES_USER": "postgres",
        "POSTGRES_PASSWORD": "npg_1fOkpFHAZx2e",
        "POSTGRES_DB": "equora_db",
        "DATABASE_URL": "postgresql://postgres:npg_1fOkpFHAZx2e@postgres:5432/equora_db?schema=public",
        "REDIS_PASSWORD": "replace_me_redis_password",
        "JWT_SECRET": "equora_jwt_secret_key_32_characters_long_min"
    }

    for crit_key, def_val in critical_defaults.items():
        if crit_key not in key_map or not key_map[crit_key]:
            if crit_key in backup_map and backup_map[crit_key]:
                key_map[crit_key] = backup_map[crit_key]
            else:
                key_map[crit_key] = def_val

    # Always ensure CORS_ORIGIN is fully set
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
                    v = '"' + v.replace('"', '\\"') + '"'
                output_lines.append(k + "=" + v)

    for k, v in key_map.items():
        if k not in seen_keys:
            seen_keys.add(k)
            if "," in v or " " in v or "#" in v:
                v = '"' + v.replace('"', '\\"') + '"'
            output_lines.append(k + "=" + v)

    output_text = "\n".join(output_lines) + "\n"
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(output_text)

    print("[sanitize-env] Successfully sanitized " + filepath + ": " + str(len(output_lines)) + " lines.")
    for l in output_lines:
        if l.startswith("CORS_ORIGIN="):
            print("[sanitize-env] " + l[:120] + "...")
        for crit in critical_defaults:
            if l.startswith(crit + "="):
                print("[sanitize-env] Verified required: " + crit)
    return True

if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else ".env"
    success = sanitize_env_file(target)
    sys.exit(0 if success else 1)
