const dbMysqlDev = require("../../DataBase/MySqlDatabaseDev");

exports.obtenerEquipos = async (req, res) => {
  const query =
    "select * from dev.tbl_equipomedico where id not in (select id from dev.tbl_equipomedico where baja is not null)";
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
    const equipos = await dbMysqlDev.executeQueryParams(query, [id_equipo]);
    res.json(equipos);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener equipos medicos" });
  }
};

exports.altaEquipo = async (req, res) => {
  try {
    console.log("Datos recibidos en el body:", req.body);

    const {
      marca,
      modelo,
      serial_number,
      tipo,
      servicio,
      ip,
      mascara,
      gateway,
      aetitle,
      puerto,
      compra_año,
      sala,
    } = req.body;

    if (!marca || !modelo || !servicio) {
      return res.status(400).json({ error: "Campos obligatorios faltantes" });
    }

    const values = [
      marca ?? null,
      modelo ?? null,
      serial_number ?? null,
      tipo ?? null,
      servicio ?? null,
      ip ?? null,
      mascara ?? null,
      gateway ?? null,
      aetitle ?? null,
      puerto ?? null,
      compra_año ?? null,
      sala ?? null,
    ];

    console.log("Valores que se enviarán a la BD:", values);

    const insertQuery = `
          INSERT INTO tbl_equipomedico (marca, modelo, serial_number, tipo, servicio, ip, mascara, gateway, aetitle, puerto, compra_año, sala, alta) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `;

    await dbMysqlDev.executeQueryParams(insertQuery, values);

    res.status(201).json({
      message: "Registro creado exitosamente",
    });
  } catch (err) {
    console.error("Error al cargar el equipo:", err);
    res.status(500).json({ error: "Error al cargar equipo" });
  }
};

exports.tecnicoEquipo = async (req, res) => {
  const {equipoId} = req.params;
  const query = `select t.* from tbl_tecnicos t join tbl_equipo_tecnico et on t.id_tecnico  = et.tecnico_id 
where et.equipo_id = ?`

  try {
    const tenicosEquipo = await dbMysqlDev.executeQueryParams(
      query,
      [equipoId]
    );
    res.json(tenicosEquipo);
  } catch (error) {
    console.error("Error al obtener técnicos:", error);
    res.status(500).json({ error: "Error al obtener técnicos." });
  }
};
