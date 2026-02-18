import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getAuthUser, canViewMedia } from '@/lib/authRequest'

type MediaRow = {
  id: number
  userId: number
  isPrivate: number
}

type CommentRow = {
  id: number
  userId: number
  mediaId: number
  text: string
  createdAt: Date
  username: string
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await context.params
    if (!code?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Invalid or missing code' },
        { status: 400 }
      )
    }

    const mediaRows = await query<MediaRow[]>(
      'SELECT id, userId, isPrivate FROM media WHERE code = ? AND expiresAt > NOW() LIMIT 1',
      [code.trim()]
    )

    if (mediaRows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Media not found' },
        { status: 404 }
      )
    }

    const media = mediaRows[0]!
    const user = await getAuthUser()
    if (!canViewMedia(user, media.userId, media.isPrivate === 1)) {
      return NextResponse.json(
        { success: false, error: 'Media not found' },
        { status: 404 }
      )
    }

    const mediaId = media.id

    // Get comments with author usernames
    const comments = await query<CommentRow[]>(
      `SELECT c.id, c.userId, c.mediaId, c.text, c.createdAt, u.username
       FROM comments c
       INNER JOIN users u ON c.userId = u.id
       WHERE c.mediaId = ?
       ORDER BY c.createdAt ASC`,
      [mediaId]
    )

    return NextResponse.json({
      success: true,
      comments: comments.map((c) => ({
        id: c.id,
        userId: c.userId,
        username: c.username,
        text: c.text,
        createdAt: c.createdAt,
      })),
    })
  } catch (e) {
    console.error('Get comments error:', e)
    return NextResponse.json(
      { success: false, error: 'Failed to get comments' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ code: string }> }
) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { code } = await context.params
    if (!code?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Invalid or missing code' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { text } = body as { text?: string }

    if (!text?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Comment text is required' },
        { status: 400 }
      )
    }

    const mediaRows = await query<MediaRow[]>(
      'SELECT id, userId, isPrivate FROM media WHERE code = ? AND expiresAt > NOW() LIMIT 1',
      [code.trim()]
    )

    if (mediaRows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Media not found' },
        { status: 404 }
      )
    }

    const media = mediaRows[0]!
    if (!canViewMedia(user, media.userId, media.isPrivate === 1)) {
      return NextResponse.json(
        { success: false, error: 'Media not found' },
        { status: 404 }
      )
    }

    const mediaId = media.id

    // Create comment
    const insertResult = await query(
      'INSERT INTO comments (userId, mediaId, text) VALUES (?, ?, ?)',
      [user.id, mediaId, text.trim()]
    )

    const commentId = (insertResult as unknown as { insertId: number }).insertId

    // Get created comment with username
    const commentRows = await query<CommentRow[]>(
      `SELECT c.id, c.userId, c.mediaId, c.text, c.createdAt, u.username
       FROM comments c
       INNER JOIN users u ON c.userId = u.id
       WHERE c.id = ? LIMIT 1`,
      [commentId]
    )

    const comment = commentRows[0]!

    return NextResponse.json({
      success: true,
      comment: {
        id: comment.id,
        userId: comment.userId,
        username: comment.username,
        text: comment.text,
        createdAt: comment.createdAt,
      },
    })
  } catch (e) {
    console.error('Create comment error:', e)
    return NextResponse.json(
      { success: false, error: 'Failed to create comment' },
      { status: 500 }
    )
  }
}
