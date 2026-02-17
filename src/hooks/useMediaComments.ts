'use client'

import { useCallback, useEffect, useState } from 'react'

export type MediaComment = {
  id: number
  userId: number
  username: string
  text: string
  createdAt: string
}

type CommentsResponse = {
  success: boolean
  comments?: MediaComment[]
  error?: string
}

export function useMediaComments(code: string | null) {
  const [comments, setComments] = useState<MediaComment[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const refresh = useCallback(async () => {
    if (!code) {
      setComments([])
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/media/${code}/comments`, {
        credentials: 'include',
      })
      const data = (await res.json()) as CommentsResponse
      if (data.success && Array.isArray(data.comments)) setComments(data.comments)
      else setComments([])
    } catch {
      setComments([])
    } finally {
      setLoading(false)
    }
  }, [code])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const addComment = useCallback(
    async (text: string) => {
      if (!code) return { success: false, error: 'Missing code' }
      const trimmed = text.trim()
      if (!trimmed) return { success: false, error: 'Empty comment' }
      if (submitting) return { success: false, error: 'Already submitting' }

      setSubmitting(true)
      try {
        const res = await fetch(`/api/media/${code}/comments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ text: trimmed }),
        })
        const data = (await res.json())
        if (data.success && data.comment) {
          setComments((prev) => [...prev, data.comment!])
        }
        return data
      } catch {
        return { success: false, error: 'Request failed' }
      } finally {
        setSubmitting(false)
      }
    },
    [code, submitting]
  )

  return { comments, loading, submitting, refresh, addComment }
}

