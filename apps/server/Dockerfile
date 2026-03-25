FROM node:20-alpine

WORKDIR /usr/src/app

# Copy root manifests
COPY package.json package-lock.json ./
# Copy server manifest
COPY apps/server/package.json ./apps/server/

# Install dependencies (only server ones)
RUN npm ci --workspace=server --include-workspace-root

# Copy the rest of the application
COPY . .

# Build the server
RUN npm run build -w server

# Expose port
EXPOSE 3000

CMD ["npm", "run", "start:server", "-w", "server"]
