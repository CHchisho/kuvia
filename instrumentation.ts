/**
 * Executed when the Next.js server starts.
 * Checks the connection to the database.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { checkConnection } = await import('./src/lib/db')
    const ok = await checkConnection()
    if (ok) {
      console.log('[kuvia] Database connection OK')
    } else {
      console.warn('[kuvia] Database connection failed — check MYSQL_* env vars')
    }
  }
}
