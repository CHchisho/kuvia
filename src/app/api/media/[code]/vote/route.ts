import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getAuthUser, canViewMedia } from '@/lib/authRequest'

type MediaRow = {
  id: number
  userId: number
  isPrivate: number
}

type VoteRow = {
  id: number
  type: 'upvote' | 'downvote'
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
    const { type } = body as { type?: string }

    if (type !== 'upvote' && type !== 'downvote') {
      return NextResponse.json(
        { success: false, error: 'Invalid vote type. Must be "upvote" or "downvote"' },
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

    // Check if user already voted
    const existingVotes = await query<VoteRow[]>(
      'SELECT id, type FROM votes WHERE userId = ? AND mediaId = ? LIMIT 1',
      [user.id, mediaId]
    )

    if (existingVotes.length > 0) {
      const existingVote = existingVotes[0]!
      if (existingVote.type === type) {
        // Remove vote if clicking the same type again
        await query('DELETE FROM votes WHERE id = ?', [existingVote.id])
        return NextResponse.json({
          success: true,
          action: 'removed',
          type: null,
        })
      } else {
        // Update vote type
        await query('UPDATE votes SET type = ? WHERE id = ?', [type, existingVote.id])
        return NextResponse.json({
          success: true,
          action: 'updated',
          type,
        })
      }
    } else {
      // Create new vote
      await query(
        'INSERT INTO votes (userId, mediaId, type) VALUES (?, ?, ?)',
        [user.id, mediaId, type]
      )
      return NextResponse.json({
        success: true,
        action: 'created',
        type,
      })
    }
  } catch (e) {
    console.error('Vote error:', e)
    return NextResponse.json(
      { success: false, error: 'Failed to process vote' },
      { status: 500 }
    )
  }
}
