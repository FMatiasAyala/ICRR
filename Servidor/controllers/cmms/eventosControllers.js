const dbMysqlDev = require("../../DataBase/MySqlDatabaseDev");
const { broadcastUpdate } = require("../../websocket/webSocketCmms");
const path = require("path");
const fs = require("fs");
const archiver = require("archiver");

exports.obtenerEventos = async (req, res) => {
  const query =
    "SELECT e.id_evento AS evento_id,e.estado,e.desde,e.descripcion,e.hasta,e.tipo_falla,e.id_usuario,e.id_equipo,e.criticidad, re.id_repuesto,re.repuesto,re.costo,re.observacion,re.serial_number, re.proveedor FROM tbl_eventos e LEFT JOIN tbl_repuestos_usados re ON e.id_evento = re.id_evento WHERE e.id_equipo NOT IN (SELECT id FROM tbl_equipomedico WHERE baja IS NOT NULL);";

  try {
    const rows = await dbMysqlDev.executeQuery(query);

    // Agrupar eventos con sus repuestos
    const eventosMap = new Map();

    rows.forEach((row) => {
      const idEvento = row.evento_id;
      if (!eventosMap.has(idEvento)) {
        eventosMap.set(idEvento, {
          id_evento: row.id_evento,
          estado: row.estado,
          desde: row.desde,
          descripcion: row.descripcion,
          hasta: row.hasta,
          tipo_falla: row.tipo_falla,
          id_usuario: row.id_usuario,
          id_equipo: row.id_equipo,
          criticidad: row.criticidad,

          repuestos: [],
        });
      }

      if (row.id_repuesto) {
        eventosMap.get(idEvento).repuestos.push({
          id_repuesto: row.id_repuesto,
          repuesto: row.repuesto,
          costo: row.costo,
          observacion: row.observacion,
          serial_number: row.serial_number,
          proveedor: row.proveedor,
        });
      }
    });

    const eventos = Array.from(eventosMap.values());
    res.json(eventos);
  } catch (err) {
    console.error("Error al obtener los eventos: ", err);
  }
};

exports.eventosFiltrados = async (req, res) => {
  const { id_equipo } = req.query;
  const query =
    "SELECT e.id_evento AS evento_id,e.estado,e.desde,e.descripcion,e.hasta,e.tipo_falla,e.id_usuario,e.id_equipo,e.criticidad, re.id_repuesto,re.repuesto,re.costo,re.observacion,re.serial_number, re.proveedor FROM tbl_eventos e LEFT JOIN tbl_repuestos_usados re ON e.id_evento = re.id_evento WHERE e.id_equipo = ?;";

  try {
    const rows = await dbMysqlDev.executeQueryParams(query, [id_equipo]);

    // Agrupar eventos con sus repuestos
    const eventosMap = new Map();

    rows.forEach((row) => {
      const idEvento = row.evento_id;
      if (!eventosMap.has(idEvento)) {
        eventosMap.set(idEvento, {
          id_evento: row.evento_id,
          estado: row.estado,
          desde: row.desde,
          descripcion: row.descripcion,
          hasta: row.hasta,
          tipo_falla: row.tipo_falla,
          id_usuario: row.id_usuario,
          id_equipo: row.id_equipo,
          criticidad: row.criticidad,

          repuestos: [],
        });
      }

      if (row.id_repuesto) {
        eventosMap.get(idEvento).repuestos.push({
          id_repuesto: row.id_repuesto,
          repuesto: row.repuesto,
          costo: row.costo,
          observacion: row.observacion,
          serial_number: row.serial_number,
          proveedor: row.proveedor,
        });
      }
    });

    const eventos = Array.from(eventosMap.values());
    res.json(eventos);
  } catch (err) {
    console.error("Error al obtener los eventos: ", err);
  }
};

exports.reportesEventos = async (req, res) => {
  const { id_equipo, estado, desde, hasta } = req.body;

  let query =
    "select id_equipo, descripcion, estado, desde, hasta, tipo_falla as falla from tbl_eventos where 1=1";
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
    " SELECT id_equipo, COUNT(*) AS cantidad_eventos FROM tbl_eventos where estado in ('NO OPERATIVO','REVISION') and id_equipo not in (select id from tbl_equipomedico where baja is not null) and YEAR(desde) = YEAR(CURDATE()) GROUP BY id_equipo ORDER BY cantidad_eventos DESC";
  try {
    const eventos = await dbMysqlDev.executeQuery(query);
    res.json(eventos);
  } catch (err) {
    console.error("Error al obtener los eventos: ", err);
  }
};

exports.nuevoEvento = async (req, res) => {
  const {
    descripcion,
    id_equipo,
    estado,
    tipo_falla,
    criticidad,
    id_usuario,
    tipo_archivo,
  } = req.body;
  console.log(id_equipo, descripcion, estado, tipo_falla, id_usuario);

  const repuestos = req.body.repuestos || [];

  const files = req.files;
  // Validación de parámetros
  if (!descripcion || !id_equipo || !estado || !tipo_falla || !id_usuario) {
    console.log(descripcion, id_equipo, estado, tipo_falla);
    return res.status(400).json({ err: "Faltan parámetros requeridos" });
  }

  const updateQueryEvento = `
      UPDATE tbl_eventos 
      SET hasta = NOW() 
      WHERE id_equipo = ? AND estado IN ('OPERATIVO', 'NO OPERATIVO', 'REVISION') AND hasta IS NULL
      ORDER BY desde DESC 
      LIMIT 1
    `;

  const insertQueryEvento = `
      INSERT INTO tbl_eventos (descripcion, id_equipo, estado,criticidad, tipo_falla, id_usuario, desde) 
      VALUES (?, ?, ?, ?, ?, ?, NOW())
    `;

  const getLastInsertId = `SELECT id_evento FROM tbl_eventos ORDER BY id_evento DESC LIMIT 1`;

  const insertAdjunto = `
    INSERT INTO tbl_adjuntos_eventos (id_evento, url, descripcion, tipo, fecha_subida)
    VALUES (?, ?, ?, ?, NOW())
  `;

  const insertRepuestoUsado = `
  INSERT INTO tbl_repuestos_usados (id_evento,repuesto, costo, observacion, serial_number, proveedor)
  VALUES (?, ?, ?, ?, ?, ?)
`;

  try {
    await dbMysqlDev.executeQueryParams(updateQueryEvento, [id_equipo]);
    await dbMysqlDev.executeQueryParams(insertQueryEvento, [
      descripcion ?? null,
      id_equipo ?? null,
      estado ?? null,
      criticidad ?? null,
      tipo_falla ?? null,
      id_usuario ?? null,
    ]);

    // Obtener ID del evento recién insertado
    const insertResult = await dbMysqlDev.executeQuery(getLastInsertId);
    const id_evento = insertResult[0]?.id_evento;
    if (!id_evento) {
      return res
        .status(500)
        .json({ err: "No se pudo obtener el ID del evento" });
    }

    if (files && files.length > 0) {
      for (const file of files) {
        const url = path
          .relative(
            "C:/htdocs/Matias/ICRR/Servidor/adjuntosEventos",
            file.path
          )
          .replace(/\\/g, "/");

        await dbMysqlDev.executeQueryParams(insertAdjunto, [
          id_evento,
          url,
          file.originalname,
          tipo_archivo,
        ]);
      }
    }
    if (repuestos.length > 0) {
      for (const repuesto of repuestos) {
        const {
          repuesto: nombreRepuesto,
          costo,
          observacion,
          serial_number,
          proveedor,
        } = repuesto;

        if (!nombreRepuesto) continue;

        await dbMysqlDev.executeQueryParams(insertRepuestoUsado, [
          id_evento,
          nombreRepuesto,
          costo || 0,
          observacion || "",
          serial_number || "",
          proveedor || "",
        ]);
      }
    }
    const [rows] = await dbMysqlDev.executeQueryParams(
      "SELECT * FROM tbl_eventos WHERE id_evento = ?",
      [id_evento]
    );

    const [repuestosRows] = await dbMysqlDev.executeQueryParams(
      "SELECT * FROM tbl_repuestos_usados WHERE id_evento = ?",
      [id_evento]
    );

    const repuestosFinales = repuestosRows;
    const eventoNuevo = rows;
    // Broadcast de la actualización
    broadcastUpdate("mensaje", {
        type: 'eventoNuevo',
        data: { ...eventoNuevo, repuestos: repuestosFinales },
    });
    res.status(201).json({
      message: "Evento y archivos creados correctamente",
      id_evento,
    });
  } catch (err) {
    console.error("Error al crear evento:", err);
    res.status(500).json({ err: "Error al crear evento" });
  }
};

exports.modificacionEvento = async (req, res) => {
  const id = req.params.id;
  const { descripcion, estado, tipo_falla, criticidad, tipo_archivo } =
    req.body;
  const archivos = req.files;
  const repuestos = JSON.parse(req.body.repuestos || "[]");

  const insertRepuestoUsado = `
    INSERT INTO tbl_repuestos_usados 
      (id_evento, repuesto, costo, observacion, serial_number, proveedor)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  const updateRepuestoUsado = `
    UPDATE tbl_repuestos_usados SET 
      repuesto = ?, 
      costo = ?, 
      observacion = ?, 
      serial_number = ?, 
      proveedor = ?
    WHERE id_repuesto = ?
  `;

  try {
    // 🔎 SELECT inicial para comparación
    const [prevRows] = await dbMysqlDev.executeQueryParams(
      "SELECT * FROM tbl_eventos WHERE id_evento = ?",
      [id]
    );
    const eventoAntes = prevRows;

    if (!eventoAntes) {
      return res.status(404).json({ message: "Evento no encontrado" });
    }

    // 1. Actualizar evento principal
    const updateQuery = `
      UPDATE tbl_eventos SET 
        descripcion = ?, 
        estado = ?, 
        tipo_falla = ?, 
        criticidad = ?
      WHERE id_evento = ?
    `;
    await dbMysqlDev.executeQueryParams(updateQuery, [
      descripcion || "",
      estado || "",
      tipo_falla || "",
      criticidad || "",
      id,
    ]);

    // 2. Guardar archivos si existen
    if (archivos && archivos.length > 0) {
      for (const file of archivos) {
        const url = path
          .relative(
            "C:/htdocs/Matias/ICRR/Servidor/adjuntosEventos",
            file.path
          )
          .replace(/\\/g, "/");

        const insertFileQuery = `
          INSERT INTO tbl_adjuntos_eventos (id_evento, url, descripcion, tipo)
          VALUES (?, ?, ?, ?)
        `;
        await dbMysqlDev.executeQueryParams(insertFileQuery, [
          id,
          url,
          file.originalname,
          tipo_archivo || "",
        ]);
      }
    }

    // 3. Insertar o actualizar repuestos
    if (repuestos.length > 0) {
      for (const repuesto of repuestos) {
        const {
          id_repuesto,
          repuesto: nombreRepuesto,
          costo,
          observacion,
          serial_number,
          proveedor,
        } = repuesto;

        if (!nombreRepuesto) continue;

        if (id_repuesto) {
          // Si tiene ID, actualizar el repuesto existente
          await dbMysqlDev.executeQueryParams(updateRepuestoUsado, [
            nombreRepuesto,
            costo || 0,
            observacion || "",
            serial_number || "",
            proveedor || "",
            id_repuesto,
          ]);
        } else {
          // Si no tiene ID, insertar como nuevo repuesto
          await dbMysqlDev.executeQueryParams(insertRepuestoUsado, [
            id,
            nombreRepuesto,
            costo || 0,
            observacion || "",
            serial_number || "",
            proveedor || "",
          ]);
        }
      }
    }
    // 🔁 SELECT final para el WebSocket
    const [rows] = await dbMysqlDev.executeQueryParams(
      "SELECT * FROM tbl_eventos WHERE id_evento = ?",
      [id]
    );

    const [repuestosRows] = await dbMysqlDev.executeQueryParams(
      "SELECT * FROM tbl_repuestos_usados WHERE id_evento = ?",
      [id]
    );
    const eventoActualizado = rows;

    if (eventoActualizado) {
      let tipoEvento = "eventoActualizado";

      const soloCambioEstado =
        eventoAntes.descripcion === eventoActualizado.descripcion &&
        eventoAntes.tipo_falla === eventoActualizado.tipo_falla &&
        eventoAntes.criticidad === eventoActualizado.criticidad &&
        eventoAntes.estado !== eventoActualizado.estado;

      if (soloCambioEstado) tipoEvento = "eventoEstadoActualizado";

      const repuestosFinales = repuestosRows;

      console.log(repuestosFinales);

      broadcastUpdate("mensaje", {
        type: tipoEvento,
        data: { ...eventoActualizado, repuestos: repuestosFinales },
      });
    }
    res.status(200).json({ message: "Evento actualizado correctamente." });
  } catch (error) {
    console.error("Error al modificar el evento:", error);
    res.status(500).json({ error: "Error al modificar el evento." });
  }
};

exports.fileEvento = async (req, res) => {
  const { id_evento } = req.query;

  console.log(id_evento);

  if (!id_evento) {
    return res.status(400).json({ error: "ID del evento es requerido" });
  }

  const query = "SELECT url FROM tbl_adjuntos_eventos WHERE id_evento = ?";

  try {
    const result = await dbMysqlDev.executeQueryParams(query, [id_evento]);

    if (result.length === 0) {
      return res
        .status(404)
        .json({ error: "No se encontraron archivos para este evento" });
    }

    const baseDir =
      "C:/htdocs/Matias/ICRR/Servidor/adjuntosEventos";

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
      `attachment; filename=evento_${id_evento}_adjuntos.zip`
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
