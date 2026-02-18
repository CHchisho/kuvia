import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken, AUTH_COOKIE_NAME } from '@/lib/auth'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value
    if (!token) {
      return NextResponse.json({ success: false, user: null }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ success: false, user: null }, { status: 401 })
    }

    return NextResponse.json({
      success: true,
      user: {
        id: Number(payload.sub),
        username: payload.username,
        email: payload.email,
        role: payload.role ?? 'user',
      },
    })
  } catch {
    return NextResponse.json({ success: false, user: null }, { status: 401 })
  }
}
