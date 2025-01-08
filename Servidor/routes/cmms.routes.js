// cmms/routes.js
const express = require("express");
const router = express.Router();
const { contrato } = require("../middlewares/contratosMiddlewares");
const bcrypt = require("bcrypt");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const dbMysqlDev = require("../DataBase/MySqlDatabaseDev");
const equiposControllers = require("../controllers/cmms/equiposController");
const mantenimientoControllers = require("../controllers/cmms/mantenimientosController");
const eventosControllers = require("../controllers/cmms/eventosControllers");
const path = require("path");
require("dotenv").config();


//Equipo medicos
router.get("/equipos", equiposControllers.obtenerEquipos);
router.post("/bajaEquipo", equiposControllers.bajaEquipo);
router.post("/altaEquipos", equiposControllers.altaEquipo);

// Eventos de equipos
router.get("/eventos", eventosControllers.obtenerEventos);
router.get("/eventosFiltrados", eventosControllers.eventosFiltrados);
router.get("/cantidadEventos", eventosControllers.cantidadEventos); 
router.post("/eventos", eventosControllers.nuevoEvento);

//Mantenimientos
router.get("/mantenimiento", mantenimientoControllers.obtenerMantenimientos);
router.post("/mantenimiento", mantenimientoControllers.nuevoMantenimiento);
router.put("/mantenimiento/:id", mantenimientoControllers.actualizarMantenimiento);
router.put("/mantenimientoPostpone/:id", mantenimientoControllers.reprogramarManteminiento);


//obtenes ups
router.get("/ups", (req, res) => {
  const query = "select * from tbl_ups";

  const obtenerUps = async () => {
    try {
      const ups = await dbMysqlDev.executeQuery(query);
      res.json(ups);
    } catch (err) {
      res.status(500).json({ error: "Error al obtener equipos medicos" });
    }
  };

  obtenerUps();
});

// Ficha Tecnicos
router.get("/tecnicos", (req, res) => {
  const query = "select * from tbl_tecnicos";

  const obtenerTecnicos = async () => {
    try {
      const tecnicos = await dbMysqlDev.fichaTecnicos(query);
      res.json(tecnicos);
    } catch (err) {
      res.status(500).json({ error: "Error al obtener equipos medicos" });
    }
  };

  obtenerTecnicos();
});

// Salas
router.get("/salas", (req, res) => {
  const query = "select * from tbl_salas";

  const obtenerEvetnos = async () => {
    try {
      const eventos = await dbMysqlDev.executeQuery(query);
      res.json(eventos);
    } catch (err) {
      console.error("Error al obtener los eventos: ", err);
    }
  };
  obtenerEvetnos();
});

//Descarga del contrato
router.get("/datosContrato", async (req, res) => {
  const { id_equipo } = req.query;

  if (!id_equipo) {
    return res.status(400).json({ error: "ID de equipo es requerido" });
  }

  const query =
    "select descripcion, cobertura_partes , cobertura_manoDeObra, desde , hasta , actualizacion  from dev.tbl_contratos where id_equipo = ?";

  const datosContrato = async () => {
    try {
      const datos = await dbMysqlDev.executeQueryParams(query, [id_equipo]);
      res.json(datos);
    } catch (err) {
      console.error("Error al obtener los eventos: ", err);
    }
  };

  datosContrato();
});
router.get("/fileContrato", async (req, res) => {
  const { id_equipo } = req.query;

  if (!id_equipo) {
    return res.status(400).json({ error: "ID de equipo es requerido" });
  }

  const query = "SELECT url FROM dev.tbl_contratos WHERE id_equipo = ?";

  try {
    // Consulta en la base de datos
    const result = await dbMysqlDev.executeQueryParams(query, [id_equipo]);

    if (result.length === 0) {
      return res
        .status(404)
        .json({ error: "No se encontró el contrato para este equipo" });
    }

    // Obtén la URL del archivo desde la base de datos
    const fileUrl = result[0].url;
    const filePath = path.join(
      "C:/htdocs/Matias/ICRR/Servidor/contratos/",
      fileUrl
    );

    // Verifica si el archivo existe
    if (!fs.existsSync(filePath)) {
      return res
        .status(404)
        .json({ error: "El archivo no existe en el servidor" });
    }

    // Envía el archivo para descarga
    res.download(filePath, "contrato.pdf", (err) => {
      if (err) {
        console.error("Error al enviar el archivo:", err);
        return res.status(500).json({ error: "Error al descargar el archivo" });
      }
    });
  } catch (err) {
    console.error("Error al obtener el contrato:", err);
    return res.status(500).json({ error: "Error al procesar la solicitud" });
  }
});

// Carga de contratos
router.post("/cargaContratos", contrato.single("file"), async (req, res) => {
  const {
    descripcion,
    cobertura_partes,
    cobertura_manoDeObra,
    desde,
    hasta,
    id_equipo,
    actualizacion,
  } = req.body;

  console.log("Datos recibidos:", req.body);
  console.log("Archivo subido:", req.file);

  // Verificar que el archivo haya sido subido
  if (!req.file) {
    return res.status(400).json({ error: "No se subió ningún archivo" });
  }

  // Obtener la ruta relativa del archivo subido
  const url = path
    .relative("C:/htdocs/Matias/ICRR/Servidor/contratos", req.file.path)
    .replace(/\\/g, "/"); // Asegurar barras normales en la ruta

  // Query SQL
  const query =
    "INSERT INTO tbl_contratos (url, descripcion, cobertura_partes, cobertura_manoDeObra, desde, hasta, id_equipo, actualizacion) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

  try {
    // Insertar el archivo en la base de datos
    await dbMysqlDev.executeQueryParams(query, [
      url,
      descripcion,
      cobertura_partes,
      cobertura_manoDeObra,
      desde,
      hasta,
      id_equipo,
      actualizacion,
    ]);

    res.status(201).json({
      message: "Carga de contrato realizada exitosamente",
    });
  } catch (error) {
    console.error("Error al cargar contrato:", error);
    return res.status(500).json({ error: "Error al cargar contrato" });
  }
});

//Usuarios
router.post("/newUsers", async (req, res) => {
  const { username, password, role, name, lastname } = req.body;

  const query =
    "INSERT INTO tbl_usuarios (username, password, role, name, lastname) VALUES (?, ?, ?, ?, ?)";

  const nuevoUsuario = async () => {
    if (!username || !password || !role) {
      return res.status(400).json({ error: "Faltan datos del usuario" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const params = await dbMysqlDev.executeQueryParams(query, [
        username,
        hashedPassword,
        role,
        name,
        lastname,
      ]);
      res.status(201).json({
        message: "Registro creado exitosamente",
      });
    } catch {
      console.error("Error al insertar usuario:", error);
      return res.status(500).json({ error: "Error al crear el usuario" });
    }
  };

  nuevoUsuario();
});

router.put("/changePassword", async (req, res) => {
  const { username, password, id } = req.body;
  const query = "UPDATE tbl_usuarios SET password =? WHERE id =?";
  if (!username || !password) {
    return res.status(400).json({ error: "Faltan datos de usuario" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await dbMysqlDev.executeQueryParams(query, [
      hashedPassword,
      id,
    ]);
    res.status(200).json({ message: "Contraseña actualizada exitosamente" });
  } catch (error) {
    console.error("Error al cambiar contraseña:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const query =
    "SELECT id, username, password, role, name, lastname FROM tbl_usuarios WHERE username = ?";

  const login = async () => {
    try {
      const session = await dbMysqlDev.executeQueryParams(query, [username]);

      if (session.length === 0) {
        return res.status(401).json({ error: "Credenciales incorrectas" });
      }

      const user = session[0];
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: "Credenciales incorrectas" });
      }
      const token = jwt.sign(
        {
          id: user.id,
          username: user.username,
          role: user.role,
          name: user.name,
          lastname: user.lastname,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      res.json({ token });
    } catch (error) {
      console.error("Error en el login:", error);
      res.status(500).json({ error: "Error en el servidor" });
    }
  };

  login();
});

module.exports = router;
