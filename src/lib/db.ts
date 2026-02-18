import mysql from 'mysql2/promise'

const poolConfig = {
  host: process.env.MYSQL_HOST ?? 'localhost',
  port: Number(process.env.MYSQL_PORT ?? 3306),
  user: process.env.MYSQL_USER ?? 'root',
  password: process.env.MYSQL_PASSWORD ?? '',
  database: process.env.MYSQL_DATABASE ?? 'kuvia',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
}

let pool: mysql.Pool | null = null

function getPool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool(poolConfig)
  }
  return pool
}

/** Execute a query to the database. The pool is created on the first request. */
export async function query<T = mysql.RowDataPacket[]>(
  sql: string,
  params?: unknown[]
): Promise<T> {
  const p = getPool()
  const [rows] = await p.execute(sql, params)
  return rows as T
}

/** Check the connection to the database (for server start or health-check). */
export async function checkConnection(): Promise<boolean> {
  try {
    const p = getPool()
    await p.execute('SELECT 1')
    return true
  } catch {
    return false
  }
}

export type UserRole = 'user' | 'moderator' | 'admin'

export type UserRow = {
  id: number
  createdAt: Date
  username: string
  email: string
  password: string
  role: UserRole
}
