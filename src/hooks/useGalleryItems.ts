'use client';

import {useCallback, useEffect, useRef, useState} from 'react';

export type SortOption = 'date' | 'rating';

export type GalleryItem = {
  id: number;
  code: string;
  description: string;
  imageUrl: string;
  upvotes: number;
  downvotes: number;
  rating: number;
  savedBytes: number;
  savedCO2Grams: number;
};

type VoteType = 'upvote' | 'downvote';
type VoteAction = 'created' | 'updated' | 'removed';

type GalleryResponse = {success?: boolean; items?: GalleryItem[]};

export function useGalleryItems(sortBy: SortOption) {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const abortRef = useRef<AbortController | null>(null);

  const refresh = useCallback(async () => {
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    setLoading(true);
    try {
      const res = await fetch(`/api/images?sort=${sortBy}`, {
        signal: ac.signal,
      });
      const data = (await res.json()) as GalleryResponse;
      if (ac.signal.aborted) return;
      if (data.success && Array.isArray(data.items)) setItems(data.items);
      else setItems([]);
    } catch (e: unknown) {
      const name = (e as {name?: string} | null)?.name;
      if (name !== 'AbortError') setItems([]);
    } finally {
      if (!ac.signal.aborted) setLoading(false);
    }
  }, [sortBy]);

  useEffect(() => {
    void refresh();
    return () => {
      abortRef.current?.abort();
    };
  }, [refresh]);

  const applyVoteUpdate = useCallback(
    (code: string, requestedType: VoteType, action: VoteAction) => {
      setItems((currentItems) => {
        let hasUpdatedItem = false;

        const nextItems = currentItems.map((item) => {
          if (item.code !== code) return item;

          hasUpdatedItem = true;

          let upvotes = item.upvotes;
          let downvotes = item.downvotes;

          if (action === 'created') {
            if (requestedType === 'upvote') upvotes += 1;
            else downvotes += 1;
          } else if (action === 'updated') {
            if (requestedType === 'upvote') {
              upvotes += 1;
              downvotes = Math.max(0, downvotes - 1);
            } else {
              downvotes += 1;
              upvotes = Math.max(0, upvotes - 1);
            }
          } else if (requestedType === 'upvote') {
            upvotes = Math.max(0, upvotes - 1);
          } else {
            downvotes = Math.max(0, downvotes - 1);
          }

          return {
            ...item,
            upvotes,
            downvotes,
            rating: upvotes - downvotes,
          };
        });

        if (!hasUpdatedItem) return currentItems;
        if (sortBy !== 'rating') return nextItems;

        return [...nextItems].sort((a, b) => b.rating - a.rating);
      });
    },
    [sortBy]
  );

  return {items, loading, refresh, applyVoteUpdate};
}
