import { query } from '@/lib/db'

export type ModerationAction = 'image_removed' | 'image_removed_by_author'

/**
 * Log moderation action (admin/moderator). Use when role is not the author.
 */
export async function logModerationAction(params: {
  userId: number
  action: ModerationAction
  mediaId?: number
  mediaCode?: string
  details?: string
}): Promise<void> {
  await query(
    `INSERT INTO moderation_log (userId, action, mediaId, mediaCode, details)
     VALUES (?, ?, ?, ?, ?)`,
    [
      params.userId,
      params.action,
      params.mediaId ?? null,
      params.mediaCode ?? null,
      params.details ?? null,
    ]
  )
}
