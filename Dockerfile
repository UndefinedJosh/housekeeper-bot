FROM node:18-slim

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the project
COPY . .

# Build the bot
RUN npm run build

# Start the bot
CMD ["node", "dist/main.js"]
