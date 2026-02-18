'use client'

import { useCallback, useEffect, useState } from 'react'

export type MediaMetadata = {
  id: number
  code: string
  description: string
  isPrivate: boolean
  mimeType: string
  expiresAt: string
  createdAt: string
  authorUsername: string
  authorId: number
}

type Response = {
  success: boolean
  media?: MediaMetadata
  error?: string
}

export function useMediaMetadata(code: string | null) {
  const [metadata, setMetadata] = useState<MediaMetadata | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const refresh = useCallback(async () => {
    if (!code) {
      setMetadata(null)
      setLoading(false)
      return
    }
    setLoading(true)
    setError(false)
    try {
      const res = await fetch(`/api/media/${code}`, { credentials: 'include' })
      const data = (await res.json()) as Response
      if (data.success && data.media) {
        setMetadata(data.media)
        setError(false)
      } else {
        setMetadata(null)
        setError(true)
      }
    } catch {
      setMetadata(null)
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [code])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { metadata, loading, error, refresh }
}
