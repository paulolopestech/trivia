import * as WebSocket from "ws";
import { Sequelize } from "sequelize";
import { DataBaseSqlClient } from "./database";

const sequelize = new Sequelize("sqlite3");

// Create a WebSocket server instance
//@ts-ignore
const server = new WebSocket.Server({ port: 8080 }, async () => {
  await DataBaseSqlClient.initDataBase();
});

// Event listener for handling incoming connections
server.on("connection", (socket: WebSocket) => {
  console.log("Client connected.");

  // Event listener for handling incoming messages
  socket.on("message", async (message: string) => {
    console.log(`Received: ${message}`);

    switch (message) {
      case "question":
        const question = await DataBaseSqlClient;
        socket.send(`Server received: ${message}`);
        break;

      default:
        break;
    }
  });

  // Event listener for handling connection close
  socket.on("close", () => {
    console.log("Client disconnected.");
  });
});

console.log("WebSocket server is running on port 8080");
