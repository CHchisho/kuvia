import 'server-only';

declare global {
  var __kuviaBootstrapPromise: Promise<void> | undefined;
  var __kuviaCleanupIntervalStarted: boolean | undefined;
}

async function runBootstrap(): Promise<void> {
  const {checkConnection} = await import('@/lib/db');
  const {cleanupExpiredMedia} = await import('@/lib/cleanup');
  const {ensureSeedUsers} = await import('@/lib/seedUsers');

  const ok = await checkConnection();
  if (!ok) {
    console.warn('[kuvia] Database connection failed - check MYSQL_* env vars');
    return;
  }

  console.log('[kuvia] Database connection OK');

  try {
    await ensureSeedUsers();
  } catch (e) {
    console.error('[kuvia] Seed users check failed:', e);
  }

  try {
    const deleted = await cleanupExpiredMedia();
    if (deleted > 0) {
      console.log(`[kuvia] Initial cleanup: removed ${deleted} expired items`);
    }
  } catch (e) {
    console.error('[kuvia] Initial cleanup failed:', e);
  }

  if (!globalThis.__kuviaCleanupIntervalStarted) {
    const CLEANUP_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours
    setInterval(async () => {
      try {
        const deleted = await cleanupExpiredMedia();
        if (deleted > 0) {
          console.log(
            `[kuvia] Scheduled cleanup: removed ${deleted} expired items`
          );
        }
      } catch (e) {
        console.error('[kuvia] Scheduled cleanup failed:', e);
      }
    }, CLEANUP_INTERVAL_MS);

    globalThis.__kuviaCleanupIntervalStarted = true;
    console.log('[kuvia] Cleanup job scheduled (runs every 24 hours)');
  }
}

export function initializeServer(): Promise<void> {
  globalThis.__kuviaBootstrapPromise ??= runBootstrap();
  return globalThis.__kuviaBootstrapPromise;
}
