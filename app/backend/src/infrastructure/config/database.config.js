const { Pool } = require('pg');
require('dotenv').config();

/**
 * Configuración del Pool de conexiones de PostgreSQL.
 * Administra reutilización de conexiones eficientemente para evitar saturate la base de datos.
 *
 * Si DATABASE_URL está definida (caso Supabase), se usa esa cadena de conexión.
 * En caso contrario, se arma la conexión a partir de las variables DB_* (caso Postgres local).
 * Supabase exige TLS, por lo que DB_SSL=true activa ssl con rejectUnauthorized:false
 * (Supabase usa una CA intermedia que Node no valida por defecto).
 */
const sslEnabled = process.env.DB_SSL === 'true';

const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: sslEnabled ? { rejectUnauthorized: false } : false,
    }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      database: process.env.DB_NAME || 'app_delivery',
      user: process.env.DB_USER || 'user_delivery',
      password: process.env.DB_PASSWORD || 'pass_delivery',
      ssl: sslEnabled ? { rejectUnauthorized: false } : false,
    };

const pool = new Pool(poolConfig);

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
