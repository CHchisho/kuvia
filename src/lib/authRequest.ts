import { cookies } from 'next/headers'
import { verifyToken, AUTH_COOKIE_NAME } from '@/lib/auth'

export type AuthUser = {
  id: number
  username: string
  email: string
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
  }
}
