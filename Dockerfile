# Use the official Node.js 20 image.
FROM node:20-slim

# Set the working directory in the container.
WORKDIR /app

# Copy package.json and pnpm-lock.yaml to the working directory.
COPY package.json pnpm-lock.yaml ./

# Install pnpm.
RUN npm install -g pnpm

# Install dependencies.
RUN pnpm install

# Copy the rest of the application code to the working directory.
COPY . .

# Build the Next.js application.
RUN pnpm build

# Expose the port the application will run on.
EXPOSE 3000

# Set the command to start the application.
CMD ["pnpm", "start"]
