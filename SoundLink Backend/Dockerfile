# Use official Node.js LTS image
FROM node:20-alpine

WORKDIR /app

# Install necessary utilities and update npm
RUN apk add --no-cache wget \
    && npm install -g npm@latest

# Set npm configurations to avoid common issues
RUN npm config set fetch-timeout 300000
ENV NODE_ENV=production

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application
COPY . .

# Create uploads directory if it doesn't exist
RUN mkdir -p uploads/profiles

# Expose the port
EXPOSE 4000

# Healthcheck to verify the service is running
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4000/api/health || exit 1

# Start the application
CMD ["node", "server.js"] 