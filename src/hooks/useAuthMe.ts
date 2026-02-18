'use client'

import { useEffect, useState } from 'react'

export type UserRole = 'user' | 'moderator' | 'admin'

export type AuthMeUser = {
  id: number
  username: string
  email: string
  role: UserRole
}

type AuthMeResponse =
  | { success: true; user: AuthMeUser }
  | { success: false; user: null }

export function useAuthMe() {
  const [user, setUser] = useState<AuthMeUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    fetch('/api/auth/me', { credentials: 'include' })
      .then((res) => res.json() as Promise<AuthMeResponse>)
      .then((data) => {
        if (cancelled) return
        if (data.success) setUser(data.user)
        else setUser(null)
      })
      .catch(() => {
        if (!cancelled) setUser(null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return { user, loading }
}

