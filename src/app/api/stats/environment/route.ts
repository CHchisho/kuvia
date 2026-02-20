import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { savedBytesToCO2Grams } from '@/lib/environmentMetrics'
import type { RowDataPacket } from 'mysql2'

type Row = RowDataPacket & { totalSavedBytes: string | number }

/**
 * GET /api/stats/environment — global saved data and CO₂ (all non-expired media).
 */
export async function GET() {
  try {
    const rows = await query<Row[]>(
      `SELECT COALESCE(SUM(
        CASE
          WHEN originalSizeBytes IS NOT NULL AND storedSizeBytes IS NOT NULL AND originalSizeBytes > 0
          THEN GREATEST(0, originalSizeBytes - storedSizeBytes)
          ELSE 0
        END
      ), 0) AS totalSavedBytes
       FROM media
       WHERE expiresAt > NOW()`
    )

    const totalSavedBytes = Number(rows[0]?.totalSavedBytes ?? 0)
    const savedCO2Grams = savedBytesToCO2Grams(totalSavedBytes)

    return NextResponse.json({
      success: true,
      totalSavedBytes,
      savedCO2Grams,
    })
  } catch (e) {
    console.error('Environment stats error:', e)
    return NextResponse.json(
      { success: false, error: 'Failed to load stats' },
      { status: 500 }
    )
  }
}
