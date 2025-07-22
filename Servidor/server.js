const express = require("express");
const fs = require("fs");
const prisma =require("./prismaClient/prismaClient")
const cors = require("cors");
const {initWebSocket} = require("./websocket/webSocket");
const {initWebSocketCmms} = require("./websocket/webSocketCmms");
const path = require("path");
const routerTablon = require('./routes/tablonAnuncios.routes');
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());
app.use(cors({
  origin: 'http://192.168.1.6:3700',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true, // enable set cookies
}));
const uploadPath = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadPath));
app.use('/tablon', routerTablon);

// Servidor WebSocket Tablon
const serverTablon = app.listen(PORT, () => {
  console.log(`WebSocket Tablon running on port 3000`);
});
initWebSocket(serverTablon);




//Server Cmms
const routerCmms = require('./routes/cmms.routes');
const http = require('http');
const appCmms = express();
const serverCmms = http.createServer (appCmms)
const PORT_CMMS = 3002;
const contratosPath = path.join(__dirname, 'contratos');
const adjuntosPath = path.join (__dirname, 'adjuntosEventos');



appCmms.use(express.json());
appCmms.use('/contratos', express.static(contratosPath));
appCmms.use('/adjuntosEventos', express.static(adjuntosPath));
appCmms.use(cors({
  origin: 'http://192.168.1.6:3701',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true, // enable set cookies
}));
appCmms.use('/cmms', routerCmms);

initWebSocketCmms(serverCmms);
serverCmms.listen(PORT_CMMS, () => {
  console.log(`WebSocket CMMS running on port 3002`);
});

