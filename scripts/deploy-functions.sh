#!/bin/bash

set -e

# Supabase Edge Functions Deploy Script
# Usage:
#   ./scripts/deploy-functions.sh                    # Deploy all functions
#   ./scripts/deploy-functions.sh <function-name>    # Deploy a specific function
#   ./scripts/deploy-functions.sh --project-ref <ref> # Override project ref

DEPLOY_HISTORY_FILE="supabase/.temp/deploy-history.log"
mkdir -p "$(dirname "$DEPLOY_HISTORY_FILE")"

# Load env vars if .env exists
if [ -f ".env" ]; then
  export $(grep -v '^#' .env | xargs)
fi

PROJECT_REF="${SUPABASE_PROJECT_ID:-}"
SPECIFIC_FUNCTION=""
TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --project-ref)
      PROJECT_REF="$2"
      shift 2
      ;;
    *)
      SPECIFIC_FUNCTION="$1"
      shift
      ;;
  esac
done

if [ -z "$PROJECT_REF" ]; then
  echo "Error: SUPABASE_PROJECT_ID not set. Pass --project-ref or set SUPABASE_PROJECT_ID in .env"
  exit 1
fi

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
  echo "Error: supabase CLI not found. Install it: https://supabase.com/docs/guides/cli"
  exit 1
fi

# Get git info for deploy history
GIT_COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
GIT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")

log_deploy() {
  local func_name=$1
  local status=$2
  echo "{\"timestamp\":\"$TIMESTAMP\",\"function\":\"$func_name\",\"status\":\"$status\",\"commit\":\"$GIT_COMMIT\",\"branch\":\"$GIT_BRANCH\",\"project\":\"$PROJECT_REF\"}" >> "$DEPLOY_HISTORY_FILE"
}

deploy_function() {
  local func_name=$1
  echo ""
  echo "Deploying: $func_name"
  echo "─────────────────────────────────────"

  if supabase functions deploy "$func_name" --project-ref "$PROJECT_REF"; then
    echo "✓ $func_name deployed successfully"
    log_deploy "$func_name" "success"
  else
    echo "✗ $func_name deployment failed"
    log_deploy "$func_name" "failed"
    return 1
  fi
}

# Deploy functions
FAILED=0

if [ -n "$SPECIFIC_FUNCTION" ]; then
  deploy_function "$SPECIFIC_FUNCTION" || FAILED=1
else
  FUNCTIONS=(
    "generate-skills"
    "generate-quests"
    "generate-challenges"
    "analyze-assessment"
  )

  for func in "${FUNCTIONS[@]}"; do
    deploy_function "$func" || FAILED=1
  done
fi

echo ""
echo "─────────────────────────────────────"
echo "Deploy history: $DEPLOY_HISTORY_FILE"
echo "Git commit: $GIT_COMMIT ($GIT_BRANCH)"

if [ $FAILED -eq 1 ]; then
  echo "⚠ Some deployments failed. Check logs above."
  exit 1
else
  echo "✓ All deployments completed successfully."
fi
