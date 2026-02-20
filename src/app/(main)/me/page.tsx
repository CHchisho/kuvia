'use client';

import React, {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import Link from 'next/link';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {
  faHeart,
  faChartLine,
  faImage,
  faArrowLeft,
  faRightFromBracket,
  faLeaf,
} from '@fortawesome/free-solid-svg-icons';
import { formatCO2, formatSavedBytes } from '@/lib/environmentMetrics';
import Button from '@/components/Button/Button';
import {useIsAllowed} from '@/store/useIsAllowed';

type User = {id: number; username: string; email: string};

type UploadItem = {
  id: number;
  shortCode: string;
  url: string;
  imageUrl: string;
  isPublic: boolean;
  expiresAt: string;
  createdAt: string;
  upvotes: number;
  downvotes: number;
  rating: number;
  savedBytes: number;
  savedCO2Grams: number;
};

type UserStats = {
  totalUpvotes: number;
  totalDownvotes: number;
  totalRating: number;
  imageCount: number;
  topCount: number;
  totalSavedBytes: number;
  savedCO2Grams: number;
};

export default function MePage() {
  const router = useRouter();
  const setIsAllowed = useIsAllowed((s) => s.setIsAllowed);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/auth/me', {credentials: 'include'})
      .then((res) => res.json())
      .then((data: {success: boolean; user?: User}) => {
        if (cancelled) return;
        if (data.success && data.user) {
          setUser(data.user);
          return Promise.all([
            fetch('/api/images/my', {credentials: 'include'}).then((r) => r.json()),
            fetch('/api/users/me/stats', {credentials: 'include'}).then((r) => r.json()),
          ]);
        }
        router.replace('/login');
        return null;
      })
      .then((data: [ { success?: boolean; items?: UploadItem[] }, { success?: boolean } & UserStats ] | null | undefined) => {
        if (cancelled || data == null || data === undefined) return;
        const [imagesRes, statsRes] = data;
        if (imagesRes?.success && Array.isArray(imagesRes.items)) {
          setUploads(imagesRes.items);
        }
        if (statsRes?.success && 'totalUpvotes' in statsRes) {
          setStats({
            totalUpvotes: statsRes.totalUpvotes,
            totalDownvotes: statsRes.totalDownvotes,
            totalRating: statsRes.totalRating,
            imageCount: statsRes.imageCount,
            topCount: statsRes.topCount,
            totalSavedBytes: statsRes.totalSavedBytes ?? 0,
            savedCO2Grams: statsRes.savedCO2Grams ?? 0,
          });
        }
      })
      .catch(() => {
        if (!cancelled) router.replace('/login');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-var(--header-height)-var(--footer-height))] flex items-center justify-center px-4">
        <p className="text-mono-200">Loading...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-[calc(100vh-var(--header-height)-var(--footer-height))] px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Back */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-mono-200 hover:text-primary-100 transition-colors text-sm"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          Back to Home
        </Link>

        {/* Profile info */}
        <section className="bg-mono-400 rounded-lg p-6 border border-mono-300">
          <h1 className="text-2xl font-bold text-mono-100 mb-4">Profile</h1>

          <div className="flex items-center justify-between">
            <div className="space-y-2 text-mono-100">
              <p>
                <span className="text-mono-200">Username:</span>{' '}
                <strong>{user.username}</strong>
              </p>
              <p>
                <span className="text-mono-200">Email:</span> {user.email}
              </p>
            </div>
            <div>
              <Button
                variant="primary"
                type="button"
                onClick={async () => {
                  await fetch('/api/auth/logout', {
                    method: 'POST',
                    credentials: 'include',
                  });
                  setIsAllowed(undefined);
                  router.push('/');
                  router.refresh();
                }}
              >
                <FontAwesomeIcon icon={faRightFromBracket} />
                Logout
              </Button>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-mono-300 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-2 text-mono-200">
              <FontAwesomeIcon icon={faHeart} className="text-primary-100" />
              <span>Total upvotes</span>
              <span className="text-mono-100 font-medium">
                {stats?.totalUpvotes ?? '—'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-mono-200">
              <FontAwesomeIcon
                icon={faChartLine}
                className="text-primary-100"
              />
              <span>Top upvotes</span>
              <span className="text-mono-100 font-medium">
                {stats?.topCount ?? '—'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-mono-200">
              <FontAwesomeIcon icon={faImage} className="text-primary-100" />
              <span>Images</span>
              <span className="text-mono-100 font-medium">
                {stats?.imageCount ?? '—'}
              </span>
            </div>
            {(stats?.totalSavedBytes != null && (stats.totalSavedBytes > 0 || stats.savedCO2Grams > 0)) && (
              <div className="flex items-center gap-2 text-mono-200 sm:col-span-3">
                <FontAwesomeIcon icon={faLeaf} className="text-primary-100" />
                <span>Total saved</span>
                <span className="text-mono-100 font-medium">
                  {formatSavedBytes(stats.totalSavedBytes)} · {formatCO2(stats.savedCO2Grams)} CO₂
                </span>
              </div>
            )}
          </div>
        </section>

        {/* My uploads */}
        <section className="bg-mono-400 rounded-lg p-6 border border-mono-300">
          <h2 className="text-xl font-bold text-mono-100 mb-4 flex items-center gap-2">
            <FontAwesomeIcon icon={faImage} />
            My uploads
          </h2>
          {uploads.length === 0 ? (
            <p className="text-mono-200">
              No photos yet. Your uploaded images will appear here.
            </p>
          ) : (
            <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {uploads.map((item) => (
                <li key={item.id}>
                  <Link
                    href={`/${item.shortCode}`}
                    className="block rounded-lg overflow-hidden border border-mono-300 hover:border-primary-100 transition-colors aspect-square bg-mono-500"
                  >
                    <img
                      src={item.imageUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </Link>
                  <p className="text-xs text-mono-300 mt-1 truncate">
                    /{item.shortCode} · {item.isPublic ? 'public' : 'private'}
                  </p>
                  <p className="text-xs text-mono-200 mt-0.5">
                    ▲ {item.upvotes} · {item.rating} · ▼ {item.downvotes}
                  </p>
                  {(item.savedBytes > 0 || item.savedCO2Grams > 0) && (
                    <p className="text-xs text-mono-300 mt-0.5">
                      Saved: {formatSavedBytes(item.savedBytes)} · {formatCO2(item.savedCO2Grams)} CO₂
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
