#!/usr/bin/env bash
# Generates k8s/02-secrets.yaml with cryptographically random passwords and signed Supabase JWT keys.
set -euo pipefail
cd "$(dirname "$0")"

SECRETS_FILE="02-secrets.yaml"
if [ -f "$SECRETS_FILE" ] && [ "${1:-}" != "--force" ]; then
  echo "$SECRETS_FILE already exists. Pass --force to overwrite."
  exit 0
fi

gen_hex() { openssl rand -hex "$1"; }
b64url() { openssl base64 -e -A | tr '+/' '-_' | tr -d '='; }

sign_jwt() {
  local secret="$1" role="$2"
  local header='{"alg":"HS256","typ":"JWT"}'
  local iat=1700000000
  local exp=2015360000
  local payload="{\"role\":\"${role}\",\"iss\":\"supabase\",\"iat\":${iat},\"exp\":${exp}}"
  local h_b64 p_b64 sig
  h_b64=$(printf '%s' "$header" | b64url)
  p_b64=$(printf '%s' "$payload" | b64url)
  sig=$(printf '%s' "${h_b64}.${p_b64}" | openssl dgst -sha256 -hmac "$secret" -binary | b64url)
  printf '%s.%s.%s' "$h_b64" "$p_b64" "$sig"
}

POSTGRES_PASSWORD=$(gen_hex 24)
SUPABASE_JWT_SECRET=$(gen_hex 32)
ANON_KEY=$(sign_jwt "$SUPABASE_JWT_SECRET" "anon")
SERVICE_ROLE_KEY=$(sign_jwt "$SUPABASE_JWT_SECRET" "service_role")
STUDIO_PASSWORD=$(gen_hex 16)
JWT_SECRET=$(gen_hex 48)
JWT_REFRESH_SECRET=$(gen_hex 48)

cat > "$SECRETS_FILE" <<EOF
apiVersion: v1
kind: Secret
metadata:
  name: backend-secrets
  namespace: eshraqat
type: Opaque
stringData:
  POSTGRES_PASSWORD: "${POSTGRES_PASSWORD}"
  DATABASE_URL: "postgresql://postgres:${POSTGRES_PASSWORD}@supabase-db:5432/postgres?schema=public"
  DIRECT_URL: "postgresql://postgres:${POSTGRES_PASSWORD}@supabase-db:5432/postgres?schema=public"
  SUPABASE_JWT_SECRET: "${SUPABASE_JWT_SECRET}"
  SUPABASE_ANON_KEY: "${ANON_KEY}"
  SUPABASE_PUBLISHABLE_KEY: "${ANON_KEY}"
  SUPABASE_SERVICE_ROLE_KEY: "${SERVICE_ROLE_KEY}"
  DASHBOARD_USERNAME: "supabase"
  DASHBOARD_PASSWORD: "${STUDIO_PASSWORD}"
  JWT_SECRET: "${JWT_SECRET}"
  JWT_REFRESH_SECRET: "${JWT_REFRESH_SECRET}"
EOF

chmod 600 "$SECRETS_FILE"
echo "Generated $SECRETS_FILE successfully."
echo "Supabase Studio credentials: username=supabase password=${STUDIO_PASSWORD}"

