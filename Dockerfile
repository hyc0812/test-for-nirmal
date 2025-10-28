# Multi-stage build for React application
FROM node:18-alpine as build

# Set working directory
WORKDIR /app

# Copy package files from frontend directory
COPY frontend/package*.json ./

# Install dependencies
RUN npm install

# Copy source code from frontend directory
COPY frontend/ .

# Set proper permissions
RUN chmod +x node_modules/.bin/*

# Build the application using npx
RUN npx react-scripts build

# Production stage with nginx
FROM nginx:alpine

# Copy built assets from build stage
COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx configuration from frontend directory
COPY Creditchain/nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

