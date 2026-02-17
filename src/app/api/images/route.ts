import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

type MediaRow = {
  id: number
  code: string
  description: string | null
  upvotes: number
  downvotes: number
  rating: number
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const sortBy = searchParams.get('sort') || 'date'

    const orderByClause =
      sortBy === 'rating'
        ? 'rating DESC, m.createdAt DESC'
        : 'm.createdAt DESC'

    const rows = await query<MediaRow[]>(
      `SELECT 
        m.id, 
        m.code, 
        m.description,
        COALESCE(SUM(CASE WHEN v.type = 'upvote' THEN 1 ELSE 0 END), 0) as upvotes,
        COALESCE(SUM(CASE WHEN v.type = 'downvote' THEN 1 ELSE 0 END), 0) as downvotes,
        COALESCE(SUM(CASE WHEN v.type = 'upvote' THEN 1 WHEN v.type = 'downvote' THEN -1 ELSE 0 END), 0) as rating
       FROM media m
       LEFT JOIN votes v ON m.id = v.mediaId
       WHERE m.isPrivate = 0 AND m.expiresAt > NOW()
       GROUP BY m.id, m.code, m.description, m.createdAt
       ORDER BY ${orderByClause}`
    )

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || ''
    const items = rows.map((row) => ({
      id: row.id,
      code: row.code,
      description: row.description ?? '',
      upvotes: Number(row.upvotes),
      downvotes: Number(row.downvotes),
      rating: Number(row.rating),
      imageUrl:
        baseUrl !== ''
          ? `${baseUrl}/api/images/${row.code}`
          : `/api/images/${row.code}`,
    }))

    return NextResponse.json({ success: true, items })
  } catch (e) {
    console.error('Public images list error:', e)
    return NextResponse.json(
      { success: false, error: 'Failed to load gallery' },
      { status: 500 }
    )
  }
}
