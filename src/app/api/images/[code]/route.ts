import { NextResponse } from 'next/server'
import { Readable } from 'node:stream'
import { query } from '@/lib/db'
import { resolveStoragePath } from '@/lib/imageStorage'
import fs from 'node:fs'

type MediaRow = {
  id: number
  image: string
  mimeType: string
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
      `SELECT id, image, mimeType, expiresAt 
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
