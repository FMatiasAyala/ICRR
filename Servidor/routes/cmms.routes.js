// cmms/routes.js
const express = require("express");
const router = express.Router();
const { contrato } = require("../middlewares/contratosMiddlewares");
const bcrypt = require("bcrypt");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const { MySqlDatabaseCrr, MySqlDatabaseDev } = require("../db");
const { broadcastUpdate } = require("../websocket/webSocketCmms");
const path = require("path");
require("dotenv").config();


/* ------------ MYSQL DEV -------------------- */

const configMySqlDev = {
  host: process.env.DB_HOST_MYSQL,
  user: process.env.DB_USER_MYSQL,
  password: process.env.DB_PASSWORD_MYSQL,
  database: process.env.DB_NAME_MYSQL_DEV,
};


const dbMysqlDev = new MySqlDatabaseDev(configMySqlDev);

router.get("/equipos", (req, res) => {
  const query = "select * from tbl_equipomedico";

  const obtenerEquipos = async () => {
    try {
      const equipos = await dbMysqlDev.executeQuery(query);
      res.json(equipos);
    } catch (err) {
      res.status(500).json({ error: "Error al obtener equipos medicos" });
    }
  };
  obtenerEquipos();
});
//Equipos medicos
router.post("/altaEquipos", async (req, res) => {
  try {
    console.log("Datos recibidos en el body:", req.body);

    const {
      marca,
      modelo,
      serial_number,
      tipo,
      servicio,
      ip,
      mascara,
      gateway,
      aetitle,
      puerto,
      compra_año,
      sala,
    } = req.body;

    if (!marca || !modelo || !servicio) {
      return res.status(400).json({ error: "Campos obligatorios faltantes" });
    }

    const values = [
      marca ?? null,
      modelo ?? null,
      serial_number ?? null,
      tipo ?? null,
      servicio ?? null,
      ip ?? null,
      mascara ?? null,
      gateway ?? null,
      aetitle ?? null,
      puerto ?? null,
      compra_año ?? null,
      sala ?? null,
    ];

    console.log("Valores que se enviarán a la BD:", values);

    const insertQuery = `
      INSERT INTO tbl_equipomedico (marca, modelo, serial_number, tipo, servicio, ip, mascara, gateway, aetitle, puerto, compra_año, sala, alta) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;

    await dbMysqlDev.executeQueryParams(insertQuery, values);

    res.status(201).json({
      message: "Registro creado exitosamente",
    });

    broadcastUpdate("eventoActualizado", { modelo });
  } catch (err) {
    console.error("Error al cargar el equipo:", err);
    res.status(500).json({ error: "Error al cargar equipo" });
  }
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

// Eventos de equipos
router.get("/eventos", (req, res) => {
  const query = "select * from tbl_estados";

  const obtenerEventos = async () => {
    try {
      const eventos = await dbMysqlDev.executeQuery(query);
      res.json(eventos);
    } catch (err) {
      console.error("Error al obtener los eventos: ", err);
    }
  };
  obtenerEventos();
});

// Eventos de equipos
router.get("/eventosFiltrados", (req, res) => {
  const { id_equipo } = req.query;
  const query =
    "select * from dev.tbl_estados where id_equipo = ? order by desde desc";

  const obtenerEventos = async () => {
    try {
      if (!id_equipo) {
        return res.status(400).json({ error: "searchTerm is required" });
      }
      const eventos = await dbMysqlDev.executeQueryParams(query, [id_equipo]);
      res.json(eventos);
    } catch (err) {
      console.error("Error al obtener los eventos: ", err);
    }
  };
  obtenerEventos();
});

// Cantidad de eventos por equipo
router.get("/cantidadEventos", (req, res) => {
  const query =
    "SELECT id_equipo, COUNT(*) AS cantidad_eventos FROM dev.tbl_estados where estado in ('NO OPERATIVO','REVISION') GROUP BY id_equipo ORDER BY cantidad_eventos DESC";

  const obtenerCantidades = async () => {
    try {
      const eventos = await dbMysqlDev.executeQuery(query);
      res.json(eventos);
    } catch (err) {
      console.error("Error al obtener los eventos: ", err);
    }
  };
  obtenerCantidades();
});

router.post("/eventos", async (req, res) => {
  const { descripcion, id_equipo, estado, tipo_falla, id_usuario } = req.body;

  // Validación de parámetros
  if (!descripcion || !id_equipo || !estado || !tipo_falla || !id_usuario) {
    return res.status(400).json({ err: "Faltan parámetros requeridos" });
  }

  const updateQuery = `
    UPDATE tbl_estados 
    SET hasta = NOW() 
    WHERE id_equipo = ? AND estado IN ('OPERATIVO', 'NO OPERATIVO', 'REVISION') AND hasta IS NULL
    ORDER BY desde DESC 
    LIMIT 1
  `;

  const insertQuery = `
    INSERT INTO tbl_estados (descripcion, id_equipo, estado, tipo_falla, id_usuario, desde) 
    VALUES (?, ?, ?, ?, ?, NOW())
  `;

  const selectQuery = `
    SELECT * FROM tbl_estados 
  `;

  try {
    await dbMysqlDev.executeQueryParams(updateQuery, [id_equipo]);
    await dbMysqlDev.executeQueryParams(insertQuery, [
      descripcion,
      id_equipo,
      estado,
      tipo_falla,
      id_usuario,
    ]);
    const [latestState] = await dbMysqlDev.executeQuery(selectQuery);

    if (!latestState) {
      return res.status(404).json({ err: "Estado no encontrado" });
    }

    res.status(201).json({
      message: "Registro creado exitosamente",
      estado: latestState,
    });

    // Broadcast de la actualización
    broadcastUpdate("eventoActualizado", { id_equipo, estado });
  } catch (err) {
    console.error("Error al crear evento:", err);
    res.status(500).json({ err: "Error al crear evento" });
  }
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

//Mantenimientos
router.get("/mantenimiento", (req, res) => {
  const query = "select * from tbl_mantenimientos";

  const obtenerMantenimientos = async () => {
    try {
      const mantenimiento = await dbMysqlDev.executeQuery(query);
      res.json(mantenimiento);
    } catch (err) {
      console.error("Error al obtener los eventos: ", err);
    }
  };
  obtenerMantenimientos();
});

router.post("/mantenimiento", (req, res) => {
  const {
    fecha,
    empresa,
    id_tecnico,
    id_equipo,
    descripcion,
    estado,
    desde,
    hasta,
    id_usuario,
  } = req.body;

  // Asegurarse de que los parámetros no sean undefined, de lo contrario usar null
  const safeFecha = fecha || null;
  const safeEmpresa = empresa || null;
  const safeIdTecnico = id_tecnico || null;
  const safeIdEquipo = id_equipo || null;
  const safeDescripcion = descripcion || null;
  const safeEstado = estado || null;
  const safeDesde = desde || null;
  const safeHasta = hasta || null;
  const safeId_usuario = id_usuario || null;
  // Verificar que la fecha no sea anterior a la fecha actual
  const fechaActual = new Date();
  const fechaInput = new Date(safeFecha);

  // Ajustamos ambas fechas para que la hora sea 00:00:00
  fechaActual.setHours(0, 0, 0, 0);
  fechaInput.setHours(0, 0, 0, 0);

  if (fechaInput < fechaActual) {
    return res
      .status(400)
      .json({ error: "La fecha no puede ser anterior al día actual." });
  }

  const query =
    "INSERT INTO tbl_mantenimientos (fecha, empresa, id_tecnico, id_equipo, descripcion, estado, desde, hasta, id_usuario) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

  const fetchMantenimientos = async () => {
    try {
      const params = await dbMysqlDev.executeQueryParams(query, [
        safeFecha,
        safeEmpresa,
        safeIdTecnico,
        safeIdEquipo,
        safeDescripcion,
        safeEstado,
        safeDesde,
        safeHasta,
        safeId_usuario,
      ]);
      res.status(201).json({
        message: "Registro creado exitosamente",
      });
      broadcastUpdate(
        JSON.stringify({
          type: "update",
          data: {
            safeFecha,
            safeEmpresa,
            safeIdTecnico,
            safeIdEquipo,
            safeDescripcion,
            safeEstado,
            safeDesde,
            safeHasta,
            safeId_usuario,
          },
        })
      );
    } catch (err) {
      console.error("Error al crear evento:", err);
      res.status(500).json({ err: "Error al crear evento" });
    }
  };

  fetchMantenimientos();
});

router.put("/mantenimiento/:id", (req, res) => {
  const id = req.params.id;
  const { estado } = req.body;

  const query = `
    UPDATE tbl_mantenimientos
    SET estado = ?
    WHERE id_mantenimiento = ?;
  `;

  const actualizarMantenimiento = async () => {
    try {
      const result = await dbMysqlDev.executeQueryParams(query, [estado, id]);

      if (result.affectedRows > 0) {
        res.json({ message: "Mantenimiento actualizado correctamente" });
      } else {
        res.status(404).json({ message: "Mantenimiento no encontrado" });
      }
    } catch (err) {
      console.error("Error al actualizar el mantenimiento: ", err);
      res.status(500).json({ message: "Error en el servidor" });
    }
  };

  actualizarMantenimiento();
  broadcastUpdate({
    event: "update",
    data: { id, estado },
  });
});

router.put("/mantenimientoPostpone/:id", (req, res) => {
  const id = req.params.id;
  const { estado, fecha, desde, hasta } = req.body;

  const query = `
    UPDATE tbl_mantenimientos
    SET estado = ?,fecha = ?, desde = ?, hasta = ?
    WHERE id_mantenimiento = ?;
  `;

  const actualizarMantenimiento = async () => {
    try {
      const result = await dbMysqlDev.executeQueryParams(query, [
        estado,
        fecha,
        desde,
        hasta,
        id,
      ]);

      if (result.affectedRows > 0) {
        res.json({ message: "Mantenimiento actualizado correctamente" });
      } else {
        res.status(404).json({ message: "Mantenimiento no encontrado" });
      }
    } catch (err) {
      console.error("Error al actualizar el mantenimiento: ", err);
      res.status(500).json({ message: "Error en el servidor" });
    }
  };

  actualizarMantenimiento();
  broadcastUpdate({
    event: "update",
    data: { id, estado, fecha, desde, hasta },
  });
});

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

//Descarga del contrato
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

//Generar usuario
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

//Cambiar contraseña
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

//login usuario
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
