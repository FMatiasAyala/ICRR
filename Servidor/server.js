const express = require("express");
const prisma =require("./prismaClient/prismaClient")
const cors = require("cors");
const {initWebSocket} = require("./websocket/webSocket");
const path = require("path");
const routerTablon = require('./routes/tablonAnuncios.routes');
const routerCmms = require('./routes/cmms.routes');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());
const uploadPath = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadPath));
app.use('/tablon', routerTablon);
app.use('/cmms', routerCmms);


// Servidor HTTP
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Servidor WebSocket
initWebSocket(server);

