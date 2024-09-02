const express = require("express");
const { PrismaClient } = require("@prisma/client");
const cors = require("cors");
const {executeMySql, executeQuery} = require("./db");
const WebSocket = require("ws");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());
const uploadPath = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadPath));






// Middleware para crear la carpeta si no existe
const createFolderIfNotExists = (folderPath) => {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
};

// Configuración de multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const authorId = req.body.authorId;
    const folderPath = path.join("C:/ICRR/ICRR/Servidor/uploads", authorId.toString());
    createFolderIfNotExists(folderPath);
    cb(null, folderPath);
  },
  filename: (req, file, cb) => {
    const originalName = path.parse(file.originalname).name; // Obtiene el nombre original del archivo sin la extensión
    const extension = path.extname(file.originalname); // Obtiene la extensión del archivo

    cb(null, `${originalName}${extension}`);
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
    const anuncios = await prisma.anuncioDev.findMany({
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
    const { title, content, obraSocial, codigoObraSocial, sector, authorId, servicio } = req.body;
    const attachments = req.files
      ? req.files.map((file) => {
          const filePath = path.relative(__dirname, file.path).replace(/\\/g, "/"); // Ruta relativa
          return { url: filePath };
        })
      : [];

    // Guardar el anuncio
    const newAnuncio = await prisma.anuncioDev.create({
      data: {
        title,
        content,
        obraSocial,
        codigoObraSocial,
        sector,
        servicio,
        attachments: {
          create: attachments.map((attachment) => ({ url: attachment.url })),
        },
        author: {
          connect: { id: parseInt(authorId, 10) },
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
    const anuncios = await prisma.anuncioDev.findMany({
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
    const anuncio = await prisma.anuncioDev.findUnique({
      where: { id: parseInt(id) },
      include: {
        attachments: true,
        author: true,
      },
    });
    res.json(anuncio);
  } catch (error) {
    console.error("Error fetching anuncio:", error);
    res.status(500).json({ error: "Error fetching anuncio" });
  }
});

app.put("/anuncios/:id", upload.array("attachments", 10), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, sector } = req.body;
    const attachments = req.files ? req.files.map((file) => {
      const filePath = path.relative(__dirname, file.path).replace(/\\/g, "/"); // Ruta relativa
      return filePath;
    }) : [];

    const data = {
      title,
      content,
      sector,
    };

    if (attachments.length > 0) {
      // Si hay nuevos archivos, elimina los antiguos y actualiza los adjuntos
      const oldAnuncio = await prisma.anuncioDev.findUnique({
        where: { id: parseInt(id) },
        include: { attachments: true },
      });

      for (const attachmentdev of oldAnuncio.attachments) {
        try {
          fs.unlinkSync(path.join(__dirname, attachmentdev.url))
        } catch (err) {
          console.error("Error deleting file:", err);
        }
      }

      data.attachments = {
        deleteMany: {}, // Elimina todos los adjuntos actuales
        create: attachments.map((url) => ({ url })), // Añade los nuevos adjuntos
      };
    }

    const updatedAnuncio = await prisma.anuncioDev.update({
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


app.delete("/anuncios/:id", async (req, res) => {
  const { id } = req.params;
  try {
    // Eliminar los archivos adjuntos relacionados
    const attachments = await prisma.attachmentDev.findMany({
      where: { anuncioId: parseInt(id) },
    });

    for (const attachmentDev of attachments) {
      try {
        fs.unlinkSync(path.join(__dirname, attachmentDev.url));
      } catch (err) {
        console.error("Error deleting file:", err);
      }
    }

    await prisma.attachmentDev.deleteMany({
      where: { anuncioId: parseInt(id) },
    });

    // Eliminar el anuncio
    await prisma.anuncioDev.delete({
      where: { id: parseInt(id) },
    });

    broadcast(JSON.stringify({ type: "update" }));
    res.sendStatus(204);
  } catch (error) {
    console.error("Error deleting anuncio:", error);
    res.status(500).json({ error: "Error deleting anuncio" });
  }
});


// Obtener todos los usuarios
app.get("/user", async (req, res) => {
  try {
    const users = await prisma.authorDev.findMany({});
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Error fetching users" });
  }
});


//Fitlra anuncios segun el servicio del usuario

app.get("/anunciosFiltrados", async (req, res) => {
  const { searchTerm } = req.query;
  console.log("searchTerm:",searchTerm); // Verifica que `searchTerm` tiene un valor
  
  const query = `SELECT a.idemp FROM tblempleado a
                WHERE a.idemp = ?
                AND a.idemp IN (
                  SELECT idemp  
                  FROM tblempleado 
                  WHERE encuesta = 'operador' 
                  AND area = 'ADMISION' 
                  AND estado = 'HAB' 
                  AND servicio NOT IN ('RM')
                )`;
  try {
    if (!searchTerm) {
      return res.status(400).json({ error: "searchTerm is required" });
    }
    const anuncioFiltro = await executeMySql(query, [searchTerm]);
    res.json(anuncioFiltro);
  } catch (err) {
    console.error("Error al ejecutar la consulta:", err);
    res.status(500).json({ error: "Error al ejecutar la consulta" });
  }
});



//Obetenes obras sociales
app.get("/obrasociales", async (req, res) => {
  const query =
    "select RTRIM(nTarjeta) as id,  RTRIM(sInstitucion) as codigo, RTRIM(sRazonSocial) as razonSocial, RTRIM(sSigla) as sigla from stdInstitucionesMedicas WHERE sEstado = 'HAB'"; // Ajusta la consulta según tu tabla y necesidades
  try {
    const obrasSociales = await executeQuery(query);
    res.json(obrasSociales);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener las obras sociales" });
  }
});

app.get("/obrasociales/:searchTerm", async (req, res) => {
  const { searchTerm } = req.params;
  const query = `SELECT RTRIM(nTarjeta) AS id, RTRIM(sInstitucion) AS codigo, RTRIM(sRazonSocial) AS razonSocial, RTRIM(sSigla) AS sigla 
                 FROM stdInstitucionesMedicas 
                 WHERE sEstado = 'HAB' AND (sInstitucion LIKE @searchTerm OR sRazonSocial LIKE @searchTerm)`;
  
  try {
    const obraSociales = await executeQuery(query, { searchTerm: `%${searchTerm}%` });
    res.json(obraSociales);
  } catch (error) {
    console.error("Error fetching obras sociales:", error);
    res.status(500).json({ error: "Error fetching obra sociales" });
  }
});

