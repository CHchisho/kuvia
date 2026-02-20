'use client';

import React, {useState, useEffect} from 'react';
import Link from 'next/link';
import {useAuthMe} from '@/hooks/useAuthMe';
import {
  useGalleryItems,
  type SortOption,
} from '@/hooks/useGalleryItems';
import {formatCO2, formatSavedBytes} from '@/lib/environmentMetrics';
import {IconFan} from '@/components/shared/Icons/IconFan';

type EnvStats = { totalSavedBytes: number; savedCO2Grams: number } | null;

export const Page = () => {
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const {items, loading, refresh} = useGalleryItems(sortBy);
  const {user} = useAuthMe();
  const [submittingCode, setSubmittingCode] = useState<string | null>(null);
  const [envStats, setEnvStats] = useState<EnvStats>(null);

  useEffect(() => {
    fetch('/api/stats/environment', {credentials: 'include'})
      .then((r) => r.json())
      .then((data: {success?: boolean; totalSavedBytes?: number; savedCO2Grams?: number}) => {
        if (data.success && typeof data.totalSavedBytes === 'number' && typeof data.savedCO2Grams === 'number') {
          setEnvStats({totalSavedBytes: data.totalSavedBytes, savedCO2Grams: data.savedCO2Grams});
        }
      })
      .catch(() => {});
  }, []);

  const handleVote = async (code: string, type: 'upvote' | 'downvote') => {
    if (!user) return;
    if (submittingCode) return;

    setSubmittingCode(code);
    try {
      const res = await fetch(`/api/media/${code}/vote`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        credentials: 'include',
        body: JSON.stringify({type}),
      });

      const data = (await res.json()) as {success?: boolean};
      if (data.success) {
        await refresh();
      }
    } finally {
      setSubmittingCode(null);
    }
  };

  return (
    <div className="w-full px-4 py-8">
      {envStats != null && (envStats.totalSavedBytes > 0 || envStats.savedCO2Grams > 0) && (
        <div className="mb-6 p-4 rounded-lg border border-mono-300 bg-mono-400 flex items-center gap-4 flex-wrap">
          <IconFan size={32} color="var(--color-primary-100)" className="shrink-0" />
          <div>
            <p className="text-mono-200 text-sm">Total saved</p>
            <p className="text-mono-100 font-semibold">
              {formatSavedBytes(envStats.totalSavedBytes)} data · {formatCO2(envStats.savedCO2Grams)} CO₂
            </p>
            <p className="text-mono-300 text-xs mt-0.5">
              Image compression and optimization reduce storage and transfer, lowering environmental impact.
            </p>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-mono-100">Gallery</h1>
        <div className="flex items-center gap-2">
          <label className="text-mono-200 text-sm">Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="px-3 py-1 rounded bg-mono-400 text-mono-100 border border-mono-300 focus:outline-none focus:border-primary-100"
          >
            <option value="date">By date</option>
            <option value="rating">By rating</option>
          </select>
        </div>
      </div>
      {loading ? (
        <p className="text-mono-200">Loading…</p>
      ) : items.length === 0 ? (
        <p className="text-mono-200">No public photos yet.</p>
      ) : (
        <div
          className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4"
          style={{columnGap: '1rem'}}
        >
          {items.map((image) => (
            <div key={image.id} className="block w-full mb-4 break-inside-avoid">
              <div className="relative w-full overflow-hidden rounded-lg bg-mono-400">
                <Link
                  href={`/${image.code}`}
                  className="block cursor-pointer hover:opacity-80 transition-opacity"
                  aria-label={`Open photo ${image.code}`}
                >
                  <div className="relative w-full aspect-square">
                  <img
                    src={image.imageUrl}
                    alt={image.description || 'Photo'}
                    className="object-cover w-full h-full"
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 20vw, 20vw"
                  />
                  </div>
                </Link>
                <div className="p-3 bg-mono-400">
                  <div className="flex items-center justify-between mb-1">
                    {user ? (
                      <div className="flex items-center gap-2 text-xs text-mono-200">
                        <button
                          type="button"
                          onClick={() => handleVote(image.code, 'upvote')}
                          disabled={submittingCode === image.code}
                          className="px-2 py-1 rounded bg-mono-300 hover:bg-mono-200 text-mono-100 disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label="Upvote"
                        >
                          ▲ {image.upvotes}
                        </button>
                        <span className="font-semibold text-mono-100">
                          {image.rating}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleVote(image.code, 'downvote')}
                          disabled={submittingCode === image.code}
                          className="px-2 py-1 rounded bg-mono-300 hover:bg-mono-200 text-mono-100 disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label="Downvote"
                        >
                          ▼ {image.downvotes}
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-xs text-mono-200">
                        <span>▲ {image.upvotes}</span>
                        <span className="font-semibold text-mono-100">
                          {image.rating}
                        </span>
                        <span>▼ {image.downvotes}</span>
                        <Link
                          href="/login"
                          className="ml-2 text-primary-100 hover:underline"
                        >
                          Login to vote
                        </Link>
                      </div>
                    )}
                  </div>
                  {image.description && (
                    <p className="text-sm text-mono-100">{image.description}</p>
                  )}
                  {(image.savedBytes > 0 || image.savedCO2Grams > 0) && (
                    <p className="text-xs text-mono-300 mt-1">
                      Saved: {formatSavedBytes(image.savedBytes)} · {formatCO2(image.savedCO2Grams)} CO₂
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
