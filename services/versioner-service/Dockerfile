# Development stage
FROM node:18-alpine as development

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

ENV NODE_ENV=development
ENV PORT=3004

EXPOSE 3004
CMD ["npm", "run", "dev"]

# Production stage
FROM node:18-alpine as production

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --production

# Copy source
COPY . .

ENV NODE_ENV=production
ENV PORT=3004

EXPOSE 3004
CMD ["npm", "start"] 