#!/usr/bin/env python3
import sys
import os
import re

def sanitize_env_file(filepath):
    if not os.path.exists(filepath):
        print(f"[sanitize-env] File not found: {filepath}", file=sys.stderr)
        return False

    with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
        raw_text = f.read()

    raw_text = raw_text.replace("\r", "")
    raw_lines = raw_text.split("\n")

    # Pass 1: join continuation lines (wrapped comma-separated lists like CORS_ORIGIN)
    merged_lines = []
    for line in raw_lines:
        stripped = line.strip()
        if stripped.startswith(",") and merged_lines:
            prev = merged_lines[-1].rstrip()
            if prev.endswith(",") or prev.endswith("\\") or (prev.count('"') % 2 != 0) or (prev.count("'") % 2 != 0) or "CORS_ORIGIN" in prev:
                if prev.endswith("\\"):
                    prev = prev[:-1].rstrip()
                merged_lines[-1] = prev + stripped
            else:
                merged_lines.append("# [FIXED_BY_DEPLOY]: " + line)
        elif (stripped.startswith('"') or stripped.startswith("'")) and stripped.endswith(stripped[0]) and len(stripped) > 1 and "=" not in stripped and merged_lines:
            if merged_lines[-1].count('"') % 2 != 0 or merged_lines[-1].count("'") % 2 != 0:
                merged_lines[-1] = merged_lines[-1].rstrip() + stripped
            else:
                merged_lines.append("# [FIXED_BY_DEPLOY]: " + line)
        else:
            merged_lines.append(line)

    # Pass 2: check for unclosed quotes across lines
    final_lines = []
    i = 0
    while i < len(merged_lines):
        line = merged_lines[i]
        if "=" in line and not line.strip().startswith("#"):
            k, v = line.split("=", 1)
            v_strip = v.strip()
            if (v_strip.startswith('"') and v_strip.count('"') % 2 != 0) or (v_strip.startswith("'") and v_strip.count("'") % 2 != 0):
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

    # Pass 3: Comment out any orphaned lines without =
    sanitized_lines = []
    for line in final_lines:
        trimmed = line.strip()
        if not trimmed or trimmed.startswith("#") or "=" in trimmed:
            sanitized_lines.append(line)
        else:
            sanitized_lines.append("# [FIXED_BY_DEPLOY]: " + line)

    # Pass 4: Ensure CORS_ORIGIN has both port 3000 (dao) and 3001 (matrix)
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
            if val.startswith('"') and val.endswith('"'):
                val = val[1:-1]
            elif val.startswith("'") and val.endswith("'"):
                val = val[1:-1]
            existing = [x.strip() for x in val.split(",") if x.strip()]
            for req in required_cors:
                if req not in existing:
                    existing.append(req)
            sanitized_lines[idx] = f'CORS_ORIGIN="{",".join(existing)}"'
            break

    if not cors_found:
        sanitized_lines.append(f'CORS_ORIGIN="{",".join(required_cors)}"')

    output_text = "\n".join(sanitized_lines) + "\n"
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(output_text)

    print(f"[sanitize-env] Successfully sanitized {filepath}: {len(sanitized_lines)} lines.")
    for line in sanitized_lines:
        if line.startswith("CORS_ORIGIN="):
            print(f"[sanitize-env] {line[:120]}...")
    return True

if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else ".env"
    success = sanitize_env_file(target)
    sys.exit(0 if success else 1)
