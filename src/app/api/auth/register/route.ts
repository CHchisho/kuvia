import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { query, type UserRow } from '@/lib/db'
import { createToken, getCookieOptions } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { username, email, password } = body as { username?: string; email?: string; password?: string }

    if (!username?.trim() || !email?.trim() || !password) {
      return NextResponse.json(
        { success: false, error: 'Username, email and password are required' },
        { status: 400 }
      )
    }

    const trimmedUsername = username.trim()
    const trimmedEmail = email.trim().toLowerCase()

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    const existing = await query<(UserRow)[]>(
      'SELECT id FROM users WHERE email = ? OR username = ?',
      [trimmedEmail, trimmedUsername]
    )
    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, error: 'User with this email or username already exists' },
        { status: 409 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const insertResult = await query(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [trimmedUsername, trimmedEmail, hashedPassword]
    )
    const userId = (insertResult as unknown as { insertId: number }).insertId

    const token = await createToken({
      sub: String(userId),
      username: trimmedUsername,
      email: trimmedEmail,
    })

    const { name, options } = getCookieOptions()
    const response = NextResponse.json({
      success: true,
      user: { id: userId, username: trimmedUsername, email: trimmedEmail },
    })
    response.cookies.set(name, token, options as Record<string, string | number | boolean>)

    return response
  } catch (e) {
    console.error('Register error:', e)
    return NextResponse.json(
      { success: false, error: 'Registration failed' },
      { status: 500 }
    )
  }
}
