const dbMysqlDev = require("../../DataBase/MySqlDatabaseDev");
const path = require("path");
const fs = require("fs");

/* Carga de contratos */
exports.cargaContratos = async (req, res) => {
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

  // Verificar que se haya subido un archivo
  if (!req.file) {
    return res.status(400).json({ error: "No se subió ningún archivo" });
  }

  // Obtener el nombre del archivo y armar la URL relativa
  const filename = path.basename(req.file.path); // ej: contrato_123.pdf
  const url = `${filename}`; // así se guarda en la DB

  // Query SQL
  const query = `
    INSERT INTO tbl_contratos (
      url, descripcion, cobertura_partes,
      cobertura_manoDeObra, desde, hasta,
      id_equipo, actualizacion
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  try {
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

    res
      .status(201)
      .json({ message: "Carga de contrato realizada exitosamente" });
  } catch (error) {
    console.error("Error al cargar contrato:", error);
    res.status(500).json({ error: "Error al cargar contrato" });
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
    const baseDir =
      "C:/htdocs/Matias/ICRR/Servidor/contratos";
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
