# Use an official Node.js runtime as the base image
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install project dependencies
RUN npm install

RUN npm install -g typescript

# Copy the rest of the application code to the container
COPY . .

# Build TypeScript code
RUN npm run build

# Expose the port that the server will listen on
#EXPOSE 8080

# Command to run your TypeScript server
CMD [ "node", "server.js" ]
