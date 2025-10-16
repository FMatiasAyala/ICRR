const dbMysqlDev = require("../../DataBase/MySqlDatabaseDev");

// OBTENER TODOS
exports.obtenerEquipos = async (req, res) => {
  try {
    const rows = await dbMysqlDev.executeQuery(
      "SELECT * FROM tbl_equipos WHERE activo=1"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error obteniendo equipos" });
  }
};

// OBTENER UNO POR ID
exports.obtenerEquipoPorId = async (req, res) => {
  try {
    const id = req.params.id;
    const [rows] = await dbMysqlDev.executeQueryParams(
      "SELECT * FROM tbl_equipos WHERE id = ?",
      [id]
    );
    if (rows.length === 0)
      return res.status(404).json({ error: "Equipo no encontrado" });
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error obteniendo equipo" });
  }
};

// CREAR NUEVO EQUIPO
exports.crearEquipo = async (req, res) => {
  try {
    const datos = req.body;
    const campos = Object.keys(datos); // ['nombre', 'tipo', ...]
    const valores = Object.values(datos); // [value1, value2, ...]
    const camposStr = campos.join(", "); // "nombre, tipo, modelo, x, y"
    const placeholders = campos.map(() => "?").join(", "); // "?, ?, ?, ?, ?"
    const query = `INSERT INTO tbl_equipos (${camposStr}) VALUES (${placeholders})`;
    const result = await dbMysqlDev.executeQueryParams(query, valores);

    res.json({ message: "Equipo creado", id: result[0].insertId });
  } catch (err) {
    res.status(500).json({ error: "Error creando equipo" });
  }
};

// ACTUALIZAR EQUIPO
exports.actualizarEquipo = async (req, res) => {
  try {
    const id = req.params.id;
    const datos = req.body;
    const campos = Object.keys(datos);
    const valores = Object.values(datos);
    const setStr = campos.map((campo) => `${campo}=?`).join(", ");

    const query = `UPDATE tbl_equipos SET ${setStr} WHERE id=?`;
    await dbMysqlDev.executeQueryParams(query, [...valores, id]);
    res.json({ message: "Equipo actualizado" });
  } catch (err) {
    res.status(500).json({ error: "Error actualizando equipo" });
  }
};

// DAR DE BAJA EQUIPO (update activo=0)
exports.darBajaEquipo = async (req, res) => {
  try {
    const id = req.params.id;
    await dbMysqlDev.executeQueryParams(
      "UPDATE tbl_equipos SET activo = 0 WHERE id = ?",
      [id]
    );
    res.json({ message: "Equipo dado de baja" });
  } catch (err) {
    res.status(500).json({ error: "Error dando de baja equipo" });
  }
};

// BORRAR EQUIPO (opcional, si querés borrado físico)
exports.borrarEquipo = async (req, res) => {
  try {
    const id = req.params.id;
    await dbMysqlDev.executeQueryParams(
      "DELETE FROM tbl_equipos WHERE id = ?",
      [id]
    );
    res.json({ message: "Equipo eliminado físicamente" });
  } catch (err) {
    res.status(500).json({ error: "Error eliminando equipo" });
  }
};

//Matafuegos
exports.obtenerMatafuego = async (req, res) => {
  try {
    const rows = await dbMysqlDev.executeQuery("SELECT * FROM tbl_matafuegos");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error obteniendo equipos" });
  }
};

// OBTENER UNO POR ID
exports.obtenerMatafuegoId = async (req, res) => {
  try {
    const id = req.params.id;
    const [rows] = await dbMysqlDev.executeQueryParams(
      "SELECT * FROM tbl_matafuegos WHERE id = ?",
      [id]
    );
    if (rows.length === 0)
      return res.status(404).json({ error: "Equipo no encontrado" });
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error obteniendo equipo" });
  }
};

// CREAR NUEVO EQUIPO
exports.crearMatafuego = async (req, res) => {
  try {
    const datos = req.body;
    const campos = Object.keys(datos);
    const valores = Object.values(datos);
    const camposStr = campos.join(", ");
    const placeholders = campos.map(() => "?").join(", ");

    const query = `INSERT INTO tbl_matafuegos (${camposStr}) VALUES (${placeholders})`;
    const result = await dbMysqlDev.executeQueryParams(query, valores);

    res.json({ message: "Equipo creado", id: result[0].insertId });
  } catch (err) {
    res.status(500).json({ error: "Error creando equipo" });
  }
};

// ACTUALIZAR EQUIPO
exports.actualizarMatafuego = async (req, res) => {
  try {
    const id = req.params.id;
    const datos = req.body;
    const campos = Object.keys(datos);
    const valores = Object.values(datos);
    const setStr = campos.map((campo) => `${campo}=?`).join(", ");

    const query = `UPDATE tbl_matafuegos SET ${setStr} WHERE id=?`;
    await dbMysqlDev.executeQueryParams(query, [...valores, id]);
    res.json({ message: "Equipo actualizado" });
  } catch (err) {
    res.status(500).json({ error: "Error actualizando equipo" });
  }
};

// BORRAR EQUIPO (opcional, si querés borrado físico)
exports.borrarMatafuego = async (req, res) => {
  try {
    const id = req.params.id;
    await dbMysqlDev.executeQueryParams(
      "DELETE FROM tbl_matafuegos WHERE id = ?",
      [id]
    );
    res.json({ message: "Equipo eliminado físicamente" });
  } catch (err) {
    res.status(500).json({ error: "Error eliminando equipo" });
  }
};





// Refrigeracion 
exports.obtenerRefrigeracion = async (req, res) => {
  try {
    const rows = await dbMysqlDev.executeQuery("SELECT * FROM tbl_refrigeracion");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error obteniendo equipos" });
  }
};

// OBTENER UNO POR ID
exports.obtenerRefrigeracionId = async (req, res) => {
  try {
    const id = req.params.id;
    const [rows] = await dbMysqlDev.executeQueryParams(
      "SELECT * FROM tbl_refrigeracion WHERE id = ?",
      [id]
    );
    if (rows.length === 0)
      return res.status(404).json({ error: "Equipo no encontrado" });
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error obteniendo equipo" });
  }
};

// CREAR NUEVO EQUIPO
exports.crearRefrigeracion = async (req, res) => {
  try {
    const datos = req.body;
    console.log(datos)
    const campos = Object.keys(datos);
    const valores = Object.values(datos);
    const camposStr = campos.join(", ");
    const placeholders = campos.map(() => "?").join(", ");

    const query = `INSERT INTO tbl_refrigeracion (${camposStr}) VALUES (${placeholders})`;
    const result = await dbMysqlDev.executeQueryParams(query, valores);

    res.json({ message: "Equipo creado", id: result[0].insertId });
  } catch (err) {
    res.status(500).json({ error: "Error creando equipo" });
  }
};

// ACTUALIZAR EQUIPO
exports.actualizarRefrigeracion = async (req, res) => {
  try {
    const id = req.params.id;
    const datos = req.body;
    const campos = Object.keys(datos);
    const valores = Object.values(datos);
    const setStr = campos.map((campo) => `${campo}=?`).join(", ");

    const query = `UPDATE tbl_refrigeracion SET ${setStr} WHERE id=?`;
    await dbMysqlDev.executeQueryParams(query, [...valores, id]);
    res.json({ message: "Equipo actualizado" });
  } catch (err) {
    res.status(500).json({ error: "Error actualizando equipo" });
  }
};

// BORRAR EQUIPO (opcional, si querés borrado físico)
exports.borrarRefrigeracion = async (req, res) => {
  try {
    const id = req.params.id;
    await dbMysqlDev.executeQueryParams(
      "DELETE FROM tbl_refrigeracion WHERE id = ?",
      [id]
    );
    res.json({ message: "Equipo eliminado físicamente" });
  } catch (err) {
    res.status(500).json({ error: "Error eliminando equipo" });
  }
};





// UPS 
exports.obtenerUps = async (req, res) => {
  try {
    const rows = await dbMysqlDev.executeQuery("SELECT * FROM tbl_ups");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error obteniendo equipos" });
  }
};

// OBTENER UNO POR ID
exports.obtenerUpsId = async (req, res) => {
  try {
    const id = req.params.id;
    const [rows] = await dbMysqlDev.executeQueryParams(
      "SELECT * FROM tbl_ups WHERE id = ?",
      [id]
    );
    if (rows.length === 0)
      return res.status(404).json({ error: "Equipo no encontrado" });
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error obteniendo equipo" });
  }
};
// CREAR NUEVO EQUIPO
exports.crearUps = async (req, res) => {
  try {
    const datos = req.body;
    console.log(datos)
    const campos = Object.keys(datos);
    const valores = Object.values(datos);
    const camposStr = campos.join(", ");
    const placeholders = campos.map(() => "?").join(", ");

    const query = `INSERT INTO tbl_ups (${camposStr}) VALUES (${placeholders})`;
    const result = await dbMysqlDev.executeQueryParams(query, valores);

    res.json({ message: "Equipo creado", id: result[0].insertId });
  } catch (err) {
    res.status(500).json({ error: "Error creando equipo" });
  }
};

// ACTUALIZAR EQUIPO
exports.actualizarUps = async (req, res) => {
  try {
    const id = req.params.id;
    const datos = req.body;
    const campos = Object.keys(datos);
    const valores = Object.values(datos);
    const setStr = campos.map((campo) => `${campo}=?`).join(", ");

    const query = `UPDATE tbl_ups SET ${setStr} WHERE id=?`;
    await dbMysqlDev.executeQueryParams(query, [...valores, id]);
    res.json({ message: "Equipo actualizado" });
  } catch (err) {
    res.status(500).json({ error: "Error actualizando equipo" });
  }
};

// BORRAR EQUIPO (opcional, si querés borrado físico)
exports.borrarUps = async (req, res) => {
  try {
    const id = req.params.id;
    await dbMysqlDev.executeQueryParams(
      "DELETE FROM tbl_ups WHERE id = ?",
      [id]
    );
    res.json({ message: "Equipo eliminado físicamente" });
  } catch (err) {
    res.status(500).json({ error: "Error eliminando equipo" });
  }
};