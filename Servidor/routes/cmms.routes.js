// cmms/routes.js
const express = require("express");
const router = express.Router();
const { MySqlDatabaseCrr, MySqlDatabaseDev } = require("../db");
require("dotenv").config();

const configMySqlCrr = {
  host: process.env.DB_HOST_MYSQL,
  user: process.env.DB_USER_MYSQL,
  password: process.env.DB_PASSWORD_MYSQL,
  database: process.env.DB_NAME_MYSQL_CRR,
};

/* ------------------- MYSQL CRR ------------------------- */
const dbMysqlCrr = new MySqlDatabaseCrr(configMySqlCrr);

router.post("/create", (req, res) => {
  const { name, description } = req.body;

  res.status(201).json({
    message: "Tarea creada exitosamente",
    data: { name, description },
  });
});

router.get("/equipos", (req, res) => {
  const query = "select * from tblequipomedico";

  const obtenerEquipos = async () => {
    try {
      const equipos = await dbMysqlCrr.executeQuery(query);
      res.json(equipos);
    } catch (err) {
      res.status(500).json({ error: "Error al obtener equipos medicos" });
    }
  };

  obtenerEquipos();
});

router.get("/list/:id", (req, res) => {
  const taskId = req.params.id;

  res.status(200).json({ message: "Tarea encontrada", data: {} });
});

router.put("/update/:id", (req, res) => {
  const taskId = req.params.id;
  const { name, description } = req.body;

  res.status(200).json({ message: "Tarea actualizada exitosamente" });
});

router.delete("/delete/:id", (req, res) => {
  const taskId = req.params.id;

  res.status(200).json({ message: "Tarea eliminada exitosamente" });
});

/* ------------ MYSQL DEV -------------------- */

const configMySqlDev = {
  host: process.env.DB_HOST_MYSQL,
  user: process.env.DB_USER_MYSQL,
  password: process.env.DB_PASSWORD_MYSQL,
  database: process.env.DB_NAME_MYSQL_DEV,
};

const dbMysqlDev = new MySqlDatabaseDev(configMySqlDev);

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

router.post("/eventos", (req, res) => {
  const { descripcion, id_equipo, estado, tipo_falla } = req.body;

  const query =
    "insert into tbl_estados (descripcion, id_equipo, estado, tipo_falla) values (?, ?, ?,?)";

  const fecthEvento = async () => {
    try {
      const params = await dbMysqlDev.executeQueryParams(query, [
        descripcion,
        id_equipo,
        estado,
        tipo_falla,
      ]);
      res.status(201).json({
        message: "Registro creado exitosamente",
      });
    } catch (err) {
      console.error("Error al crear evento:", err);
      res.status(500).json({ err: "Error al crear evento" });
    }
  };
  fecthEvento();
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
  const { fecha, empresa, id_tecnico, id_equipo, descripcion, estado } = req.body;

  // Asegurarse de que los parámetros no sean undefined, de lo contrario usar null
  const safeFecha = fecha || null;
  const safeEmpresa = empresa || null;
  const safeIdTecnico = id_tecnico || null;
  const safeIdEquipo = id_equipo || null;
  const safeDescripcion = descripcion || null;
  const safeEstado = estado || null;

  console.log(
    safeEmpresa,
    safeIdTecnico,
    safeFecha,
    safeDescripcion,
    safeIdEquipo,
    safeEstado
  );

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
    "INSERT INTO tbl_mantenimientos (fecha, empresa, id_tecnico, id_equipo, descripcion, estado) VALUES (?, ?, ?, ?, ?, ?)";

  const fetchMantenimientos = async () => {
    try {
      const params = await dbMysqlDev.executeQueryParams(query, [
        safeFecha,
        safeEmpresa,
        safeIdTecnico,
        safeIdEquipo,
        safeDescripcion,
        safeEstado,
      ]);
      res.status(201).json({
        message: "Registro creado exitosamente",
      });
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
});


module.exports = router;
