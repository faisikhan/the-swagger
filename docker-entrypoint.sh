#!/bin/sh
set -e

PRISMA=/app/node_modules/.pnpm/node_modules/.bin/prisma
SCHEMA=/app/apps/api/prisma/schema.prisma

echo "Running migrations..."
$PRISMA migrate deploy --schema $SCHEMA

echo "Running seed..."
node /app/apps/api/dist/prisma/seed.js || echo "Seed skipped or already seeded"

echo "Starting API..."
exec node /app/apps/api/dist/src/main.js
