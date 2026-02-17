import { query } from '@/lib/db'
import { resolveStoragePath } from '@/lib/imageStorage'
import fs from 'node:fs'

type ExpiredMediaRow = {
  id: number
  image: string
}

/**
 * Deletes expired files and records from the database.
 */
export async function cleanupExpiredMedia(): Promise<number> {
  try {
    // Find all records with expired expiration time
    const expired = await query<ExpiredMediaRow[]>(
      `SELECT id, image FROM media WHERE expiresAt <= NOW()`
    )

    if (expired.length === 0) {
      return 0
    }

    let deletedFiles = 0
    let deletedRecords = 0

    for (const row of expired) {
      // Delete file
      try {
        const filePath = resolveStoragePath(row.image)
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath)
          deletedFiles++
        }
      } catch (e) {
        console.error(`[cleanup] Failed to delete file ${row.image}:`, e)
      }

      // Delete record from database
      try {
        await query('DELETE FROM media WHERE id = ?', [row.id])
        deletedRecords++
      } catch (e) {
        console.error(`[cleanup] Failed to delete DB record ${row.id}:`, e)
      }
    }

    console.log(
      `[cleanup] Deleted ${deletedFiles} files and ${deletedRecords} DB records`
    )
    return deletedRecords
  } catch (e) {
    console.error('[cleanup] Error during cleanup:', e)
    throw e
  }
}
