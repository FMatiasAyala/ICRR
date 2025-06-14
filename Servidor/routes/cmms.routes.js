// cmms/routes.js
const express = require("express");
const router = express.Router();
const { contrato } = require("../middlewares/contratosMiddlewares");
const {adjuntosEventos}= require("../middlewares/adjuntosEventosMiddlewares");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dbMysqlDev = require("../DataBase/MySqlDatabaseDev");
const equiposControllers = require("../controllers/cmms/equiposController");
const mantenimientoControllers = require("../controllers/cmms/mantenimientosController");
const eventosControllers = require("../controllers/cmms/eventosControllers");
const tecnicosControllers = require("../controllers/cmms/tecnicosController");
const contratoController = require ("../controllers/cmms/contratoController")


require("dotenv").config();


//Equipo medicos
router.get("/equipos", equiposControllers.obtenerEquipos);
router.get("/tecnicosEquipo/:equipoId", equiposControllers.tecnicoEquipo);
router.post("/bajaEquipo", equiposControllers.bajaEquipo);
router.post("/altaEquipos", equiposControllers.altaEquipo);
router.put("/modificacionEquipo/:id", equiposControllers.modificacionEquipo)

// Eventos de equipos
router.get("/eventos", eventosControllers.obtenerEventos);
router.get("/eventosFiltrados", eventosControllers.eventosFiltrados);
router.get("/cantidadEventos", eventosControllers.cantidadEventos); 
router.get("/fileEvento", eventosControllers.fileEvento);
router.post("/eventos",adjuntosEventos.array("files"), eventosControllers.nuevoEvento);
router.post("/reporteEventos", eventosControllers.reportesEventos);
router.put("/modificacionEvento/:id",adjuntosEventos.array("files"), eventosControllers.modificacionEvento);


//Mantenimientos
router.get("/mantenimiento", mantenimientoControllers.obtenerMantenimientos);
router.post("/mantenimiento", mantenimientoControllers.nuevoMantenimiento);
router.put("/mantenimiento/:id", mantenimientoControllers.actualizarMantenimiento);
router.put("/mantenimientoPostpone/:id", mantenimientoControllers.reprogramarManteminiento);

// Ficha Tecnicos
router.get("/tecnicos", tecnicosControllers.obtenerTecnicos);
router.post("/altaTecnicos", tecnicosControllers.altaTecnicos);
router.put("/modificacionTecnicos/:id", tecnicosControllers.modificacionTecnicos);
router.delete("/bajaTecnicos/:id", tecnicosControllers.bajaTecnicos);


//Contratos
router.get("/datosContrato", contratoController.datosContratos);
router.get("/fileContrato", contratoController.fileContrato);
router.post("/cargaContratos", contrato.single("file"), contratoController.cargaContratos);




// Salas
router.get("/salas", (req, res) => {
  const query = "select * from tbl_ubicaciones inner join tbl_servicios on tbl_ubicaciones.id_servicio = tbl_servicios.id_servicio";

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
