import { pool } from '../config/database.js'

export async function getDatabaseHealth(request, response, next) {
  try {
    const result = await pool.query('SELECT now() AS database_time')

    response.json({
      status: 'ok',
      databaseTime: result.rows[0].database_time,
    })
  } catch (error) {
    next(error)
  }
}
