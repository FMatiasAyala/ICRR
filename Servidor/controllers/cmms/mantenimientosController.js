const dbMysqlDev = require("../../DataBase/MySqlDatabaseDev");
const { broadcastUpdate } = require("../../websocket/webSocketCmms");
const path = require("path");
const fs = require("fs");
const archiver = require("archiver");
const baseDir = "C:/CMMS_Folder/ICRR/Servidor/adjuntosEventos";

exports.obtenerMantenimientos = async (req, res) => {
  const query = "select * from tbl_mantenimientos order by fecha";
  try {
    const mantenimiento = await dbMysqlDev.executeQuery(query);
    res.json(mantenimiento);
  } catch (err) {
    console.error("Error al obtener los eventos: ", err);
  }
};

exports.obtenerMantenimientosPorEquipo = async (req, res) => {
  const { id_equipo } = req.query;

  const query = `
    SELECT 
      m.id_mantenimiento,
      m.fecha,
      m.empresa,
      m.id_tecnico,
      m.id_equipo,
      m.tipo,
      m.detalle,
      m.comentario,
      m.estado,
      m.desde,
      m.hasta,
      m.id_usuario,
      CASE 
        WHEN aj.cantidad > 0 THEN 1 
        ELSE 0 
      END AS tiene_adjuntos
    FROM tbl_mantenimientos m
    LEFT JOIN (
      SELECT id_mantenimiento, COUNT(*) AS cantidad
      FROM tbl_adjuntos_mantenimientos
      GROUP BY id_mantenimiento
    ) aj ON m.id_mantenimiento = aj.id_mantenimiento
    WHERE m.id_equipo = ?;
  `;

  try {
    const rows = await dbMysqlDev.executeQueryParams(query, [id_equipo]);
    res.json(rows);
  } catch (err) {
    console.error("Error al obtener los mantenimientos:", err);
    res.status(500).json({ error: "Error al obtener los mantenimientos" });
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
    tipo_archivo,
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

  const files = req.files;
  const query =
    "INSERT INTO tbl_mantenimientos (fecha, empresa, id_tecnico, id_equipo, tipo, detalle, comentario, estado, desde, hasta, id_usuario) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

  const insertAdjunto = `
    INSERT INTO tbl_adjuntos_mantenimientos (id_mantenimiento, url, descripcion, tipo, fecha_subida)
    VALUES (?, ?, ?, ?, NOW())
  `;

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

    if (files && files.length > 0) {
      for (const file of files) {
        const url = path.relative(baseDir, file.path).replace(/\\/g, "/");

        await dbMysqlDev.executeQueryParams(insertAdjunto, [
          insertedId,
          url,
          file.originalname,
          tipo_archivo,
        ]);
      }
    }
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
  const { estado, comentario, tipo_archivo } = req.body;

  const files = req.files;
  console.log("BODY:", req.body);
  console.log(
    "FILES:",
    req.files?.map((f) => f.originalname)
  );

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

  const insertAdjunto = `
    INSERT INTO tbl_adjuntos_mantenimientos (id_mantenimiento, url, descripcion, tipo, fecha_subida)
    VALUES (?, ?, ?, ?, NOW())
  `;
  try {
    const result = await dbMysqlDev.executeQueryParams(queryUpdate, [
      estado || null,
      comentario || null,
      id,
    ]);

    if (files && files.length > 0) {
      for (const file of files) {
        const url = path.relative(baseDir, file.path).replace(/\\/g, "/");
        const tipo =
          tipo_archivo ||
          (file.originalname.includes(".")
            ? file.originalname.split(".").pop()
            : "desconocido");

        await dbMysqlDev.executeQueryParams(insertAdjunto, [
          id,
          url || null,
          file.originalname || null,
          tipo || null,
        ]);
      }
    }

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



exports.fileMantenimiento = async (req, res) => {
  const { id_mantenimiento } = req.query;

  console.log(id_mantenimiento);

  if (!id_mantenimiento) {
    return res.status(400).json({ error: "ID del mantenimiento es requerido" });
  }

  const query = "SELECT url FROM tbl_adjuntos_mantenimientos WHERE id_mantenimiento = ?";

  try {
    const result = await dbMysqlDev.executeQueryParams(query, [id_mantenimiento]);

    if (result.length === 0) {
      return res
        .status(404)
        .json({ error: "No se encontraron archivos para este evento" });
    }

    const archivosValidos = result
      .map((row) => {
        const filePath = path.join(baseDir, row.url);
        if (fs.existsSync(filePath)) {
          return {
            absolutePath: filePath,
            fileName: path.basename(row.url),
          };
        }
        return null;
      })
      .filter(Boolean);

    if (archivosValidos.length === 0) {
      return res
        .status(404)
        .json({ error: "Ninguno de los archivos existe físicamente" });
    }

    // Configura headers de la respuesta para un archivo zip
    res.setHeader("Content-Type", "application/zip");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=evento_${id_mantenimiento}_adjuntos.zip`
    );

    const archive = archiver("zip", {
      zlib: { level: 9 },
    });

    archive.on("error", (err) => {
      console.error("Error al crear el zip:", err);
      return res.status(500).send({ error: "Error al crear el archivo zip" });
    });

    // Pipe del zip hacia la respuesta
    archive.pipe(res);

    // Agrega cada archivo al zip
    archivosValidos.forEach((archivo) => {
      archive.file(archivo.absolutePath, { name: archivo.fileName });
    });

    archive.finalize();
  } catch (err) {
    console.error("Error al procesar archivos:", err);
    return res.status(500).json({ error: "Error al procesar la solicitud" });
  }
};