const express = require("express");
const { PrismaClient } = require("@prisma/client");
const cors = require("cors");
const WebSocket = require("ws");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'C:/ICRR/ICRR/Servidor/uploads')));

// Middleware para crear la carpeta si no existe
const createFolderIfNotExists = (folderPath) => {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
};
// Configuración de multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const authorId = req.body.authorId; // Obtén el ID del autor desde el cuerpo de la solicitud
    const folderPath = path.join("C:/ICRR/ICRR/Servidor/uploads", authorId.toString()); // Crea una carpeta para cada autor
    createFolderIfNotExists(folderPath);
    cb(null, folderPath); // Carpeta donde se guardarán los archivos
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Renombra el archivo con un timestamp
  },
});

const upload = multer({ storage: storage });

// Servidor HTTP
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Servidor WebSocket
const wss = new WebSocket.Server({ server });

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

const fetchAnuncios = async (ws) => {
  try {
    const anuncios = await prisma.anuncio.findMany({
      include: {
        attachments: true,
        author: true,
      },
    });
    ws.send(JSON.stringify({ type: "init", anuncios }));
  } catch (error) {
    console.error("Error fetching anuncios:", error);
    ws.send(
      JSON.stringify({ type: "error", message: "Error fetching anuncios" })
    );
  }
};

const broadcast = (data) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
};

app.post("/anuncios", upload.array("attachments", 10), async (req, res) => {
  try {
    const { title, content, sector, authorId  } = req.body;
    const attachments = req.files ? req.files.map((file) => {
      const filePath = path.relative(__dirname, file.path).replace(/\\/g, '/'); // Ruta relativa
      return { url: filePath };
    }) : [];

    // Guardar el anuncio
    const newAnuncio = await prisma.anuncio.create({
      data: {
        title,
        content,
        sector,
        attachments: {
          create: attachments.map((url) => ({ url })),
        },
        author: {
          connect: { id: parseInt(authorId, 10)  }
        },
      },
    });

    broadcast(JSON.stringify({ type: "update" }));
    res.json(newAnuncio);
  } catch (error) {
    console.error("Error creating anuncio:", error);
    res.status(500).json({ error: "Error creating anuncio" });
  }
});

// Obtener todos los anuncios
app.get("/anuncios", async (req, res) => {
  try {
    const anuncios = await prisma.anuncio.findMany({
      include: {
        attachments: true,
        author: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    res.json(anuncios);
  } catch (error) {
    console.error("Error fetching anuncios:", error);
    res.status(500).json({ error: "Error fetching anuncios" });
  }
});

// Obtener un anuncio por ID
app.get("/anuncios/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const anuncio = await prisma.anuncio.findUnique({
      where: { id: parseInt(id) },
      include: {
        attachments: true,
        author:true,
      },
    });
    res.json(anuncio);
  } catch (error) {
    console.error("Error fetching anuncio:", error);
    res.status(500).json({ error: "Error fetching anuncio" });
  }
});

// Actualizar un anuncio por ID

app.put("/anuncios/:id", upload.array("attachments", 10), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, sector } = req.body;
    const attachments = req.files ? req.files.map((file) => file.path) : [];

    const data = {
      title,
      content,
      sector,
    };

    if (attachments.length > 0) {
      // Si hay nuevos archivos, elimina los antiguos y actualiza los adjuntos
      const oldAnuncio = await prisma.anuncio.findUnique({
        where: { id: parseInt(id) },
        include: { attachments: true },
      });

      for (const attachment of oldAnuncio.attachments) {
        try {
          fs.unlinkSync(attachment.url);
        } catch (err) {
          console.error("Error al eliminar el archivo:", err);
        }
      }

      data.attachments = {
        deleteMany: {}, // Borra todos los adjuntos actuales
        create: attachments.map((url) => ({ url })), // Añade los nuevos adjuntos
      };
    }

    const updatedAnuncio = await prisma.anuncio.update({
      where: { id: parseInt(id) },
      data,
    });

    broadcast(JSON.stringify({ type: "update" }));
    res.json(updatedAnuncio);
  } catch (error) {
    console.error("Error updating anuncio:", error);
    res.status(500).json({ error: "Error updating anuncio" });
  }
});

// Eliminar un anuncio por ID
app.delete("/anuncios/:id", async (req, res) => {
  const { id } = req.params;
  try {
    // Eliminar los archivos adjuntos relacionados
    const attachments = await prisma.attachment.findMany({
      where: { anuncioId: parseInt(id) },
    });

    for (const attachment of attachments) {
      try {
        fs.unlinkSync(attachment.url);
      } catch (err) {
        console.error("Error al eliminar el archivo:", err);
      }
    }

    await prisma.attachment.deleteMany({
      where: { anuncioId: parseInt(id) },
    });

    // Eliminar el anuncio
    await prisma.anuncio.delete({
      where: { id: parseInt(id) },
    });

    broadcast(JSON.stringify({ type: "update" }));
    res.sendStatus(204);
  } catch (error) {
    console.error("Error al eliminar el anuncio:", error);
    res.status(500).json({ error: "Error al eliminar el anuncio" });
  }
});

// Obtener todos los usuarios
app.get("/user", async (req, res) => {
  try {
    const user = await prisma.author.findMany({});
    res.json(user);
  } catch (error) {
    console.error("Error fetching anuncios:", error);
    res.status(500).json({ error: "Error fetching anuncios" });
  }
});
