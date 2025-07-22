const { type } = require("os");
const dbMysqlDev = require("../../DataBase/MySqlDatabaseDev");
const { broadcastUpdate } = require("../../websocket/webSocketCmms");

exports.obtenerTecnicos = async (req, res) => {
  const query = "select * from tbl_tecnicos";

  const obtenerTecnicos = async () => {
    try {
      const tecnicos = await dbMysqlDev.executeQuery(query);
      res.json(tecnicos);
    } catch (err) {
      res.status(500).json({ error: "Error al obtener equipos medicos" });
    }
  };

  obtenerTecnicos();
};

exports.altaTecnicos = async (req, res) => {
  try {
    console.log("Datos recibidos en el body:", req.body);

    const { nombre, apellido, cobertura, numero, email, id_equipo, empresa } =
      req.body;

    // Insertar técnico en tbl_tecnicos
    const altaTecnico = await dbMysqlDev.executeQueryParams(
      "INSERT INTO tbl_tecnicos (nombre, apellido, empresa,email, cobertura, numero) VALUES (?, ?,?, ?, ?, ?)",
      [nombre, apellido, empresa, email, cobertura, numero]
    );

    // Obtener el ID del técnico recién insertado
    const tecnicoNuevo = await dbMysqlDev.executeQuery(
      "SELECT id_tecnico, nombre, apellido, email, cobertura, numero, empresa FROM tbl_tecnicos ORDER BY id_tecnico DESC LIMIT 1"
    );

    if (!Array.isArray(tecnicoNuevo) || tecnicoNuevo.length === 0) {
      console.error("No se pudo obtener el ID del técnico");
      return res
        .status(500)
        .json({ error: "No se pudo obtener el ID del técnico" });
    }

    const tecnicoDatos = tecnicoNuevo[0];
    const tecnicoId = tecnicoNuevo[0].id_tecnico;

    // Insertar en tbl_equipo_tecnico para cada equipo asociado
    if (Array.isArray(id_equipo) && id_equipo.length > 0) {
      for (const equipoId of id_equipo) {
        await dbMysqlDev.executeQueryParams(
          "INSERT INTO tbl_equipo_tecnico (tecnico_id, equipo_id) VALUES (?, ?)",
          [tecnicoId, equipoId]
        );
      }
    }

    broadcastUpdate("mensaje", {
      type: "tecnicoNuevo",
      data: tecnicoDatos,
    });
    if (Array.isArray(id_equipo)) {
      for (const equipoId of id_equipo) {
        broadcastUpdate("mensaje", {
          type: "tecnicoAsignadoAEquipo",
          data: {
            id_equipo: equipoId,
            tecnico: tecnicoDatos,
          },
        });
      }
    }

    res.status(201).json({ message: "Técnico dado de alta correctamente" });
  } catch (err) {
    console.error("Error en altaTecnicos:", err);
    res
      .status(500)
      .json({ error: "Error al dar de alta al técnico", details: err.message });
  }
};

exports.modificacionTecnicos = async (req, res) => {
  const id = req.params.id;
  const { nombre, apellido, cobertura, numero, email, id_equipo, empresa } =
    req.body;

  const query = `UPDATE tbl_tecnicos SET nombre=?, apellido=?, empresa=?, email=?, cobertura=?, numero=? WHERE id_tecnico=?`;

  try {
    const result = await dbMysqlDev.executeQueryParams(query, [
      nombre,
      apellido,
      empresa,
      email,
      cobertura,
      numero,
      id,
    ]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Técnico no encontrado" });
    }
    res.status(200).json({ message: "Técnico modificado correctamente" });
  } catch (error) {
    console.error("Error en modificacionTecnicos:", error);
    res
      .status(500)
      .json({ error: "Error al modificar al técnico", details: error.message });
  }

  // Insertar en tbl_equipo_tecnico para cada equipo asociado
  if (Array.isArray(id_equipo) && id_equipo.length > 0) {
    for (const equipoId of id_equipo) {
      await dbMysqlDev.executeQueryParams(
        "INSERT INTO tbl_equipo_tecnico (tecnico_id, equipo_id) VALUES (?, ?)",
        [id, equipoId]
      );
    }
  }
};

exports.bajaTecnicos = async (req, res) => {
  const id = req.params.id;

  const query = `DELETE FROM tbl_tecnicos WHERE id_tecnico=?`;

  try {
    const result = await dbMysqlDev.executeQueryParams(query, [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Técnico no encontrado" });
    }
    broadcastUpdate("mensaje", {
      type: "tecnicoEliminado",
      data: id, // mandamos solo el id
    });
    res.status(200).json({ message: "Técnico eliminado correctamente" });
  } catch (error) {
    console.error("Error en bajaTecnicos:", error);
    res
      .status(500)
      .json({ error: "Error al eliminar al técnico", details: error.message });
  }
};
