const dbMysqlDev = require("../../DataBase/MySqlDatabaseDev");
const { broadcastUpdate } = require("../../websocket/webSocketCmms");
exports.obtenerEquipos = async (req, res) => {
  const query =
    "select * from tbl_equipomedico inner join tbl_servicios on tbl_equipomedico.id_servicio = tbl_servicios.id_servicio where id not in (select id from tbl_equipomedico where baja is not null)";
  try {
    const equipos = await dbMysqlDev.executeQuery(query);
    res.json(equipos);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener equipos medicos" });
  }
};

// Baja idempotente + respuesta útil
exports.bajaEquipo = async (req, res) => {
  try {
    const { id_equipo } = req.body;

    // Validación mínima
    if (!id_equipo || isNaN(Number(id_equipo))) {
      return res.status(400).json({ ok: false, error: "ID_INVALIDO" });
    }

    // 1) Intentá marcar la baja SOLO si aún no tenía baja
    const sqlUpdate = `
      UPDATE tbl_equipomedico
      SET baja = NOW()
      WHERE id = ?
    `;
    const result = await dbMysqlDev.executeQueryParams(sqlUpdate, [id_equipo]);

    // 2) Traé el valor actual de baja para responder al front
    const sqlSelect = `SELECT baja FROM tbl_equipomedico WHERE id = ? LIMIT 1`;
    const rows = await dbMysqlDev.executeQueryParams(sqlSelect, [id_equipo]);
    const baja_at = rows?.[0]?.baja || null;

    const alreadyBaja = result?.affectedRows === 0 && baja_at !== null;

    // Emití el evento SOLO si efectivamente se cambió el estado ahora
    if (result?.affectedRows > 0) {
      broadcastUpdate("equipoDadoDeBaja", { id: Number(id_equipo), baja_at });
    }

    return res.status(200).json({
      ok: true,
      id_equipo: Number(id_equipo),
      baja_at, // fecha/hora de baja (string ISO/SQL)
      alreadyBaja, // true si ya estaba dado de baja
    });
  } catch (err) {
    console.error("Error al dar de baja el equipo:", err);
    return res.status(500).json({ ok: false, error: "ERROR_BAJA_EQUIPO" });
  }
};

exports.altaEquipo = async (req, res) => {
  const {
    marca,
    modelo,
    serial_number,
    ip,
    id_servicio,
    tipo,
    mascara,
    gateway,
    aetitle,
    puerto,
    compra_año,
    fabricacion_año,
    id_ubicacion,
    funcion,
    riesgo,
    requerimientos,
    antecedentes,
  } = req.body;
  try {
    if (!marca || !modelo || !id_servicio) {
      return res.status(400).json({ error: "Campos obligatorios faltantes" });
    }

    const values = [
      marca ?? null,
      modelo ?? null,
      serial_number ?? null,
      tipo ?? null,
      id_servicio ?? null,
      ip ?? null,
      mascara ?? null,
      gateway ?? null,
      aetitle ?? null,
      puerto ?? null,
      compra_año ?? null,
      id_ubicacion ?? null,
      funcion ?? null,
      riesgo ?? null,
      requerimientos ?? null,
      antecedentes ?? null,
      fabricacion_año ?? null,
    ];
    const insertQuery = `
          INSERT INTO tbl_equipomedico (marca, modelo, serial_number, tipo, id_servicio, ip, mascara, gateway, aetitle, puerto, compra_año, id_ubicacion, funcion, riesgo, requerimientos, antecedentes, fabricacion_año, alta) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,? ,? ,? ,? , NOW())
        `;

    await dbMysqlDev.executeQueryParams(insertQuery, values);

    // Obtener el ID recién insertado
    const [idRows] = await dbMysqlDev.executeQuery(
      `SELECT id from tbl_equipomedico order by id desc limit 1`
    );
    const nuevoId = idRows.id;
    // Enriquecer el equipo recién insertado con datos del servicio
    const [rows] = await dbMysqlDev.executeQueryParams(
      `
  SELECT * 
  FROM tbl_equipomedico 
  INNER JOIN tbl_servicios 
    ON tbl_equipomedico.id_servicio = tbl_servicios.id_servicio 
  WHERE tbl_equipomedico.id = ?
`,
      [nuevoId]
    );

    const equipoCompleto = rows;

    // Emitir con todos los datos necesarios
    broadcastUpdate("mensaje", { type: "equipoNuevo", data: equipoCompleto });

    res.status(201).json({
      message: "Registro creado exitosamente",
    });
  } catch (err) {
    console.error("Error al cargar el equipo:", err);
    res.status(500).json({ error: "Error al cargar equipo" });
  }
};

exports.tecnicoEquipo = async (req, res) => {
  const { equipoId } = req.params;
  const query = `select t.* from tbl_tecnicos t join tbl_equipo_tecnico et on t.id_tecnico  = et.tecnico_id 
where et.equipo_id = ?`;

  try {
    const tenicosEquipo = await dbMysqlDev.executeQueryParams(query, [
      equipoId,
    ]);
    res.json(tenicosEquipo);
  } catch (error) {
    console.error("Error al obtener técnicos:", error);
    res.status(500).json({ error: "Error al obtener técnicos." });
  }
};

exports.modificacionEquipo = async (req, res) => {
  const id = req.params.id;

  const {
    marca,
    modelo,
    serial_number,
    tipo,
    ip,
    mascara,
    gateway,
    aetitle,
    puerto,
    compra_año,
    fabricacion_año,
    id_ubicacion,
    alta,
    funcion,
    riesgo,
    requerimientos,
    antecedentes,
  } = req.body;

  const query =
    "UPDATE tbl_equipomedico SET marca=?, modelo=?, serial_number=?, tipo=?, ip=?, mascara=?, gateway=?, aetitle=?, puerto=?, compra_año=?,fabricacion_año=?, id_ubicacion=?, alta=?, funcion=?, riesgo=?, requerimientos=?, antecedentes=? WHERE id=?";

  const selectQuery = `
  SELECT * 
  FROM tbl_equipomedico 
  INNER JOIN tbl_servicios 
    ON tbl_equipomedico.id_servicio = tbl_servicios.id_servicio 
  WHERE tbl_equipomedico.id = ?
`;
  try {
    const result = await dbMysqlDev.executeQueryParams(query, [
      marca || null,
      modelo || null,
      serial_number || null,
      tipo || null,
      ip || null,
      mascara || null,
      gateway || null,
      aetitle || null,
      puerto || null,
      compra_año || null,
      fabricacion_año || null,
      id_ubicacion || null,
      alta || null,
      funcion || null,
      riesgo || null,
      requerimientos || null,
      antecedentes || null,
      id,
    ]);
    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: " Equipo no encontrado",
      });
    }
    const [rows] = await dbMysqlDev.executeQueryParams(selectQuery, [id]);

    const equipoModificado = rows;

    broadcastUpdate("mensaje", {
      type: "equipoUpdate",
      data: equipoModificado,
    });

    res.status(200).json({
      message: "Equipo modificado correctamente",
    });
  } catch (error) {
    console.error("Error en modificacion del equipo:", error);
    res
      .status(500)
      .json({ error: "Error al modificar el equipo", details: error.message });
  }
};
