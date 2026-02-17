/**
 * Executed when the Next.js server starts.
 * Checks the connection to the database and sets up cleanup job.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { checkConnection } = await import('./src/lib/db')
    const { cleanupExpiredMedia } = await import('./src/lib/cleanup')

    // Check database connection
    const ok = await checkConnection()
    if (ok) {
      console.log('[kuvia] Database connection OK')

      // Run cleanup on startup
      try {
        const deleted = await cleanupExpiredMedia()
        if (deleted > 0) {
          console.log(`[kuvia] Initial cleanup: removed ${deleted} expired items`)
        }
      } catch (e) {
        console.error('[kuvia] Initial cleanup failed:', e)
      }

      // Set up cleanup job
      const CLEANUP_INTERVAL_MS = 24 * 60 * 60 * 1000 // 24 hours
      setInterval(async () => {
        try {
          const deleted = await cleanupExpiredMedia()
          if (deleted > 0) {
            console.log(`[kuvia] Scheduled cleanup: removed ${deleted} expired items`)
          }
        } catch (e) {
          console.error('[kuvia] Scheduled cleanup failed:', e)
        }
      }, CLEANUP_INTERVAL_MS)

      console.log('[kuvia] Cleanup job scheduled (runs every 24 hours)')
    } else {
      console.warn('[kuvia] Database connection failed — check MYSQL_* env vars')
    }
  }
}
