# Use a pre-built image that already includes Chrome/Chromium
FROM ghcr.io/puppeteer/puppeteer:latest

# Set working directory
WORKDIR /usr/src/app

# By default, the puppeteer image runs as non-root user 'pptruser'
# We need to make sure this user has permissions for our files
COPY --chown=pptruser:pptruser package*.json ./

# Install dependencies
RUN npm install

# Copy source code with correct ownership
COPY --chown=pptruser:pptruser . .

# Skip build for now to get container running
# RUN npm run build

# Expose port
EXPOSE 3000

# Use development mode to avoid needing the build
CMD ["npm", "run", "dev"] 