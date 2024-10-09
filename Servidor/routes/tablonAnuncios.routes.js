const express = require("express");
const router = express.Router();
const {MySqlDatabaseCrr, executeQuery } = require("../db");
const { upload } = require("../middlewares/uploadMiddlewares");
const { prisma } = require("../prismaClient/prismaClient");
const { broadcast } = require("../websocket/webSocket");
const path = require("path");

router.post("/anuncios", upload.array("attachments", 10), async (req, res) => {
  try {
    const {
      title,
      content,
      obraSocial,
      codigoObraSocial,
      sector,
      authorId,
      servicio,
    } = req.body;
    const attachments = req.files
      ? req.files.map((file) => {
          const filePath = path
            .relative(__dirname, file.path)
            .replace(/\\/g, "/"); // Ruta relativa
          return { url: filePath };
        })
      : [];

    // Guardar el anuncio
    const newAnuncio = await prisma.anuncio.create({
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
router.get("/anuncios", async (req, res) => {
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
router.get("/anuncios/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const anuncio = await prisma.anuncio.findUnique({
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

router.put(
  "/anuncios/:id",
  upload.array("attachments", 10),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { title, content, sector } = req.body;
      const attachments = req.files
        ? req.files.map((file) => {
            const filePath = path
              .relative(__dirname, file.path)
              .replace(/\\/g, "/"); // Ruta relativa
            return filePath;
          })
        : [];

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
            fs.unlinkSync(path.join(__dirname, attachment.url));
          } catch (err) {
            console.error("Error deleting file:", err);
          }
        }

        data.attachments = {
          deleteMany: {}, // Elimina todos los adjuntos actuales
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
  }
);

router.delete("/anuncios/:id", async (req, res) => {
  const { id } = req.params;
  try {
    // Eliminar los archivos adjuntos relacionados
    const attachments = await prisma.attachment.findMany({
      where: { anuncioId: parseInt(id) },
    });

    for (const attachment of attachments) {
      try {
        fs.unlinkSync(path.join(__dirname, attachment.url));
      } catch (err) {
        console.error("Error deleting file:", err);
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
    console.error("Error deleting anuncio:", error);
    res.status(500).json({ error: "Error deleting anuncio" });
  }
});

// Obtener todos los usuarios
router.get("/user", async (req, res) => {
  try {
    const users = await prisma.author.findMany({});
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Error fetching users" });
  }
});

//Fitlra anuncios segun el servicio del usuario
const configMySqlCrr = {
  host: process.env.DB_HOST_MYSQL,
  user: process.env.DB_USER_MYSQL,
  password: process.env.DB_PASSWORD_MYSQL,
  database: process.env.DB_NAME_MYSQL_CRR,
};

const dbMysqlCrr = new MySqlDatabaseCrr(configMySqlCrr);

router.post("/create", (req, res) => {
  const { name, description } = req.body;

  res.status(201).json({
    message: "Tarea creada exitosamente",
    data: { name, description },
  });
});

router.get("/anunciosFiltrados", async (req, res) => {
  const { searchTerm } = req.query;

  const query = `SELECT a.idemp FROM tblempleado a
                  WHERE a.idemp = ?
                  AND a.idemp IN (
                    SELECT idemp  
                    FROM tblempleado 
                    WHERE area in ('ADMISION', 'CALLCENTER') 
                    AND estado = 'HAB' 
                    AND servicio NOT IN ('RM')
                  )`;
  try {
    if (!searchTerm) {
      return res.status(400).json({ error: "searchTerm is required" });
    }
    const anuncioFiltro = await dbMysqlCrr.executeQueryParams(query, [searchTerm]);
    res.json(anuncioFiltro);
  } catch (err) {
    console.error("Error al ejecutar la consulta:", err);
    res.status(500).json({ error: "Error al ejecutar la consulta" });
  }
});

//Obetenes obras sociales
router.get("/obrasociales", async (req, res) => {
  const query =
    "select RTRIM(nTarjeta) as id,  RTRIM(sInstitucion) as codigo, RTRIM(sRazonSocial) as razonSocial, RTRIM(sSigla) as sigla from stdInstitucionesMedicas WHERE sEstado = 'HAB'"; // Ajusta la consulta según tu tabla y necesidades
  try {
    const obrasSociales = await executeQuery(query);
    res.json(obrasSociales);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener las obras sociales" });
  }
});

router.get("/obrasociales/:searchTerm", async (req, res) => {
  const { searchTerm } = req.params;
  const query = `SELECT RTRIM(nTarjeta) AS id, RTRIM(sInstitucion) AS codigo, RTRIM(sRazonSocial) AS razonSocial, RTRIM(sSigla) AS sigla 
                   FROM stdInstitucionesMedicas 
                   WHERE sEstado = 'HAB' AND (sInstitucion LIKE @searchTerm OR sRazonSocial LIKE @searchTerm)`;

  try {
    const obraSociales = await executeQuery(query, {
      searchTerm: `%${searchTerm}%`,
    });
    res.json(obraSociales);
  } catch (error) {
    console.error("Error fetching obras sociales:", error);
    res.status(500).json({ error: "Error fetching obra sociales" });
  }
});


module.exports = router;
