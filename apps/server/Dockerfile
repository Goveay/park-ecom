FROM node:20-alpine

WORKDIR /usr/src/app

# Copy root manifests
COPY package.json package-lock.json ./
# Copy all package manifests for workspace resolution
COPY apps/server/package.json ./apps/server/
COPY apps/storefront/package.json ./apps/storefront/
COPY managment/package.json ./managment/

# Install dependencies
RUN npm ci

# Copy the rest of the application
COPY . .

# Build the server
RUN npm run build -w server

# Expose port
EXPOSE 3000

CMD ["npm", "run", "start:server", "-w", "server"]
