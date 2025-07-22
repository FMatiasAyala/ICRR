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

  const fechaActual = new Date();
  const fechaInput = new Date(fecha);

  fechaActual.setHours(0, 0, 0, 0);
  fechaInput.setHours(0, 0, 0, 0);

  if (fechaInput < fechaActual) {
    return res
      .status(400)
      .json({ error: "La fecha no puede ser anterior al día actual." });
  }

  const query =
    "INSERT INTO tbl_mantenimientos (fecha, empresa, id_tecnico, id_equipo, tipo, detalle, comentario, estado, desde, hasta, id_usuario) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

  try {
    const result = await dbMysqlDev.executeQueryParams(query, [
      fecha || null,
      empresa || null,
      id_tecnico || null,
      id_equipo || null,
      tipo || null,
      detalle || null,
      comentario || null,
      estado || null,
      desde || null,
      hasta || null,
      id_usuario || null,
    ]);
    const insertedId = result?.insertId; // Asegurate que el método devuelva el ID

    // Enviá los datos que el frontend realmente necesita
    broadcastUpdate("mensaje", {
      type: "mantenimientoNuevo",
      data: {
        id_mantenimiento: insertedId,
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
      },
    });
    res.status(201).json({
      message: "Registro creado exitosamente",
    });
  } catch (err) {
    console.error("Error al crear evento:", err);
    res.status(500).json({ err: "Error al crear evento" });
  }
};

exports.actualizarMantenimiento = async (req, res) => {
  const id = req.params.id;
  const { estado, comentario } = req.body;

  const queryUpdate = `
    UPDATE tbl_mantenimientos
    SET estado = ?, comentario = ?
    WHERE id_mantenimiento = ?;
  `;

  const querySelect = `
    SELECT *
    FROM tbl_mantenimientos
    WHERE id_mantenimiento = ?;
  `;

  try {
    const result = await dbMysqlDev.executeQueryParams(queryUpdate, [
      estado,
      comentario,
      id,
    ]);

    if (result.affectedRows > 0) {
      const [rows] = await dbMysqlDev.executeQueryParams(querySelect, [id]);

      if (rows) {
        const actualizado = rows; // convierte a objeto plano

        broadcastUpdate("mensaje", {
          type: "mantenimientoActualizado",
          data: actualizado,
        });

        console.log("➡️ Enviando respuesta OK");
        res.status(200).json({
          message: "Mantenimiento actualizado correctamente",
        });
      } else {
        res
          .status(404)
          .json({ message: "No se pudo obtener el mantenimiento actualizado" });
      }
    } else {
      res.status(404).json({ message: "Mantenimiento no encontrado" });
    }
  } catch (err) {
    console.error("Error al actualizar el mantenimiento: ", err);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

exports.reprogramarManteminiento = async (req, res) => {
  const id = req.params.id;
  const { estado, fecha, desde, hasta } = req.body;

  const queryUpdate = `
    UPDATE tbl_mantenimientos
    SET estado = ?, fecha = ?, desde = ?, hasta = ?
    WHERE id_mantenimiento = ?;
  `;

  const querySelect = `
    SELECT *
    FROM tbl_mantenimientos
    WHERE id_mantenimiento = ?;
  `;

  try {
    const result = await dbMysqlDev.executeQueryParams(queryUpdate, [
      estado,
      fecha,
      desde,
      hasta,
      id,
    ]);

    if (result.affectedRows > 0) {
      // Obtener el registro actualizado completo
      const [rows] = await dbMysqlDev.executeQueryParams(querySelect, [id]);

      if (rows) {
        const actualizado = rows;

        broadcastUpdate("mensaje", {
          type: "mantenimientoActualizado",
          data: actualizado, // ahora tenés todos los campos
        });

        console.log("➡️ Postergando mantenimiento OK");
        res.status(200).json({
          message: "Mantenimiento actualizado correctamente",
        });
      } else {
        res
          .status(404)
          .json({ message: "No se pudo obtener el mantenimiento actualizado" });
      }
    } else {
      res.status(404).json({ message: "Mantenimiento no encontrado" });
    }
  } catch (err) {
    console.error("Error al actualizar el mantenimiento: ", err);
    res.status(500).json({ message: "Error en el servidor" });
  }
};
