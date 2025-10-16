const dbMysqlDev = require("../../DataBase/MySqlDatabaseDev");
const path = require("path");
const fs = require("fs");

/* Carga de contratos */
// helper para limpiar fechas vacías o "null"
function parseDateOrNull(v) {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  if (!s || s.toLowerCase() === "null") return null;
  // acá podés validar formato yyyy-mm-dd si querés
  return s;
}

exports.cargaContratos = async (req, res) => {
  try {
    const {
      descripcion,
      cobertura_partes,
      cobertura_manoDeObra,
      desde,
      hasta,
      id_equipo,
      actualizacion,
    } = req.body;

    if (!req.file) {
      return res.status(400).json({ ok: false, error: "NO_FILE" });
    }

    // filename simple y URL relativa
    const filename = path.basename(req.file.path || req.file.filename || "");
    const url = filename || req.file.originalname || "";

    // Normalizar fechas vacías
    const norm = (v) => {
      if (v == null) return null;
      const s = String(v).trim();
      return s === "" || s.toLowerCase() === "null" ? null : s;
    };

    const sql = `
      INSERT INTO tbl_contratos (
        url, descripcion, cobertura_partes,
        cobertura_manoDeObra, desde, hasta,
        id_equipo, actualizacion
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await dbMysqlDev.executeQueryParams(sql, [
      url,
      descripcion ?? null,
      cobertura_partes ?? null,
      cobertura_manoDeObra ?? null,
      norm(desde),
      norm(hasta),
      id_equipo,
      actualizacion ?? null,
    ]);

    // ✅ Respuesta mínima y limpia
    return res.status(201).json({
      ok: true,
      message: "Contrato cargado exitosamente",
      // opcional: devolvé lo que QUIERAS, pero nada que rompa
      file: req.file.originalname,
      url_guardada: url,
    });
  } catch (error) {
    console.error("Error al cargar contrato:", error);
    return res.status(500).json({ ok: false, error: "UPLOAD_FAIL" });
  }
};
/* Descargar contrato */
exports.fileContrato = async (req, res) => {
  const { id_contrato } = req.query;

  if (!id_contrato) {
    return res.status(400).json({ error: "ID de contrato es requerido" });
  }

  // Verificá el nombre correcto de la columna. Si es 'id_contrato' en la DB, dejalo así.
  const query = "SELECT url FROM tbl_contratos WHERE id_contrato = ?";

  try {
    const result = await dbMysqlDev.executeQueryParams(query, [id_contrato]);

    if (result.length === 0) {
      return res.status(404).json({ error: "No se encontró el contrato" });
    }

    const relativeUrl = result[0].url;
    const baseDir = "C:/CMMS_Folder/ICRR/Servidor/contratos";
    const filePath = path.join(baseDir, relativeUrl);

    if (!fs.existsSync(filePath)) {
      return res
        .status(404)
        .json({ error: "El archivo no existe en el servidor" });
    }

    res.download(filePath, path.basename(filePath), (err) => {
      if (err) {
        console.error("Error al enviar el archivo:", err);
        return res.status(500).json({ error: "Error al descargar el archivo" });
      }
    });
  } catch (err) {
    console.error("Error al obtener el contrato:", err);
    return res.status(500).json({ error: "Error al procesar la solicitud" });
  }
};

exports.datosContratos = async (req, res) => {
  const { id_equipo } = req.query;

  if (!id_equipo) {
    return res.status(400).json({ error: "ID de equipo es requerido" });
  }

  const query =
    "select id_contrato, descripcion, cobertura_partes , cobertura_manoDeObra, desde , hasta , actualizacion, created_at  from tbl_contratos where id_equipo = ?";

  const datosContrato = async () => {
    try {
      const datos = await dbMysqlDev.executeQueryParams(query, [id_equipo]);
      res.json(datos);
    } catch (err) {
      console.error("Error al obtener los eventos: ", err);
    }
  };

  datosContrato();
};
exports.allContratos = async (req, res) => {
  const query =
    "select id_contrato, descripcion, cobertura_partes , cobertura_manoDeObra, desde , hasta ,id_equipo, actualizacion, created_at  from tbl_contratos";

  const allContrato = async () => {
    try {
      const datos = await dbMysqlDev.executeQuery(query);
      res.json(datos);
    } catch (err) {
      console.error("Error al obtener los eventos: ", err);
    }
  };

  allContrato();
};

exports.editContrato = async (req, res) => {
  const { id_contrato } = req.params;

  // ⛔️ Sólo permitimos editar estos campos (lo que mostrás en UI)
  const allowed = new Set([
    "descripcion",
    "cobertura_partes",
    "cobertura_manoDeObra",
    "desde",
    "hasta",
    "actualizacion",
    "id_equipo", // opcional: si permitís reasignar equipo
  ]);

  // 1) Filtramos body por whitelist
  const payload = {};
  for (const [k, v] of Object.entries(req.body || {})) {
    if (allowed.has(k)) payload[k] = v;
  }
  if (!Object.keys(payload).length) {
    return res.status(400).json({ ok: false, error: "NO_FIELDS" });
  }

  // 2) Validaciones mínimas
  if (payload.desde && payload.hasta) {
    const d1 = new Date(payload.desde);
    const d2 = new Date(payload.hasta);
    if (isFinite(+d1) && isFinite(+d2) && d2 < d1) {
      return res
        .status(400)
        .json({ ok: false, error: "RANGO_FECHAS_INVALIDO" });
    }
  }

  // 3) Armamos SET dinámico seguro
  const sets = [];
  const params = [];
  for (const [k, v] of Object.entries(payload)) {
    sets.push(`${k} = ?`);
    params.push(v);
  }

  const sql = `UPDATE tbl_contratos SET ${sets.join(
    ", "
  )} WHERE id_contrato = ?`;
  params.push(id_contrato);

  try {
    const result = await dbMysqlDev.executeQueryParams(sql, params);
    if (result.affectedRows === 0) {
      return res.status(404).json({ ok: false, error: "NOT_FOUND" });
    }
    res.json({ ok: true });
  } catch (err) {
    console.error("Error al editar contrato:", err);
    res.status(500).json({ ok: false, error: "EDIT_CONTRATO_FAIL" });
  }
};
