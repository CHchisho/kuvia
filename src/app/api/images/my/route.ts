import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/authRequest'
import { query } from '@/lib/db'

type MediaRow = {
  id: number
  code: string
  isPrivate: number
  expiresAt: Date
  createdAt: Date
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
      `SELECT id, code, isPrivate, expiresAt, createdAt 
       FROM media 
       WHERE userId = ? AND expiresAt > NOW() 
       ORDER BY createdAt DESC`,
      [user.id]
    )

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || ''
    const items = rows.map((row) => ({
      id: row.id,
      shortCode: row.code,
      url: baseUrl ? `${baseUrl}/${row.code}` : `/${row.code}`,
      imageUrl: baseUrl ? `${baseUrl}/api/images/${row.code}` : `/api/images/${row.code}`,
      isPublic: row.isPrivate === 0,
      expiresAt: row.expiresAt,
      createdAt: row.createdAt,
    }))

    return NextResponse.json({ success: true, items })
  } catch (e) {
    console.error('My images error:', e)
    return NextResponse.json(
      { success: false, error: 'Failed to load images' },
      { status: 500 }
    )
  }
}
