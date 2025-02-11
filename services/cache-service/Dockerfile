FROM node:18-alpine as development

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 3001

# Start the service
CMD ["npm", "run", "dev"]

FROM node:18-alpine as production

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
ENV NODE_ENV=production

EXPOSE 3001
CMD ["npm", "start"] 