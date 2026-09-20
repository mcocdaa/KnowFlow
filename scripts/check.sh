#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT/backend"
PYTHON_BIN="python3"
if [ -x "$PROJECT_ROOT/backend/.venv/bin/python" ]; then
  PYTHON_BIN="$PROJECT_ROOT/backend/.venv/bin/python"
fi

echo "==> [KnowFlow] Backend ruff check..."
"$PYTHON_BIN" -m ruff check .
echo "==> [KnowFlow] Backend pytest..."
"$PYTHON_BIN" -m pytest test/ -q

cd "$PROJECT_ROOT/frontend"
echo "==> [KnowFlow] Frontend lint & test..."
npm run lint
npm test -- --run

echo "✓ 全部检查通过 (KnowFlow)"
