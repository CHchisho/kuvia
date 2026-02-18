import * as jose from 'jose'

const JWT_SECRET = process.env.JWT_SECRET ?? 'kuvia-dev-secret-change-in-production'
const COOKIE_NAME = 'kuvia_session'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

export type UserRole = 'user' | 'moderator' | 'admin'

export type JWTPayload = {
  sub: string // userId
  username: string
  email: string
  role: UserRole
  iat?: number
  exp?: number
}

async function getSecret() {
  return new TextEncoder().encode(JWT_SECRET)
}

export async function createToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): Promise<string> {
  const secret = await getSecret()
  return new jose.SignJWT({
    username: payload.username,
    email: payload.email,
    role: payload.role ?? 'user',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(String(payload.sub))
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret)
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const secret = await getSecret()
    const { payload } = await jose.jwtVerify(token, secret)
    return {
      sub: payload.sub as string,
      username: payload.username as string,
      email: payload.email as string,
      role: (payload.role as UserRole) ?? 'user',
      iat: payload.iat,
      exp: payload.exp,
    }
  } catch {
    return null
  }
}

export function getCookieOptions(): { name: string; value: string; options: Record<string, unknown> } {
  return {
    name: COOKIE_NAME,
    value: '',
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: COOKIE_MAX_AGE,
      path: '/',
    },
  }
}

export const AUTH_COOKIE_NAME = COOKIE_NAME
