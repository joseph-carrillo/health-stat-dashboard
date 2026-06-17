# Health Statistics Dashboard — Frontend (React + Vite) image
#
# Multi-stage build:
#   - development: Vite dev server with HMR, source mounted via docker-compose
#   - build:       produces the static dist/ bundle
#   - production:  nginx serving dist/ and proxying /api -> backend
#
# Build:
#   docker build --target development -t healthstat-frontend:dev frontend
#   docker build --target production  -t healthstat-frontend:prod frontend

# ========================================================================
# Stage 1: development — Vite dev server
# ========================================================================
FROM node:20-alpine AS development

WORKDIR /app

# Copy manifests first for layer caching; install all deps (incl. dev).
COPY package.json package-lock.json* ./
RUN npm ci

# Source is bind-mounted by docker-compose in dev; this COPY is a fallback.
COPY . .

EXPOSE 5173

# --host binds 0.0.0.0 so the port is reachable from the host.
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# ========================================================================
# Stage 2: build — compile the static bundle
# ========================================================================
FROM node:20-alpine AS build

WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
RUN npm run build

# ========================================================================
# Stage 3: production — nginx serves dist/ and proxies /api
# ========================================================================
FROM nginx:alpine AS production

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
