FROM node:22-alpine AS builder

WORKDIR /usr/src/app

# Copy root manifests
COPY package.json package-lock.json ./
# Copy all package manifests for workspace resolution
COPY apps/server/package.json ./apps/server/
COPY apps/storefront/package.json ./apps/storefront/
COPY managment/package.json ./managment/

# Install ALL dependencies (need typescript devDep for build)
RUN npm ci

# Copy server source
COPY apps/server/ ./apps/server/

# Build the server (tsc)
RUN npm run build -w server

# --- Production Stage ---
FROM node:22-alpine AS runner

WORKDIR /usr/src/app

# Copy root manifests
COPY package.json package-lock.json ./
COPY apps/server/package.json ./apps/server/
COPY apps/storefront/package.json ./apps/storefront/
COPY managment/package.json ./managment/

# Install production deps only
RUN npm ci --omit=dev

# Copy built output from builder
COPY --from=builder /usr/src/app/apps/server/dist ./apps/server/dist
# Copy static assets dir structure
COPY apps/server/static ./apps/server/static

EXPOSE 3000

CMD ["node", "./apps/server/dist/index.js"]
