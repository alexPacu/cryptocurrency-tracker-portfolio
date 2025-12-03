FROM node:18-alpine AS builder

WORKDIR /app

# Copy root package files
COPY package.json package-lock.json ./

# Install root dependencies
RUN npm ci --silent

# Copy source code
COPY . .

# Build the React app
WORKDIR /app/client
RUN CI=false npm install && npm run build

FROM node:18-alpine

WORKDIR /app

# Copy root and backend package files to install production dependencies
COPY package.json package-lock.json* ./
COPY backend/package.json backend/package-lock.json* ./backend/
RUN npm ci --silent --only=production
RUN cd backend && npm ci --silent --only=production

# Copy the built client, backend source, and db models
COPY --from=builder /app/client/build ./client/build
COPY backend/src ./backend/src
COPY db ./db

# Expose port
EXPOSE 5000

# Health check pointing to a valid API endpoint
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the correct server entrypoint
CMD ["node", "backend/src/index.js"]

