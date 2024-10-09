const sql = require("mssql");
const mysql = require("mysql2/promise");
require("dotenv").config();

class MySqlDatabaseCrr {
  constructor(configMySql) {
    // Inicializamos el pool de conexión con los parámetros de configuración
    this.pool = mysql.createPool(configMySql);
  }

  // Método para ejecutar una consulta con parámetros
  async executeQueryParams(query, params) {
    try {
      const [rows] = await this.pool.execute(query, params);
      return rows;
    } catch (error) {
      console.error("Error ejecutando la consulta:", error);
      throw error; // Propagamos el error para manejarlo en otro lugar
    }
  }

  // Otro método ejemplo que puede reutilizar el mismo pool
  async executeQuery(query) {
    try {
      const [rows] = await this.pool.execute(query);
      return rows;
    } catch (error) {
      console.error("Error ejecutando la consulta sin parámetros:", error);
      throw error; // Propagamos el error para manejarlo en otro lugar
    }
  }

  async fichaTecnicos(query) {
    try {
      const [rows] = await this.pool.execute(query);
      return rows;
    } catch (error) {
      console.error("Error ejecutando la consulta:", error);
      throw error; // Propagamos el error para manejarlo en otro lugar
    }
  }

  // Método para cerrar el pool de conexiones cuando no lo necesites más
  async closePool() {
    try {
      await this.pool.end();
      console.log("Pool cerrado correctamente.");
    } catch (error) {
      console.error("Error cerrando el pool de conexiones:", error);
      throw error;
    }
  }
}

class MySqlDatabaseDev {
  constructor(configMySql) {
    // Inicializamos el pool de conexión con los parámetros de configuración
    this.pool = mysql.createPool(configMySql);
  }

  // Método para ejecutar una consulta con parámetros
  async executeQueryParams(query, params) {
    try {
      const [rows] = await this.pool.execute(query, params);
      return rows;
    } catch (error) {
      console.error("Error ejecutando la consulta:", error);
      throw error; // Propagamos el error para manejarlo en otro lugar
    }
  }

  // Otro método ejemplo que puede reutilizar el mismo pool
  async executeQuery(query) {
    try {
      const [rows] = await this.pool.execute(query);
      return rows;
    } catch (error) {
      console.error("Error ejecutando la consulta sin parámetros:", error);
      throw error; // Propagamos el error para manejarlo en otro lugar
    }
  }

  async fichaTecnicos(query) {
    try {
      const [rows] = await this.pool.execute(query);
      return rows;
    } catch (error) {
      console.error("Error ejecutando la consulta:", error);
      throw error; // Propagamos el error para manejarlo en otro lugar
    }
  }

  // Método para cerrar el pool de conexiones cuando no lo necesites más
  async closePool() {
    try {
      await this.pool.end();
      console.log("Pool cerrado correctamente.");
    } catch (error) {
      console.error("Error cerrando el pool de conexiones:", error);
      throw error;
    }
  }
}

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  options: {
    encrypt: process.env.DB_ENCRYPT === "false",
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === "true",
  },
};

async function executeQuery(query) {
  let pool;
  try {
    // Conectar a la base de datos
    pool = await sql.connect(config);

    // Ejecutar la consulta
    const result = await pool.query(query);
    return result.recordset;
  } catch (err) {
    console.error("Error ejecutando la consulta:", err);
    throw err; // Lanzar el error para que sea capturado en el controlador
  } finally {
    // Cerrar la conexión en el bloque finally
    if (pool) {
      await pool.close();
    }
  }
}


module.exports = { executeQuery, MySqlDatabaseCrr, MySqlDatabaseDev };