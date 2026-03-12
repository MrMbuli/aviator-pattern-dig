const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: 8080 });

wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("message", (message) => {
    const data = JSON.parse(message);
    if (data.type === "play") {
      // Handle multiplayer play
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(data));
        }
      });
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});
