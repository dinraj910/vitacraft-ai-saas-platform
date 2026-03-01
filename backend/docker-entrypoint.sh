#!/bin/sh
set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "   VitaCraft AI — Container Startup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo "🔄  Running database migrations..."
npx prisma migrate deploy

echo "🌱  Seeding database (plans & admin)..."
node prisma/seed.js

echo "✅  Database ready."
echo "🚀  Starting VitaCraft AI backend on port 5000..."

exec "$@"
