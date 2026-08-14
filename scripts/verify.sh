#!/bin/bash
set -euo pipefail
export PATH="$HOME/.nvm/versions/node/v24.19.0/bin:$PATH"
cd /home/rajak/everything/code/projects/current/cutting-board-design
npm test 2>&1 | tee /tmp/cbd-test.log | tail -40
npm run build 2>&1 | tee /tmp/cbd-build2.log | tail -40
