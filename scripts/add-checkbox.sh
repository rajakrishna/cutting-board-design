#!/bin/bash
set -euo pipefail
export PATH="$HOME/.nvm/versions/node/v24.19.0/bin:$PATH"
cd /home/rajak/everything/code/projects/current/cutting-board-design
node node_modules/shadcn/dist/index.js add checkbox -y --overwrite --cwd /home/rajak/everything/code/projects/current/cutting-board-design
