FROM node:20-alpine

# Install system dependencies
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy ALL manifests first for clean workspace resolution
COPY package.json package-lock.json ./
COPY apps/server/package.json ./apps/server/
COPY apps/storefront/package.json ./apps/storefront/
COPY managment/package.json ./managment/

# Install ALL dependencies
RUN npm ci

# Copy the entire monorepo
COPY . .

# Build-time ARGs for Next.js
ARG NEXT_PUBLIC_VENDURE_SHOP_API_URL
ARG NEXT_PUBLIC_VENDURE_ASSET_URL
ENV NEXT_PUBLIC_VENDURE_SHOP_API_URL=$NEXT_PUBLIC_VENDURE_SHOP_API_URL
ENV NEXT_PUBLIC_VENDURE_ASSET_URL=$NEXT_PUBLIC_VENDURE_ASSET_URL
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS="--max-old-space-size=2048"

# Force build to be production and skip non-critical checks
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PRIVATE_STANDALONE=true
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Run build across all workspaces or just storefront
RUN npm run build -w storefront -- --no-lint

# Final setup
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Note: In standalone mode, Next.js generates server.js 
# but for a single-stage simple build, we can use next start
CMD ["npm", "run", "start", "-w", "storefront"]
