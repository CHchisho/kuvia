import crypto from 'node:crypto'
import { query } from '@/lib/db'

const SHORT_CODE_LENGTH = 8
const BASE62 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'

function randomBase62(length: number): string {
  const bytes = crypto.randomBytes(length)
  let result = ''
  for (let i = 0; i < length; i++) {
    result += BASE62[bytes[i]! % 62]
  }
  return result
}

/** Generate a unique short code for image URL. Retries if collision. */
export async function generateShortCode(): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = randomBase62(SHORT_CODE_LENGTH)
    const rows = await query<{ id: number }[]>(
      'SELECT id FROM media WHERE code = ? LIMIT 1',
      [code]
    )
    if (rows.length === 0) return code
  }
  throw new Error('Failed to generate unique short code')
}
