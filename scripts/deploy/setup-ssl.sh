#!/usr/bin/env bash
# ==============================================================================
# EQUORA ECOSYSTEM — PRODUCTION SSL SETUP & AUTOMATION SCRIPT
# Provisions Let's Encrypt certificates for equorafidao.com and equorafimatrix.com
# Safely enables full HTTPS in Nginx with zero downtime and rollback protection.
# ==============================================================================

set -Eeuo pipefail

APP_DIR="${APP_DIR:-/opt/dao}"
EMAIL="${1:-admin@equorafidao.com}"

echo "=========================================================="
echo " Starting Equora SSL Provisioning & Verification"
echo " Date: $(date -u)"
echo " APP_DIR: $APP_DIR"
echo " Contact Email: $EMAIL"
echo "=========================================================="

# 1. Prerequisite Checks
if [ "$EUID" -ne 0 ]; then
  echo "Error: This script must be run as root or with sudo." >&2
  exit 1
fi

command -v nginx >/dev/null 2>&1 || {
  echo "Error: Nginx is not installed." >&2
  exit 1
}

command -v certbot >/dev/null 2>&1 || {
  echo "Certbot not found. Installing certbot via snap/apt..."
  apt-get update && apt-get install -y certbot python3-certbot-nginx
}

# 2. Prepare ACME challenge webroot directory
mkdir -p /var/www/certbot
chmod 755 /var/www/certbot

# 3. Ensure base HTTP Nginx configuration is active for ACME validation
echo "[1/5] Ensuring base HTTP Nginx configuration is active..."
cp "$APP_DIR/deploy/nginx/equora.conf" /etc/nginx/sites-available/equora.conf
ln -sf /etc/nginx/sites-available/equora.conf /etc/nginx/sites-enabled/equora.conf

if ! nginx -t; then
  echo "Error: Base Nginx configuration failed test." >&2
  exit 1
fi

systemctl reload nginx
echo "Base Nginx reloaded successfully."

# 4. Request / Expand SSL Certificates for DAO and Matrix
echo "[2/5] Obtaining Let's Encrypt certificates via ACME webroot..."

# Certificate for DAO Frontend + Unified API
if [ ! -d "/etc/letsencrypt/live/equorafidao.com" ]; then
  echo "Requesting certificate for equorafidao.com..."
  certbot certonly \
    --webroot \
    -w /var/www/certbot \
    -d equorafidao.com \
    -d www.equorafidao.com \
    -d api.equorafidao.com \
    --non-interactive \
    --agree-tos \
    -m "$EMAIL" \
    --keep-until-expiring
else
  echo "Certificate for equorafidao.com already exists. Checking renewal..."
  certbot renew --webroot -w /var/www/certbot --cert-name equorafidao.com --keep-until-expiring
fi

# Certificate for Matrix Frontend
if [ ! -d "/etc/letsencrypt/live/equorafimatrix.com" ]; then
  echo "Requesting certificate for equorafimatrix.com..."
  certbot certonly \
    --webroot \
    -w /var/www/certbot \
    -d equorafimatrix.com \
    -d www.equorafimatrix.com \
    --non-interactive \
    --agree-tos \
    -m "$EMAIL" \
    --keep-until-expiring
else
  echo "Certificate for equorafimatrix.com already exists. Checking renewal..."
  certbot renew --webroot -w /var/www/certbot --cert-name equorafimatrix.com --keep-until-expiring
fi

# 5. Verify certificate files on disk
echo "[3/5] Verifying certificate files on disk..."
for cert_domain in equorafidao.com equorafimatrix.com; do
  if [ ! -f "/etc/letsencrypt/live/$cert_domain/fullchain.pem" ] || [ ! -f "/etc/letsencrypt/live/$cert_domain/privkey.pem" ]; then
    echo "Warning: Certificates for $cert_domain not found in /etc/letsencrypt/live/$cert_domain/"
    echo "Keeping HTTP configuration active to avoid service interruption."
    exit 0
  fi
done

# 6. Apply Full SSL Production Configuration with Rollback Guard
echo "[4/5] Deploying production SSL Nginx configuration..."
BACKUP_FILE="/etc/nginx/sites-available/equora.conf.bak.$(date +%s)"
cp /etc/nginx/sites-available/equora.conf "$BACKUP_FILE"

cp "$APP_DIR/deploy/nginx/equora-ssl.conf" /etc/nginx/sites-available/equora.conf

if nginx -t; then
  systemctl reload nginx
  echo "SSL Nginx configuration applied and reloaded successfully."
else
  echo "Error: SSL Nginx configuration failed test. Rolling back to safe HTTP config..."
  cp "$BACKUP_FILE" /etc/nginx/sites-available/equora.conf
  nginx -t && systemctl reload nginx
  echo "Rollback successful. Live services remain uninterrupted."
  exit 1
fi

# 7. Verification & Health Probes
echo "[5/5] Performing live endpoint connectivity checks..."
for url in "https://equorafidao.com" "https://equorafimatrix.com" "https://api.equorafidao.com/health"; do
  http_code=$(curl -s -o /dev/null -w "%{http_code}" -k "$url" 2>/dev/null || echo "000")
  echo "  $url -> HTTP $http_code"
done

echo "=========================================================="
echo " SSL Setup & Verification Completed Successfully!"
echo "=========================================================="
