import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const UPLOAD_DIR = path.join(process.cwd(), 'uploads')
const ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
])
const MAX_SIZE_BYTES = 10 * 1024 * 1024 // 10 MB
const OUTPUT_FORMAT: keyof sharp.FormatEnum = 'webp'
const OUTPUT_MIME = 'image/webp'

export const ALLOWED_MIME_TYPES = Array.from(ALLOWED_TYPES)
export const MAX_SIZE_MB = MAX_SIZE_BYTES / (1024 * 1024)

export function getUploadDir(): string {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true })
  }
  return UPLOAD_DIR
}

export function validateFileType(mime: string): boolean {
  return ALLOWED_TYPES.has(mime)
}

export function validateFileSize(size: number): boolean {
  return size > 0 && size <= MAX_SIZE_BYTES
}

/** Compute SHA-256 hash of buffer for deduplication. */
export function hashBuffer(buffer: Buffer): string {
  return crypto.createHash('sha256').update(buffer).digest('hex')
}

/** Target ~70% size reduction for optimization  */
const WEBP_QUALITY = 52
const WEBP_EFFORT = 6

/**
 * Convert image buffer to WebP and save to storage.
 * Returns relative path and stored file size for environmental metrics.
 */
export async function saveImageAsWebP(
  buffer: Buffer,
  shortCode: string
): Promise<{ storagePath: string; mimeType: string; storedSizeBytes: number }> {
  const dir = getUploadDir()
  const filename = `${shortCode}.${OUTPUT_FORMAT}`
  const filePath = path.join(dir, filename)

  await sharp(buffer)
    .rotate()
    .webp({ quality: WEBP_QUALITY, effort: WEBP_EFFORT })
    .toFile(filePath)

  const stat = fs.statSync(filePath)
  return {
    storagePath: filename,
    mimeType: OUTPUT_MIME,
    storedSizeBytes: stat.size,
  }
}

/** Resolve full filesystem path from storage path (filename). */
export function resolveStoragePath(storagePath: string): string {
  return path.join(UPLOAD_DIR, storagePath)
}
