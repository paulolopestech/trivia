import WebSocket from "ws";
import readline from "readline";
import { promisify } from "util";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
const userInput = promisify(rl.question).bind(rl);

async function getUserInput(prompt: string) {
  return await userInput(prompt);
}

const alternativesArray = ["A", "B", "C", "D", "E"];

function showQuestion(parsedServerMessage: any) {
  console.log(`\nQuestion: ${parsedServerMessage[0].question}\n`);
  console.log("ALTERNATIVES: ");
  const alternatives = JSON.parse(parsedServerMessage[0].alternatives);
  alternatives.forEach((alternative: any, index: any) => {
    console.log(`${alternativesArray[index]}: ${alternative}`);
  });
}

const server = new WebSocket("ws://localhost:8080");

server.on("open", async () => {
  console.log("Connected to the server.");
  const getQuestion = {
    type: "question",
  };

  server.on("message", async (message: any) => {
    const parsedServerMessage: any = JSON.parse(message);
    if (parsedServerMessage[0].question) {
      showQuestion(parsedServerMessage);
      const userResponse = await getUserInput("Choose an alternative: ");
      const res = {
        type: "answer",
        userAnswer: userResponse,
      };
      server.send(JSON.stringify(res));
      await getUserInput("Press any key to continue...\n\n");
      server.send(JSON.stringify(getQuestion));
    }

    if (parsedServerMessage.length === 3) {
      let correctAnswersCounter = 0;
      parsedServerMessage.forEach((question: any, index: any) => {
        console.log(`Question number ${index + 1}: ${question[0].question}`);
        const resultsAlternatives = JSON.parse(question[0].alternatives);
        console.log("ALTERNATIVES: ");
        resultsAlternatives.forEach((alternative: any, index: any) => {
          console.log(`${alternativesArray[index]}: ${alternative}`);
        });
        console.log("YOUR ANSWER:", question.userAnswer);
        console.log("CORRECT ANSWER:", question[0].answer);
        console.log("\n\n");
        if (question.userAnswer === question[0].answer) {
          correctAnswersCounter++;
        }
      });
      console.log("Correct Answers: ", correctAnswersCounter);
      console.log("Wrong Answers; ", 3 - correctAnswersCounter);

      const input: any = await getUserInput(
        "Press 'R' to restart the game, or 'Q' to quit: "
      );

      switch (input) {
        case "R":
          console.log("\n\n\nRESTARTING GAME...");
          server.send(JSON.stringify(getQuestion));
          break;
        case "Q":
          console.log("\n\nCLOSING GAME...");
          server.close();
          break;
        default:
          console.log("\n\n\nRESTARTING GAME...");
          server.send(JSON.stringify(getQuestion));
          break;
      }
      if (input === "Q") {
        server.close();
      }
    }
  });

  console.log("WELCOME TO THE MINI TRIVIA. A GAME OF 3 QUESTIONS...");
  await getUserInput("Press any key to receive the first question...\n");
  server.send(JSON.stringify(getQuestion));

  server.on("close", () => {
    console.log("Connection closed.");
    return;
  });
});
