const dbMysqlDev = ("../../DataBase/MySqlDatabaseDev");

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
  }


  exports.fileContrato =async (req, res) => {
    const { id_equipo } = req.query;
  
    if (!id_equipo) {
      return res.status(400).json({ error: "ID de equipo es requerido" });
    }
  
    const query = "SELECT url FROM tbl_contratos WHERE id_equipo = ?";
  
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
  }