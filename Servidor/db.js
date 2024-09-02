require('dotenv').config();
const sql = require('mssql');
const mysql = require('mysql2/promise');


const pool = mysql.createPool({
  host: process.env.DB_HOST_MYSQL,
  user: process.env.DB_USER_MYSQL,
  password: process.env.DB_PASSWORD_MYSQL,
  database: process.env.DB_NAME_MYSQL,
});

async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Conexión exitosa a MySQL');
    connection.release(); // Liberar la conexión cuando termines
  } catch (error) {
    console.error('Error conectando a MySQL:', error);
  }
}

testConnection();

// Función para ejecutar una consulta a la base de datos MySQL
async function executeMySql(query, params) {
  try { 
    const [rows] = await pool.execute(query, params);
    return rows;
  } catch (e) {
    console.error('Error ejecutando la consulta:', e);
    throw e; // Asegúrate de que el error se propague correctamente
  }
}


const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  options: {
    encrypt: process.env.DB_ENCRYPT === 'false',
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true',
  },
};

// Función para ejecutar una consulta a la base de datos SQL server
async function executeQuery(query, params) {
  let pool
  try {
    // Conectar a la base de datos
    pool = await sql.connect(config);
    
    const request = pool.request();
  
    // Agregar parámetros a la consulta
    for (const [key, value] of Object.entries(params)) {
      request.input(key, sql.VarChar, value);
    }

    // Ejecutar la consulta
    const result = await request.query(query);
    return result.recordset;
  } catch (err) {
    console.error('Error ejecutando la consulta:', err);
  } finally {
    // Cerrar la conexión
    await sql.close();
  }
}

module.exports = {executeQuery, executeMySql};
