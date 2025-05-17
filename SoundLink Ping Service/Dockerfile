FROM node:18-alpine

WORKDIR /app

# Copy package files from the specific directory
COPY package*.json ./
RUN npm install

# Copy application code
COPY . .

EXPOSE 3000

CMD ["node", "index.js"] 