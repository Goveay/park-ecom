FROM node:20-alpine

WORKDIR /usr/src/app

# Copy root lockfile and server package.json
COPY package-lock.json ./
COPY apps/server/package.json ./apps/server/

# Install dependencies (only server ones for this image)
RUN npm ci --workspace=server --include-workspace-root

# Copy the rest of the application
COPY . .

# Build the server
RUN npm run build -w server

# Expose port (Matches serverPort in config)
EXPOSE 3000

CMD ["npm", "run", "start:server", "-w", "server"]
