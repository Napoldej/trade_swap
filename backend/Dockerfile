# ── Build stage ───────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Generate Prisma client from the infrastructure directory
RUN cd src/infrastructure && npx prisma generate

# Compile TypeScript → dist/
RUN npm run build

# ── Production stage ──────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

# Copy package files and install ALL deps (prisma CLI needed for migrate deploy)
COPY package*.json ./
RUN npm ci

# Copy compiled application
COPY --from=builder /app/dist ./dist

# Copy Prisma schema, migrations, and generated client
COPY --from=builder /app/src/infrastructure ./src/infrastructure

EXPOSE 3000

# Run migrations then start the app
CMD ["sh", "-c", "cd /app/src/infrastructure && npx prisma migrate deploy && cd /app && node dist/main.js"]
