import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/authRequest'
import { query } from '@/lib/db'


export async function GET() {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const [aggRows, topRows] = await Promise.all([
      query<{ totalUpvotes: number; totalDownvotes: number; imageCount: number }[]>(
        `SELECT
          COUNT(DISTINCT m.id) AS imageCount,
          COALESCE(SUM(CASE WHEN v.type = 'upvote' THEN 1 ELSE 0 END), 0) AS totalUpvotes,
          COALESCE(SUM(CASE WHEN v.type = 'downvote' THEN 1 ELSE 0 END), 0) AS totalDownvotes
         FROM media m
         LEFT JOIN votes v ON m.id = v.mediaId
         WHERE m.userId = ? AND m.expiresAt > NOW()`,
        [user.id]
      ),
      query<{ topCount: number }[]>(
        `SELECT COUNT(*) AS topCount FROM (
          SELECT m.id
          FROM media m
          LEFT JOIN votes v ON m.id = v.mediaId
          WHERE m.userId = ? AND m.expiresAt > NOW()
          GROUP BY m.id
          HAVING SUM(CASE WHEN v.type = 'upvote' THEN 1 WHEN v.type = 'downvote' THEN -1 ELSE 0 END) > 0
        ) t`,
        [user.id]
      ),
    ])

    const r = aggRows[0]
    const top = topRows[0]

    if (!r) {
      return NextResponse.json({
        success: true,
        totalUpvotes: 0,
        totalDownvotes: 0,
        totalRating: 0,
        imageCount: 0,
        topCount: 0,
      })
    }

    const totalUpvotes = Number(r.totalUpvotes)
    const totalDownvotes = Number(r.totalDownvotes)

    return NextResponse.json({
      success: true,
      totalUpvotes,
      totalDownvotes,
      totalRating: totalUpvotes - totalDownvotes,
      imageCount: Number(r.imageCount),
      topCount: top ? Number(top.topCount) : 0,
    })
  } catch (e) {
    console.error('User stats error:', e)
    return NextResponse.json(
      { success: false, error: 'Failed to load stats' },
      { status: 500 }
    )
  }
}
