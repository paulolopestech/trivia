import * as WebSocket from "ws";
import { DataBaseSqlClient } from "./database";

const questionsAndAnswers: Array<any> = [];

const server = new WebSocket.Server({ port: 8080 }, async () => {
  await DataBaseSqlClient.initDataBase();
  console.log("DATABASE STARTED!");
  console.log("Server started at port 8000");
});

server.on("connection", (socket: WebSocket) => {
  console.log("Client connected!");
  socket.on("message", async (message: string) => {
    const parsedMessage = JSON.parse(message);
    switch (parsedMessage.type) {
      case "question":
        if (questionsAndAnswers.length >= 3) {
          socket.send(JSON.stringify(questionsAndAnswers));
          questionsAndAnswers.length = 0;
          break;
        }
        const question = await DataBaseSqlClient.getRandomQuestion();
        questionsAndAnswers.push({ ...question, userAnswer: "" });
        delete question.answer;
        socket.send(JSON.stringify({ ...question }));
        break;
      case "answer":
        if (questionsAndAnswers.length > 0) {
          const len = questionsAndAnswers.length;
          const lastQuestion = questionsAndAnswers[len - 1];
          lastQuestion.userAnswer = parsedMessage.userAnswer;
          questionsAndAnswers[len - 1] = lastQuestion;
        }
        break;
      default:
        break;
    }
  });
  socket.on("close", () => {
    console.log("Client disconnected.");
    questionsAndAnswers.length = 0;
  });
});
