# === Stage 1: Build Dependencies ===
# Use a Node.js LTS version (Alpine for smaller size)
FROM node:18-alpine AS deps

# Set working directory
WORKDIR /app

# Copy package.json and lock file
COPY package*.json ./

# Install *all* dependencies (including devDependencies needed for build)
RUN npm ci

# === Stage 2: Build the Application ===
FROM node:18-alpine AS builder

WORKDIR /app

# Copy dependencies installation from the 'deps' stage
COPY --from=deps /app/node_modules ./node_modules
# Copy the rest of the application code
COPY . .

# Set NEXT_TELEMETRY_DISABLED to avoid telemetry during build
ENV NEXT_TELEMETRY_DISABLED 1

# Build the Next.js application for production
RUN npm run build

# === Stage 3: Production Image ===
FROM node:18-alpine AS runner

WORKDIR /app

# Set environment to production
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application output from the 'builder' stage
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Change ownership of necessary files (if any needed besides .next)
# e.g., RUN chown -R nextjs:nodejs /some/other/folder

# Switch to the non-root user
USER nextjs

# Expose the port Next.js will run on (default 3000)
# IMPORTANT: This might conflict with your backend. Consider changing it later in docker-compose.yml
EXPOSE 3000

# Set the host to listen on all interfaces within the container
ENV HOSTNAME "0.0.0.0"

# Command to run the Next.js production server (using the standalone output)
CMD ["node", "server.js"]