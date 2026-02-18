import { cookies } from 'next/headers'
import { verifyToken, AUTH_COOKIE_NAME, type UserRole } from '@/lib/auth'

export type AuthUser = {
  id: number
  username: string
  email: string
  role: UserRole
}

/** Get current user from request (cookies). Returns null if not authenticated. */
export async function getAuthUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value
  if (!token) return null

  const payload = await verifyToken(token)
  if (!payload) return null

  return {
    id: Number(payload.sub),
    username: payload.username,
    email: payload.email,
    role: payload.role ?? 'user',
  }
}

export function isAdmin(user: AuthUser): boolean {
  return user.role === 'admin'
}

export function isModerator(user: AuthUser): boolean {
  return user.role === 'moderator' || user.role === 'admin'
}

/** Can delete any image and view private images */
export function canModerate(user: AuthUser): boolean {
  return isModerator(user)
}

/** Can delete this image: author or admin/moderator */
export function canDeleteMedia(user: AuthUser, mediaUserId: number): boolean {
  return user.id === mediaUserId || canModerate(user)
}

/** Can view this media: public, or owner, or admin/moderator */
export function canViewMedia(
  user: AuthUser | null,
  mediaUserId: number,
  isPrivate: boolean
): boolean {
  if (!isPrivate) return true
  if (!user) return false
  return user.id === mediaUserId || canModerate(user)
}
