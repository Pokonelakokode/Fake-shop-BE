###########################
# Multi-stage Docker build
###########################

# Stage 1: Build the project
FROM node:18-alpine AS builder
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the source code
COPY . .

# Build the TypeScript project (assumes a build script is defined in package.json)
RUN npm run build

# Stage 2: Run the application
FROM node:18-alpine
WORKDIR /app

# Copy built files and node_modules from builder stage
COPY --from=builder /app .

# Copy .env file
COPY .env .env

# Expose the port
EXPOSE 3000

# Define the command to run the application
CMD [ "node", "dist/index.js" ]
