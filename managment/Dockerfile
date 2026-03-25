# Build stage for Vite in a Monorepo
FROM node:20-alpine AS build-stage
WORKDIR /app

# Copy root lockfile and management package.json
COPY package-lock.json ./
COPY managment/package.json ./managment/

# Install dependencies using workspaces
RUN npm ci --workspace=managment --include-workspace-root

# Copy the rest
COPY . .

ARG VITE_VENDURE_API_URL
ENV VITE_VENDURE_API_URL=$VITE_VENDURE_API_URL

# Build the app
RUN npm run build -w managment

# Production stage
FROM nginx:stable-alpine AS production-stage
# In monorepo, build output is usually in /app/managment/dist or similar
COPY --from=build-stage /app/managment/dist /usr/share/nginx/html

RUN printf 'server {\n  listen 80;\n  location / {\n    root /usr/share/nginx/html;\n    index index.html index.htm;\n    try_files $uri $uri/ /index.html;\n  }\n}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
