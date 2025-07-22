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

exports.bajaEquipo = async (req, res) => {
  const { id_equipo } = req.body;
  const query = "update tbl_equipomedico set baja = now() where id = ?";
  try {
    await dbMysqlDev.executeQueryParams(query, [id_equipo]);

    // Emitís el evento manualmente
    broadcastUpdate("equipoDadoDeBaja", { id: id_equipo });

    res.json({ success: true });
  } catch (err) {
    console.error("Error al dar de baja el equipo:", err);
    res.status(500).json({ error: "Error al dar de baja el equipo" });
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
      id,
    ]);
    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: " Equipo no encontrado",
      });
    }
    const [rows] = await dbMysqlDev.executeQueryParams(selectQuery, [id]);

    const equipoModificado = rows;

    broadcastUpdate("mensaje", { type: "equipoUpdate", data: equipoModificado });

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
