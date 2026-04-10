#!/bin/bash

echo "============================================"
echo "  Health Platform - Starting all servers"
echo "============================================"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Start Screening (port 5000)
echo "[1/3] Starting Doctor Screening on port 5000..."
cd "$SCRIPT_DIR/Screening"
python app.py &
SCREENING_PID=$!

# Start Resubmission (port 2200)
echo "[2/3] Starting Resubmission Copilot on port 2200..."
cd "$SCRIPT_DIR/Resubmission"
python flask_app.py &
RESUB_PID=$!

# Start Portal (port 8080)
echo "[3/3] Starting Portal on port 8080..."
cd "$SCRIPT_DIR"
python portal.py &
PORTAL_PID=$!

echo ""
echo "============================================"
echo "  All servers started!"
echo "  PIDs: Portal=$PORTAL_PID | Resubmission=$RESUB_PID | Screening=$SCREENING_PID"
echo "  Open: http://localhost:2020"
echo "============================================"
echo ""
echo "Press Ctrl+C to stop all servers."

# Stop all on Ctrl+C
trap "echo 'Stopping...'; kill $PORTAL_PID $RESUB_PID $SCREENING_PID 2>/dev/null; exit" SIGINT SIGTERM

wait
