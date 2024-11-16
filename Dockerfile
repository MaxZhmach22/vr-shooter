FROM node:20.3.0-alpine3.17 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN VITE_PROD=true npm run build
