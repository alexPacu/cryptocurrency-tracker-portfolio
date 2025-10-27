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
RUN npm ci --silent && npm run build

FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --silent --only=production

# Copy server files
COPY server.js ./
COPY client/build ./client/build

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/coins?page=1&per_page=1', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the server
CMD ["node", "server.js"]

