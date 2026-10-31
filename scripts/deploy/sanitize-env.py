#!/usr/bin/env python3
import sys
import os
import re

def sanitize_env_file(filepath):
    if not os.path.exists(filepath):
        print("[sanitize-env] File not found: " + filepath, file=sys.stderr)
        return False

    with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
        content = f.read()

    # 1. Strip Windows carriage returns
    content = content.replace("\r", "")

    # 2. Unpack jammed lines where VAR= or # Header is immediately preceded by another value without newline
    content = re.sub(r'([^\n])(#\s+[0-9A-Za-z])', r'\1\n\2', content)
    content = re.sub(r'([^\n])([A-Z_][A-Z0-9_]*=)', r'\1\n\2', content)

    # 3. Clean line by line
    cleaned_lines = []
    cors_origins = [
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

    q_double = chr(34)
    cors_set = False

    for line in content.split("\n"):
        trimmed = line.strip()
        if not trimmed:
            cleaned_lines.append("")
            continue
        if trimmed.startswith("#"):
            cleaned_lines.append(trimmed)
            continue
        if "=" not in trimmed:
            cleaned_lines.append("# [ORPHAN_LINE_REMOVED]: " + trimmed)
            continue

        k, v = trimmed.split("=", 1)
        k = k.strip()
        v = v.strip()

        # Remove outer quotes if present
        if (v.startswith('"') and v.endswith('"')) or (v.startswith("'") and v.endswith("'")):
            v = v[1:-1].strip()

        if k == "CORS_ORIGIN":
            cors_set = True
            cleaned_lines.append("CORS_ORIGIN=" + q_double + ",".join(cors_origins) + q_double)
            continue

        # Clean accidental CORS origins contamination from contract addresses or hexes
        if ("_ADDRESS" in k or "_HEX" in k or "_KEY" in k) and (",http://" in v or ",https://" in v):
            v = v.split(",http://")[0].split(",https://")[0].strip()
            if v.startswith('"') or v.startswith("'"):
                v = v[1:]
            if v.endswith('"') or v.endswith("'"):
                v = v[:-1]

        cleaned_lines.append(k + "=" + v)

    if not cors_set:
        cleaned_lines.append("CORS_ORIGIN=" + q_double + ",".join(cors_origins) + q_double)

    output_text = "\n".join(cleaned_lines) + "\n"
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(output_text)

    print("[sanitize-env] Successfully sanitized " + filepath + ": " + str(len(cleaned_lines)) + " lines.")
    for l in cleaned_lines:
        if l.startswith("CORS_ORIGIN="):
            print("[sanitize-env] " + l[:120] + "...")
    return True

if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else ".env"
    success = sanitize_env_file(target)
    sys.exit(0 if success else 1)
