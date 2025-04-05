#!/bin/bash



echo "Creating empty test CSV files..."

create_empty_file() {
    local filename=$1
    echo "Creating empty $filename..."
    touch "$filename"
}

create_empty_file "test-voter-file.csv"
create_empty_file "test-external-file-1.csv"
create_empty_file "test-external-file-2.csv"
create_empty_file "./mock-api/data.json"
echo '[ ]' > mock-api/data.json

echo "Starting API server in mock-api directory..."
(cd mock-api && npx nodemon --exec ts-node index.ts) &

API_SERVER_PID=$!

cleanup() {
    echo "Stopping API server (PID: $API_SERVER_PID)..."
    kill $API_SERVER_PID
    
    echo "Cleaning up test CSV and data files..."
    rm -f test-voter-file.csv
    rm -f test-external-file-1.csv
    rm -f test-external-file-2.csv
    rm -f ./mock-api/data.json
}
trap cleanup EXIT

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