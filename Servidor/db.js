require('dotenv').config();
const sql = require('mssql');

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

async function executeQuery(query) {
  try {
    // Conectar a la base de datos
    await sql.connect(config);
    
    // Ejecutar la consulta
    const result = await sql.query(query);
    return result.recordset;
  } catch (err) {
    console.error('Error ejecutando la consulta:', err);
  } finally {
    // Cerrar la conexión
    await sql.close();
  }
}

module.exports = executeQuery;
