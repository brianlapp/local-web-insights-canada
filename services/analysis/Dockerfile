FROM node:18-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy application code
COPY . .

# Build TypeScript code
RUN npm run build

# Expose API port
EXPOSE 3001

# Start the service
CMD ["node", "dist/index.js"] 