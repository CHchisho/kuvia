'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export type SortOption = 'date' | 'rating'

export type GalleryItem = {
  id: number
  code: string
  description: string
  imageUrl: string
  upvotes: number
  downvotes: number
  rating: number
  savedBytes: number
  savedCO2Grams: number
}

type GalleryResponse = { success?: boolean; items?: GalleryItem[] }

export function useGalleryItems(sortBy: SortOption) {
  const [items, setItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const abortRef = useRef<AbortController | null>(null)

  const refresh = useCallback(async () => {
    abortRef.current?.abort()
    const ac = new AbortController()
    abortRef.current = ac

    setLoading(true)
    try {
      const res = await fetch(`/api/images?sort=${sortBy}`, { signal: ac.signal })
      const data = (await res.json()) as GalleryResponse
      if (ac.signal.aborted) return
      if (data.success && Array.isArray(data.items)) setItems(data.items)
      else setItems([])
    } catch (e: unknown) {
      const name = (e as { name?: string } | null)?.name
      if (name !== 'AbortError') setItems([])
    } finally {
      if (!ac.signal.aborted) setLoading(false)
    }
  }, [sortBy])

  useEffect(() => {
    void refresh()
    return () => {
      abortRef.current?.abort()
    }
  }, [refresh])

  return { items, loading, refresh }
}

