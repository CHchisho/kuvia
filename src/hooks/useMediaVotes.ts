'use client'

import { useCallback, useEffect, useState } from 'react'

export type VoteType = 'upvote' | 'downvote'

export type VoteData = {
  upvotes: number
  downvotes: number
  rating: number
  userVote: VoteType | null
}

type VotesResponse = {
  success: boolean
  upvotes?: number
  downvotes?: number
  rating?: number
  userVote?: VoteType | null
}

type VoteActionResponse = {
  success: boolean
  error?: string
}

const EMPTY: VoteData = { upvotes: 0, downvotes: 0, rating: 0, userVote: null }

export function useMediaVotes(code: string | null) {
  const [votes, setVotes] = useState<VoteData>(EMPTY)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const refresh = useCallback(async () => {
    if (!code) {
      setVotes(EMPTY)
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/media/${code}/votes`, {
        credentials: 'include',
      })
      const data = (await res.json()) as VotesResponse
      if (data.success) {
        setVotes({
          upvotes: data.upvotes ?? 0,
          downvotes: data.downvotes ?? 0,
          rating: data.rating ?? 0,
          userVote: data.userVote ?? null,
        })
      } else {
        setVotes(EMPTY)
      }
    } catch {
      setVotes(EMPTY)
    } finally {
      setLoading(false)
    }
  }, [code])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const vote = useCallback(
    async (type: VoteType) => {
      if (!code) return { success: false, error: 'Missing code' } as VoteActionResponse
      if (submitting) return { success: false, error: 'Already submitting' } as VoteActionResponse

      setSubmitting(true)
      try {
        const res = await fetch(`/api/media/${code}/vote`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ type }),
        })
        const data = (await res.json()) as VoteActionResponse
        if (data.success) {
          await refresh()
        }
        return data
      } catch {
        return { success: false, error: 'Request failed' }
      } finally {
        setSubmitting(false)
      }
    },
    [code, refresh, submitting]
  )

  return { votes, loading, submitting, refresh, vote }
}

