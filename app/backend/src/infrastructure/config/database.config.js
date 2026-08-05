const { Pool } = require('pg');
require('dotenv').config();

/**
 * Configuración del Pool de conexiones de PostgreSQL.
 * Administra reutilización de conexiones eficientemente para evitar saturate la base de datos.
 */
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'app_delivery',
  user: process.env.DB_USER || 'user_delivery',
  password: process.env.DB_PASSWORD || 'pass_delivery',
});

module.exports = {
  /**
   * Ejecuta una consulta SQL en el pool
   * @param {string} text - Query SQL paramétrico
   * @param {Array} params - Arreglo de parámetros
   */
  query: (text, params) => pool.query(text, params),
  
  /**
   * Obtiene un cliente individual para manejar Transacciones SQL (BEGIN, COMMIT, ROLLBACK)
   */
  getClient: () => pool.connect(),

  pool
};
