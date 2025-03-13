const dbMysqlDev = require("../../DataBase/MySqlDatabaseDev");
const { broadcastUpdate } = require("../../websocket/webSocketCmms");

exports.obtenerMantenimientos = async (req, res) => {
  const query = "select * from tbl_mantenimientos order by fecha";
  try {
    const mantenimiento = await dbMysqlDev.executeQuery(query);
    res.json(mantenimiento);
  } catch (err) {
    console.error("Error al obtener los eventos: ", err);
  }
};

exports.nuevoMantenimiento = async (req, res) => {
  const {
    fecha,
    empresa,
    id_tecnico,
    id_equipo,
    tipo,
    detalle,
    comentario,
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
  const safeTipo = tipo || null;
  const safeDetalle = detalle || null;
  const safeComentario = comentario || null;
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
    "INSERT INTO tbl_mantenimientos (fecha, empresa, id_tecnico, id_equipo, tipo,detalle,comentario, estado, desde, hasta, id_usuario) VALUES (?, ?, ?, ? , ?, ?, ?, ?, ?, ?, ?)";

  try {
    const params = await dbMysqlDev.executeQueryParams(query, [
      safeFecha,
      safeEmpresa,
      safeIdTecnico,
      safeIdEquipo,
      safeTipo,
      safeDetalle,
      safeComentario,
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
          safeTipo,
          safeDetalle,
          safeComentario,
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

exports.actualizarMantenimiento = async (req, res) => {
  const id = req.params.id;
  const { estado, comentario } = req.body;

  const query = `
  UPDATE tbl_mantenimientos
  SET estado = ?, comentario = ?
  WHERE id_mantenimiento = ?;
`;
  try {
    const result = await dbMysqlDev.executeQueryParams(query, [
      estado,
      comentario,
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

  broadcastUpdate({
    event: "update",
    data: { id, estado },
  });
};

exports.reprogramarManteminiento = async (req, res) => {
  const id = req.params.id;
  const { estado, fecha, desde, hasta } = req.body;

  const query = `
      UPDATE tbl_mantenimientos
      SET estado = ?,fecha = ?, desde = ?, hasta = ?
      WHERE id_mantenimiento = ?;
    `;

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
  broadcastUpdate({
    event: "update",
    data: { id, estado, fecha, desde, hasta },
  });
};
