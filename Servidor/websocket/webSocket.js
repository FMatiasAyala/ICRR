const WebSocket = require("ws");
const {prisma} = require("../prismaClient/prismaClient");

let wss;

const initWebSocket = (server) => {
    wss = new WebSocket.Server({ server });
    wss.on("connection", (ws) => {
      console.log("Client connected");
      ws.on("message", (message) => {
        const data = JSON.parse(message);
        if (data.type === "fetch") {
          fetchAnuncios(ws);
        } else if (
          data.type === "create" ||
          data.type === "update" ||
          data.type === "delete"
        ) {
          broadcast(JSON.stringify({ type: "update" }));
        }
      });
      ws.on("close", () => {
        console.log("Client disconnected");
      });
    });
  };
  
  const fetchAnuncios = async (ws) => {
    try {
      const anuncios = await prisma.anuncioDev.findMany({
        include: {
          attachments: true,
          author: true,
        },
      });
      ws.send(JSON.stringify({ type: "init", anuncios }));
    } catch (error) {
      console.error("Error fetching anuncios:", error);
      ws.send(JSON.stringify({ type: "error", message: "Error fetching anuncios" }));
    }
  };
  
  const broadcast = (data) => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  };
  
  module.exports = { initWebSocket, broadcast };