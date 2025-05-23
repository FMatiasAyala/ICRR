const dbMysqlDev = require("../../DataBase/MySqlDatabaseDev")
const { broadcastUpdate } = require("../../websocket/webSocketCmms");

exports.obtenerEventos = async (req, res) => {
  const query =
    "select * from tbl_estados  where id_equipo  not in (select id from tbl_equipomedico where baja is not null)";
  try {
    const eventos = await dbMysqlDev.executeQuery(query);
    res.json(eventos);
  } catch (err) {
    console.error("Error al obtener los eventos: ", err);
  }
};

exports.eventosFiltrados = async (req, res) => {
  const { id_equipo } = req.query;
  const query =
    "select * from tbl_estados where id_equipo = ? order by desde desc";
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

exports.reportesEventos = async (req, res) => {
  const { id_equipo, estado, desde, hasta } = req.body;

  let query =
    "select id_equipo, descripcion, estado, desde, hasta, tipo_falla as falla from tbl_estados where 1=1";
  let params = [];

   // Filtrar por ID de equipo si se envía un valor
   if (id_equipo && id_equipo !== "todos") {
    query += " AND id_equipo = ?";
    params.push(id_equipo);
  }

  // Filtrar por estado si se envía un valor
  if (estado && estado !== "todos") {
    query += " AND estado = ?";
    params.push(estado);
  }

  // Filtrar por rango de fechas si se envían ambos valores
  if (desde && hasta) {
    query += " AND desde BETWEEN ? AND ?";
    params.push(desde, hasta);
  }

  query += " ORDER BY desde DESC";
  
  try {
    if (!id_equipo) {
      return res.status(400).json({ error: "searchTerm is required" });
    }
    const eventos = await dbMysqlDev.executeQueryParams(query, params);
    res.json(eventos);
  } catch (err) {
    console.error("Error al obtener los eventos: ", err);
  }
};

exports.cantidadEventos = async (req, res) => {
  const query =
    " SELECT id_equipo, COUNT(*) AS cantidad_eventos FROM tbl_estados where estado in ('NO OPERATIVO','REVISION') and id_equipo not in (select id from tbl_equipomedico where baja is not null) and YEAR(desde) = YEAR(CURDATE()) GROUP BY id_equipo ORDER BY cantidad_eventos DESC";
  try {
    const eventos = await dbMysqlDev.executeQuery(query);
    res.json(eventos);
  } catch (err) {
    console.error("Error al obtener los eventos: ", err);
  }
};

exports.nuevoEvento = async (req, res) => {
  const { descripcion, id_equipo, estado, tipo_falla, id_usuario } = req.body;

  // Validación de parámetros
  if (!descripcion || !id_equipo || !estado || !tipo_falla || !id_usuario) {
    console.log(descripcion, id_equipo, estado, tipo_falla);
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
};
