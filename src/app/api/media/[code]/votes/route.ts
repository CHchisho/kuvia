import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getAuthUser, canViewMedia } from '@/lib/authRequest'

type MediaRow = {
  id: number
  userId: number
  isPrivate: number
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

    // Get vote counts
    const upvoteRows = await query<{ count: number }[]>(
      'SELECT COUNT(*) as count FROM votes WHERE mediaId = ? AND type = "upvote"',
      [mediaId]
    )
    const downvoteRows = await query<{ count: number }[]>(
      'SELECT COUNT(*) as count FROM votes WHERE mediaId = ? AND type = "downvote"',
      [mediaId]
    )

    const upvotes = upvoteRows[0]?.count ?? 0
    const downvotes = downvoteRows[0]?.count ?? 0

    // Get user's vote if authenticated
    let userVote: 'upvote' | 'downvote' | null = null
    if (user) {
      const userVoteRows = await query<{ type: 'upvote' | 'downvote' }[]>(
        'SELECT type FROM votes WHERE userId = ? AND mediaId = ? LIMIT 1',
        [user.id, mediaId]
      )
      if (userVoteRows.length > 0) {
        userVote = userVoteRows[0]!.type
      }
    }

    const rating = upvotes - downvotes

    return NextResponse.json({
      success: true,
      upvotes,
      downvotes,
      rating,
      userVote,
    })
  } catch (e) {
    console.error('Get votes error:', e)
    return NextResponse.json(
      { success: false, error: 'Failed to get votes' },
      { status: 500 }
    )
  }
}
