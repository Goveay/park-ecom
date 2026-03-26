FROM node:22-alpine AS base

# Install system dependencies
RUN apk add --no-cache libc6-compat
WORKDIR /app

# --- Dependencies Stage ---
FROM base AS deps

# Copy ALL manifests for workspace resolution
COPY package.json package-lock.json ./
COPY apps/server/package.json ./apps/server/
COPY apps/storefront/package.json ./apps/storefront/
COPY managment/package.json ./managment/

# Install ALL dependencies (need devDeps for build)
RUN npm ci

# --- Build Stage ---
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/storefront/node_modules ./apps/storefront/node_modules
COPY . .

# Build-time ARGs for Next.js (must be available at build time)
ARG NEXT_PUBLIC_VENDURE_SHOP_API_URL
ARG NEXT_PUBLIC_VENDURE_ASSET_URL
ENV NEXT_PUBLIC_VENDURE_SHOP_API_URL=$NEXT_PUBLIC_VENDURE_SHOP_API_URL
ENV NEXT_PUBLIC_VENDURE_ASSET_URL=$NEXT_PUBLIC_VENDURE_ASSET_URL
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Build storefront
RUN npm run build -w storefront

# --- Production Stage ---
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy standalone output
COPY --from=builder /app/apps/storefront/public ./apps/storefront/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/storefront/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/storefront/.next/static ./apps/storefront/.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Use the standalone server.js directly
CMD ["node", "apps/storefront/server.js"]
