import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/authRequest'
import { query } from '@/lib/db'
import { savedBytesToCO2Grams } from '@/lib/environmentMetrics'

type MediaRow = {
  id: number
  code: string
  isPrivate: number
  expiresAt: Date
  createdAt: Date
  upvotes: number
  downvotes: number
  rating: number
  savedBytes: string | number
}

export async function GET() {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const rows = await query<MediaRow[]>(
      `SELECT m.id, m.code, m.isPrivate, m.expiresAt, m.createdAt,
        COALESCE(SUM(CASE WHEN v.type = 'upvote' THEN 1 ELSE 0 END), 0) AS upvotes,
        COALESCE(SUM(CASE WHEN v.type = 'downvote' THEN 1 ELSE 0 END), 0) AS downvotes,
        COALESCE(SUM(CASE WHEN v.type = 'upvote' THEN 1 WHEN v.type = 'downvote' THEN -1 ELSE 0 END), 0) AS rating,
        COALESCE(GREATEST(0, m.originalSizeBytes - m.storedSizeBytes), 0) AS savedBytes
       FROM media m
       LEFT JOIN votes v ON m.id = v.mediaId
       WHERE m.userId = ? AND m.expiresAt > NOW()
       GROUP BY m.id, m.code, m.isPrivate, m.expiresAt, m.createdAt, m.originalSizeBytes, m.storedSizeBytes
       ORDER BY m.createdAt DESC`,
      [user.id]
    )

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || ''
    const items = rows.map((row) => {
      const savedBytes = Number(row.savedBytes ?? 0)
      return {
        id: row.id,
        shortCode: row.code,
        url: baseUrl ? `${baseUrl}/${row.code}` : `/${row.code}`,
        imageUrl: baseUrl ? `${baseUrl}/api/images/${row.code}` : `/api/images/${row.code}`,
        isPublic: row.isPrivate === 0,
        expiresAt: row.expiresAt,
        createdAt: row.createdAt,
        upvotes: Number(row.upvotes),
        downvotes: Number(row.downvotes),
        rating: Number(row.rating),
        savedBytes,
        savedCO2Grams: savedBytesToCO2Grams(savedBytes),
      }
    })

    return NextResponse.json({ success: true, items })
  } catch (e) {
    console.error('My images error:', e)
    return NextResponse.json(
      { success: false, error: 'Failed to load images' },
      { status: 500 }
    )
  }
}
