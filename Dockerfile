FROM node:21-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN VITE_PROD=true npm run build
