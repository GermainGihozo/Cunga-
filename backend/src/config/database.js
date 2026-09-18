import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config()

const DB_CONFIG = {
  host:                  process.env.DB_HOST     || 'localhost',
  port:                  parseInt(process.env.DB_PORT) || 3306,
  user:                  process.env.DB_USER     || 'root',
  password:              process.env.DB_PASSWORD || '',
  database:              process.env.DB_NAME     || 'cunga_platform',
  waitForConnections:    true,
  connectionLimit:       10,
  queueLimit:            0,
  enableKeepAlive:       true,
  keepAliveInitialDelay: 10000,
  connectTimeout:        10000,
  // mysql2 option: automatically handle reconnects
  multipleStatements:    false,
}

// Create the pool — exported as a getter so it can be recreated on crash
let pool = mysql.createPool(DB_CONFIG)

// Recreate pool on fatal errors
pool.on('error', (err) => {
  if (err.fatal) {
    console.warn('⚠️  Pool fatal error — recreating pool in 2s:', err.code)
    setTimeout(() => { pool = mysql.createPool(DB_CONFIG) }, 2000)
  }
})

// Test database connection
export const testConnection = async () => {
  try {
    const connection = await pool.getConnection()
    console.log('✅ Database connected successfully')
    connection.release()
    return true
  } catch (error) {
    console.error('❌ Database connection failed:', error.message)
    return false
  }
}

// Detect connection errors that warrant a retry
const isConnError = (err) =>
  err.code === 'ECONNREFUSED' ||
  err.code === 'PROTOCOL_CONNECTION_LOST' ||
  err.code === 'ER_CON_COUNT_ERROR' ||
  err.code === 'ETIMEDOUT' ||
  err.code === 'ENOTFOUND' ||
  err.fatal === true

// Execute query with automatic retry + pool recreation
export const query = async (sql, params, retries = 2) => {
  try {
    const [results] = await pool.execute(sql, params)
    return results
  } catch (error) {
    if (isConnError(error) && retries > 0) {
      const delay = retries === 2 ? 500 : 2000
      console.warn(`⚠️  DB error (${error.code}) — retry ${3 - retries}/2 in ${delay}ms`)
      await new Promise(r => setTimeout(r, delay))
      // Recreate the pool before the last retry
      if (retries === 1) {
        pool = mysql.createPool(DB_CONFIG)
        await new Promise(r => setTimeout(r, 1000))
      }
      return query(sql, params, retries - 1)
    }
    console.error('Database query error:', error.message || error.code)
    throw error
  }
}

// Transaction helper
export const transaction = async (callback) => {
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()
    const result = await callback(connection)
    await connection.commit()
    return result
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}

export default pool
