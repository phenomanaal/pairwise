#!/bin/bash

# Start mockoon-cli in the background
echo "Starting mockoon-cli with mockoon.json..."
mockoon-cli start --data mockoon.json &

# Store the process ID of mockoon-cli
MOCKOON_PID=$!

# Function to stop mockoon-cli when the script exits
cleanup() {
    echo "Stopping mockoon-cli (PID: $MOCKOON_PID)..."
    kill $MOCKOON_PID
}
trap cleanup EXIT

# Check if pnpm is installed and run dev command
if command -v pnpm &> /dev/null; then
    echo "pnpm is available. Running 'pnpm run dev'..."
    pnpm run dev
elif command -v npm &> /dev/null; then
    echo "pnpm not found. npm is available. Running 'npm run dev'..."
    npm run dev
else
    echo "Error: Neither pnpm nor npm is installed. Please install one to proceed."
    exit 1
fi
