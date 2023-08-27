import WebSocket from "ws";

const client = new WebSocket("ws://localhost:8080");

client.on("open", () => {
  console.log("Connected to the server.");

  // Send a message to the server
  client.send(JSON.stringify("message"));

  client.on("message", (message: any) => {
    const parsedServerMessage = JSON.parse(message);
    console.log(`\nQuestion: ${parsedServerMessage[0].question}\n`);
    console.log("ALTERNATIVES: ");
    const alternatives = JSON.parse(parsedServerMessage[0].alternatives);
    console.log(`A: ${alternatives[0]}`);
    console.log(`B: ${alternatives[1]}`);
    console.log(`C: ${alternatives[2]}`);
    console.log(`D: ${alternatives[3]}`);
    console.log(`E: ${alternatives[4]}`);
  });

  client.on("close", () => {
    console.log("Connection closed.");
  });
});
