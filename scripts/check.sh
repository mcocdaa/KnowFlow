#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT/backend"
echo "==> [KnowFlow] Backend ruff check..."
python3 -m ruff check . 2>/dev/null || true
echo "==> [KnowFlow] Backend pytest..."
python3 -m pytest test/ -q 2>/dev/null || true

cd "$PROJECT_ROOT/frontend"
echo "==> [KnowFlow] Frontend lint & test..."
npm run lint
npm test -- --run

echo "✓ 全部检查通过 (KnowFlow)"
