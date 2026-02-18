/**
 * Executed when the Next.js server starts.
 * Checks the connection to the database, ensures seed users exist, and sets up cleanup job.
 */
export async function register() {
  const isNodeServer =
    process.env.NEXT_RUNTIME === 'nodejs' || process.env.NEXT_RUNTIME === undefined
  if (isNodeServer) {
    const { checkConnection } = await import('./src/lib/db')
    const { cleanupExpiredMedia } = await import('./src/lib/cleanup')
    const { ensureSeedUsers } = await import('./src/lib/seedUsers')

    // Check database connection
    const ok = await checkConnection()
    if (ok) {
      console.log('[kuvia] Database connection OK')

      // Ensure base accounts (admin, moderator) exist
      try {
        await ensureSeedUsers()
      } catch (e) {
        console.error('[kuvia] Seed users check failed:', e)
      }

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
