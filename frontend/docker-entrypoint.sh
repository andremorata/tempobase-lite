#!/bin/sh
set -e

echo "Applying database schema..."
prisma db push --schema=/app/prisma/schema.prisma --url="${DIRECT_DATABASE_URL:-$DATABASE_URL}"

echo "Starting Next.js..."
exec node server.js
