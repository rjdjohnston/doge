FROM node:18-alpine as development

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3002
CMD ["npm", "run", "dev"]

FROM node:18-alpine as production

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
ENV NODE_ENV=production

EXPOSE 3002
CMD ["npm", "start"] 