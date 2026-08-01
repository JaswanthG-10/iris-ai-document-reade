# Stage 1: Build the React TypeScript application
FROM node:20-alpine AS build

WORKDIR /app

# Copy package configurations and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code and build production distribution bundle
COPY . .
RUN npm run build

# Stage 2: Serve built assets using Nginx web server
FROM nginx:alpine

# Copy custom Nginx configuration matching SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build assets from prior stage to Nginx server path
COPY --from=build /app/dist /usr/share/nginx/html

# Expose web application port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
