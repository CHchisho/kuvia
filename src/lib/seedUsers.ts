import bcrypt from 'bcryptjs';
import {query} from '@/lib/db';

type SeedRole = 'admin' | 'moderator';
type SeedUser = {email: string; username: string; password: string; role: SeedRole};

function env(name: string): string | undefined {
  const v = process.env[name];
  return typeof v === 'string' && v.trim() ? v.trim() : undefined;
}

function getSeedUsersFromEnv(): SeedUser[] {
  const admin = {
    email: env('SEED_ADMIN_EMAIL'),
    username: env('SEED_ADMIN_USERNAME'),
    password: env('SEED_ADMIN_PASSWORD'),
    role: 'admin' as const,
  };
  const moderator = {
    email: env('SEED_MODERATOR_EMAIL'),
    username: env('SEED_MODERATOR_USERNAME'),
    password: env('SEED_MODERATOR_PASSWORD'),
    role: 'moderator' as const,
  };

  const hasAdmin = admin.email && admin.username && admin.password;
  const hasModerator = moderator.email && moderator.username && moderator.password;

  const users: SeedUser[] = [];
  if (hasAdmin) users.push(admin as SeedUser);
  if (hasModerator) users.push(moderator as SeedUser);

  if (users.length === 0) {
    console.warn(
      '[kuvia] Seed users skipped - set SEED_ADMIN_* and/or SEED_MODERATOR_* env vars'
    );
  }

  return users;
}

/**
 * Ensures base accounts exist. Called on server start.
 * Creates admin and moderator if they don't exist; passwords are bcrypt-hashed.
 */
export async function ensureSeedUsers(): Promise<void> {
  const seedUsers = getSeedUsersFromEnv();
  if (seedUsers.length === 0) return;

  for (const seed of seedUsers) {
    const existing = await query<{id: number}[]>(
      'SELECT id FROM users WHERE email = ? LIMIT 1',
      [seed.email]
    );
    if (existing.length > 0) continue;

    const hashedPassword = await bcrypt.hash(seed.password, 10);
    await query(
      'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
      [seed.username, seed.email, hashedPassword, seed.role]
    );
    console.log(`[kuvia] Created seed user: ${seed.email} (${seed.role})`);
  }
}
