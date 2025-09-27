# Multi-stage build for extension server
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies
COPY apps/extension/package.json ./
RUN npm ci --only=production

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the application
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./
COPY apps/extension/ ./

RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3002

ENV PORT=3002
ENV HOSTNAME="0.0.0.0"

CMD ["npm", "start"]
