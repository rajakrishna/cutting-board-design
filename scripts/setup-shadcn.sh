#!/bin/bash
set -euo pipefail
export PATH="$HOME/.nvm/versions/node/v24.19.0/bin:$PATH"
cd /home/rajak/everything/code/projects/current/cutting-board-design
echo "node: $(node -v)"
# Ensure CSS has shadcn theme placeholders if add needs them
node node_modules/shadcn/dist/index.js add button toggle-group switch input slider select popover tooltip card badge collapsible separator scroll-area sheet dialog sidebar -y --overwrite --cwd /home/rajak/everything/code/projects/current/cutting-board-design
echo "ADD DONE"
ls -la src/components/ui | head -40
