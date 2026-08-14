#!/bin/bash
set -euo pipefail
cd /home/rajak/everything/code/projects/current/cutting-board-design
echo "=== UI imports ==="
grep -RIn "from '@/components/ui" src --include='*.tsx' || true
echo "=== legacy hand classes ==="
grep -RInE "border-line|bg-surface|text-ink|bg-accent |className=.*hit " src --include='*.tsx' || true
echo "=== raw button tags outside ui ==="
grep -RIn "<button" src/components --include='*.tsx' | grep -v '/ui/' || true
echo "=== checkbox raw ==="
grep -RIn 'type="checkbox"' src/components --include='*.tsx' | grep -v '/ui/' || true
