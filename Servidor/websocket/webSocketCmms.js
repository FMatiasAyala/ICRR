const { Server } = require("socket.io");

let io; // Variable para almacenar la instancia de socket.io

const initWebSocketCmms = (
  server,
  { corsOrigin = "http://192.168.1.231:3701", path = "/socket.io-cmms" } = {}
) => {
  io = new Server(server, {
    path,
    cors: {
      origin: corsOrigin, // Cambia esto según tu frontend
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log(`Cliente conectado: ${socket.id}`);

    // Evento para recibir mensajes
    socket.on("mensaje", (data) => {
      console.log("Mensaje recibido:", data);

      // Emitir a todos los clientes
      io.emit("mensaje", data);
    });

    // Evento para desconexión
    socket.on("disconnect", () => {
      console.log(`Cliente desconectado: ${socket.id}`);
    });
  });

  return io;
};

const broadcastUpdate = (evento, data) => {
  io.emit(evento, data); // Emite el evento a todos los clientes conectados
};
const getIo = () => io; // Para obtener la instancia de socket.io en otros módulos

module.exports = { initWebSocketCmms, getIo, broadcastUpdate };
