import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { query, UserRow } from '@/lib/db'
import { createToken, getCookieOptions } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body as { email?: string; password?: string }

    if (!email?.trim() || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const trimmedEmail = email.trim().toLowerCase()
    const rows = await query<UserRow[]>(
      'SELECT id, username, email, password, COALESCE(role, "user") as role FROM users WHERE email = ? LIMIT 1',
      [trimmedEmail]
    )

    const user = rows[0]
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 401 }
      )
    }
    if (!(await bcrypt.compare(password, user.password))) {
      return NextResponse.json(
        { success: false, error: 'Invalid password' },
        { status: 401 }
      )
    }

    const token = await createToken({
      sub: String(user.id),
      username: user.username,
      email: user.email,
      role: user.role ?? 'user',
    })

    const { name, options } = getCookieOptions()
    const response = NextResponse.json({
      success: true,
      user: { id: user.id, username: user.username, email: user.email, role: user.role ?? 'user' },
    })
    response.cookies.set(name, token, options as Record<string, string | number | boolean>)

    return response
  } catch (e) {
    console.error('Login error:', e)
    return NextResponse.json(
      { success: false, error: 'Login failed' },
      { status: 500 }
    )
  }
}
