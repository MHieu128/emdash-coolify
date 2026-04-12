# ---- Stage 1: Install dependencies ----
FROM node:22-alpine AS deps

# Native build tools for better-sqlite3
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy dependency manifests
COPY package.json pnpm-workspace.yaml ./

# Install all dependencies (including devDependencies for build)
RUN corepack enable && corepack prepare pnpm@latest --activate && \
    pnpm install

# ---- Stage 2: Build the Astro site ----
FROM node:22-alpine AS build

WORKDIR /app

# Copy installed deps from stage 1
COPY --from=deps /app/node_modules ./node_modules

# Copy all source files
COPY . .

# Build the Astro standalone server
RUN corepack enable && corepack prepare pnpm@latest --activate && \
    pnpm run build

# ---- Stage 3: Production runtime ----
FROM node:22-alpine AS runtime

# Runtime dependencies for better-sqlite3 and sharp
RUN apk add --no-cache libstdc++ libc6-compat

WORKDIR /app

# Copy built output
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./
COPY --from=build /app/pnpm-workspace.yaml ./

# Copy Astro config (needed at runtime for EmDash database/storage/auth config)
COPY --from=build /app/astro.config.mjs ./

# Copy seed data (needed for emdash init/seed at startup)
COPY --from=build /app/seed ./seed

# Copy entrypoint script
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

# Create data directories (will be volume-mounted in production)
RUN mkdir -p /app/uploads /app/data

# Expose Astro's default port
EXPOSE 4321

# Environment
ENV HOST=0.0.0.0
ENV PORT=4321
ENV NODE_ENV=production

ENTRYPOINT ["./docker-entrypoint.sh"]
