import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getAuthUser, canViewMedia } from '@/lib/authRequest'

type MediaMetaRow = {
  id: number
  userId: number
  code: string
  description: string | null
  isPrivate: number
  mimeType: string
  expiresAt: Date
  createdAt: Date
  username: string
}

/**
 * GET /api/media/[code] — metadata for the photo page.
 * Access: public media, or owner, or admin/moderator for private.
 */
export async function GET(
  _request: Request,
  context: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await context.params
    const codeTrimmed = code?.trim()
    if (!codeTrimmed) {
      return NextResponse.json(
        { success: false, error: 'Invalid or missing code' },
        { status: 400 }
      )
    }

    const rows = await query<MediaMetaRow[]>(
      `SELECT m.id, m.userId, m.code, m.description, m.isPrivate, m.mimeType, m.expiresAt, m.createdAt, u.username
       FROM media m
       INNER JOIN users u ON m.userId = u.id
       WHERE m.code = ? LIMIT 1`,
      [codeTrimmed]
    )

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Media not found' },
        { status: 404 }
      )
    }

    const row = rows[0]!
    const expiresAt = new Date(row.expiresAt)
    if (expiresAt <= new Date()) {
      return NextResponse.json(
        { success: false, error: 'Link has expired' },
        { status: 410 }
      )
    }

    const user = await getAuthUser()
    if (!canViewMedia(user, row.userId, row.isPrivate === 1)) {
      return NextResponse.json(
        { success: false, error: 'Media not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      media: {
        id: row.id,
        code: row.code,
        description: row.description ?? '',
        isPrivate: row.isPrivate === 1,
        mimeType: row.mimeType,
        expiresAt: row.expiresAt,
        createdAt: row.createdAt,
        authorUsername: row.username,
        authorId: row.userId,
      },
    })
  } catch (e) {
    console.error('Media metadata error:', e)
    return NextResponse.json(
      { success: false, error: 'Failed to load metadata' },
      { status: 500 }
    )
  }
}
