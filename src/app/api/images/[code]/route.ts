import { NextResponse } from 'next/server'
import { Readable } from 'node:stream'
import { query } from '@/lib/db'
import { resolveStoragePath } from '@/lib/imageStorage'
import { getAuthUser, canViewMedia, canDeleteMedia, canModerate } from '@/lib/authRequest'
import { logModerationAction } from '@/lib/moderationLog'
import fs from 'node:fs'

type MediaRow = {
  id: number
  userId: number
  image: string
  mimeType: string
  isPrivate: number
  expiresAt: Date
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await context.params
    if (!code?.trim()) {
      return NextResponse.json(
        { error: 'Invalid or missing code' },
        { status: 400 }
      )
    }

    const rows = await query<MediaRow[]>(
      `SELECT id, userId, image, mimeType, isPrivate, expiresAt 
       FROM media WHERE code = ? LIMIT 1`,
      [code.trim()]
    )

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'Image not found or link is invalid' },
        { status: 404 }
      )
    }

    const row = rows[0]!
    const expiresAt = new Date(row.expiresAt)
    if (expiresAt <= new Date()) {
      return NextResponse.json(
        { error: 'Link has expired' },
        { status: 410 }
      )
    }

    const user = await getAuthUser()
    if (!canViewMedia(user, row.userId, row.isPrivate === 1)) {
      return NextResponse.json(
        { error: 'Image not found or link is invalid' },
        { status: 404 }
      )
    }

    const filePath = resolveStoragePath(row.image)
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      )
    }

    const nodeStream = fs.createReadStream(filePath)
    const webStream = Readable.toWeb(nodeStream) as ReadableStream<Uint8Array>
    return new NextResponse(webStream, {
      headers: {
        'Content-Type': row.mimeType,
        'Cache-Control': 'private, max-age=3600',
      },
    })
  } catch (e) {
    console.error('Image serve error:', e)
    return NextResponse.json(
      { error: 'Failed to load image' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: Request,
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
    const codeTrimmed = code?.trim()
    if (!codeTrimmed) {
      return NextResponse.json(
        { success: false, error: 'Invalid or missing code' },
        { status: 400 }
      )
    }

    const rows = await query<MediaRow[]>(
      `SELECT id, userId, image FROM media WHERE code = ? LIMIT 1`,
      [codeTrimmed]
    )
    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Image not found' },
        { status: 404 }
      )
    }
    const row = rows[0]!

    if (!canDeleteMedia(user, row.userId)) {
      return NextResponse.json(
        { success: false, error: 'You cannot delete this image' },
        { status: 403 }
      )
    }

    const isModeratorAction = canModerate(user) && user.id !== row.userId

    const filePath = resolveStoragePath(row.image)
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath)
      } catch (e) {
        console.error('Failed to delete file:', e)
      }
    }

    await query('DELETE FROM media WHERE id = ?', [row.id])

    if (isModeratorAction) {
      await logModerationAction({
        userId: user.id,
        action: 'image_removed',
        mediaId: row.id,
        mediaCode: codeTrimmed,
        details: `Removed by ${user.role}`,
      })
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('Delete image error:', e)
    return NextResponse.json(
      { success: false, error: 'Failed to delete image' },
      { status: 500 }
    )
  }
}
