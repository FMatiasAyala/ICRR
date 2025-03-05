const { Server } = require("socket.io");

let io; // Variable para almacenar la instancia de socket.io

const initWebSocketCmms = (server) => {
  io = new Server(server, {
    cors: {
      origin: "http://192.168.1.6:3701/cmms", // Cambia esto según tu frontend
      methods: ["GET", "POST", "PUT", "DELETE"],
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

module.exports = { initWebSocketCmms, getIo , broadcastUpdate};
