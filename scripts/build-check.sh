#!/bin/bash
set -euo pipefail
export PATH="$HOME/.nvm/versions/node/v24.19.0/bin:$PATH"
cd /home/rajak/everything/code/projects/current/cutting-board-design
npm run build 2>&1 | tee /tmp/cbd-build.log | tail -80
