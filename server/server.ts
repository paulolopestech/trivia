import * as WebSocket from "ws";
import { DataBaseSqlClient } from "./database";

const questionsAndAnswers: any = [];

const server = new WebSocket.Server({ port: 8080 }, async () => {
  await DataBaseSqlClient.initDataBase();
  console.log("DATABASE STARTED!");
  console.log("Server started at port 8000");
});

server.on("connection", (socket: WebSocket) => {
  console.log("Client connected!");

  socket.on("message", async (message: string) => {
    const parsedMessage = JSON.parse(message);

    switch (parsedMessage) {
      case "message":
        const question = await DataBaseSqlClient.getRandomQuestion();
        questionsAndAnswers.push(question);
        delete question.answer;
        console.log("Q AND A: ", questionsAndAnswers);
        console.log("QUESTION SENT: ", question);
        socket.send(JSON.stringify(question));
        break;
      default:
        break;
    }
  });

  socket.on("close", () => {
    console.log("Client disconnected.");
  });
});
