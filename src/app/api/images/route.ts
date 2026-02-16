import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

type MediaRow = {
  id: number
  code: string
  description: string | null
}

export async function GET() {
  try {
    const rows = await query<MediaRow[]>(
      `SELECT id, code, description 
       FROM media 
       WHERE isPrivate = 0 AND expiresAt > NOW() 
       ORDER BY createdAt DESC`
    )

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || ''
    const items = rows.map((row) => ({
      id: row.id,
      code: row.code,
      description: row.description ?? '',
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
