#!/usr/bin/env bash
# Sobe o AscendOSRS local-first: backend (server.js) + Vite dev.
#   - server.js (porta 3001): persistência em disco (data/dashboard.json) + proxy de preços
#   - vite (porta 8960): a UI; proxia /api -> 3001
# Sem dependência de 'concurrently'. Usado pelo homelab (start-apps.sh) e à mão.
cd "$(dirname "$0")" || exit 1

node server.js &
SERVER_PID=$!

npm run dev &
VITE_PID=$!

# derruba os dois juntos se o script morrer
trap 'kill "$SERVER_PID" "$VITE_PID" 2>/dev/null' EXIT TERM INT
wait
