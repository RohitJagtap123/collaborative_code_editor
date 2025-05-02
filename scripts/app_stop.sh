#!/bin/bash
export NVM_DIR="/root/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

echo "Stopping Node application if running..."
pm2 stop collaborative_code_editor || true
pm2 delete collaborative_code_editor || true