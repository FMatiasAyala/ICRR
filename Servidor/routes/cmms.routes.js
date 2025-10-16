// cmms/routes.js
const express = require("express");
const router = express.Router();
const { contrato } = require("../middlewares/contratosMiddlewares");
const {
  adjuntosEventos,
} = require("../middlewares/adjuntosEventosMiddlewares");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middlewares/authMiddlewares");
const dbMysqlDev = require("../DataBase/MySqlDatabaseDev");
const equiposControllers = require("../controllers/cmms/equiposController");
const mantenimientoControllers = require("../controllers/cmms/mantenimientosController");
const eventosControllers = require("../controllers/cmms/eventosControllers");
const tecnicosControllers = require("../controllers/cmms/tecnicosController");
const contratoController = require("../controllers/cmms/contratoController");
const equiposInformaticos = require("../controllers/cmms/equiposInfController");
const planosControllers = require("../controllers/cmms/planosController");

require("dotenv").config();

//Equipo medicos
router.get("/equipos", equiposControllers.obtenerEquipos);
router.get("/tecnicosEquipo/:equipoId", equiposControllers.tecnicoEquipo);
router.post("/bajaEquipo", equiposControllers.bajaEquipo);
router.post("/altaEquipos", equiposControllers.altaEquipo);
router.put("/modificacionEquipo/:id", equiposControllers.modificacionEquipo);

// Eventos de equipos
router.get("/eventos", eventosControllers.obtenerEventos);
router.get("/eventosFiltrados", eventosControllers.eventosFiltrados);
router.get("/cantidadEventos", eventosControllers.cantidadEventos);
router.get("/fileEvento", eventosControllers.fileEvento);
router.post(
  "/eventos",
  adjuntosEventos.array("files"),
  eventosControllers.nuevoEvento
);
router.post("/reporteEventos", eventosControllers.reportesEventos);
router.put(
  "/modificacionEvento/:id",
  adjuntosEventos.array("files"),
  eventosControllers.modificacionEvento
);

//Mantenimientos
router.get("/mantenimiento", mantenimientoControllers.obtenerMantenimientos);
router.post("/mantenimiento", mantenimientoControllers.nuevoMantenimiento);
router.put(
  "/mantenimiento/:id",
  mantenimientoControllers.actualizarMantenimiento
);
router.put(
  "/mantenimientoPostpone/:id",
  mantenimientoControllers.reprogramarManteminiento
);

// Ficha Tecnicos
router.get("/tecnicos", tecnicosControllers.obtenerTecnicos);
router.post("/altaTecnicos", tecnicosControllers.altaTecnicos);
router.put(
  "/modificacionTecnicos/:id",
  tecnicosControllers.modificacionTecnicos
);
router.delete("/bajaTecnicos/:id", tecnicosControllers.bajaTecnicos);

//Contratos
router.get("/allContratos", contratoController.allContratos);
router.get("/datosContrato", contratoController.datosContratos);
router.get("/fileContrato", contratoController.fileContrato);
router.post(
  "/cargaContratos",
  contrato.single("file"),
  contratoController.cargaContratos
);
router.patch("/editContrato/:id_contrato", contratoController.editContrato);

//PC, impresoras, scanner, switch , etc.
router.get("/equiposInformaticos", equiposInformaticos.obtenerEquipos);
router.post("/altaEquipoInformatico", equiposInformaticos.crearEquipo);
router.put(
  "/modificacionEquipoInformatico/:id",
  equiposInformaticos.actualizarEquipo
);

//Mata fuegos
router.get("/Matafuegos", equiposInformaticos.obtenerMatafuego);
router.post("/altaMatafuegos", equiposInformaticos.crearMatafuego);
router.put(
  "/modificacionMatafuegos/:id",
  equiposInformaticos.actualizarMatafuego
);

//Refrigeracion
router.get("/refrigeracion", equiposInformaticos.obtenerRefrigeracion);
router.post("/altaRefrigeracion", equiposInformaticos.crearRefrigeracion);
router.put(
  "/modificacionRefrigeracion/:id",
  equiposInformaticos.actualizarRefrigeracion
);

//UPS
router.get("/ups", equiposInformaticos.obtenerUps);
router.post("/altaUps", equiposInformaticos.crearUps);
router.put("/modificacionUps/:id", equiposInformaticos.actualizarUps);

//Planos
router.get("/planos", planosControllers.obtenerPlanos);

// Salas
router.get("/salas", (req, res) => {
  const query =
    "select * from tbl_ubicaciones inner join tbl_servicios on tbl_ubicaciones.id_servicio = tbl_servicios.id_servicio";

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

//GET/Users
router.get("/users", authMiddleware, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Solo admin puede ver usuarios" });
  }

  try {
    const result = await dbMysqlDev.executeQueryParams(
      "SELECT id_usuario, username, role, name, lastname FROM tbl_usuarios"
    );
    res.json(result);
  } catch (err) {
    console.error("Error en get users:", err);
    res.status(500).json({ error: "Error en el servidor" });
  }
});


// POST /login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const [user] = await dbMysqlDev.executeQueryParams(
      "SELECT id_usuario, username, password, role, name, lastname FROM tbl_usuarios WHERE username = ?",
      [username]
    );

    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return res.status(401).json({ error: "Credenciales inválidas" });

    // Payload mínimo
    const payload = {
      id: user.id_usuario,
      username: user.username,
      role: user.role,
      name:user.name,
      lastname:user.lastname
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    res.json({ token });
  } catch (err) {
    console.error("Error en login:", err);
    res.status(500).json({ error: "Error en el servidor" });
  }
});


// PUT /changePassword
router.put("/changePassword", authMiddleware, async (req, res) => {
  const { id_usuario, password } = req.body;

  if (!id_usuario || !password) {
    return res.status(400).json({ error: "Faltan datos (id, password)" });
  }

  // validar que sea admin
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ error: "Solo un administrador puede cambiar contraseñas" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await dbMysqlDev.executeQueryParams(
      "UPDATE tbl_usuarios SET password = ? WHERE id_usuario = ?",
      [hashedPassword, id_usuario]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json({ message: "Contraseña actualizada por el administrador" });
  } catch (err) {
    console.error("Error en changePassword:", err);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

module.exports = router;
