import bcrypt from 'bcryptjs'
import { query } from '@/lib/db'

const SEED_USERS = [
  { email: 'admin@gmail.com', username: 'admin', password: 'admin', role: 'admin' as const },
  { email: 'moderator@gmail.com', username: 'moderator', password: 'moderator', role: 'moderator' as const },
]

/**
 * Ensures base accounts exist. Called on server start.
 * Creates admin and moderator if they don't exist; passwords are bcrypt-hashed.
 */
export async function ensureSeedUsers(): Promise<void> {
  for (const seed of SEED_USERS) {
    const existing = await query<{ id: number }[]>(
      'SELECT id FROM users WHERE email = ? LIMIT 1',
      [seed.email]
    )
    if (existing.length > 0) continue

    const hashedPassword = await bcrypt.hash(seed.password, 10)
    await query(
      'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
      [seed.username, seed.email, hashedPassword, seed.role]
    )
    console.log(`[kuvia] Created seed user: ${seed.email} (${seed.role})`)
  }
}
