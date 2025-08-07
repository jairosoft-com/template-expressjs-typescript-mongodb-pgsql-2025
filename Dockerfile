# Stage 1: Builder
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Generate Prisma client
RUN npx prisma generate
RUN npm run build

# Stage 2: Production
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
# Copy Prisma schema and migrations
COPY prisma ./prisma
# Generate Prisma client for production
RUN npx prisma generate
EXPOSE 3001
# Run migrations and start server
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]