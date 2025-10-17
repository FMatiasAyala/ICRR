const express = require("express");
const fs = require("fs");

const prisma = require("./prismaClient/prismaClient");
const cors = require("cors");
const { initWebSocket } = require("./websocket/webSocket");
const { initWebSocketCmms } = require("./websocket/webSocketCmms");
const { createVncBridge } = require("./vnc/vncBridge");
const path = require("path");
const routerTablon = require("./routes/tablonAnuncios.routes");
const app = express();
const PORT = process.env.PORT || 3000;
require("dotenv").config();
app.use(express.json());
app.use(
  cors({
    origin: "http://192.168.1.231:3700",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true, // enable set cookies
  })
);
const uploadPath = path.join(__dirname, "uploads");
app.use("/uploads", express.static(uploadPath));
app.use("/tablon", routerTablon);

// Servidor WebSocket Tablon
const serverTablon = app.listen(PORT, () => {
  console.log(`WebSocket Tablon running on port 3000`);
});
initWebSocket(serverTablon);

//Server Cmms
const routerCmms = require("./routes/cmms.routes");
const http = require("http");
const appCmms = express();
const serverCmms = http.createServer(appCmms);
const PORT_CMMS = 3002;
const contratosPath = path.join(__dirname, "contratos");
const adjuntosPath = path.join(__dirname, "adjuntosEventos");
const planos = path.join(__dirname, "planos");

appCmms.use(
  cors({
    origin: "http://192.168.1.231:3701",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);
appCmms.use(express.json());
appCmms.use("/contratos", express.static(contratosPath));
appCmms.use("/adjuntosEventos", express.static(adjuntosPath));
appCmms.use("/cmms", routerCmms);
appCmms.use("/planos", express.static(planos));

initWebSocketCmms(serverCmms, { path: "/socket.io-cmms" });

const wssVnc = createVncBridge({
  allowPorts: [5900, 5901, 5902],
  allowSubnet: "192.168.",
});

// Esto es lo que evita que se pisen
serverCmms.on("upgrade", (req, socket, head) => {
  if (req.url.startsWith("/ws-vnc")) {
    wssVnc.handleUpgrade(req, socket, head, (ws) => {
      wssVnc.emit("connection", ws, req);
    });
  }
});
serverCmms.listen(PORT_CMMS, () => {
  console.log(`WebSocket CMMS running on port 3002`);
});
