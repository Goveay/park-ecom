# Multi-stage build for Next.js in a Monorepo
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy root manifests
COPY package.json package-lock.json ./
# Copy storefront manifest
COPY apps/storefront/package.json ./apps/storefront/

# Install dependencies using workspaces
RUN npm ci --workspace=storefront --include-workspace-root

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app ./
COPY . .

# Environment variables must be present at build time for Next.js Client Components
ARG NEXT_PUBLIC_VENDURE_SHOP_API_URL
ENV NEXT_PUBLIC_VENDURE_SHOP_API_URL=$NEXT_PUBLIC_VENDURE_SHOP_API_URL

RUN npm run build -w storefront

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/storefront/public ./public

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/apps/storefront/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/storefront/.next/static ./apps/storefront/.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/storefront/server.js"]
