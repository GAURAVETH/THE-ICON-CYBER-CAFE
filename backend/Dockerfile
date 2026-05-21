# Production-ready Dockerfile for the backend service

FROM node:20-alpine AS deps
WORKDIR /usr/src/app

# Install only production dependencies from lockfile for deterministic builds
COPY package.json package-lock.json ./
RUN npm ci --only=production

FROM node:20-alpine AS runner
WORKDIR /usr/src/app

# Copy installed production dependencies
COPY --from=deps /usr/src/app/node_modules ./node_modules

# Copy application source code
COPY . .

# Set runtime environment
ENV NODE_ENV=production
EXPOSE 5000

# Start the Express server
CMD ["npm", "run", "dev"]
