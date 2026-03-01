# ── Stage 1: Dependencies ─────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app

# Install OS packages needed for native modules
RUN apk add --no-cache dumb-init openssl

COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# ── Stage 2: Production Image ─────────────────────────────────
FROM node:20-alpine AS production
WORKDIR /app

# dumb-init: proper PID-1 signal handling in containers
RUN apk add --no-cache dumb-init openssl

# Copy only prod dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application source
COPY src/    ./src/
COPY prisma/ ./prisma/
COPY package*.json ./

# Generate Prisma client (targets the alpine OS binary)
RUN npx prisma generate

# Copy & permission the startup entrypoint
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && adduser -S nodeapp -u 1001 -G nodejs
USER nodeapp

EXPOSE 5000

# dumb-init wraps entrypoint so signals work correctly
ENTRYPOINT ["dumb-init", "--", "./docker-entrypoint.sh"]
CMD ["node", "src/app.js"]
```

---

### FILE 23 — `backend/.dockerignore`
```
node_modules
.env
.env.*
!.env.example
logs/
*.log
.git
tests/
coverage/