#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TEMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TEMP_DIR"' EXIT

for command in git node npm; do
  if ! command -v "$command" >/dev/null 2>&1; then
    printf 'Required command not found: %s\n' "$command" >&2
    exit 1
  fi
done

if [[ ! -f "$ROOT_DIR/supabase_init.sql" || ! -f "$ROOT_DIR/package.json" ]]; then
  printf 'Run this script from a FamMap repository.\n' >&2
  exit 1
fi

read -r -p 'Supabase project reference: ' project_ref
read -r -p 'Supabase project URL: ' supabase_url
read -r -p 'Supabase anon key: ' anon_key
read -r -s -p 'Supabase service role key: ' service_role_key
printf '\n'

for value in "$project_ref" "$supabase_url" "$anon_key" "$service_role_key"; do
  if [[ -z "$value" ]]; then
    printf 'Supabase values cannot be empty.\n' >&2
    exit 1
  fi
done

mkdir -p "$TEMP_DIR/supabase/migrations"
cp "$ROOT_DIR/supabase_init.sql" "$TEMP_DIR/supabase/migrations/20261015000000_initial_schema.sql"
(
  cd "$TEMP_DIR"
  npx --yes supabase@latest init
  npx --yes supabase@latest link --project-ref "$project_ref"
  npx --yes supabase@latest db push --linked
)

cd "$ROOT_DIR"
npx --yes vercel@latest link

add_production_env() {
  local name="$1"
  local value="$2"
  local secret="${3:-false}"
  local value_file="$TEMP_DIR/$name"

  umask 077
  printf '%s' "$value" > "$value_file"
  if [[ "$secret" == true ]]; then
    npx --yes vercel@latest env add "$name" production --force --sensitive < "$value_file"
  else
    npx --yes vercel@latest env add "$name" production --force < "$value_file"
  fi
  rm -f "$value_file"
}

add_production_env NEXT_PUBLIC_SUPABASE_URL "$supabase_url"
add_production_env NEXT_PUBLIC_SUPABASE_ANON_KEY "$anon_key"
add_production_env SUPABASE_URL "$supabase_url"
add_production_env SUPABASE_SERVICE_ROLE_KEY "$service_role_key" true
unset anon_key service_role_key
npx --yes vercel@latest --prod
