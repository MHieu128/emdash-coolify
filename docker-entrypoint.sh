#!/bin/sh
set -e

echo "=== EmDash Docker Entrypoint ==="

# Ensure persistent data directories exist
mkdir -p /app/data /app/uploads

# Symlink database file to persistent volume
# The EmDash CLI and Astro both use ./data.db (resolves to /app/data.db)
# We store the actual file on the persistent /app/data volume
if [ ! -L /app/data.db ]; then
    # If a real data.db exists (first run), move it to persistent storage
    if [ -f /app/data.db ]; then
        mv /app/data.db /app/data/data.db
    fi
    ln -sf /app/data/data.db /app/data.db
fi

echo "Running EmDash initialization (migrations)..."
npx emdash init

echo "Running EmDash seed..."
npx emdash seed

echo "Starting EmDash server on port ${PORT:-4321}..."
exec node ./dist/server/entry.mjs
