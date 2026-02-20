import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/authRequest'
import { query } from '@/lib/db'
import {
  validateFileType,
  validateFileSize,
  hashBuffer,
  saveImageAsWebP,
} from '@/lib/imageStorage'
import { savedBytesToCO2Grams } from '@/lib/environmentMetrics'
import { generateShortCode } from '@/lib/shortCode'

const EXPIRY_DAYS_OPTIONS = [1, 7, 14, 30]

function getExpiresAt(days: number): Date {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d
}

export async function POST(request: Request) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const isPublicRaw = formData.get('isPublic')
    const expiresInDaysRaw = formData.get('expiresInDays')
    const descriptionRaw = formData.get('description')
    const description =
      typeof descriptionRaw === 'string' ? descriptionRaw.trim().slice(0, 200) : ''

    if (!file || typeof file === 'string') {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    const mime = file.type || 'application/octet-stream'
    if (!validateFileType(mime)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid file type. Allowed: image/jpeg, image/png, image/gif, image/webp`,
        },
        { status: 400 }
      )
    }

    if (!validateFileSize(file.size)) {
      return NextResponse.json(
        { success: false, error: 'File too large. Maximum size is 10 MB.' },
        { status: 400 }
      )
    }

    const expiresInDays = EXPIRY_DAYS_OPTIONS.includes(
      Number(expiresInDaysRaw) as (typeof EXPIRY_DAYS_OPTIONS)[number]
    )
      ? Number(expiresInDaysRaw)
      : 1
    const isPublic = isPublicRaw !== 'false' && isPublicRaw !== '0'

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const fileHash = hashBuffer(buffer)

    // Check duplicate: same user, same hash
    const existing = await query<{ id: number; code: string; expiresAt: Date }[]>(
      `SELECT id, code, expiresAt FROM media 
       WHERE userId = ? AND fileHash = ? AND expiresAt > NOW() 
       ORDER BY createdAt DESC LIMIT 1`,
      [user.id, fileHash]
    )

    const originalSizeBytes = buffer.length

    if (existing.length > 0) {
      const row = existing[0]!
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || ''
      const url = baseUrl ? `${baseUrl}/${row.code}` : `/${row.code}`
      const duplicateSavedBytes = originalSizeBytes
      return NextResponse.json({
        success: true,
        duplicate: true,
        shortCode: row.code,
        url,
        expiresAt: row.expiresAt,
        savedBytes: duplicateSavedBytes,
        savedCO2Grams: savedBytesToCO2Grams(duplicateSavedBytes),
      })
    }

    const shortCode = await generateShortCode()
    const { storagePath, mimeType, storedSizeBytes } = await saveImageAsWebP(
      buffer,
      shortCode
    )
    const expiresAt = getExpiresAt(expiresInDays)

    await query(
      `INSERT INTO media (userId, code, image, fileHash, mimeType, description, isPrivate, expiresAt, originalSizeBytes, storedSizeBytes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user.id,
        shortCode,
        storagePath,
        fileHash,
        mimeType,
        description || null,
        isPublic ? 0 : 1,
        expiresAt,
        originalSizeBytes,
        storedSizeBytes,
      ]
    )

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || ''
    const url = baseUrl ? `${baseUrl}/${shortCode}` : `/${shortCode}`
    const savedBytes = Math.max(0, originalSizeBytes - storedSizeBytes)

    return NextResponse.json({
      success: true,
      shortCode,
      url,
      expiresAt: expiresAt.toISOString(),
      savedBytes,
      savedCO2Grams: savedBytesToCO2Grams(savedBytes),
    })
  } catch (e) {
    console.error('Upload error:', e)
    return NextResponse.json(
      { success: false, error: 'Upload failed' },
      { status: 500 }
    )
  }
}
