FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache dumb-init
COPY package*.json ./
RUN npm ci --only=production
COPY src/ ./src/
COPY prisma/ ./prisma/
RUN npx prisma generate
EXPOSE 5000
ENTRYPOINT ["dumb-init", "--"]
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